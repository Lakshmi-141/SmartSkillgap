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

async function runPhase5Tests() {
  console.log('=== RUNNING PHASE 5 SKILL GAP ANALYSIS SUITE ===\n');
  const timestamp = Date.now();
  const testEmail = `gapuser_${timestamp}@example.com`;

  // 1. Setup: Register User to obtain JWT
  console.log('[Setup] Registering test user...');
  const regRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Frontend Developer Transitioning to Full Stack',
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

  // 2. Add sample skills (HTML5 & CSS3, JavaScript (ES6+), React.js, and a Beginner HTML)
  console.log('[Setup] Adding frontend skills to user profile...');
  await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/skills',
    method: 'POST',
    headers: authHeaders
  }, { name: 'HTML5 & CSS3', proficiency: 'Advanced', category: 'Frontend' });

  await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/skills',
    method: 'POST',
    headers: authHeaders
  }, { name: 'JavaScript (ES6+)', proficiency: 'Advanced', category: 'Frontend' });

  await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/skills',
    method: 'POST',
    headers: authHeaders
  }, { name: 'React.js', proficiency: 'Intermediate', category: 'Frontend' });

  await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/skills',
    method: 'POST',
    headers: authHeaders
  }, { name: 'Git & GitHub', proficiency: 'Beginner', category: 'Tools' }); // beginner -> to improve

  console.log('✅ Acquired skills set up on user profile.\n');

  // Test 1: POST /api/skill-gap/analyze
  console.log('[Test 1] POST /api/skill-gap/analyze - Running deterministic skill gap analysis...');
  const analyzeRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/skill-gap/analyze',
    method: 'POST',
    headers: authHeaders
  }, {
    careerTitle: 'Full Stack Developer'
  });

  console.log('Status:', analyzeRes.status);
  console.log('Target Career:', analyzeRes.data.analysis?.targetCareer);
  console.log('Match Percentage:', analyzeRes.data.analysis?.matchPercentage + '%');
  console.log('Matching Skills:', analyzeRes.data.analysis?.matchingSkills?.map(s => `${s.name} (${s.proficiency})`));
  console.log('Skills To Improve:', analyzeRes.data.analysis?.skillsToImprove?.map(s => `${s.name} (${s.proficiency})`));
  console.log('Missing Skills:', analyzeRes.data.analysis?.missingSkills?.map(s => s.name));

  if (
    analyzeRes.status !== 200 ||
    !analyzeRes.data.analysis?.matchingSkills ||
    !analyzeRes.data.analysis?.missingSkills
  ) {
    console.error('❌ Test 1 FAILED! Skill gap analysis object structure invalid.');
    process.exit(1);
  }
  console.log('✅ Test 1 PASSED: Skill gap analysis calculated deterministically.\n');

  // Test 2: GET /api/skill-gap/me
  console.log('[Test 2] GET /api/skill-gap/me - Fetching persisted analysis from MongoDB...');
  const fetchRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/skill-gap/me',
    method: 'GET',
    headers: authHeaders
  });

  console.log('Status:', fetchRes.status, 'Persisted Target Career:', fetchRes.data.analysis?.targetCareer, 'Match:', fetchRes.data.analysis?.matchPercentage + '%');
  if (fetchRes.status !== 200 || fetchRes.data.analysis?.matchPercentage === undefined) {
    console.error('❌ Test 2 FAILED! Unable to fetch persisted skill gap from MongoDB.');
    process.exit(1);
  }
  console.log('✅ Test 2 PASSED: Skill gap analysis persisted & retrieved from MongoDB.\n');

  console.log('🎉 ALL PHASE 5 SKILL GAP ANALYSIS TESTS PASSED SUCCESSFULLY!');
}

runPhase5Tests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
