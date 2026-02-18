
import { Config, Message, ResearchResult } from '../types';

export const performSerperSearch = async (query: string, apiKey: string): Promise<ResearchResult[]> => {
  if (!apiKey) return [];
  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        q: query,
        num: 10, // Get more results to find better snippets
        gl: 'us',
        hl: 'en'
      }),
    });
    if (!response.ok) return [];
    const data = await response.json();
    return (data.organic || []).slice(0, 6).map((item: any) => ({
      title: item.title,
      url: item.link,
      snippet: item.snippet || item.title,
    }));
  } catch (error) {
    console.error('Serper search error:', error);
    return [];
  }
};

export const performTavilySearch = async (query: string, apiKey: string): Promise<ResearchResult[]> => {
  if (!apiKey) return [];
  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "advanced",
        max_results: 6,
        include_answer: true,
      }),
    });
    if (!response.ok) return [];
    const data = await response.json();
    return (data.results || []).map((item: any) => ({
      title: item.title,
      url: item.url,
      snippet: item.content,
    }));
  } catch (error) {
    console.error('Tavily search error:', error);
    return [];
  }
};

export const fetchOpenRouterModels = async (apiKey: string) => {
  if (!apiKey) return [];
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Nexus Pro AI',
      }
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.data.map((m: any) => ({
      id: m.id,
      name: m.name,
      pricing: m.pricing,
      isFree: parseFloat(m.pricing?.prompt || '1') === 0 && parseFloat(m.pricing?.completion || '1') === 0
    }));
  } catch (err) {
    return [];
  }
};

export const streamChatCompletion = async (
  messages: Message[],
  config: Config,
  onChunk: (chunk: string) => void
) => {
  const formattedMessages = messages.map(m => ({
    role: m.role,
    content: m.content
  }));

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.openRouterKey || ''}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Nexus Pro AI',
    },
    body: JSON.stringify({
      model: config.selectedModel,
      messages: formattedMessages,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) throw new Error("Response body is null");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;
      
      if (trimmedLine.startsWith('data: ')) {
        try {
          const data = JSON.parse(trimmedLine.slice(6));
          const content = data.choices?.[0]?.delta?.content || '';
          if (content) onChunk(content);
        } catch (e) {
          // Chunk might be partial, ignore parse errors
        }
      }
    }
  }
};
