
const http = require('http');

console.log('Testing API endpoint...');

http.get('http://localhost:3001/api/gold-rupee', (res) => {
  let data = '';
  
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Success! Got JSON response');
      console.log('Data sample:', json);
    } catch (e) {
      console.error('Error: Response is not valid JSON');
      console.error('Raw response:', data.substring(0, 500));
    }
  });
}).on('error', (e) => {
  console.error('Error:', e.message);
});
