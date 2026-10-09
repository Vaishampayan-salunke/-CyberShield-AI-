/**
 * SIH26106 Email Threat Intelligence Platform (ETIP)
 * Comprehensive End-to-End System Integration Test Suite
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const BACKEND_URL = 'http://localhost:5000';
const FASTAPI_URL = 'http://localhost:8000';

async function runAllTests() {
  console.log('\n===============================================================');
  console.log('  SIH26106 ETIP — END-TO-END INTEGRATION TEST SUITE');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      process.stdout.write(`⏳ Testing: ${name}... `);
      await fn();
      console.log('✅ PASS');
      passed++;
    } catch (err) {
      console.log(`❌ FAIL`);
      console.error(`   Error: ${err.message}`);
      if (err.response && err.response.data) {
        console.error(`   Response:`, err.response.data);
      }
      failed++;
    }
  }

  // ── 1. FastAPI Model Service Health ───────────────────────────
  await test('FastAPI Health & Model Metadata (Port 8000)', async () => {
    const res = await axios.get(`${FASTAPI_URL}/health`);
    if (res.data.status !== 'online' || !res.data.model_loaded) {
      throw new Error('FastAPI model not online or model not loaded');
    }
    const info = await axios.get(`${FASTAPI_URL}/model-info`);
    if (!info.data.accuracy || info.data.accuracy < 0.90) {
      throw new Error(`Model accuracy below threshold: ${info.data.accuracy}`);
    }
  });

  // ── 2. FastAPI ML Prediction Pipeline ─────────────────────────
  await test('FastAPI /predict Multi-Class Threat Classifier', async () => {
    const payload = {
      subject: 'Urgent: Verify your PayPal account within 24 hours',
      body: 'Dear Customer, Unusual activity was detected. Click http://paypal-security-alert.com/verify to restore access.',
      sender: 'service@paypal-security-alert.com',
      headers: { spf: 'fail', dkim: 'fail', dmarc: 'fail' },
      urls: ['http://paypal-security-alert.com/verify']
    };
    const res = await axios.post(`${FASTAPI_URL}/predict`, payload);
    if (!res.data.classification || res.data.classification !== 'phishing') {
      throw new Error(`Expected 'phishing' classification, got '${res.data.classification}'`);
    }
    if (!res.data.reasons || res.data.reasons.length === 0) {
      throw new Error('No explainable AI reasons returned');
    }
    if (res.data.risk_score < 70) {
      throw new Error(`Expected high risk score (>70), got ${res.data.risk_score}`);
    }
  });

  // ── 3. FastAPI AI Chat Assistant ──────────────────────────────
  await test('FastAPI /chat Explainer ("Why is this email phishing?")', async () => {
    const res = await axios.post(`${FASTAPI_URL}/chat`, {
      question: 'Why is this email phishing?',
      context: {
        verdict: 'phishing',
        riskScore: 85,
        reasons: ['SPF authentication failure', 'Suspicious URL redirect', 'Urgency manipulation'],
        sender: 'service@paypal-security-alert.com'
      }
    });
    if (!res.data.answer || !res.data.answer.includes('Phishing')) {
      throw new Error('Chat response did not explain phishing verdict');
    }
    if (!res.data.suggestions || res.data.suggestions.length === 0) {
      throw new Error('No follow-up suggestions returned');
    }
  });

  // ── 4. Node.js Backend Health & Swagger Docs ─────────────────
  await test('Node.js Backend Health & API Docs (Port 5000)', async () => {
    const res = await axios.get(`${BACKEND_URL}/health`);
    if (res.data.status !== 'online') {
      throw new Error('Backend health endpoint returned non-online status');
    }
  });

  // ── 5. User Authentication (Signup & Login) ───────────────────
  let authToken = '';
  const testUserEmail = `analyst_${Date.now()}@etip-test.com`;
  await test('Authentication: User Signup & JWT Issuance', async () => {

    const res = await axios.post(`${BACKEND_URL}/api/auth/signup`, {
      name: 'Integration Test Analyst',
      email: testUserEmail,
      password: 'Password123!'
    });
    if (!res.data.data.token) throw new Error('No JWT token in signup response');
    authToken = res.data.data.token;
  });

  await test('Authentication: User Login & Profile Retrieval', async () => {
    const res = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: testUserEmail,
      password: 'Password123!'
    });
    if (!res.data.data.token) throw new Error('No JWT token in login response');
    
    // Test authenticated /me
    const meRes = await axios.get(`${BACKEND_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${res.data.data.token}` }
    });
    if (meRes.data.data.email !== testUserEmail) {
      throw new Error('Authenticated /me did not match user email');
    }
  });

  // ── 6. Ingest .EML File via Multipart Form ────────────────────
  let uploadedEmailId = '';
  await test('Email Parser: Ingest .EML File (sample_emails/phishing_paypal.eml)', async () => {
    const emlPath = path.join(__dirname, '../../sample_emails/phishing_paypal.eml');
    if (!fs.existsSync(emlPath)) throw new Error(`Sample file not found at ${emlPath}`);

    const form = new FormData();
    form.append('email_file', fs.createReadStream(emlPath));

    const res = await axios.post(`${BACKEND_URL}/api/email/upload`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${authToken}`
      }
    });

    if (!res.data.data.emailId) throw new Error('No emailId returned from upload');
    uploadedEmailId = res.data.data.emailId;
  });

  // ── 7. Deep Multi-Vector Threat Analysis Pipeline ─────────────
  let generatedReportId = '';
  await test('AI Threat Engine: Multi-Factor Threat Analysis (/api/email/analyze)', async () => {
    const res = await axios.post(`${BACKEND_URL}/api/email/analyze`, {
      emailId: uploadedEmailId
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const report = res.data.data;
    if (!report.reportId) throw new Error('No reportId returned from analyze');
    if (report.verdict !== 'phishing') throw new Error(`Expected 'phishing' verdict, got ${report.verdict}`);
    if (!report.aiAnalysis || !report.aiAnalysis.reasons) throw new Error('Missing AI explainability analysis');
    if (!report.indicatorsOfCompromise) throw new Error('Missing Indicators of Compromise (IOCs)');

    generatedReportId = report.reportId;
  });

  // ── 8. Threat Report Retrieval & PDF Generation ───────────────
  await test('Report Module: Retrieve Report by ID (/api/report/:id)', async () => {
    const res = await axios.get(`${BACKEND_URL}/api/report/${generatedReportId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (res.data.data.verdict !== 'phishing') {
      throw new Error('Report verdict mismatch');
    }
  });

  await test('Report Module: Stream PDF Dossier (/api/report/download/:id)', async () => {
    const res = await axios.get(`${BACKEND_URL}/api/report/download/${generatedReportId}`, {
      responseType: 'arraybuffer'
    });
    if (res.status !== 200 || !res.data || res.data.length < 500) {
      throw new Error('PDF buffer empty or invalid');
    }
    const pdfHeader = Buffer.from(res.data).slice(0, 4).toString('utf8');
    if (pdfHeader !== '%PDF') {
      throw new Error(`Invalid PDF header: ${pdfHeader}`);
    }
  });

  // ── 9. AI Chat Assistant Proxy Route ──────────────────────────
  await test('AI Module: Node.js Backend AI Chat Proxy (/api/ai/chat)', async () => {
    const res = await axios.post(`${BACKEND_URL}/api/ai/chat`, {
      question: 'What is SPF authentication?',
      context: { verdict: 'phishing', riskScore: 80 }
    });
    if (!res.data.data.answer || !res.data.data.answer.includes('SPF')) {
      throw new Error('Chat answer did not include SPF explanations');
    }
  });

  // ── 10. Dashboard & Historical Scan Ledger ────────────────────
  await test('Dashboard Module: Real-Time Stats & Threat Trends', async () => {
    const statsRes = await axios.get(`${BACKEND_URL}/api/dashboard/stats`);
    if (statsRes.data.data.totalEmailsScanned === undefined) {
      throw new Error('Stats missing totalEmailsScanned');
    }

    const trendsRes = await axios.get(`${BACKEND_URL}/api/dashboard/trends?range=7d`);
    if (!trendsRes.data.data.timeline) {
      throw new Error('Trends missing timeline');
    }

    const recentRes = await axios.get(`${BACKEND_URL}/api/dashboard/recent-threats`);
    if (!Array.isArray(recentRes.data.data)) {
      throw new Error('Recent threats is not an array');
    }
  });

  await test('History Module: Filterable Scan History Ledger', async () => {
    const res = await axios.get(`${BACKEND_URL}/api/history?verdict=phishing`);
    if (!Array.isArray(res.data.data.history)) {
      throw new Error('History list is not an array');
    }
  });

  // ── 11. Static Frontend Delivery Check ────────────────────────
  await test('Frontend Delivery: Level-3 SOC Console HTML & Assets', async () => {
    const htmlRes = await axios.get(`${BACKEND_URL}/index.html`);
    if (!htmlRes.data.includes('SOC Threat Operations Center') && !htmlRes.data.includes('Redirecting to SOC Console')) {
      throw new Error('index.html did not contain expected SOC console content');
    }

    const cssRes = await axios.get(`${BACKEND_URL}/assets/style.css`);
    if (!cssRes.data.includes('--cyan')) {
      throw new Error('style.css did not contain theme variables');
    }
  });

  console.log('\n===============================================================');
  console.log(`  INTEGRATION TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch(err => {
  console.error('Fatal Integration Test Error:', err);
  process.exit(1);
});
