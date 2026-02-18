
export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  researchResults?: ResearchResult[];
}

export interface ResearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export interface Config {
  openRouterKey: string;
  serperKey: string;
  tavilyKey: string;
  systemPrompt: string;
  selectedModel: string;
  isResearchEnabled: boolean;
  voiceEnabled: boolean;
  isSidebarOpen: boolean;
}

export interface OpenRouterModel {
  id: string;
  name: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  isFree: boolean;
}
