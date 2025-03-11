const http = require('http');

console.log('🧪 Testing API endpoints...');

// Test both endpoints
async function runTests() {
  // Test /api/test first
  console.log('\nTesting /api/test endpoint...');
  await testEndpoint('/api/test');

  // Then test /api/gold-rupee
  console.log('\nTesting /api/gold-rupee endpoint...');
  await testEndpoint('/api/gold-rupee');
}

function testEndpoint(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      console.log('Status Code:', res.statusCode);
      console.log('Headers:', res.headers);

      let data = '';
      res.on('data', chunk => data += chunk);
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log('Response data:', json);
          resolve();
        } catch (e) {
          console.error('Error parsing JSON:', e.message);
          console.log('Raw response:', data);
          resolve();
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request failed:', error.message);
      resolve();
    });

    req.end();
  });
}

runTests();
