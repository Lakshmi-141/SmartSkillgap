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

async function runPhase4Tests() {
  console.log('=== RUNNING PHASE 4 CAREER DATABASE & SELECTION SUITE ===\n');
  const timestamp = Date.now();
  const testEmail = `careeruser_${timestamp}@example.com`;

  // Setup: Register User to obtain JWT
  console.log('[Setup] Registering test user...');
  const regRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Career Seeker',
    email: testEmail,
    password: 'password123',
    confirmPassword: 'password123',
    targetRole: 'Full Stack Web Developer'
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

  // Test 1: GET /api/careers
  console.log('[Test 1] GET /api/careers - Fetching initial seeded careers...');
  const listRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/careers',
    method: 'GET',
    headers: authHeaders
  });

  console.log('Status:', listRes.status, 'Careers Count:', listRes.data.count);
  if (listRes.status !== 200 || listRes.data.count < 11) {
    console.error(`❌ Test 1 FAILED! Expected 11 careers, got ${listRes.data.count}`);
    process.exit(1);
  }
  console.log('✅ Test 1 PASSED: 11 initial careers fetched successfully.\n');

  // Test 2: Search Careers (GET /api/careers?search=DevOps)
  console.log('[Test 2] GET /api/careers?search=DevOps - Filtering careers...');
  const searchRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/careers?search=DevOps',
    method: 'GET',
    headers: authHeaders
  });

  console.log('Status:', searchRes.status, 'Found:', searchRes.data.careers?.map(c => c.title));
  const devOpsCareer = searchRes.data.careers?.find(c => c.title === 'DevOps Engineer');

  if (searchRes.status !== 200 || !devOpsCareer) {
    console.error('❌ Test 2 FAILED! Search filter did not return DevOps Engineer.');
    process.exit(1);
  }
  console.log('✅ Test 2 PASSED: Career search filter working.\n');

  // Test 3: GET /api/careers/:id
  const careerId = devOpsCareer._id;
  console.log(`[Test 3] GET /api/careers/${careerId} - Fetching single career details...`);
  const detailRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/careers/${careerId}`,
    method: 'GET',
    headers: authHeaders
  });

  console.log('Status:', detailRes.status, 'Title:', detailRes.data.career?.title, 'Skills Count:', detailRes.data.career?.requiredSkills?.length);
  if (detailRes.status !== 200 || detailRes.data.career?.title !== 'DevOps Engineer') {
    console.error('❌ Test 3 FAILED! Unable to fetch career detail.');
    process.exit(1);
  }
  console.log('✅ Test 3 PASSED: Single career details fetched successfully.\n');

  // Test 4: POST /api/careers/:id/select - Select Target Career
  console.log(`[Test 4] POST /api/careers/${careerId}/select - Selecting DevOps Engineer as target career...`);
  const selectRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/careers/${careerId}/select`,
    method: 'POST',
    headers: authHeaders
  });

  console.log('Status:', selectRes.status, 'Target Career in Profile:', selectRes.data.user?.targetCareer);

  if (selectRes.status !== 200 || selectRes.data.user?.targetCareer !== 'DevOps Engineer') {
    console.error('❌ Test 4 FAILED! Target career selection failed.');
    process.exit(1);
  }
  console.log('✅ Test 4 PASSED: Target career saved to user profile in MongoDB.\n');

  console.log('🎉 ALL PHASE 4 CAREER DATABASE & SELECTION TESTS PASSED SUCCESSFULLY!');
}

runPhase4Tests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
