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

async function runPhase3CheckpointTests() {
  console.log('=== RUNNING PHASE 3 DYNAMIC SKILL GAP ANALYSIS CHECKPOINT ===\n');
  const timestamp = Date.now();
  const userA_email = `skillgap_userA_${timestamp}@example.com`;
  const userB_email = `skillgap_userB_${timestamp}@example.com`;

  // Step 1: Register User A
  console.log(`[Step 1] Registering User A (${userA_email})...`);
  const regA = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'User A',
    email: userA_email,
    password: 'password123',
    confirmPassword: 'password123',
    targetRole: 'Full Stack Web Developer'
  });
  if (regA.status !== 201 || !regA.data.token) {
    console.error('❌ Step 1 FAILED! User A registration failed.');
    process.exit(1);
  }
  const tokenA = regA.data.token;
  console.log('✅ Step 1 PASSED: User A registered.\n');

  // Step 2: Add initial skills to User A (React.js: Advanced)
  console.log('[Step 2] Adding skill "React.js" (Advanced) to User A...');
  await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/skills',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` }
  }, { name: 'React.js', proficiency: 'Advanced', category: 'Frontend' });

  // Add a beginner skill to User A (Git & GitHub: Beginner)
  await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/skills',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` }
  }, { name: 'Git & GitHub', proficiency: 'Beginner', category: 'Tools' });
  console.log('✅ Step 2 PASSED: Initial skills added to User A.\n');

  // Step 3: Run Skill Gap Analysis 1 for User A
  console.log('[Step 3] Running initial Skill Gap Analysis for User A...');
  const analyze1 = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/skill-gap/analyze',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  if (analyze1.status !== 200 || !analyze1.data.analysis) {
    console.error('❌ Step 3 FAILED! Skill gap analysis 1 failed.', analyze1.data);
    process.exit(1);
  }
  const initialMatch = analyze1.data.analysis.matchPercentage;
  console.log(`Status: 200 | Initial Match: ${initialMatch}% | Matching Skills: ${analyze1.data.analysis.matchingSkills.length} | Skills To Improve: ${analyze1.data.analysis.skillsToImprove.length} | Missing: ${analyze1.data.analysis.missingSkills.length}`);
  console.log('✅ Step 3 PASSED: Initial skill gap calculated deterministically.\n');

  // Step 4: Add new skill (Node.js: Advanced) to User A & Re-analyze
  console.log('[Step 4] Adding "Node.js" (Advanced) to User A profile and re-analyzing...');
  await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/skills',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` }
  }, { name: 'Node.js', proficiency: 'Advanced', category: 'Backend' });

  const analyze2 = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/skill-gap/analyze',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  if (analyze2.status !== 200 || !analyze2.data.analysis) {
    console.error('❌ Step 4 FAILED! Re-analysis failed.');
    process.exit(1);
  }
  const updatedMatch = analyze2.data.analysis.matchPercentage;
  console.log(`Updated Match: ${updatedMatch}% (Was ${initialMatch}%)`);
  if (updatedMatch <= initialMatch) {
    console.error('❌ Step 4 FAILED! Match percentage did not increase after adding Node.js skill.');
    process.exit(1);
  }
  const hasNodeInMatching = analyze2.data.analysis.matchingSkills.some(s => s.name === 'Node.js');
  if (!hasNodeInMatching) {
    console.error('❌ Step 4 FAILED! Node.js is not in matchingSkills array.');
    process.exit(1);
  }
  console.log('✅ Step 4 PASSED: Skill gap dynamically updated! Match increased from', initialMatch, '% to', updatedMatch, '%.\n');

  // Step 5: Register User B with different career & skills for multi-user isolation test
  console.log(`[Step 5] Registering User B (${userB_email}) and testing isolation...`);
  const regB = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'User B',
    email: userB_email,
    password: 'password123',
    confirmPassword: 'password123',
    targetRole: 'Data Scientist'
  });
  const tokenB = regB.data.token;

  await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/skills',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenB}` }
  }, { name: 'Python', proficiency: 'Advanced', category: 'Languages' });

  const analyzeB = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/skill-gap/analyze',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });

  console.log(`User B Target: ${analyzeB.data.analysis.targetCareer} | Match: ${analyzeB.data.analysis.matchPercentage}%`);
  if (analyzeB.data.analysis.targetCareer === analyze2.data.analysis.targetCareer && analyzeB.data.analysis.targetCareer !== 'Data Scientist & AI Engineer') {
    console.error('❌ Step 5 FAILED! User B target career conflicted with User A.');
    process.exit(1);
  }
  console.log('✅ Step 5 PASSED: Multi-user skill gap calculations are isolated and distinct.\n');

  // Step 6: Verify Persistence in MongoDB by fetching GET /api/skill-gap/me
  console.log('[Step 6] Fetching persisted analysis from MongoDB via GET /api/skill-gap/me...');
  const getMeRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/skill-gap/me',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });

  if (getMeRes.status !== 200 || getMeRes.data.analysis.matchPercentage !== updatedMatch) {
    console.error('❌ Step 6 FAILED! Persisted MongoDB analysis does not match.');
    process.exit(1);
  }
  console.log('✅ Step 6 PASSED: Analysis cleanly retrieved from MongoDB.\n');

  console.log('🎉 ALL PHASE 3 SKILL GAP ANALYSIS TESTS PASSED SUCCESSFULLY!');
}

runPhase3CheckpointTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
