# BidMaS AI Recommendation API

A serverless API for generating project recommendations based on student interests using TensorFlow.js and Universal Sentence Encoder.

## Features

- Semantic understanding of text through Universal Sentence Encoder
- Cosine similarity calculation between student interests and project descriptions
- Serverless deployment on Vercel
- Optimized for performance with model caching

## Setup & Deployment

### Prerequisites

- Node.js (v16 or later)
- Vercel CLI (`npm install -g vercel`)
- Vercel account (free tier is sufficient)

### Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Run the development server:
   ```
   npm run dev
   ```

3. Test the API locally:
   ```
   curl -X POST http://localhost:3000/api/recommend \
     -H "Content-Type: application/json" \
     -d '{"interests":"machine learning, web development", "projects":[{"Title":"AI Project", "Description":"A project about machine learning"}]}'
   ```

### Deploying to Vercel

1. Login to Vercel:
   ```
   vercel login
   ```

2. Deploy:
   ```
   npm run deploy
   ```

3. Note the deployment URL provided by Vercel (typically https://bidmas-ai-api.vercel.app)

## API Usage

### Endpoint

```
POST /api/recommend
```

### Request Format

```json
{
  "interests": "machine learning, web development",
  "projects": [
    {
      "id": "project1",
      "Title": "Machine Learning Project",
      "Description": "A project focused on image recognition using neural networks",
      "Skills": "Python, TensorFlow",
      "Requirements": "Basic understanding of neural networks"
    },
    {
      "id": "project2",
      "Title": "Web Application",
      "Description": "Building a responsive web application",
      "Skills": "JavaScript, React",
      "Requirements": "Experience with frontend development"
    }
  ]
}
```

### Response Format

```json
{
  "recommendations": [
    {
      "id": "project1",
      "Title": "Machine Learning Project",
      "Description": "A project focused on image recognition using neural networks",
      "Skills": "Python, TensorFlow",
      "Requirements": "Basic understanding of neural networks",
      "similarityScore": 0.8765
    },
    {
      "id": "project2",
      "Title": "Web Application",
      "Description": "Building a responsive web application",
      "Skills": "JavaScript, React",
      "Requirements": "Experience with frontend development",
      "similarityScore": 0.6543
    }
  ],
  "processingTime": 1234,
  "count": 2
}
```

## Error Handling

- **400 Bad Request**: Invalid input format
- **405 Method Not Allowed**: Unsupported HTTP method
- **500 Internal Server Error**: Error processing the request

## Performance Considerations

- First request may take longer (5-10 seconds) due to model loading
- Subsequent requests typically respond within 1-2 seconds
- Model is cached in memory to improve performance 