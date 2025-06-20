async function debugRapidAPI() {
  const rapidApiKey = 'fff2512acdmsh8399ffffdaedf8fp1244cajsnbcfb19aac0c3';
  const rapidApiHost = 'twitter-api47.p.rapidapi.com';
  const rapidApiUrl = 'https://twitter-api47.p.rapidapi.com/v2/search';

  try {
    const query = '$BTC';
    const url = `${rapidApiUrl}?query=${encodeURIComponent(query)}&type=Top`;

    console.log('Testing RapidAPI Twitter with query:', query);

    const response = await fetch(url, {
      headers: {
        'x-rapidapi-host': rapidApiHost,
        'x-rapidapi-key': rapidApiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Error response:', response.statusText);
      return;
    }

    const data = await response.json();
    
    console.log('\n=== Full Response Structure ===');
    console.log('Top level keys:', Object.keys(data));
    
    // Check the tweets field
    if (data.tweets) {
      console.log('\n=== Tweets Structure ===');
      console.log('Tweets type:', typeof data.tweets);
      console.log('Tweets is array:', Array.isArray(data.tweets));
      
      if (Array.isArray(data.tweets)) {
        console.log('Tweets array length:', data.tweets.length);
        if (data.tweets.length > 0) {
          console.log('First tweet keys:', Object.keys(data.tweets[0]));
          console.log('First tweet:', JSON.stringify(data.tweets[0], null, 2));
        }
      } else {
        console.log('Tweets object keys:', Object.keys(data.tweets));
        console.log('Tweets object:', JSON.stringify(data.tweets, null, 2));
      }
    }
    
    // Check cursor
    if (data.cursor) {
      console.log('\n=== Cursor ===');
      console.log('Cursor:', data.cursor);
    }

  } catch (error) {
    console.error('Error debugging RapidAPI:', error);
  }
}

debugRapidAPI(); 