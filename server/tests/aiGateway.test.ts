import { describe, it, expect, vi } from 'vitest';
import { processAIRequest } from '../src/services/aiGateway.js';

// Mock the external Gemini API calls
vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: class {
      getGenerativeModel() {
        return {
          generateContent: vi.fn().mockResolvedValue({
            response: {
              text: () => JSON.stringify({
                type: 'insight',
                action: 'query',
                data: {},
                message: 'Hello from mock Gemini!'
              })
            }
          })
        };
      }
    }
  };
});

describe('AI Gateway Service', () => {
  it('should process a basic request using Hugging Face when configured', async () => {
    process.env.AI_PROVIDER = 'huggingface';
    process.env.HF_TOKEN = 'hf_test';
    delete process.env.GEMINI_API_KEY;

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({
                type: 'insight',
                action: 'query',
                data: {},
                message: 'Hello from mock Hugging Face!'
              })
            }
          }
        ]
      })
    }));

    const response = await processAIRequest('Hello from HF?', {
      userName: 'Test User', habits: [], tasks: [], wellness: [], journals: []
    });

    expect(response.type).toBe('insight');
    expect(response.message).toBe('Hello from mock Hugging Face!');

    vi.unstubAllGlobals();
    delete process.env.HF_TOKEN;
    delete process.env.AI_PROVIDER;
  });

  it('should process a basic request using processAIRequest', async () => {
    // Provide a dummy API key for testing
    process.env.GEMINI_API_KEY = 'test-key';
    delete process.env.HF_TOKEN;
    delete process.env.AI_PROVIDER;
    
    const context = {
      userName: 'Test User',
      habits: [],
      tasks: [],
      wellness: [],
      journals: []
    };

    const response = await processAIRequest('Hello, what can I do?', context);
    
    expect(response).toBeDefined();
    expect(response.type).toBe('insight');
    expect(response.action).toBe('query');
    expect(response.message).toBe('Hello from mock Gemini!');
  });
  
  it('should handle missing API key gracefully', async () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.HF_TOKEN;
    delete process.env.AI_PROVIDER;
    
    const response = await processAIRequest('Hello, what can I do?', {
      userName: 'Test User', habits: [], tasks: [], wellness: [], journals: []
    });
    
    expect(response.type).toBe('unknown');
    expect(response.message).toContain('offline');
  });
});
