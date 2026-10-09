# 🚀 Deploying CyberShield AI V2 to Google Cloud (100% Free Tier)

This guide walks you through deploying **CyberShield AI V2** to **Google Cloud Run** using the **Google Cloud Free Tier**, meaning **\$0 cost** for hosting your hackathon prototype.

---

## 🎁 Google Cloud Free Tier Benefits Used
- **Google Cloud Run**: Free **2 Million requests per month**, 360,000 GB-seconds memory, 180,000 vCPU-seconds.
- **Artifact Registry / Container Registry**: Free **0.5 GB storage per month**.
- **Cloud Build**: Free **120 build-minutes per day**.
- **Google Gemini API**: Free tier via Google AI Studio.
- **MongoDB Atlas**: Free Shared Cluster (M0 Sandbox with 512 MB forever free).

---

## 🛠️ Step-by-Step Deployment Instructions

### Option 1: One-Command Deploy via Google Cloud Run (Recommended)

1. **Install and authenticate Google Cloud SDK (`gcloud`)**:
   ```bash
   # Login to your Google account
   gcloud auth login

   # Set your active GCP project
   gcloud config set project YOUR_GCP_PROJECT_ID
   ```

2. **Enable necessary Google Cloud APIs** (1-time command):
   ```bash
   gcloud services enable run.googleapis.com \
                          cloudbuild.googleapis.com \
                          artifactregistry.googleapis.com
   ```

3. **Deploy directly from source to Cloud Run**:
   Run this single command from your project root `c:\cyber-security(hack)`:
   ```bash
   gcloud run deploy cybershield-ai \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --memory 1Gi \
     --cpu 1 \
     --set-env-vars GEMINI_API_KEY="YOUR_GEMINI_KEY",MONGODB_URI="YOUR_MONGODB_ATLAS_URI"
   ```

4. **Instant Live URL**:
   Google Cloud will build your container and give you a live production HTTPS URL:
   `https://cybershield-ai-xxxx-uc.a.run.app`

---

### Option 2: Deploy Frontend on Firebase Hosting & Backend on Cloud Run (Alternative Free Setup)

If you prefer separating static frontend hosting from the Python backend:

1. **Backend on Cloud Run**:
   ```bash
   gcloud run deploy cybershield-api --source . --region us-central1 --allow-unauthenticated
   ```
2. **Frontend on Firebase Hosting** (Free forever):
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   # Set public directory to: frontend/dist
   # Configure as single-page app: Yes
   npm run build --prefix frontend
   firebase deploy --only hosting
   ```

---

## 🧪 Local Run (Development & Testing)

To run the unified application locally:

```bash
# 1. Start unified FastAPI backend & React frontend
python run_platform.py
```
Open your browser at: **`http://localhost:8000`**

- Interactive Swagger API Documentation: **`http://localhost:8000/docs`**
- Health Check: **`http://localhost:8000/api/health`**
- Demo Account: **`analyst@cybershield.ai`** / **`cybershield2026`** (or click "1-Click Demo SOC Analyst Sign In")
