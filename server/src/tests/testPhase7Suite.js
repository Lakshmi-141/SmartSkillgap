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

async function runPhase7Tests() {
  console.log('=== RUNNING PHASE 7 DASHBOARD SUMMARY SUITE ===\n');
  const timestamp = Date.now();
  const testEmail = `dashuser_${timestamp}@example.com`;

  // Setup: Register User
  console.log('[Setup] Registering test user...');
  const regRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Alex Johnson',
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

  // Add some skills & generate analysis
  console.log('[Setup] Setting up profile skills & roadmap...');
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
    path: '/api/skill-gap/analyze',
    method: 'POST',
    headers: authHeaders
  }, { careerTitle: 'Full Stack Web Developer' });

  await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/roadmaps/generate',
    method: 'POST',
    headers: authHeaders
  }, { targetCareer: 'Full Stack Web Developer' });

  // Test 1: GET /api/users/dashboard-summary
  console.log('[Test 1] GET /api/users/dashboard-summary - Fetching aggregated real stats...');
  const summaryRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/users/dashboard-summary',
    method: 'GET',
    headers: authHeaders
  });

  console.log('Status:', summaryRes.status);
  console.log('User Name:', summaryRes.data.summary?.user?.name);
  console.log('Target Career:', summaryRes.data.summary?.user?.targetCareer);
  console.log('Skill Match %:', summaryRes.data.summary?.skillGap?.matchPercentage + '%');
  console.log('Matching Skills Count:', summaryRes.data.summary?.skillGap?.matchingSkillsCount);
  console.log('Skills To Improve Count:', summaryRes.data.summary?.skillGap?.skillsToImproveCount);
  console.log('Missing Skills Count:', summaryRes.data.summary?.skillGap?.missingSkillsCount);
  console.log('Roadmap Progress %:', summaryRes.data.summary?.roadmap?.progress + '%');
  console.log('Current Learning Phase:', summaryRes.data.summary?.roadmap?.currentPhase?.title);
  console.log('Recent Activity Items:', summaryRes.data.summary?.recentActivity?.length);

  if (
    summaryRes.status !== 200 ||
    !summaryRes.data.summary?.user ||
    summaryRes.data.summary?.skillGap?.matchPercentage === undefined ||
    summaryRes.data.summary?.roadmap?.progress === undefined
  ) {
    console.error('❌ Test 1 FAILED! Dashboard summary data invalid.');
    process.exit(1);
  }

  console.log('✅ Test 1 PASSED: Aggregated real dashboard summary data returned successfully.\n');
  console.log('🎉 ALL PHASE 7 DASHBOARD SUMMARY TESTS PASSED SUCCESSFULLY!');
}

runPhase7Tests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
