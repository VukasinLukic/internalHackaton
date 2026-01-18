import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiClient {
  private static instance: GeminiClient;
  private genAI: GoogleGenerativeAI;

  private constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️  GEMINI_API_KEY environment variable not set');
      // Create instance anyway to avoid import errors, but it will fail on actual use
    }
    this.genAI = new GoogleGenerativeAI(apiKey || 'dummy-key');
  }

  static getInstance(): GeminiClient {
    if (!GeminiClient.instance) {
      GeminiClient.instance = new GeminiClient();
    }
    return GeminiClient.instance;
  }

  /**
   * Analyze images using Gemini Vision API
   * @param systemPrompt - System instructions for the AI
   * @param userPrompt - User's specific question/task
   * @param imageUrls - Array of image URLs to analyze
   * @returns JSON string response
   */
  async analyzeImages(
    systemPrompt: string,
    userPrompt: string,
    imageUrls: string[]
  ): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable not set. Cannot analyze images.');
    }

    try {
      // Use gemini-1.5-flash for vision tasks (faster and cheaper than pro)
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.4,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 1000,
          responseMimeType: 'application/json',
        }
      });

      // Fetch images and convert to base64
      const imageParts = await Promise.all(
        imageUrls.map(async (url) => {
          const response = await fetch(url);
          const buffer = await response.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');

          // Determine MIME type from URL or default to jpeg
          let mimeType = 'image/jpeg';
          if (url.includes('.png')) mimeType = 'image/png';
          else if (url.includes('.webp')) mimeType = 'image/webp';

          return {
            inlineData: {
              data: base64,
              mimeType
            }
          };
        })
      );

      // Combine prompts
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

      // Generate content with images
      const result = await model.generateContent([
        fullPrompt,
        ...imageParts
      ]);

      const response = await result.response;
      const text = response.text();

      return text || '{}';
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Failed to analyze images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze a single image (convenience method)
   */
  async analyzeImage(
    systemPrompt: string,
    userPrompt: string,
    imageUrl: string
  ): Promise<string> {
    return this.analyzeImages(systemPrompt, userPrompt, [imageUrl]);
  }
}

export const geminiClient = GeminiClient.getInstance();
