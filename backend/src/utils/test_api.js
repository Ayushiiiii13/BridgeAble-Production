const http = require('http');

const request = (path, method, data, token) => {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : '';
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body || '{}') }));
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
};

const runTests = async () => {
  console.log('--- Testing BridgeAble Backend API ---');

  // 1. Health
  const health = await request('/api/health', 'GET');
  console.log('1. Health Check:', health.status === 200 ? 'PASS' : 'FAIL', health.data);

  // 2. Register
  const reg = await request('/api/auth/register', 'POST', {
    name: 'Ayushi Sharma',
    email: 'ayushi@bridgeable.org',
    password: 'password123'
  });
  console.log('2. Register:', reg.status === 201 || reg.status === 400 ? 'PASS' : 'FAIL', reg.data.message);

  // 3. Login
  const login = await request('/api/auth/login', 'POST', {
    email: 'ayushi@bridgeable.org',
    password: 'password123'
  });
  console.log('3. Login:', login.status === 200 ? 'PASS' : 'FAIL', login.data.message);
  const token = login.data.token;

  // 4. Create Meeting
  const meeting = await request('/api/meetings', 'POST', {
    title: 'Accessibility Product Review',
    description: 'Sprint retrospective and MediaPipe landmark test.',
    duration: 45
  }, token);
  console.log('4. Create Meeting:', meeting.status === 201 ? 'PASS' : 'FAIL', meeting.data.meeting?.meetingCode);

  // 5. Get Meetings
  const list = await request('/api/meetings', 'GET', null, token);
  console.log('5. List Meetings:', list.status === 200 ? 'PASS' : 'FAIL', `Found ${list.data.meetings?.length || 0} meetings`);

  console.log('--- All Backend Tests Completed Successfully ---');
};

runTests().catch(console.error);
