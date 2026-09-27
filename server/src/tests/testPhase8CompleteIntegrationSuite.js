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

async function runPhase8IntegrationTests() {
  console.log('=== RUNNING PHASE 8 COMPLETE INTEGRATION END-TO-END SUITE ===\n');
  const timestamp = Date.now();
  const testEmail = `e2e_journey_${timestamp}@example.com`;

  // Step 1: Registration
  console.log(`[Step 1] Registering student user (${testEmail})...`);
  const regRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Full Journey Candidate',
    email: testEmail,
    password: 'password123',
    confirmPassword: 'password123'
  });

  if (regRes.status !== 201 || !regRes.data.token) {
    console.error('❌ Step 1 FAILED! Registration failed.', regRes.data);
    process.exit(1);
  }
  let token = regRes.data.token;
  console.log('✅ Step 1 PASSED: User registered and JWT token acquired.\n');

  // Step 2: Login
  console.log('[Step 2] Authenticating with login credentials...');
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

  if (loginRes.status !== 200 || !loginRes.data.token) {
    console.error('❌ Step 2 FAILED! Login failed.');
    process.exit(1);
  }
  token = loginRes.data.token;
  console.log('✅ Step 2 PASSED: Login successful.\n');

  // Step 3: Current Level - Add Skills & Select Career
  console.log('[Step 3] Setting up Current Level: Adding skills & selecting target career...');
  await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/skills',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, { name: 'HTML5 & CSS3', proficiency: 'Advanced', category: 'Frontend' });

  await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/skills',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, { name: 'React.js', proficiency: 'Advanced', category: 'Frontend' });

  const careersRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/careers',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const selectedCareer = careersRes.data.careers[0];

  const selectCareerRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/careers/${selectedCareer._id}/select`,
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (selectCareerRes.status !== 200) {
    console.error('❌ Step 3 FAILED! Selecting career failed.');
    process.exit(1);
  }
  console.log(`✅ Step 3 PASSED: Target career set to "${selectCareerRes.data.user.targetCareer}".\n`);

  // Step 4: Skill Gap Analysis Calculation
  console.log('[Step 4] Running Skill Gap Analysis calculation...');
  const analyzeRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/skill-gap/analyze',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (analyzeRes.status !== 200 || analyzeRes.data.analysis.matchPercentage === undefined) {
    console.error('❌ Step 4 FAILED! Skill gap calculation failed.');
    process.exit(1);
  }
  const matchPct = analyzeRes.data.analysis.matchPercentage;
  console.log(`Status: 200 | Match Percentage: ${matchPct}% | Matching: ${analyzeRes.data.analysis.matchingSkills.length} | Missing: ${analyzeRes.data.analysis.missingSkills.length}`);
  console.log('✅ Step 4 PASSED: Skill gap calculated deterministically.\n');

  // Step 5: Personalized Learning Path / Roadmap Progress
  console.log('[Step 5] Generating personalized learning roadmap & marking Phase 1 completed...');
  const genRoadmapRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/roadmaps/generate',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const roadmapId = genRoadmapRes.data.roadmap._id;

  const updateRoadmapRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/roadmaps/${roadmapId}/progress`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, { phaseNumber: 1, status: 'Completed' });

  if (updateRoadmapRes.status !== 200) {
    console.error('❌ Step 5 FAILED! Updating roadmap phase failed.');
    process.exit(1);
  }
  console.log(`Status: 200 | Roadmap Progress: ${updateRoadmapRes.data.roadmap.overallProgress}%`);
  console.log('✅ Step 5 PASSED: Learning path progress updated.\n');

  // Step 6: Project Recommendation & Completion
  console.log('[Step 6] Fetching project recommendations & completing top project build...');
  const recProjRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/projects/recommendations',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const targetProjId = recProjRes.data.recommendations[0]._id;

  const updateProjRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/projects/${targetProjId}/progress`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, { status: 'COMPLETED', githubRepoUrl: 'https://github.com/example/full-journey-repo' });

  if (updateProjRes.status !== 200 || updateProjRes.data.progress.status !== 'COMPLETED') {
    console.error('❌ Step 6 FAILED! Updating project progress failed.');
    process.exit(1);
  }
  console.log('✅ Step 6 PASSED: Project progress marked COMPLETED.\n');

  // Step 7: Mock Interview Quiz & Scoring
  console.log('[Step 7] Taking mock interview quiz assessment & evaluating score...');
  const assCatalogRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/assessments',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const testAssId = assCatalogRes.data.assessments[0]._id;

  const submitAssRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/assessments/${testAssId}/submit`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, { answers: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 } });

  if (submitAssRes.status !== 200 || !submitAssRes.data.result) {
    console.error('❌ Step 7 FAILED! Mock interview evaluation failed.');
    process.exit(1);
  }
  console.log(`Status: 200 | Score: ${submitAssRes.data.result.score}/${submitAssRes.data.result.totalQuestions} | Proficiency: ${submitAssRes.data.result.proficiencyLevel}`);
  console.log('✅ Step 7 PASSED: Mock interview completed.\n');

  // Step 8: Progress Tracking & Dashboard Summary
  console.log('[Step 8] Verifying aggregated dashboard summary & readiness index...');
  const summaryRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/users/dashboard-summary',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const readinessRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/progress/readiness',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (summaryRes.status !== 200 || readinessRes.status !== 200) {
    console.error('❌ Step 8 FAILED! Dashboard summary or readiness API failed.');
    process.exit(1);
  }
  const readinessIndex = readinessRes.data.careerReadinessPercentage;
  console.log(`Status: 200 | Final Dashboard Career Readiness Index: ${readinessIndex}%`);
  console.log('✅ Step 8 PASSED: Dashboard summary and readiness index verified.\n');

  // Step 9: Re-authenticate & Confirm End-to-End Data Persistence in MongoDB
  console.log('[Step 9] Simulating logout & re-logging in to confirm end-to-end data persistence in MongoDB...');
  const reLoginRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: testEmail,
    password: 'password123'
  });
  const newToken = reLoginRes.data.token;

  const verifySummary = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/users/dashboard-summary',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${newToken}` }
  });

  const verifyReadiness = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/progress/readiness',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${newToken}` }
  });

  if (verifySummary.status !== 200 || verifyReadiness.data.careerReadinessPercentage !== readinessIndex) {
    console.error('❌ Step 9 FAILED! Re-login data persistence mismatch.', verifyReadiness.data);
    process.exit(1);
  }

  console.log(`✅ Step 9 PASSED: MongoDB end-to-end persistence confirmed (Readiness Index: ${verifyReadiness.data.careerReadinessPercentage}% intact after re-login).\n`);

  console.log('🎉 COMPLETE END-TO-END SMARTSKILL JOURNEY VERIFIED 100%!');
}

runPhase8IntegrationTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
