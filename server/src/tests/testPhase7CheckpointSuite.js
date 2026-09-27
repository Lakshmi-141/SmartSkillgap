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

async function runPhase7CheckpointTests() {
  console.log('=== RUNNING PHASE 7 DASHBOARD & PROGRESS TRACKING CHECKPOINT ===\n');
  const timestamp = Date.now();
  const testEmail = `progress_student_${timestamp}@example.com`;

  // Step 1: Register Student User
  console.log(`[Step 1] Registering student user (${testEmail})...`);
  const regRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Dynamic Progress Candidate',
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

  // Step 2: Fetch Initial Dashboard Summary & Readiness
  console.log('[Step 2] Fetching initial career readiness & dashboard summary...');
  const initReadiness = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/progress/readiness',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (initReadiness.status !== 200 || initReadiness.data.careerReadinessPercentage === undefined) {
    console.error('❌ Step 2 FAILED! Unable to fetch initial readiness score.');
    process.exit(1);
  }
  const initialScore = initReadiness.data.careerReadinessPercentage;
  console.log(`Status: 200 | Initial Readiness Percentage: ${initialScore}%`);
  console.log('✅ Step 2 PASSED: Initial dashboard metric fetched cleanly.\n');

  // Step 3: Add Skills to Profile & Re-analyze Skill Gap
  console.log('[Step 3] Adding skills (React.js & Node.js Advanced) to profile...');
  await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/skills',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, { name: 'React.js', proficiency: 'Advanced', category: 'Frontend' });

  await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/skills',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, { name: 'Node.js', proficiency: 'Advanced', category: 'Backend' });

  await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/skill-gap/analyze',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const readinessAfterSkills = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/progress/readiness',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const scoreAfterSkills = readinessAfterSkills.data.careerReadinessPercentage;
  console.log(`Updated Score after skills added: ${scoreAfterSkills}% (Was ${initialScore}%)`);
  if (scoreAfterSkills <= initialScore) {
    console.error('❌ Step 3 FAILED! Readiness score did not increase after adding skills.');
    process.exit(1);
  }
  console.log('✅ Step 3 PASSED: Readiness dynamically updated upon skill additions.\n');

  // Step 4: Complete Roadmap Phase 1
  console.log('[Step 4] Generating roadmap and marking Phase 1 as Completed...');
  const genRoadmap = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/roadmaps/generate',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const roadmapId = genRoadmap.data.roadmap._id;

  await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/roadmaps/${roadmapId}/progress`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, { phaseNumber: 1, status: 'Completed' });

  const readinessAfterRoadmap = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/progress/readiness',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const scoreAfterRoadmap = readinessAfterRoadmap.data.careerReadinessPercentage;
  console.log(`Updated Score after roadmap milestone completed: ${scoreAfterRoadmap}% (Was ${scoreAfterSkills}%)`);
  if (scoreAfterRoadmap <= scoreAfterSkills) {
    console.error('❌ Step 4 FAILED! Readiness score did not increase after completing roadmap phase.');
    process.exit(1);
  }
  console.log('✅ Step 4 PASSED: Readiness dynamically updated upon roadmap completion.\n');

  // Step 5: Mark Project Progress as Completed
  console.log('[Step 5] Fetching project recommendations and marking project as COMPLETED...');
  const recProj = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/projects/recommendations',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const targetProjId = recProj.data.recommendations[0]._id;

  await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/projects/${targetProjId}/progress`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, { status: 'COMPLETED' });

  const readinessAfterProject = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/progress/readiness',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const scoreAfterProject = readinessAfterProject.data.careerReadinessPercentage;
  console.log(`Updated Score after project completed: ${scoreAfterProject}% (Was ${scoreAfterRoadmap}%)`);
  if (scoreAfterProject <= scoreAfterRoadmap) {
    console.error('❌ Step 5 FAILED! Readiness score did not increase after project completion.');
    process.exit(1);
  }
  console.log('✅ Step 5 PASSED: Readiness dynamically updated upon project completion.\n');

  // Step 6: Submit Mock Interview Quiz Assessment
  console.log('[Step 6] Submitting mock interview assessment...');
  const catalogRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/assessments',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const testAssId = catalogRes.data.assessments[0]._id;

  await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/assessments/${testAssId}/submit`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, { answers: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 } });

  const finalReadiness = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/progress/readiness',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const finalScore = finalReadiness.data.careerReadinessPercentage;
  console.log(`Final Readiness Score after mock interview: ${finalScore}% (Was ${scoreAfterProject}%)`);
  if (finalScore <= scoreAfterProject) {
    console.error('❌ Step 6 FAILED! Readiness score did not increase after mock interview.');
    process.exit(1);
  }
  console.log('✅ Step 6 PASSED: Overall readiness score reflects all 4 real database dimensions!\n');

  console.log('🎉 ALL PHASE 7 PROGRESS TRACKING & DASHBOARD TESTS PASSED SUCCESSFULLY!');
}

runPhase7CheckpointTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
