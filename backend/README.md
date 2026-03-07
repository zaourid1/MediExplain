# MediExplain v1 Backend

AI-powered prescription explanation with multilingual voice output.

## Full Pipeline

```
User uploads prescription image
         ↓
Cloudinary  →  stores image, returns CDN URL
         ↓
Gemini 1.5 Flash  →  reads prescription, generates plain-language explanation (8 languages)
         ↓
ElevenLabs  →  converts explanation to natural speech (base64 MP3)
         ↓
Auth0  →  every request requires a valid JWT
         ↓
Returns JSON: { image_url, analysis, audio_b64 }
```

---

## Folder Structure

```
mediexplain-v2/
├── app/
│   ├── main.py                        # FastAPI app, CORS
│   ├── config.py                      # All env vars
│   ├── middleware/
│   │   └── auth0.py                   # JWT verification dependency
│   ├── routers/
│   │   ├── explain.py                 # POST /api/explain  (full pipeline)
│   │   └── auth.py                    # GET  /api/me
│   └── services/
│       ├── cloudinary_service.py      # Image upload → CDN URL
│       ├── gemini_service.py          # Prescription OCR + analysis
│       └── elevenlabs_service.py      # Text → base64 audio
├── Dockerfile                         # Vultr-ready container
├── docker-compose.yml                 # Local dev
├── requirements.txt
├── .env.example
└── .gitignore
```

---

## Local Setup

```bash
# 1. Create virtual environment
python -m venv venv
source venv/bin/activate      # Mac/Linux
venv\Scripts\activate         # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set up environment
cp .env.example .env
# Open .env and fill in all API keys

# 4. Run
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

---

## Auth0 Setup (15 minutes)

### Step 1 — Create API
1. Go to https://manage.auth0.com
2. Applications → APIs → Create API
3. Name: `MediExplain API`
4. Identifier: `https://mediexplain-api`  ← this is your `AUTH0_AUDIENCE`
5. Algorithm: RS256

### Step 2 — Create Application (for your frontend)
1. Applications → Create Application
2. Type: Single Page App (if React) or Regular Web App
3. In Settings, copy the **Domain** → this is `AUTH0_DOMAIN`

### Step 3 — Add to .env
```
AUTH0_DOMAIN=dev-yourcode.us.auth0.com
AUTH0_AUDIENCE=https://mediexplain-api
```

### Step 4 — Frontend login (example with Auth0 React SDK)
```javascript
import { useAuth0 } from '@auth0/auth0-react';

const { getAccessTokenSilently } = useAuth0();
const token = await getAccessTokenSilently({
  audience: 'https://mediexplain-api'
});

// Use token in API calls
const res = await fetch('http://localhost:8000/api/explain', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: formData,   // FormData with the image file
});
```

---

## API Endpoints

### `POST /api/explain`
**Requires: Auth0 Bearer token**

```bash
curl -X POST "http://localhost:8000/api/explain?language=es" \
  -H "Authorization: Bearer YOUR_AUTH0_TOKEN" \
  -F "file=@prescription.jpg"
```

**Supported language codes:** `en es fr de hi zh ar pt`

**Response:**
```json
{
  "success": true,
  "image_url": "https://res.cloudinary.com/your-cloud/image/upload/mediexplain/...",
  "analysis": {
    "raw_text": "Amoxicillin 500mg...",
    "medications": [
      {
        "name": "Amoxicillin",
        "dosage": "500mg",
        "frequency": "3 times daily",
        "purpose": "Antibiotic to fight bacterial infections"
      }
    ],
    "instructions": [
      "Take 1 capsule in the morning, afternoon, and night",
      "Always take with food to protect your stomach",
      "Complete the full 7 days — even if you feel better sooner"
    ],
    "warnings": [
      "Tell your doctor if you have a penicillin allergy",
      "May cause mild diarrhea — drink plenty of water"
    ],
    "summary": "Your doctor has prescribed Amoxicillin, an antibiotic...",
    "terms": [
      { "term": "Amoxicillin", "definition": "A common antibiotic that kills bacteria" }
    ]
  },
  "audio_b64": "//NExAA...",
  "language": "en",
  "meta": {
    "user_id": "auth0_abc123",
    "filename": "prescription.jpg",
    "file_size_kb": 312.4,
    "audio_included": true,
    "cloudinary_id": "mediexplain/auth0_abc123/prescription"
  }
}
```

### `GET /api/languages`
```bash
curl http://localhost:8000/api/languages
```

### `GET /api/me`
**Requires: Auth0 Bearer token**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/me
```

### `GET /health`
```bash
curl http://localhost:8000/health
```

---

## Play Audio in Frontend

```javascript
// The audio_b64 field is a base64-encoded MP3
const audio = new Audio(`data:audio/mp3;base64,${response.audio_b64}`);
audio.play();
```

---

## Deploy to Vultr

### Option A — Vultr VPS (fastest for hackathon)

```bash
# 1. Create a Vultr VPS (Ubuntu 22.04, 1 vCPU, 1GB RAM is enough for demo)
# 2. SSH into your server

# Install Docker
curl -fsSL https://get.docker.com | sh

# Upload your project (or clone from Git)
git clone https://github.com/yourname/mediexplain-backend.git
cd mediexplain-backend

# Create .env with your production keys
cp .env.example .env
nano .env

# Build and run
docker build -t mediexplain .
docker run -d \
  --name mediexplain \
  --env-file .env \
  -p 80:8000 \
  --restart unless-stopped \
  mediexplain

# Your API is live at: http://YOUR_VULTR_IP/api/explain
```

### Option B — docker-compose (recommended)

```bash
docker-compose up -d --build
```

### Add HTTPS (recommended before demo)
```bash
# Install Caddy — auto HTTPS with zero config
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/caddy-stable-archive-keyring.gpg] https://dl.cloudsmith.io/public/caddy/stable/deb/debian any-version main" | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install caddy

# Create Caddyfile
cat > /etc/caddy/Caddyfile << EOF
yourdomain.com {
    reverse_proxy localhost:8000
}
EOF

systemctl reload caddy
# HTTPS is now live at https://yourdomain.com
```

---

## Debugging

| Error | Cause | Fix |
|---|---|---|
| `401 Unauthorized` | Invalid/missing Auth0 token | Check AUTH0_DOMAIN + AUDIENCE match your Auth0 app |
| `422 Not a prescription` | Gemini couldn't identify a prescription | Use a clearer photo |
| `cloudinary.exceptions.Error` | Wrong Cloudinary keys | Double-check all 3 Cloudinary env vars |
| `Module 'app' not found` | Running uvicorn from wrong directory | Run from `mediexplain-v2/` root, not inside `app/` |
| `python-multipart not installed` | Missing dep | `pip install python-multipart` |
| ElevenLabs 401 | Bad API key | Check ELEVENLABS_API_KEY in .env |
| Auth0 JWKS fetch fails | Wrong domain | AUTH0_DOMAIN must NOT include `https://` |
