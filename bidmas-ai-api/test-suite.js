// Advanced test suite for BidMaS AI Recommendation API
import http from 'http';

// Test scenarios with different interests and projects
const testScenarios = [
  {
    name: "Basic Matching Test",
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
    ],
    expectedRanking: ["project2", "project1", "project3"] // Expected ranking based on your current results
  },
  {
    name: "Specific Technology Matching",
    interests: "React, Firebase, mobile app development",
    projects: [
      {
        id: "project1",
        Title: "React Native Mobile Application",
        Description: "Build a cross-platform mobile app with React Native and Firebase backend.",
        Skills: "JavaScript, React Native, Firebase",
        Requirements: "Mobile development experience"
      },
      {
        id: "project2",
        Title: "Data Visualization Dashboard",
        Description: "Create an analytics dashboard using D3.js and React.",
        Skills: "JavaScript, React, D3.js",
        Requirements: "Data visualization experience"
      },
      {
        id: "project3",
        Title: "Python Data Analysis Tool",
        Description: "Develop a data analysis tool using Python, Pandas and Matplotlib.",
        Skills: "Python, Pandas, Matplotlib",
        Requirements: "Data analysis experience"
      }
    ],
    expectedRanking: ["project1", "project2", "project3"]
  },
  {
    name: "Domain Specific Knowledge Test",
    interests: "healthcare technology, medical data, patient monitoring",
    projects: [
      {
        id: "project1",
        Title: "Hospital Management System",
        Description: "Develop a system for managing patient records and hospital resources.",
        Skills: "Java, Spring Boot, SQL",
        Requirements: "Healthcare domain knowledge"
      },
      {
        id: "project2",
        Title: "Patient Monitoring Application",
        Description: "Create a mobile app for remote patient monitoring and vital signs tracking.",
        Skills: "Swift, iOS development, Bluetooth",
        Requirements: "Experience with healthcare applications"
      },
      {
        id: "project3",
        Title: "Medical Research Database",
        Description: "Build a database system for storing and analyzing medical research data.",
        Skills: "PostgreSQL, Python, Data modeling",
        Requirements: "Knowledge of medical research processes"
      },
      {
        id: "project4",
        Title: "E-commerce Platform",
        Description: "Build an online shopping platform with payment processing.",
        Skills: "JavaScript, Node.js, Payment APIs",
        Requirements: "E-commerce experience"
      }
    ],
    expectedRanking: ["project2", "project1", "project3", "project4"]
  },
  {
    name: "Edge Case: Very Short Descriptions",
    interests: "game development, Unity, 3D modeling",
    projects: [
      {
        id: "project1",
        Title: "3D Game",
        Description: "Unity game.",
        Skills: "C#",
        Requirements: "Game dev"
      },
      {
        id: "project2",
        Title: "Mobile Game",
        Description: "Create a 2D mobile game with Unity.",
        Skills: "C#, Unity, 2D animation",
        Requirements: "Mobile game development"
      }
    ],
    expectedRanking: ["project2", "project1"]
  },
  {
    name: "Edge Case: Long Descriptions",
    interests: "cybersecurity, ethical hacking",
    projects: [
      {
        id: "project1",
        Title: "Security Vulnerability Scanner",
        Description: "Develop an automated tool for identifying security vulnerabilities in web applications. The system should be able to detect common vulnerabilities such as SQL injection, cross-site scripting (XSS), broken authentication, and other OWASP Top 10 security risks. The project will involve creating scanning modules, developing a reporting system, and implementing remediation suggestions. The final product should be user-friendly and provide comprehensive security assessments.",
        Skills: "Python, Security frameworks, Web protocols",
        Requirements: "Knowledge of cybersecurity principles"
      },
      {
        id: "project2",
        Title: "Network Intrusion Detection System",
        Description: "Build a network monitoring system that can detect and alert on suspicious activities and potential intrusions. The project will use machine learning algorithms to identify anomalous patterns in network traffic.",
        Skills: "Python, Network protocols, Machine Learning",
        Requirements: "Network security knowledge"
      }
    ],
    expectedRanking: ["project1", "project2"]
  }
];

