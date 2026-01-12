import { GoogleGenAI, Type } from '@google/genai';
import { AnalysisResult, MaturityProfile, UseCaseInput } from '../types';

const SYSTEM_PROMPT = `You are a Chief AI Officer acting as a consultant specializing in Generative AI and LLM applications. You provide strategic analysis of AI use cases for organizations based on their maturity level.

When evaluating use cases, prioritize modern GenAI approaches:
- LLM-based solutions (GPT, Claude, Gemini) for text generation, analysis, and reasoning
- RAG (Retrieval-Augmented Generation) for knowledge-grounded applications
- AI Agents for autonomous task execution and workflow automation
- Prompt engineering and fine-tuning for customization
- Vector databases and semantic search for information retrieval

Avoid recommending traditional ML approaches (training custom NLP models, deep learning from scratch) unless specifically necessary for the use case.

Evaluate each use case based on:
1. Feasibility (1-10): Can this org realistically build this GIVEN their maturity level? (e.g., Novices can use LLM APIs but struggle with complex agent orchestration).
2. Strategic Impact (1-10): How much business value does it add?
3. Risk (1-10): What is the implementation, ethical, or operational risk?

Assign each use case to one group: 'Quick Wins', 'Strategic Bets', 'Low Priority', or 'Transformational'.
Provide a short reasoning and 3 concise implementation steps focusing on GenAI/LLM approaches for each use case.
Also provide an overall Executive Summary for the portfolio.`;

const buildPrompt = (maturity: MaturityProfile, useCases: UseCaseInput[]) => `
Analyze the following AI use cases for an organization with this Maturity Profile:

Organization Maturity: ${maturity.level} (Score: ${maturity.score}/100).
Summary of Maturity: ${maturity.summary}

Use Cases to Analyze:
${JSON.stringify(useCases, null, 2)}

Respond with a JSON object containing:
- executiveSummary: string (overall portfolio analysis)
- analyzedUseCases: array of objects with:
  - id: string (matching input id)
  - title: string
  - department: string
  - description: string
  - impactScore: number (1-10)
  - feasibilityScore: number (1-10)
  - riskScore: number (1-10)
  - group: one of "Quick Wins", "Strategic Bets", "Low Priority", "Transformational"
  - reasoning: string
  - implementationSteps: array of 3 strings (focus on GenAI/LLM solutions: use LLM APIs, RAG, AI agents, prompt engineering, vector search. Avoid suggesting custom ML model training unless absolutely necessary)
`;

// Google Gemini Analysis
const analyzeWithGemini = async (
  maturity: MaturityProfile,
  useCases: UseCaseInput[],
  apiKey: string
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: buildPrompt(maturity, useCases),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          executiveSummary: { type: Type.STRING },
          analyzedUseCases: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                department: { type: Type.STRING },
                description: { type: Type.STRING },
                impactScore: { type: Type.NUMBER },
                feasibilityScore: { type: Type.NUMBER },
                riskScore: { type: Type.NUMBER },
                group: {
                  type: Type.STRING,
                  enum: ['Quick Wins', 'Strategic Bets', 'Low Priority', 'Transformational']
                },
                reasoning: { type: Type.STRING },
                implementationSteps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ['id', 'title', 'department', 'description', 'impactScore', 'feasibilityScore', 'riskScore', 'group', 'reasoning', 'implementationSteps']
            }
          }
        },
        required: ['executiveSummary', 'analyzedUseCases']
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as AnalysisResult;
  } else {
    throw new Error("No data returned from AI provider.");
  }
};

// OpenAI Analysis
const analyzeWithOpenAI = async (
  maturity: MaturityProfile,
  useCases: UseCaseInput[],
  apiKey: string
): Promise<AnalysisResult> => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildPrompt(maturity, useCases) }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (content) {
    const parsed = JSON.parse(content);
    if (!parsed.executiveSummary || !parsed.analyzedUseCases) {
      throw new Error("Invalid response format from AI provider");
    }
    return parsed as AnalysisResult;
  } else {
    throw new Error("No data returned from AI provider.");
  }
};

// Main export - routes to appropriate provider
export const analyzePortfolio = async (
  maturity: MaturityProfile,
  useCases: UseCaseInput[],
  apiKey: string,
  provider: string = 'google'
): Promise<AnalysisResult> => {

  if (!apiKey) {
    throw new Error("API Key is missing. Please configure it in settings.");
  }

  try {
    switch (provider) {
      case 'google':
        return await analyzeWithGemini(maturity, useCases, apiKey);
      case 'openai':
        return await analyzeWithOpenAI(maturity, useCases, apiKey);
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  } catch (error: any) {
    console.error("Analysis failed:", error);

    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('401')) {
      throw new Error("Invalid API key. Please check your key in settings.");
    }
    if (error.message?.includes('RATE_LIMIT') || error.message?.includes('429')) {
      throw new Error("Rate limit exceeded. Please wait a moment and try again.");
    }
    if (error.message?.includes('quota')) {
      throw new Error("API quota exceeded. Please check your billing or try again later.");
    }

    throw error;
  }
};
