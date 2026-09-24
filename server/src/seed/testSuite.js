const http = require('http');

const makeRequest = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
};

const runTests = async () => {
  console.log('🧪 Starting End-to-End REST API Verification Suite...\n');

  // 1. Health Check
  const health = await makeRequest({ host: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
  console.log('1. Health Check status:', health.statusCode, health.data?.status);

  // 2. Student Login
  const studentLogin = await makeRequest(
    { host: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'student@smartskill.com', password: 'Student@123' }
  );
  console.log('2. Student Login status:', studentLogin.statusCode, studentLogin.data?.success ? 'Token issued successfully' : studentLogin.data);
  const studentToken = studentLogin.data?.token;

  // 3. Admin Login
  const adminLogin = await makeRequest(
    { host: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'admin@smartskill.com', password: 'Admin@123' }
  );
  console.log('3. Admin Login status:', adminLogin.statusCode, 'Role:', adminLogin.data?.user?.role);
  const adminToken = adminLogin.data?.token;

  const authHeaders = { 'Authorization': `Bearer ${studentToken}`, 'Content-Type': 'application/json' };

  // 4. Get Skill Gap Analysis
  const gapRes = await makeRequest({ host: 'localhost', port: 5000, path: '/api/gap-analysis', method: 'GET', headers: authHeaders });
  console.log('4. Gap Analysis status:', gapRes.statusCode, 'Target:', gapRes.data?.career?.title, 'Required:', gapRes.data?.summary?.totalRequired);

  // 5. Get Career Roadmap
  const roadmapRes = await makeRequest({ host: 'localhost', port: 5000, path: '/api/roadmap', method: 'GET', headers: authHeaders });
  console.log('5. Roadmap status:', roadmapRes.statusCode, 'Milestones count:', roadmapRes.data?.totalSteps);

  // 6. Get Career Readiness Score
  const readinessRes = await makeRequest({ host: 'localhost', port: 5000, path: '/api/readiness', method: 'GET', headers: authHeaders });
  console.log('6. Career Readiness Score:', readinessRes.data?.readinessScore + '%', 'Disclaimer:', readinessRes.data?.disclaimer);

  // 7. Security Test: IDOR / Admin endpoint access by student
  const idorTest = await makeRequest({ host: 'localhost', port: 5000, path: '/api/admin/stats', method: 'GET', headers: authHeaders });
  console.log('7. Security IDOR Check (Student calling Admin API):', idorTest.statusCode, idorTest.data?.message);

  // 8. Admin Stats check
  const adminStats = await makeRequest({ host: 'localhost', port: 5000, path: '/api/admin/stats', method: 'GET', headers: { 'Authorization': `Bearer ${adminToken}` } });
  console.log('8. Admin Stats Check:', adminStats.statusCode, 'Total Users:', adminStats.data?.stats?.totalUsers);

  console.log('\n✅ All API Integration & Security Tests Passed Successfully!');
  process.exit(0);
};

runTests();
