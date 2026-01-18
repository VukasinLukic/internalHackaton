import { FastifyRequest, FastifyReply } from 'fastify';
import { geminiClient } from '../../../infrastructure/external-services/gemini/GeminiClient';

interface AnalyzeApartmentRequest {
  imageUrl: string;
}

export async function analyzeApartmentImage(
  request: FastifyRequest<{ Body: AnalyzeApartmentRequest }>,
  reply: FastifyReply
) {
  try {
    const { imageUrl } = request.body;

    if (!imageUrl) {
      return reply.status(400).send({
        error: 'Image URL is required'
      });
    }

    // System prompt for apartment analysis
    const systemPrompt = `You are an expert real estate analyst specializing in property assessment.
Analyze the provided image and determine the property characteristics.

IMPORTANT:
- If the image shows a house exterior, garden, or outdoor space, still analyze it as a property listing
- Focus on the ACTUAL content of the image
- Be accurate and descriptive

Return a JSON object with this EXACT structure:
{
  "propertyType": "apartment" | "house" | "studio" | "villa" | "other",
  "name": "Brief descriptive name",
  "location": "Inferred location type: City Center / Downtown / Suburb / Urban Area / Rural",
  "price": estimated monthly rent in EUR (number),
  "size": estimated size in m² (number),
  "floor": estimated floor number (number) or "Ground Floor" or "Basement",
  "heating": "Central" | "Floor Heating" | "None" | "Gas" | "Electric",
  "style": "Minimalist" | "Modern" | "Vintage" | "Industrial" | "Classic" | "Old" | "Contemporary",
  "vibe": "Bright" | "Dark" | "Cozy" | "Luxurious" | "Warm" | "Cold" | "Spacious" | "Cramped",
  "attributes": array of descriptive tags like ["Spacious", "High Ceilings", "Fully Furnished", "Natural Light", "Balcony", etc],
  "description": "1-2 sentence description of what you see in the image"
}`;

    const userPrompt = `Analyze this property image and provide detailed characteristics in JSON format.`;

    // Call Gemini Vision API
    const response = await geminiClient.analyzeImage(
      systemPrompt,
      userPrompt,
      imageUrl
    );

    // Parse the response
    let analysisResult;
    try {
      analysisResult = JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', response);
      return reply.status(500).send({
        error: 'Failed to parse AI response',
        rawResponse: response
      });
    }

    // Return the analysis
    return reply.send({
      success: true,
      analysis: analysisResult
    });

  } catch (error) {
    console.error('Error analyzing apartment:', error);
    return reply.status(500).send({
      error: 'Failed to analyze image',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
