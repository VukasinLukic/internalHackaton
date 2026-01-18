import OpenAI from 'openai';

class OpenAIClient {
  private static instance: OpenAIClient;
  private client: OpenAI;

  private constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable not set');
    }
    this.client = new OpenAI({ apiKey });
  }

  static getInstance(): OpenAIClient {
    if (!OpenAIClient.instance) {
      OpenAIClient.instance = new OpenAIClient();
    }
    return OpenAIClient.instance;
  }

  async analyzeImages(
    systemPrompt: string,
    userPrompt: string,
    imageUrls: string[]
  ): Promise<string> {
    const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
      { type: 'text', text: userPrompt }
    ];

    for (const url of imageUrls) {
      content.push({
        type: 'image_url',
        image_url: { url, detail: 'low' }
      });
    }

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content }
      ],
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    return response.choices[0].message.content || '{}';
  }
}

export const openAIClient = OpenAIClient.getInstance();
