# GreenProof AI — Frontend Client (Standalone)

Standalone React + Vite single-page application for GreenProof AI.

## Tech Stack
- **Framework**: React.js 18 + Vite
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure `VITE_API_URL` and `VITE_BACKEND_URL` point to your backend:
```env
# Local development
VITE_API_URL=http://localhost:5000/api
VITE_BACKEND_URL=http://localhost:5000

# Production (e.g. Render backend)
# VITE_API_URL=https://your-backend.onrender.com/api
# VITE_BACKEND_URL=https://your-backend.onrender.com
```

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173).

### 4. Build for Production
```bash
npm run build
```
Outputs static bundle to `dist/`.

## Deployment to Vercel
1. Push `client` to GitHub or deploy via Vercel CLI.
2. Root Directory: `client` (or root if standalone repo).
3. Framework Preset: **Vite**.
4. Set Environment Variables:
   - `VITE_API_URL`: `https://your-backend.onrender.com/api`
   - `VITE_BACKEND_URL`: `https://your-backend.onrender.com`
5. `vercel.json` provides automatic SPA route rewrite rules.
