import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';

// Cache the model to avoid reloading it on every request
let model = null;

// Function to load the model if it's not already loaded
async function loadModel() {
  if (!model) {
    console.log('Loading Universal Sentence Encoder model...');
    model = await use.load();
    console.log('Model loaded successfully');
  }
  return model;
}

// Calculate cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
  return tf.tidy(() => {
    const dotProduct = tf.matMul(vecA, vecB, false, true);
    const normA = tf.norm(vecA);
    const normB = tf.norm(vecB);
    return dotProduct.div(normA.mul(normB)).dataSync()[0];
  });
}

// Calculate similarity scores between student interests and project descriptions
async function calculateSimilarities(interests, projects) {
  try {
    // Load the model
    const model = await loadModel();
    
    // Create embeddings for interests
    const interestText = Array.isArray(interests) ? interests.join('. ') : interests;
    const interestEmbedding = await model.embed(interestText);
    
    // Process each project
    const results = [];
    for (const project of projects) {
      // Create project description embedding
      // Use Title and Description or any other relevant fields
      const projectText = [
        project.Title || project.title || '',
        project.Description || project.description || '',
        project.Skills || project.skills || '',
        (project.Technologies && Array.isArray(project.Technologies)) ? project.Technologies.join(' ') : '',
        (project.technologies && Array.isArray(project.technologies)) ? project.technologies.join(' ') : '',
        project.Requirements || project.requirements || ''
      ].filter(Boolean).join('. ');
      
      const projectEmbedding = await model.embed(projectText);
      
      // Calculate similarity score
      const score = cosineSimilarity(interestEmbedding, projectEmbedding);
      
      // Add to results
      results.push({
        ...project,
        matchScore: score
      });
    }
    
    // Sort by similarity score (descending)
    return results.sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) {
    console.error('Error calculating similarities:', error);
    throw error;
  }
}

// Main handler for serverless function
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Validate request method
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  try {
    // Extract data from request body
    const { interests, projects } = req.body;
    
    // Validate input
    if (!interests || !projects || !Array.isArray(projects) || projects.length === 0) {
      res.status(400).json({ 
        error: 'Bad request. Please provide valid interests and projects array'
      });
      return;
    }
    
    // Calculate and return recommendations
    const startTime = Date.now();
    const recommendations = await calculateSimilarities(interests, projects);
    const processingTime = Date.now() - startTime;
    
    res.status(200).json({
      recommendations,
      processingTime,
      count: recommendations.length
    });
  } catch (error) {
    console.error('Error in recommendation API:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message
    });
  }
}