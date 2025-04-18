import axios from 'axios';

// Get API key from environment variables
const API_KEY = import.meta.env.VITE_HUGGING_FACE_API_KEY;

// Zero-shot classification service
export const zeroShotClassification = async (text, candidateLabels, multiLabel) => {
  try {
    const response = await axios.post(
      "https://router.huggingface.co/hf-inference/models/joeddav/bart-large-mnli-yahoo-answers",    
      {
        inputs: text,
        parameters: { 
          candidate_labels: candidateLabels,
          multi_label: multiLabel 
        }
      },
      {
        headers: { 
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json" 
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error("Error calling Hugging Face API:", error);
    throw error;
  }
  };