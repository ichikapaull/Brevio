# app.py
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import yt_dlp
import google.generativeai as genai
from google.cloud import speech

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# --- Configuration --- 
# Note: GOOGLE_API_KEY and GOOGLE_APPLICATION_CREDENTIALS 
# need to be set as environment variables.

# Configure Gemini API
# User will need to set GOOGLE_API_KEY environment variable
try:
    gemini_api_key = os.environ.get("GOOGLE_API_KEY")
    if not gemini_api_key:
        print("Warning: GOOGLE_API_KEY environment variable not set. Gemini API calls will fail.")
    genai.configure(api_key=gemini_api_key)
    # Using the latest recommended model, adjust if a specific one is needed and available
    model = genai.GenerativeModel("gemini-1.5-pro-latest") 
except Exception as e:
    print(f"Error configuring Gemini API: {e}")
    model = None

# Configure Google Cloud Speech-to-Text
# User will need to set GOOGLE_APPLICATION_CREDENTIALS environment variable
try:
    speech_credentials = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
    if not speech_credentials:
        print("Warning: GOOGLE_APPLICATION_CREDENTIALS environment variable not set. Speech-to-Text API calls will fail.")
        speech_client = None
    else:
        speech_client = speech.SpeechClient()
except Exception as e:
    print(f"Error configuring Speech-to-Text client: {e}")
    speech_client = None

