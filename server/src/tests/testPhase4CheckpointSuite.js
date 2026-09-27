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

async function runPhase4CheckpointTests() {
  console.log('=== RUNNING PHASE 4 PERSONALIZED LEARNING ROADMAP CHECKPOINT ===\n');
  const timestamp = Date.now();
  const testEmail = `roadmap_student_${timestamp}@example.com`;

  // Step 1: Register Student User
  console.log(`[Step 1] Registering student user (${testEmail})...`);
  const regRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Roadmap Scholar',
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

  // Step 2: Generate Roadmap based on Skill Gap
  console.log('[Step 2] POST /api/roadmaps/generate - Generating personalized roadmap...');
  const genRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/roadmaps/generate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (genRes.status !== 200 || !genRes.data.roadmap) {
    console.error('❌ Step 2 FAILED! Generating roadmap failed.', genRes.data);
    process.exit(1);
  }
  const initialRoadmap = genRes.data.roadmap;
  console.log(`Status: 200 | Target Career: ${initialRoadmap.targetCareer} | Phases Count: ${initialRoadmap.phases.length} | Initial Progress: ${initialRoadmap.overallProgress}%`);
  console.log('✅ Step 2 PASSED: Roadmap generated cleanly.\n');

  // Step 3: Update Phase 1 Status to "Completed"
  console.log('[Step 3] PUT /api/roadmaps/progress - Updating Phase 1 to "Completed"...');
  const phase1 = initialRoadmap.phases[0];
  const updateRes1 = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/roadmaps/${initialRoadmap._id}/progress`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    phaseNumber: phase1.phaseNumber,
    status: 'Completed'
  });

  if (updateRes1.status !== 200 || updateRes1.data.roadmap.overallProgress <= 0) {
    console.error('❌ Step 3 FAILED! Phase 1 status update failed.', updateRes1.data);
    process.exit(1);
  }
  console.log(`Status: 200 | Updated Progress: ${updateRes1.data.roadmap.overallProgress}%`);
  console.log('✅ Step 3 PASSED: Phase 1 updated to Completed and overall progress updated.\n');

  // Step 4: Re-authenticate (Simulate Logout & Login) and verify persistence in MongoDB
  console.log('[Step 4] Logging out & logging back in to verify MongoDB roadmap persistence...');
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

  const fetchRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/roadmaps/me',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${newToken}` }
  });

  if (fetchRes.status !== 200 || !fetchRes.data.roadmap) {
    console.error('❌ Step 4 FAILED! Unable to retrieve roadmap after re-login.');
    process.exit(1);
  }

  const persistedRoadmap = fetchRes.data.roadmap;
  const persistedPhase1 = persistedRoadmap.phases.find(p => p.phaseNumber === phase1.phaseNumber);

  if (persistedPhase1.status !== 'Completed' || persistedRoadmap.overallProgress !== updateRes1.data.roadmap.overallProgress) {
    console.error('❌ Step 4 FAILED! Persisted phase status or progress mismatch.');
    process.exit(1);
  }

  console.log(`✅ Step 4 PASSED: Persistent MongoDB roadmap confirmed (Target: ${persistedRoadmap.targetCareer} | Phase 1 Status: ${persistedPhase1.status} | Progress: ${persistedRoadmap.overallProgress}%).\n`);

  console.log('🎉 ALL PHASE 4 PERSONALIZED LEARNING ROADMAP TESTS PASSED SUCCESSFULLY!');
}

runPhase4CheckpointTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
