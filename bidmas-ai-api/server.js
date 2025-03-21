const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Recommendation endpoint (placeholder)
app.post('/api/recommend', (req, res) => {
  const { interests, projects } = req.body;
  // TODO: Implement actual recommendation logic
  res.json({ 
    recommendations: projects.map(p => ({
      ...p,
      matchScore: Math.random() // Placeholder score
    }))
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 