"use server"

import { cookies } from "next/headers"

// The backend API endpoint
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/summarize";
const GEMINI_ERROR_MSG = "AI processing failed - please try again or check the video URL.";

export interface SummaryData {
  videoId?: string; // videoId might not be available if backend doesn't send it
  title?: string; // title might not be available
  duration?: string; // duration might not be available
  summary: string;
  transcript?: string; // Transcript is now part of the response
  error?: string; // To carry error messages to the client
}

export async function summarizeVideo(videoUrl: string): Promise<SummaryData> {
  console.log(`[actions.ts] summarizeVideo called with URL: ${videoUrl}`);
  console.log(`[actions.ts] Calling backend API: ${API_ENDPOINT}`);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: videoUrl }),
      cache: "no-store", // Ensure fresh data for each request
    });

    if (!response.ok) {
      let errorMsg = GEMINI_ERROR_MSG;
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || `Request failed with status ${response.status}`;
        console.error("[actions.ts] Backend error:", errorData);
      } catch (e) {
        console.error("[actions.ts] Failed to parse error JSON from backend, status:", response.status);
        errorMsg = `Request failed with status ${response.status}. Please check server logs.`;
      }
      // Store error in cookie to be displayed by SummaryResult or handle directly
      cookies().set("video-summary-error", JSON.stringify({ error: errorMsg }), {
        maxAge: 300, // 5 minutes for error display
        path: "/",
      });
      // Clear any previous successful summary
      cookies().delete("video-summary"); 
      return { summary: "", error: errorMsg }; // Return error structure
    }

    const data = await response.json();
    console.log("[actions.ts] Received data from backend:", data);

    if (data.error) {
      cookies().set("video-summary-error", JSON.stringify({ error: data.error }), {
        maxAge: 300,
        path: "/",
      });
      cookies().delete("video-summary");
      return { summary: "", error: data.error };
    }

    const summaryData: SummaryData = {
      summary: data.summary,
      transcript: data.transcript,
      // videoId, title, duration are not sent by the current backend, can be added if needed
    };

    // Store the summary in a cookie for SummaryResult to pick up
    cookies().set("video-summary", JSON.stringify(summaryData), {
      maxAge: 3600, // 1 hour
      path: "/",
    });
    // Clear any previous error
    cookies().delete("video-summary-error");

    return summaryData;
  } catch (error) {
    console.error("[actions.ts] Error in summarizeVideo function:", error);
    let errorMessage = GEMINI_ERROR_MSG;
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    cookies().set("video-summary-error", JSON.stringify({ error: errorMessage }), {
        maxAge: 300, 
        path: "/",
    });
    cookies().delete("video-summary");
    return { summary: "", error: errorMessage }; // Return error structure
  }
}

// The extractVideoId function is not strictly needed here anymore if the backend handles the full URL
// but can be kept for other potential uses or if we decide to send only ID to backend.
// function extractVideoId(url: string): string {
//   const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
//   const match = url.match(regExp);
//   return match && match[2].length === 11 ? match[2] : "";
// }

