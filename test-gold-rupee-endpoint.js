// Test script for gold-rupee endpoint
const http = require('http');

console.log('🧪 Testing gold-rupee API endpoint...');

// Function to make a GET request
function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data.includes('{') ? JSON.parse(data) : data
          });
        } catch (err) {
          reject(new Error(`Invalid JSON response: ${err.message}`));
        }
      });
    }).on('error', reject);
  });
}

// Test the API endpoint
async function runTests() {
  console.log('Testing endpoint: http://localhost:3001/api/gold-rupee');
  
  try {
    const response = await get('http://localhost:3001/api/gold-rupee');
    
    console.log(`Status code: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ Endpoint returned status 200');
      
      // Check if we got valid data
      if (response.data) {
        console.log('✅ Endpoint returned valid data');
        
        // Check data format
        if (Array.isArray(response.data)) {
          console.log(`✅ Data is an array with ${response.data.length} items`);
          
          // Check if the data covers 5 years
          const dates = response.data.map(item => new Date(item.date));
          const minDate = new Date(Math.min(...dates));
          const maxDate = new Date(Math.max(...dates));
          const yearsDiff = (maxDate - minDate) / (1000 * 60 * 60 * 24 * 365);
          
          console.log(`Date range: ${minDate.toISOString().split('T')[0]} - ${maxDate.toISOString().split('T')[0]}`);
          console.log(`Range covers approximately ${yearsDiff.toFixed(1)} years`);
          
          if (yearsDiff >= 4.9) {
            console.log('✅ Data covers at least 5 years');
          } else {
            console.log('⚠️ Data covers less than 5 years');
          }
          
        } else if (response.data.data && Array.isArray(response.data.data)) {
          console.log(`✅ Data is an object with a data array containing ${response.data.data.length} items`);
          
          // Check if the data covers 5 years
          const dates = response.data.data.map(item => new Date(item.date));
          const minDate = new Date(Math.min(...dates));
          const maxDate = new Date(Math.max(...dates));
          const yearsDiff = (maxDate - minDate) / (1000 * 60 * 60 * 24 * 365);
          
          console.log(`Date range: ${minDate.toISOString().split('T')[0]} - ${maxDate.toISOString().split('T')[0]}`);
          console.log(`Range covers approximately ${yearsDiff.toFixed(1)} years`);
          
          if (yearsDiff >= 4.9) {
            console.log('✅ Data covers at least 5 years');
          } else {
            console.log('⚠️ Data covers less than 5 years');
          }
          
        } else {
          console.log('❌ Unexpected data format:', response.data);
        }
      } else {
        console.log('❌ Endpoint returned empty data');
      }
    } else {
      console.log(`❌ Endpoint returned error status: ${response.status}`);
      
      if (response.data) {
        console.log('Error details:', response.data);
      }
    }
  } catch (error) {
    console.error('❌ Error testing endpoint:', error.message);
    console.log('This could mean:');
    console.log('1. The server is not running');
    console.log('2. The endpoint is not implemented');
    console.log('3. The endpoint is at a different URL');
  }
  
  // Also test the browser URL to see what it returns
  console.log('\nTesting direct browser URL: http://localhost:3001/gold-rupee');
  
  try {
    const browserResponse = await get('http://localhost:3001/gold-rupee');
    
    console.log(`Status code: ${browserResponse.status}`);
    
    // Check if the response is HTML (website) or JSON (API)
    const isHtml = typeof browserResponse.data === 'string' && browserResponse.data.includes('<!DOCTYPE html>');
    
    if (isHtml) {
      console.log('❌ /gold-rupee is returning HTML instead of JSON data');
      console.log('   This confirms the issue: gold-rupee endpoint should be at /api/gold-rupee');
      console.log('   The server should be updated to handle this properly');
    } else {
      console.log('✅ /gold-rupee is returning proper data');
    }
  } catch (error) {
    console.error('❌ Error testing direct URL:', error.message);
  }
}

runTests();
