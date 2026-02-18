
import { OpenRouterModel } from './types';

export const VAULT_PASSWORD = "Moneynow234$#";

export const DEFAULT_OPENROUTER_MODELS: OpenRouterModel[] = [
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (Free)', pricing: { prompt: '0', completion: '0' }, isFree: true },
  { id: 'google/gemini-2.0-pro-exp-02-05:free', name: 'Gemini 2.0 Pro (Free)', pricing: { prompt: '0', completion: '0' }, isFree: true },
  { id: 'deepseek/deepseek-chat:free', name: 'DeepSeek Chat (Free)', pricing: { prompt: '0', completion: '0' }, isFree: true },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Free)', pricing: { prompt: '0', completion: '0' }, isFree: true },
  { id: 'qwen/qwen-2.5-72b-instruct:free', name: 'Qwen 2.5 72B (Free)', pricing: { prompt: '0', completion: '0' }, isFree: true },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', pricing: { prompt: '3', completion: '15' }, isFree: false },
  { id: 'openai/gpt-4o', name: 'GPT-4o', pricing: { prompt: '5', completion: '15' }, isFree: false },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', pricing: { prompt: '3.5', completion: '10.5' }, isFree: false },
];

export const DEFAULT_SYSTEM_PROMPT = `You are Nexus Pro, a world-class AI assistant.
1. Provide accurate, professional, and grounded responses.
2. Use professional Markdown for formatting.
3. Prioritize provided research data to ensure factual correctness.
4. If asked about the current time or date, refer strictly to the provided system date.`;
