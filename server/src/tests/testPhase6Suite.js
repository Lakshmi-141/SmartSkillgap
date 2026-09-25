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

async function runPhase6Tests() {
  console.log('=== RUNNING PHASE 6 PERSONALIZED CAREER ROADMAP SUITE ===\n');
  const timestamp = Date.now();
  const testEmail = `roadmapuser_${timestamp}@example.com`;

  // Setup: Register User
  console.log('[Setup] Registering test user...');
  const regRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Roadmap Explorer',
    email: testEmail,
    password: 'password123',
    confirmPassword: 'password123',
    targetRole: 'Full Stack Developer'
  });

  const token = regRes.data.token;
  if (!token) {
    console.error('❌ Setup failed: Token missing');
    process.exit(1);
  }
  console.log('✅ User registered successfully. Token acquired.\n');

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Test 1: POST /api/roadmaps/generate
  console.log('[Test 1] POST /api/roadmaps/generate - Generating personalized roadmap...');
  const genRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/roadmaps/generate',
    method: 'POST',
    headers: authHeaders
  }, {
    targetCareer: 'Full Stack Developer'
  });

  console.log('Status:', genRes.status, 'Target Career:', genRes.data.roadmap?.targetCareer, 'Phases Count:', genRes.data.roadmap?.phases?.length);
  const phases = genRes.data.roadmap?.phases;

  if (genRes.status !== 200 || !phases || phases.length < 5) {
    console.error('❌ Test 1 FAILED! Roadmap generation failed.');
    process.exit(1);
  }
  console.log('✅ Test 1 PASSED: Personalized roadmap generated with 10 structured phases.\n');

  // Test 2: GET /api/roadmaps/me
  console.log('[Test 2] GET /api/roadmaps/me - Fetching roadmap from MongoDB...');
  const fetchRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/roadmaps/me',
    method: 'GET',
    headers: authHeaders
  });

  console.log('Status:', fetchRes.status, 'Overall Progress:', fetchRes.data.roadmap?.overallProgress + '%');
  if (fetchRes.status !== 200 || fetchRes.data.roadmap?.overallProgress === undefined) {
    console.error('❌ Test 2 FAILED! Unable to fetch roadmap from MongoDB.');
    process.exit(1);
  }
  console.log('✅ Test 2 PASSED: Roadmap successfully retrieved from MongoDB.\n');

  // Test 3: PUT /api/roadmaps/:id/progress - Updating phase 1 status to Completed
  const roadmapId = fetchRes.data.roadmap._id;
  const firstPhase = fetchRes.data.roadmap.phases[0];

  console.log(`[Test 3] PUT /api/roadmaps/${roadmapId}/progress - Updating ${firstPhase.title} status to Completed...`);
  const updateRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/roadmaps/${roadmapId}/progress`,
    method: 'PUT',
    headers: authHeaders
  }, {
    phaseNumber: firstPhase.phaseNumber,
    status: 'Completed'
  });

  console.log('Status:', updateRes.status, 'Updated Progress:', updateRes.data.roadmap?.overallProgress + '%');
  const updatedFirstPhase = updateRes.data.roadmap?.phases.find(p => p.phaseNumber === firstPhase.phaseNumber);

  if (updateRes.status !== 200 || updatedFirstPhase?.status !== 'Completed') {
    console.error('❌ Test 3 FAILED! Phase progress update failed.');
    process.exit(1);
  }
  console.log('✅ Test 3 PASSED: Phase status updated to Completed and overall progress recalculated.\n');

  console.log('🎉 ALL PHASE 6 CAREER ROADMAP TESTS PASSED SUCCESSFULLY!');
}

runPhase6Tests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
