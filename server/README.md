# GreenProof AI — Backend API (Standalone)

Standalone Node.js / Express REST API for GreenProof AI.

## Tech Stack
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose (Atlas support + fallback local zero-config in-memory DB)
- **Authentication**: JWT & bcryptjs
- **Validation**: Zod
- **File Uploads**: Multer
- **Text Extraction**: PDF (`pdf-parse`), DOCX (`mammoth`), TXT
- **AI SDK**: Official Google Gemini SDK (`@google/genai`)
- **Quotation Auditor**: Deterministic text substring search cross-checking all AI citations against extracted documents

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set your environment variables in `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=
JWT_SECRET=your_jwt_secret_key_minimum_32_characters
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key_from_google_ai_studio
CLIENT_URL=http://localhost:5173
```
- If `MONGODB_URI` is left blank, an in-memory MongoDB will automatically start for local testing.
- If `GEMINI_API_KEY` is left blank, the API runs in offline test mode.

### 3. Run Locally
```bash
# Development mode with auto-reload
npm run dev

# Or standard production mode
npm start
```
Server runs on [http://localhost:5000](http://localhost:5000).

Health check: [http://localhost:5000/api/health](http://localhost:5000/api/health).

### 4. Run Automated Tests
```bash
npm test
```
Executes both unit/schema tests and integration smoke tests.

## Deployment to Render
1. Create a new **Web Service** on Render pointing to the backend.
2. Build command: `npm install`
3. Start command: `node src/index.js`
4. Environment variables to configure in Render dashboard:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGODB_URI`: `<Your MongoDB Atlas connection URI>`
   - `JWT_SECRET`: `<A secure random string>`
   - `GEMINI_API_KEY`: `<Your Google Gemini API Key>`
   - `CLIENT_URL`: `https://your-frontend.vercel.app`
