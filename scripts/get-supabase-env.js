#!/usr/bin/env node

/**
 * GreenProof AI — Supabase Environment Variable Generator
 * 
 * Usage:
 *   node scripts/get-supabase-env.js           # Prints formatted environment variables
 *   node scripts/get-supabase-env.js --write   # Automatically writes to server/.env and client/.env
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const isWriteMode = process.argv.includes('--write');
const rootDir = process.cwd();
const serverEnvPath = path.join(rootDir, 'server', '.env');
const clientEnvPath = path.join(rootDir, 'client', '.env');

console.log('\n================================================================');
console.log('       GREENPROOF AI — SUPABASE ENVIRONMENT GENERATOR          ');
console.log('================================================================\n');

// 1. Attempt to query local Supabase status if running
let supabaseUrl = 'http://127.0.0.1:54321';
let supabaseAnonKey = 'your_supabase_anon_key_here';
let supabaseServiceKey = 'your_supabase_service_role_key_here';
let databaseUrl = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

try {
  const statusOutput = execSync('npx supabase status -o json', {
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'ignore'],
    timeout: 5000,
  });
  const parsed = JSON.parse(statusOutput);
  if (parsed.API_URL) supabaseUrl = parsed.API_URL;
  if (parsed.ANON_KEY) supabaseAnonKey = parsed.ANON_KEY;
  if (parsed.SERVICE_ROLE_KEY) supabaseServiceKey = parsed.SERVICE_ROLE_KEY;
  if (parsed.DB_URL) databaseUrl = parsed.DB_URL;
  console.log('[INFO] Detected active local Supabase instance credentials!\n');
} catch (e) {
  console.log('[INFO] Local Supabase instance not active. Using standardized template values.');
  console.log('       (You can also run `npx supabase start` or paste values from your Supabase Dashboard).\n');
}

// Generate random secure JWT Secret if not already existing
const generatedJwtSecret = crypto.randomBytes(32).toString('hex');

// Format Backend .env content
const serverEnvContent = `# ==============================================================================
# GREENPROOF AI - BACKEND ENVIRONMENT CONFIGURATION (SUPABASE + GEMINI)
# Generated: ${new Date().toISOString()}
# ==============================================================================

# Server Network Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (PostgreSQL / Supabase / MongoDB Atlas)
DATABASE_URL=${databaseUrl}
# Optional MongoDB URI (if running hybrid MongoDB or in-memory mode)
MONGODB_URI=

# Supabase Project Configuration
SUPABASE_URL=${supabaseUrl}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}

# JWT Authentication
JWT_SECRET=${generatedJwtSecret}
JWT_EXPIRES_IN=7d

# Google Gemini API (@google/genai)
# Obtain your key at: https://aistudio.google.com/
GEMINI_API_KEY=

# CORS Allowed Frontend Origin(s)
CLIENT_URL=http://localhost:5173
`;

// Format Frontend .env content
const clientEnvContent = `# ==============================================================================
# GREENPROOF AI - FRONTEND ENVIRONMENT CONFIGURATION
# Generated: ${new Date().toISOString()}
# ==============================================================================

# Backend API Endpoint URL
VITE_API_URL=http://localhost:5000/api
VITE_BACKEND_URL=http://localhost:5000

# Direct Supabase Client Connectivity
VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseAnonKey}

# Application Branding
VITE_APP_NAME=GreenProof AI
VITE_APP_TAGLINE=Evidence-Based Environmental Claim Assessment
`;

// Print to console
console.log('-------------------- BACKEND (server/.env) --------------------');
console.log(serverEnvContent);

console.log('-------------------- FRONTEND (client/.env) -------------------');
console.log(clientEnvContent);

// If write mode requested, save to disk
if (isWriteMode) {
  fs.writeFileSync(serverEnvPath, serverEnvContent);
  fs.writeFileSync(clientEnvPath, clientEnvContent);
  console.log('----------------------------------------------------------------');
  console.log(' [SUCCESS] Automatically updated both server/.env and client/.env!');
  console.log('----------------------------------------------------------------\n');
} else {
  console.log('----------------------------------------------------------------');
  console.log(' [TIP] To write these variables directly to server/.env and client/.env,');
  console.log('       run: npm run supabase:env:write');
  console.log('----------------------------------------------------------------\n');
}
