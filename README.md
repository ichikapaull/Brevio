# Brevio - YouTube Video Özetleme Platformu

![Brevio Landing](public/readme.png)

Brevio, YouTube videolarını otomatik olarak özetleyen, Türkçe ve İngilizce destekli bir web uygulamasıdır. Google'ın Gemini AI ve Speech-to-Text teknolojilerini kullanarak videoları metne çevirir ve özetler.

## 🌟 Özellikler

- 🎥 YouTube video URL'sinden otomatik özetleme
- 🔊 Ses-metin dönüşümü
- 📝 Akıllı metin özetleme
- 🌐 Türkçe ve İngilizce dil desteği
- 🎨 Modern ve kullanıcı dostu arayüz
- ⚡ Hızlı ve verimli işlem

## 🚀 Başlangıç

### Gereksinimler

- Python 3.8+
- Node.js 16+
- Google Cloud hesabı
- Google API anahtarları

### Kurulum

1. Projeyi klonlayın:
```bash
git clone https://github.com/ichikapaull/brevio.git
cd brevio
```

2. Backend kurulumu:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Frontend kurulumu:
```bash
cd frontend/Brevio
npm install
```

4. Environment değişkenlerini ayarlayın:
```bash
# Backend için .env dosyası oluşturun
GOOGLE_API_KEY=your_google_api_key
GOOGLE_APPLICATION_CREDENTIALS=path_to_your_credentials.json
```

### Çalıştırma

1. Backend'i başlatın:
```bash
cd backend
python app.py
```

2. Frontend'i başlatın:
```bash
cd frontend/Brevio
npm run dev
```

## 🛠️ Teknolojiler

### Backend
- Flask
- Google Cloud Speech-to-Text
- Google Gemini AI
- yt-dlp

### Frontend
- React
- TypeScript
- Tailwind CSS
- Shadcn UI

## 📝 API Kullanımı

### Video Özetleme
```http
POST /summarize
Content-Type: application/json

{
    "url": "https://www.youtube.com/watch?v=..."
}
```

## 🤝 Katkıda Bulunma

1. Bu repository'yi fork edin
2. Feature branch'i oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👥 İletişim

Proje Sahibi - [@yourusername](https://github.com/ichikapaull)

Proje Linki: [https://github.com/yourusername/brevio](https://github.com/ichikapaullbrevio)

## 🙏 Teşekkürler

- Google Cloud Platform
- Gemini AI
- React ve TypeScript topluluğu
- Tüm katkıda bulunanlara 