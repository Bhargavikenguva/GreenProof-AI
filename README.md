# GreenProof AI — Evidence-Based Environmental Claim Assessment MVP

GreenProof AI is a full-stack, AI-powered environmental claim assessment platform designed to investigate sustainability claims on product packaging and combat greenwashing.

---

## 1. Project Purpose

GreenProof AI helps consumers, compliance officers, and auditors verify claims made on commercial packaging (such as *"100% biodegradable"*, *"80% recycled plastic"*, *"Carbon neutral"*, and *"Environmentally friendly packaging"*).

### Fundamental Core Principle
> **Packaging photographs identify visible claims to investigate.**
> **Supporting documents (such as accredited laboratory reports, resin chain-of-custody certificates, and standard test results) provide the evidence for substantiation.**
> GreenProof AI **never** claims a product is genuinely biodegradable, carbon neutral, or eco-friendly based solely on a packaging photograph.

---

## 2. Standardized 4-Tier Assessment Statuses

GreenProof AI strictly adheres to four objective audit status labels:

1. **Supported by available evidence**: Available evidence sufficiently supports the claim within the stated scope, with no unresolved material contradiction.
2. **Insufficient evidence**: The available evidence is incomplete, irrelevant, or inadequate to substantiate the claim, but no material contradiction has been established. *(Always assigned when no documents are uploaded).*
3. **Potential inconsistency**: The available evidence materially conflicts with the claim, such as a different product identity or contradictory test result.
4. **Needs human review**: The assessment involves material ambiguity, specialist judgment, questionable document authenticity, or an unresolved issue requiring expert oversight.

*Note: Unsupported claims are never classified as fraud without rigorous forensic proof; absence of contradictory evidence is never treated as proof of truth.*

---

## 3. Technology Stack

### Frontend
- **Framework**: React.js 18 + Vite
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS (Tailored forest/sage/mint sustainability palette)
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js (ES Modules)
- **Server**: Express.js
- **Database**: MongoDB with Mongoose ODM (Atlas ready, with automatic zero-config memory database fallback for instant local evaluation)
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing
- **Data Validation**: Zod runtime schema validation
- **File Ingestion**: Multer with strict MIME and size limits
- **Document Text Extraction**:
  - PDF: `pdf-parse`
  - DOCX: `mammoth`
  - TXT: Native buffer stream parser
- **AI Engine**: Official Google Gemini SDK (`@google/genai`) multimodal vision & language model (`gemini-2.5-flash`)
- **Quotation Auditor**: Deterministic text substring search cross-checking all AI citations against actual extracted files

---

## 4. Folder Structure

```
GreenProof AI/
├── client/                     # Frontend Vite + React application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── api/                # Axios instance & interceptors
│   │   │   └── client.js
│   │   ├── components/         # Reusable UI components
│   │   │   ├── DocumentDropzone.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ImageDropzone.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ReviewModal.jsx
│   │   │   └── StatusBadge.jsx
│   │   ├── context/            # AuthContext (state & role management)
│   │   │   └── AuthContext.jsx
│   │   ├── pages/              # 8 Dedicated application views
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── EvidenceUploadPage.jsx
│   │   │   ├── HistoryPage.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── NewAssessmentPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ReportPage.jsx
│   │   │   └── ReviewQueuePage.jsx
│   │   ├── App.jsx             # Router definition & protected routes
│   │   ├── index.css           # Tailwind base & design tokens
│   │   └── main.jsx            # Entry point
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── vercel.json
├── server/                     # Backend Node.js Express API
│   ├── src/
│   │   ├── config/             # DB & environment loader
│   │   │   ├── db.js
│   │   │   └── env.js
│   │   ├── controllers/        # Request controllers
│   │   │   ├── assessment.controller.js
│   │   │   ├── auth.controller.js
│   │   │   ├── review.controller.js
│   │   │   └── stats.controller.js
│   │   ├── middleware/         # Auth, Role, Upload, and Error middlewares
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   ├── roles.js
│   │   │   ├── upload.js
│   │   │   └── validate.js
│   │   ├── models/             # Mongoose schemas
│   │   │   ├── Assessment.js
│   │   │   ├── AssessmentVersion.js
│   │   │   ├── EvidenceDocument.js
│   │   │   ├── HumanReview.js
│   │   │   └── User.js
│   │   ├── routes/             # Express API routes
│   │   │   ├── assessment.routes.js
│   │   │   ├── auth.routes.js
│   │   │   ├── health.routes.js
│   │   │   ├── review.routes.js
│   │   │   └── stats.routes.js
│   │   ├── services/           # Gemini AI & document extraction services
│   │   │   ├── extraction.service.js
│   │   │   └── gemini.service.js
│   │   ├── tests/              # Automated backend test suite
│   │   │   └── run-tests.js
│   │   └── index.js            # Express server initialization
│   ├── .env.example
│   └── package.json
├── render.yaml                 # Render cloud deployment specification
├── .env.example                # Root environment sample
├── .gitignore
├── package.json                # Root package scripts
└── README.md
```