@app.route("/summarize", methods=["POST"])
def summarize_video():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    youtube_url = data.get("url")

    if not youtube_url:
        return jsonify({"error": "Missing 'url' parameter"}), 400

    audio_filename = "downloaded_audio.webm" # Using webm as it's often available and STT supports opus in webm

    try:
        # 1. Download audio from YouTube
        print(f"Downloading audio for: {youtube_url}")
        ydl_opts = {
            "format": "bestaudio[ext=webm]/bestaudio", # Prefer webm with opus, fallback to best audio
            "outtmpl": audio_filename,
            "noplaylist": True,
            "postprocessors": [{
                "key": "FFmpegExtractAudio",
                "preferredcodec": "opus", # Opus is good for STT
            }],
            # Limit duration to 30 minutes (1800 seconds) as per requirements
            # Note: yt-dlp doesn't have a direct duration limit during download.
            # This would ideally be checked after download or via metadata before full download.
            # For now, we'll proceed and rely on API limits or handle large files.
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(youtube_url, download=True)
            # Check duration after metadata is fetched
            duration = info_dict.get("duration")
            if duration and duration > 1800: # 30 minutes
                # Clean up downloaded file if any
                if os.path.exists(audio_filename):
                    os.remove(audio_filename)
                return jsonify({"error": "Audio duration exceeds 30 minutes limit."}), 400
            # yt-dlp names the file based on outtmpl, so it should be audio_filename
            # If preferredcodec was used, the extension might change. Let's find the actual downloaded file.
            downloaded_file_path = ydl.prepare_filename(info_dict).replace(info_dict["ext"], "opus") if info_dict["ext"] != "opus" else ydl.prepare_filename(info_dict)
            if not os.path.exists(downloaded_file_path):
                 downloaded_file_path = audio_filename # Fallback if renaming logic is complex
            
            # Ensure the file is what we expect, or find the actual output.
            # yt-dlp might save with a different extension if opus in webm isn't directly available.
            # For simplicity, we'll assume it saves as audio_filename or audio_filename.opus
            actual_audio_file = None
            if os.path.exists(downloaded_file_path) and downloaded_file_path.endswith(".opus"):
                actual_audio_file = downloaded_file_path
            elif os.path.exists(audio_filename):
                actual_audio_file = audio_filename
            else: # try to find a webm or opus file if the name is different
                found_files = [f for f in os.listdir('.') if f.startswith('downloaded_audio') and (f.endswith('.webm') or f.endswith('.opus'))]
                if found_files:
                    actual_audio_file = found_files[0]
                else:
                    print(f"Error: Could not find downloaded audio file starting with 'downloaded_audio'. Files in dir: {os.listdir('.')}")
                    return jsonify({"error": "Audio download failed or file not found."}), 500
        print(f"Audio downloaded: {actual_audio_file}")

        # 2. Speech-to-text conversion
        if not speech_client:
            return jsonify({"error": "Speech-to-Text client not configured. Check GOOGLE_APPLICATION_CREDENTIALS."}), 500
        
        print(f"Starting speech-to-text for: {actual_audio_file}")
        with open(actual_audio_file, "rb") as audio_file_content:
            content = audio_file_content.read()
        
        recognition_audio = speech.RecognitionAudio(content=content)
        # Determine encoding based on file extension
        audio_encoding = speech.RecognitionConfig.AudioEncoding.WEBM_OPUS
        if actual_audio_file.endswith(".opus") and not actual_audio_file.endswith(".webm"):
             # Raw opus, not in a container. This might need specific handling or yt-dlp ensures it's in webm.
             # For now, assuming yt-dlp gives WEBM_OPUS or a compatible format that STT can auto-detect or handle.
             # If it's raw opus, encoding should be speech.RecognitionConfig.AudioEncoding.OGG_OPUS if STT supports it directly
             # or just OPUS if it's raw opus. The pasted config used WEBM_OPUS, so sticking to that.
             pass # Keep WEBM_OPUS as per original config, assuming yt-dlp output is compatible

        config = speech.RecognitionConfig(
            encoding=audio_encoding, # As per pasted_content.txt, assuming webm container with opus
            sample_rate_hertz=48000, # Opus typically uses 48kHz, but STT can often auto-detect
            language_code="en-US", # Make this configurable if needed
            enable_automatic_punctuation=True
        )

        response = speech_client.recognize(config=config, audio=recognition_audio)
        transcript_parts = [result.alternatives[0].transcript for result in response.results if result.alternatives]
        transcript = " ".join(transcript_parts)

        if not transcript:
            # Clean up audio file
            if os.path.exists(actual_audio_file):
                os.remove(actual_audio_file)
            return jsonify({"error": "Could not transcribe audio. The video might have no speech or the speech is unclear."}), 500
        print("Transcript generated.")

        # 3. Text summarization using Gemini
        if not model:
            # Clean up audio file
            if os.path.exists(actual_audio_file):
                os.remove(actual_audio_file)
            return jsonify({"error": "Gemini model not configured. Check GOOGLE_API_KEY."}), 500

        print("Summarizing transcript...")
        # Ensure the prompt is clear for the model
        summarization_prompt = f"""Please summarize the following transcript from a YouTube video. Provide a concise and informative summary highlighting the key points and main topics discussed:\n\nTranscript:\n{transcript}\n\nSummary:"""
        
        gemini_response = model.generate_content(summarization_prompt)
        summary = gemini_response.text
        print("Summary generated.")

        # Clean up downloaded audio file
        if os.path.exists(actual_audio_file):
            os.remove(actual_audio_file)

        return jsonify({"summary": summary, "transcript": transcript})

    except yt_dlp.utils.DownloadError as e:
        print(f"yt-dlp download error: {e}")
        # Attempt to remove partial file if it exists
        if os.path.exists(audio_filename):
            try: os.remove(audio_filename) 
            except: pass
        return jsonify({"error": f"Failed to download or process video: {str(e)}"}), 500
    except genai.types.generation_types.BlockedPromptException as e:
        print(f"Gemini content generation blocked: {e}")
        if os.path.exists(actual_audio_file):
            try: os.remove(actual_audio_file) 
            except: pass
        return jsonify({"error": "Content generation blocked by safety settings. The transcript may contain sensitive content."}), 400
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        # Attempt to remove partial file if it exists
        if os.path.exists(actual_audio_file if 'actual_audio_file' in locals() else audio_filename):
            try: os.remove(actual_audio_file if 'actual_audio_file' in locals() else audio_filename) 
            except: pass
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

if __name__ == "__main__":
    # Port 5000 is standard for Flask dev, can be changed
    app.run(host="0.0.0.0", port=5000, debug=True) 

