// Check Twitter API rate limits and token status
const checkTwitterAPI = async () => {
  const BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAACiryQEAAAAAsZ3vmhMwoLW2kFe9FNP9w%2Bsqg5c%3DGcN85rH9AVYYmy6iuiBg2YJN506KSyVbXKMnfGKmK7fax0TTpb";
  
  try {
    console.log('🔍 Checking Twitter API Status\n');
    
    // Test 1: Check rate limits
    console.log('1. Checking rate limits...');
    const rateLimitResponse = await fetch('https://api.twitter.com/2/tweets/search/recent?query=test&max_results=10', {
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Rate limit response: ${rateLimitResponse.status} ${rateLimitResponse.statusText}`);
    
    if (rateLimitResponse.status === 429) {
      const headers = rateLimitResponse.headers;
      console.log('Rate limit headers:');
      console.log('- x-rate-limit-limit:', headers.get('x-rate-limit-limit'));
      console.log('- x-rate-limit-remaining:', headers.get('x-rate-limit-remaining'));
      console.log('- x-rate-limit-reset:', headers.get('x-rate-limit-reset'));
      
      const resetTime = headers.get('x-rate-limit-reset');
      if (resetTime) {
        const resetDate = new Date(parseInt(resetTime) * 1000);
        console.log(`Rate limit resets at: ${resetDate.toLocaleString()}`);
      }
    }
    
    // Test 2: Try a different endpoint
    console.log('\n2. Testing user lookup endpoint...');
    const userResponse = await fetch('https://api.twitter.com/2/users/by/username/twitter', {
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`User lookup response: ${userResponse.status} ${userResponse.statusText}`);
    
    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('✅ User lookup successful:', userData.data?.name);
    }
    
    // Test 3: Check if token is valid
    console.log('\n3. Testing token validity...');
    if (rateLimitResponse.status === 401) {
      console.log('❌ Bearer Token is invalid or expired');
    } else if (rateLimitResponse.status === 429) {
      console.log('⚠️ Bearer Token is valid but rate limited');
    } else if (rateLimitResponse.status === 200) {
      console.log('✅ Bearer Token is valid and working');
    }
    
  } catch (error) {
    console.error('❌ Error checking Twitter API:', error.message);
  }
};

// Run the check
checkTwitterAPI(); 