---

## 5. Getting Started Locally

### Prerequisites
- Node.js (v18 or higher recommended; v20+ tested)
- npm or pnpm

### 1. Clone & Install Dependencies

In the root directory, install server and client dependencies:
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment Variables Setup

Copy the sample environment file in `server`:
```bash
cp server/.env.example server/.env
```

Configure your variables in `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=
JWT_SECRET=your_jwt_secret_key_minimum_32_characters
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key_from_google_ai_studio
CLIENT_URL=http://localhost:5173
```

> **Note on MongoDB**: If `MONGODB_URI` is left blank during local development, the backend automatically boots an in-memory MongoDB instance. For production, supply your MongoDB Atlas connection string.
> **Note on Gemini**: Obtain a free API key at [Google AI Studio](https://aistudio.google.com/). If omitted, the backend runs in transparent test mode with deterministic evaluation templates.

---

## 6. Running Locally

You can run the backend and frontend concurrently from their respective folders:

**Terminal 1 (Backend API):**
```bash
cd server
npm run dev
```
*Backend runs on `http://localhost:5000` (Health check at `http://localhost:5000/api/health`).*

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 7. Automated Testing

Run the automated backend test suite:
```bash
cd server
npm run test
```

The test runner validates:
1. Strict schema compliance for all 4 standardized status labels.
2. Rejection of unauthorized status classifications.
3. Deterministic quotation verifier (valid quotes pass; fabricated/hallucinated quotes are flagged).
4. Text extraction from documents with passage preservation.
5. Honesty rule: Empty evidence strictly produces `Insufficient evidence`.

---

## 8. Deployment Guide

### A. Database: MongoDB Atlas
1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free M0 cluster.
3. Under **Database Access**, create a database user and password.
4. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) for Render compatibility.
5. Click **Connect** → **Drivers** and copy your connection string into `MONGODB_URI`.

### B. Backend: Render
1. Create a new **Web Service** on [Render](https://render.com/).
2. Connect your GitHub repository.
3. Set the following build and start configurations:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`
4. Add the following **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGODB_URI`: `<Your MongoDB Atlas connection URI>`
   - `JWT_SECRET`: `<A secure random string>`
   - `GEMINI_API_KEY`: `<Your Google Gemini API Key>`
   - `CLIENT_URL`: `<Your Vercel deployment URL>`

### C. Frontend: Vercel
1. Sign in to [Vercel](https://vercel.com/) and import the repository.
2. Set **Root Directory** to `client`.
3. Framework Preset: **Vite**.
4. Deploy! `client/vercel.json` ensures all client-side routes (like `/dashboard`, `/assessments/new`) rewrite to `/index.html` seamlessly.

---

## 9. Roles & Permissions

- **`user`**: Normal user. Can upload photographs, trigger OCR claim detection, upload documents, and view their own private audits.
- **`reviewer`**: Specialist environmental auditor. Has access to the **Human Review Queue** (`/reviews`) to review contested claims, add notes, and log approved/rejected decisions.
- **`admin`**: Full administrative access.

---

## 10. Known Limitations

- **Image-only Substantiation**: A photograph alone can never scientifically prove biodegradability, compostability, or recycled percentage.
- **Scanned/Raster PDFs**: PDFs containing non-OCR scanned images require text selectable layers for extraction.
- **Legal Scope**: AI analysis is an investigatory tool and does not substitute for accredited conformity assessment or government certifications.
