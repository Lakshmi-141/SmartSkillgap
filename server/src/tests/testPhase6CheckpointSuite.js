const http = require('http');

const request = (options, postData) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', err => reject(err));
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
};

async function runPhase6CheckpointTests() {
  console.log('=== RUNNING PHASE 6 MOCK INTERVIEW & ASSESSMENT CHECKPOINT ===\n');
  const timestamp = Date.now();
  const testEmail = `interview_student_${timestamp}@example.com`;

  // Step 1: Register Student User
  console.log(`[Step 1] Registering student user (${testEmail})...`);
  const regRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Interview Candidate',
    email: testEmail,
    password: 'password123',
    confirmPassword: 'password123',
    targetRole: 'Full Stack Web Developer'
  });

  if (regRes.status !== 201 || !regRes.data.token) {
    console.error('❌ Step 1 FAILED! Registration failed.');
    process.exit(1);
  }
  const token = regRes.data.token;
  console.log('✅ Step 1 PASSED: Registered & JWT acquired.\n');

  // Step 2: Fetch Available Assessments / Interviews Catalog
  console.log('[Step 2] GET /api/assessments - Fetching available mock interview modules...');
  const catalogRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/assessments',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (catalogRes.status !== 200 || !catalogRes.data.assessments.length) {
    console.error('❌ Step 2 FAILED! Unable to fetch assessments catalog.', catalogRes.data);
    process.exit(1);
  }
  const targetAssessment = catalogRes.data.assessments[0];
  console.log(`Status: 200 | Modules Count: ${catalogRes.data.assessments.length} | Target Module: "${targetAssessment.title}"`);
  console.log('✅ Step 2 PASSED: Interview modules catalog fetched cleanly.\n');

  // Step 3: Fetch Questions for Target Interview Module
  console.log(`[Step 3] GET /api/assessments/${targetAssessment._id} - Fetching questions...`);
  const detailRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/assessments/${targetAssessment._id}`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (detailRes.status !== 200 || !detailRes.data.assessment.questions) {
    console.error('❌ Step 3 FAILED! Unable to fetch interview questions.', detailRes.data);
    process.exit(1);
  }
  const questions = detailRes.data.assessment.questions;
  console.log(`Status: 200 | Questions Count: ${questions.length}`);
  if (questions.length === 0) {
    console.error('❌ Step 3 FAILED! Questions list is empty.');
    process.exit(1);
  }
  console.log('✅ Step 3 PASSED: Interview questions loaded cleanly.\n');

  // Step 4: Submit Answers & Calculate Score
  console.log(`[Step 4] POST /api/assessments/${targetAssessment._id}/submit - Submitting answers...`);
  // Simulate answers for all questions
  const simulatedAnswers = {};
  questions.forEach((q, idx) => {
    simulatedAnswers[idx] = 0; // Select option 0
  });

  const submitRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/assessments/${targetAssessment._id}/submit`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    answers: simulatedAnswers
  });

  if (submitRes.status !== 200 || !submitRes.data.result) {
    console.error('❌ Step 4 FAILED! Submitting assessment failed.', submitRes.data);
    process.exit(1);
  }
  const evalResult = submitRes.data.result;
  console.log(`Status: 200 | Score: ${evalResult.score}/${evalResult.totalQuestions} (${evalResult.percentage}%) | Proficiency: ${evalResult.proficiencyLevel}`);
  console.log('✅ Step 4 PASSED: Interview score and proficiency evaluated cleanly.\n');

  // Step 5: Fetch Previous Attempt History (GET /api/assessments/results/me)
  console.log('[Step 5] GET /api/assessments/results/me - Fetching completed interview history...');
  const historyRes1 = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/assessments/results/me',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (historyRes1.status !== 200 || !historyRes1.data.results.length) {
    console.error('❌ Step 5 FAILED! Unable to fetch completed attempt history.', historyRes1.data);
    process.exit(1);
  }
  console.log(`Status: 200 | Completed Attempts Count: ${historyRes1.data.results.length}`);
  console.log('✅ Step 5 PASSED: Attempt history fetched successfully.\n');

  // Step 6: Re-authenticate & verify persistent attempt history in MongoDB
  console.log('[Step 6] Logging out & logging back in to verify MongoDB attempt history persistence...');
  const loginRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: testEmail,
    password: 'password123'
  });
  const newToken = loginRes.data.token;

  const historyRes2 = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/assessments/results/me',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${newToken}` }
  });

  if (historyRes2.status !== 200 || !historyRes2.data.results.length) {
    console.error('❌ Step 6 FAILED! Persisted attempt history not retrieved after re-login.');
    process.exit(1);
  }

  const persistedAttempt = historyRes2.data.results[0];
  if (persistedAttempt.score !== evalResult.score || persistedAttempt.percentage !== evalResult.percentage) {
    console.error('❌ Step 6 FAILED! Score or percentage mismatch in MongoDB persistence.', persistedAttempt);
    process.exit(1);
  }

  console.log(`✅ Step 6 PASSED: Persistent MongoDB interview history confirmed (Score: ${persistedAttempt.score}/${persistedAttempt.totalQuestions} | Percentage: ${persistedAttempt.percentage}% | Proficiency: ${persistedAttempt.proficiencyLevel}).\n`);

  console.log('🎉 ALL PHASE 6 MOCK INTERVIEW TESTS PASSED SUCCESSFULLY!');
}

runPhase6CheckpointTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
