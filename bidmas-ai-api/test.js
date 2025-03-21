// Test script for the recommendation API using ES modules
import http from 'http';

// Sample data for testing
const testData = {
  interests: "machine learning, artificial intelligence, web development",
  projects: [
    {
      id: "project1",
      Title: "Neural Network for Image Recognition",
      Description: "Develop a convolutional neural network for image classification tasks.",
      Skills: "Python, TensorFlow, Computer Vision",
      Requirements: "Knowledge of deep learning fundamentals"
    },
    {
      id: "project2",
      Title: "E-commerce Web Application",
      Description: "Build a responsive online store with product catalog and cart functionality.",
      Skills: "JavaScript, React, Node.js",
      Requirements: "Experience with modern web frameworks"
    },
    {
      id: "project3",
      Title: "Natural Language Processing Tool",
      Description: "Create a text analysis tool for sentiment analysis and entity recognition.",
      Skills: "Python, NLTK, spaCy",
      Requirements: "Understanding of NLP concepts"
    }
  ]
};

// Make a POST request to the local API
async function testApi() {
  console.log('Testing recommendation API...');
  console.log('Sending sample data:', JSON.stringify(testData, null, 2));
  
  // Convert the test data to a JSON string
  const postData = JSON.stringify(testData);
  
  // Request options
  const options = {
    hostname: 'localhost',
    port: 3001, // Updated to match your Vercel dev server port
    path: '/api/recommend',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  // Create the request
  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        try {
          const parsedData = JSON.parse(responseData);
          console.log('\nAPI Response:');
          console.log('Processing Time:', parsedData.processingTime, 'ms');
          console.log('Number of Recommendations:', parsedData.count);
          console.log('\nTop Recommendations:');
          
          // Display the top 3 recommendations or all if less than 3
          const topRecommendations = parsedData.recommendations.slice(0, 3);
          topRecommendations.forEach((rec, index) => {
            // Changed similarityScore to matchScore to match your API implementation
            console.log(`\n${index + 1}. ${rec.Title} (Score: ${rec.matchScore.toFixed(4)})`);
            console.log(`   Description: ${rec.Description}`);
          });
          
          console.log('\nTest completed successfully!');
        } catch (error) {
          console.error('Error parsing response:', error);
          console.log('Raw response:', responseData);
        }
      } else {
        console.error('API returned an error:', responseData);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('Error making request:', error.message);
    console.log('\nMake sure the development server is running:');
    console.log('  npm run dev');
  });
  
  // Write the data to the request body
  req.write(postData);
  req.end();
}

testApi();