// Function to run a test scenario
async function runTestScenario(scenario, apiPort = 3001) {
  return new Promise((resolve, reject) => {
    console.log(`\n\n==== RUNNING TEST: ${scenario.name} ====`);
    console.log('Interests:', scenario.interests);
    
    const testData = {
      interests: scenario.interests,
      projects: scenario.projects
    };
    
    const postData = JSON.stringify(testData);
    
    const options = {
      hostname: 'localhost',
      port: apiPort,
      path: '/api/recommend',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const parsedData = JSON.parse(responseData);
            
            console.log('\nResults:');
            console.log(`Processing Time: ${parsedData.processingTime} ms`);
            
            // Display recommendations
            parsedData.recommendations.forEach((rec, index) => {
              console.log(`${index + 1}. ${rec.Title} (Score: ${rec.matchScore.toFixed(4)})`);
            });
            
            // Check if ranking matches expected
            const actualRanking = parsedData.recommendations.map(rec => rec.id);
            const matchesExpected = JSON.stringify(actualRanking) === JSON.stringify(scenario.expectedRanking);
            
            console.log(`\nExpected ranking: ${scenario.expectedRanking.join(', ')}`);
            console.log(`Actual ranking: ${actualRanking.join(', ')}`);
            console.log(`Ranking matches expected: ${matchesExpected ? 'YES ✓' : 'NO ✗'}`);
            
            // Calculate correlation
            const correlationScore = calculateRankCorrelation(actualRanking, scenario.expectedRanking);
            console.log(`Rank correlation: ${correlationScore.toFixed(2)}`);
            
            console.log(`Test ${matchesExpected ? 'PASSED' : 'FAILED'}`);
            
            resolve({
              name: scenario.name,
              passed: matchesExpected,
              correlation: correlationScore,
              actualRanking,
              expectedRanking: scenario.expectedRanking,
              processingTime: parsedData.processingTime
            });
          } catch (error) {
            console.error('Error parsing response:', error);
            console.log('Raw response:', responseData);
            reject(error);
          }
        } else {
          console.error('API returned an error:', responseData);
          reject(new Error(`API error: ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Error making request:', error.message);
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

// Calculate rank correlation between two arrays of ids
function calculateRankCorrelation(actual, expected) {
  if (actual.length !== expected.length) {
    return 0; // Can't calculate correlation for different length arrays
  }
  
  // Create a mapping of id to rank position for both arrays
  const actualRanks = {};
  const expectedRanks = {};
  
  actual.forEach((id, index) => {
    actualRanks[id] = index;
  });
  
  expected.forEach((id, index) => {
    expectedRanks[id] = index;
  });
  
  // Calculate Spearman's rank correlation
  let d2Sum = 0;
  const n = actual.length;
  
  for (const id of actual) {
    if (expectedRanks[id] !== undefined) {
      const d = actualRanks[id] - expectedRanks[id];
      d2Sum += d * d;
    }
  }
  
  // Spearman's formula: 1 - (6 * sum(d^2)) / (n * (n^2 - 1))
  const correlation = 1 - (6 * d2Sum) / (n * (n*n - 1));
  return correlation;
}

// Run all test scenarios
async function runAllTests() {
  console.log('Starting BidMaS AI API Test Suite');
  console.log('================================');
  console.log(`Date and Time: ${new Date().toISOString()}`);
  
  const results = [];
  
  for (const scenario of testScenarios) {
    try {
      const result = await runTestScenario(scenario);
      results.push(result);
    } catch (error) {
      console.error(`Test "${scenario.name}" failed with error:`, error.message);
      results.push({
        name: scenario.name,
        passed: false,
        error: error.message
      });
    }
  }
  
  // Print summary
  console.log('\n\n================================');
  console.log('TEST SUITE SUMMARY');
  console.log('================================');
  
  let passCount = 0;
  let failCount = 0;
  let totalCorrelation = 0;
  
  results.forEach(result => {
    if (result.passed) {
      passCount++;
      totalCorrelation += result.correlation || 0;
    } else {
      failCount++;
    }
    
    console.log(`${result.name}: ${result.passed ? 'PASSED ✓' : 'FAILED ✗'}`);
  });
  
  const averageCorrelation = passCount > 0 ? totalCorrelation / passCount : 0;
  
  console.log('--------------------------------');
  console.log(`Tests Passed: ${passCount}/${results.length} (${(passCount/results.length*100).toFixed(1)}%)`);
  console.log(`Average Rank Correlation: ${averageCorrelation.toFixed(2)}`);
  console.log('================================');
}

// Run all tests
runAllTests().catch(err => {
  console.error('Error running test suite:', err);
});