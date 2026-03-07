# MediExplain Backend

FastAPI backend that accepts medical document images and returns plain-language explanations with optional audio.

---

## Architecture

```
POST /api/explain
    │
    ├─► Gemini Vision  →  extract raw text (OCR)
    ├─► Gemini Text    →  simplify to plain English
    ├─► ElevenLabs     →  generate audio (optional)
    └─► Cloudinary     →  host image (optional)
```

---

## Folder Structure

```
mediexplain-backend/
├── app/
│   ├── main.py                    # FastAPI app, CORS, route registration
│   ├── config.py                  # All env vars via pydantic-settings
│   ├── routers/
│   │   └── explain.py             # POST /api/explain  +  POST /api/explain/text
│   └── services/
│       ├── ocr.py                 # Gemini Vision image → raw text
│       ├── simplifier.py          # Gemini text → structured plain English
│       ├── audio.py               # ElevenLabs text → base64 MP3
│       └── cloudinary_upload.py   # Optional image hosting
├── .env.example
├── requirements.txt
└── README.md
```

---

## Quick Start

### 1. Clone & enter project
```bash
cd mediexplain-backend
```

### 2. Create virtual environment
```bash
python -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Set up environment
```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY (required)
```

### 5. Run the server
```bash
uvicorn app.main:app --reload --port 8000
```

Server is live at: **http://localhost:8000**
Interactive docs at: **http://localhost:8000/docs**

---

## API Endpoints

### `GET /health`
```bash
curl http://localhost:8000/health
# {"status": "ok", "service": "MediExplain"}
```

---

### `POST /api/explain`
Upload a medical image. Returns OCR text + simplified explanation.

**With text only (default):**
```bash
curl -X POST http://localhost:8000/api/explain \
  -F "file=@prescription.jpg"
```

**With audio included:**
```bash
curl -X POST "http://localhost:8000/api/explain?include_audio=true" \
  -F "file=@prescription.jpg"
```

**Example response:**
```json
{
  "success": true,
  "raw_text": "Amoxicillin 500mg - Take 1 capsule 3 times daily for 7 days...",
  "simplified": {
    "summary": "Your doctor prescribed an antibiotic to fight an infection.",
    "instructions": [
      "Take 1 capsule in the morning, afternoon, and evening",
      "Take it for 7 days — don't stop early even if you feel better",
      "Take with food to avoid an upset stomach"
    ],
    "warnings": [
      "Tell your doctor if you are allergic to penicillin",
      "May cause diarrhea — drink plenty of water"
    ],
    "terms": [
      { "term": "Amoxicillin", "definition": "A common antibiotic that kills bacteria" },
      { "term": "500mg", "definition": "The dose — how strong each capsule is" }
    ]
  },
  "audio_b64": "//NExAA...",
  "image_url": "https://res.cloudinary.com/...",
  "meta": {
    "filename": "prescription.jpg",
    "file_size_kb": 245.3,
    "audio_included": true
  }
}
```

---

### `POST /api/explain/text`
Skip OCR, send raw text directly.

```bash
curl -X POST http://localhost:8000/api/explain/text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Metformin 500mg twice daily with meals. Monitor blood glucose.",
    "include_audio": false
  }'
```

---

## Playing Audio in the Frontend

```javascript
const audioB64 = response.audio_b64;
const audio = new Audio(`data:audio/mp3;base64,${audioB64}`);
audio.play();
```

---

## Debugging Common Errors

### `GEMINI_API_KEY not set` / `401 Unauthorized`
- Make sure `.env` exists and has a valid key
- Get one free at https://aistudio.google.com/app/apikey

### `422 No text extracted`
- Image might be too blurry or low resolution
- Try a higher quality photo with better lighting

### `413 File too large`
- Compress the image or increase `MAX_FILE_SIZE_MB` in `.env`

### `python-multipart not installed`
```bash
pip install python-multipart
```

### ElevenLabs `401 Unauthorized`
- Check `ELEVENLABS_API_KEY` in `.env`
- Free tier has 10,000 chars/month — sufficient for demos

### Cloudinary `cloudinary.exceptions.Error`
- Make sure all three Cloudinary keys are set in `.env`
- Or leave them blank to disable Cloudinary (image_url will be null)

### `ModuleNotFoundError: No module named 'app'`
- Run uvicorn from the project root: `mediexplain-backend/`
- NOT from inside the `app/` folder
