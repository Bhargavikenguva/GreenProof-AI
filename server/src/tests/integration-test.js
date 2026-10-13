process.env.NODE_ENV = 'test';
import { startServer } from '../index.js';
import mongoose from 'mongoose';

async function runIntegration() {
  console.log('--- RUNNING FULL INTEGRATION SMOKE TEST ---');
  let serverInstance = null;
  const testPort = 5002;
  const baseUrl = `http://localhost:${testPort}`;

  try {
    const started = await startServer(testPort);
    serverInstance = started.server;

    // 1. Health check
    console.log('[1/8] Checking GET /api/health...');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    console.log('  Health Response:', healthData);
    if (healthRes.status !== 200 || healthData.status !== 'healthy') {
      throw new Error('Health check failed');
    }

    // 2. User registration
    console.log('\n[2/8] Testing POST /api/auth/register...');
    const regPayload = {
      name: 'Integration Test User',
      email: `test_${Date.now()}@greenproof.ai`,
      password: 'SecurePassword123!',
    };
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regPayload),
    });
    const regData = await regRes.json();
    if (regRes.status !== 201 || !regData.token) {
      throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    }
    const token = regData.token;
    console.log('  Registered user ID:', regData.user._id, 'Role:', regData.user.role);

    // 3. User login
    console.log('\n[3/8] Testing POST /api/auth/login...');
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: regPayload.email, password: regPayload.password }),
    });
    const loginData = await loginRes.json();
    if (loginRes.status !== 200 || !loginData.token) {
      throw new Error('Login failed');
    }
    console.log('  Login successful for:', loginData.user.email);

    // 4. Authenticated GET /api/auth/me
    console.log('\n[4/8] Testing GET /api/auth/me...');
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meData = await meRes.json();
    if (meRes.status !== 200 || meData.user.email !== regPayload.email) {
      throw new Error('Failed to fetch authenticated user profile');
    }
    console.log('  Verified authenticated user:', meData.user.name);

    // 5. Create Assessment with manual claim
    console.log('\n[5/8] Testing POST /api/assessments (Manual Claim)...');
    const assessRes = await fetch(`${baseUrl}/api/assessments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        companyName: 'NaturePack Global',
        productName: 'EcoShield Paper Box',
        productDescription: 'Brown corrugated shipping carton',
        manualClaim: '100% Recycled Post-Consumer Cardboard',
      }),
    });
    const assessData = await assessRes.json();
    if (assessRes.status !== 201 || !assessData.assessment._id) {
      throw new Error('Assessment creation failed');
    }
    const assessmentId = assessData.assessment._id;
    console.log('  Created Assessment ID:', assessmentId);

    // 6. Select / Edit Claim
    console.log('\n[6/8] Testing PATCH /api/assessments/:id/select-claim...');
    const patchRes = await fetch(`${baseUrl}/api/assessments/${assessmentId}/select-claim`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        claimId: 'manual_claim_1',
        claimText: '100% Recycled Post-Consumer Cardboard under FSC Standard',
        isManual: true,
      }),
    });
    const patchData = await patchRes.json();
    if (patchRes.status !== 200) {
      throw new Error('Select claim failed');
    }
    console.log('  Updated claim text:', patchData.assessment.selectedClaim.claimText);

    // 7. Run Assessment (No documents attached -> Must yield Insufficient evidence)
    console.log('\n[7/8] Testing POST /api/assessments/:id/analyze without evidence...');
    const analyzeRes = await fetch(`${baseUrl}/api/assessments/${assessmentId}/analyze`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const analyzeData = await analyzeRes.json();
    if (analyzeRes.status !== 200 || analyzeData.assessment.status !== 'Insufficient evidence') {
      throw new Error(`Expected status "Insufficient evidence", got "${analyzeData.assessment?.status}"`);
    }
    console.log('  Audit Result Status:', analyzeData.assessment.status);
    console.log('  Audit Explanation Excerpt:', analyzeData.assessment.assessmentResult.explanation.substring(0, 100) + '...');

    // 8. Dashboard Statistics from live MongoDB
    console.log('\n[8/8] Testing GET /api/stats/dashboard (Live MongoDB query)...');
    const statsRes = await fetch(`${baseUrl}/api/stats/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const statsData = await statsRes.json();
    if (statsRes.status !== 200 || typeof statsData.stats.totalAssessments !== 'number') {
      throw new Error('Stats endpoint failed');
    }
    console.log('  Live MongoDB Total Assessments:', statsData.stats.totalAssessments);
    console.log('  Live MongoDB Insufficient Count:', statsData.stats.statusCounts.insufficient);
    console.log('  Recent Assessments retrieved:', statsData.recentAssessments.length);

    console.log('\n===========================================');
    console.log('ALL 8 INTEGRATION TESTS PASSED CLEANLY!');
    console.log('===========================================');
  } catch (err) {
    console.error('Integration test failure:', err.message);
    process.exitCode = 1;
  } finally {
    if (serverInstance) {
      serverInstance.close();
    }
    await mongoose.disconnect();
    process.exit(process.exitCode || 0);
  }
}

runIntegration();
