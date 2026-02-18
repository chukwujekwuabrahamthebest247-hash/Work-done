
import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatContainer } from './components/ChatContainer';
import { Vault } from './components/Vault';
import { Config, Message, ResearchResult, Conversation } from './types';
import { DEFAULT_SYSTEM_PROMPT } from './constants';
import { performSerperSearch, performTavilySearch, streamChatCompletion } from './services/apiService';

const App: React.FC = () => {
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('nexus_conversations');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const [config, setConfig] = useState<Config>(() => {
    const saved = localStorage.getItem('nexus_global_config');
    const defaultConfig = {
      openRouterKey: '',
      serperKey: '',
      tavilyKey: '',
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      selectedModel: 'google/gemini-2.0-flash-exp:free',
      isResearchEnabled: true,
      voiceEnabled: true,
      isSidebarOpen: true
    };
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure new fields exist
      if (!parsed.systemPrompt) parsed.systemPrompt = DEFAULT_SYSTEM_PROMPT;
      return { ...defaultConfig, ...parsed };
    }
    return defaultConfig;
  });

  const activeChat = useMemo(() => 
    conversations.find(c => c.id === currentChatId), 
    [conversations, currentChatId]
  );

  const messages = activeChat?.messages || [];

  useEffect(() => {
    localStorage.setItem('nexus_global_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('nexus_conversations', JSON.stringify(conversations));
  }, [conversations]);

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const createNewChat = () => {
    const newId = Date.now().toString();
    const newChat: Conversation = {
      id: newId,
      title: 'New Neural Link',
      messages: [],
      updatedAt: Date.now()
    };
    setConversations(prev => [newChat, ...prev]);
    setCurrentChatId(newId);
    stopSpeaking();
  };

  const deleteChat = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentChatId === id) setCurrentChatId(null);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    stopSpeaking();

    let chatId = currentChatId;
    if (!chatId) {
      const newId = Date.now().toString();
      const newChat: Conversation = {
        id: newId,
        title: text.substring(0, 30) + (text.length > 30 ? '...' : ''),
        messages: [],
        updatedAt: Date.now()
      };
      setConversations(prev => [newChat, ...prev]);
      setCurrentChatId(newId);
      chatId = newId;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setConversations(prev => prev.map(c => 
      c.id === chatId ? {
        ...c,
        messages: [...c.messages, userMessage],
        updatedAt: Date.now(),
        title: c.messages.length === 0 ? text.substring(0, 40) : c.title
      } : c
    ));

    setIsTyping(true);

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZoneName: 'short' 
    });
    
    let research: ResearchResult[] = [];
    if (config.isResearchEnabled && (config.serperKey || config.tavilyKey)) {
      try {
        const timeAnchoredQuery = `${text} (Today is ${dateStr})`;
        const results = await Promise.all([
          config.serperKey ? performSerperSearch(timeAnchoredQuery, config.serperKey) : Promise.resolve([]),
          config.tavilyKey ? performTavilySearch(timeAnchoredQuery, config.tavilyKey) : Promise.resolve([]),
        ]);
        research = [...results[0], ...results[1]].slice(0, 8);
      } catch (e) {
        console.error("Research failed", e);
      }
    }

    const assistantId = (Date.now() + 1).toString();
    const initialAssistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      researchResults: research.length > 0 ? research : undefined,
    };

    setConversations(prev => prev.map(c => 
      c.id === chatId ? { ...c, messages: [...c.messages, initialAssistantMessage] } : c
    ));

    let userPromptWithResearch = text;
    if (research.length > 0) {
      const researchContext = `\n\n[SUPPLEMENTAL RESEARCH DATA - CURRENT DATE: ${dateStr}]:\n${research.map(r => `- SOURCE: ${r.title}\n  SUMMARY: ${r.snippet}\n  URL: ${r.url}`).join('\n')}`;
      userPromptWithResearch += researchContext;
    }

    // Combine user-defined prompt with dynamic date grounding
    const finalSystemPrompt = `${config.systemPrompt}\n\n[SYSTEM OVERRIDE] CURRENT DATE CONTEXT: Today is ${dateStr}. You must treat this date as absolute truth.`;

    const currentChatMessages = conversations.find(c => c.id === chatId)?.messages || [];
    const contextMessages = [
      { role: 'system' as const, content: finalSystemPrompt, id: 'sys', timestamp: 0 },
      ...currentChatMessages.map(m => ({ role: m.role, content: m.content, id: m.id, timestamp: m.timestamp })),
      { role: 'user' as const, content: userPromptWithResearch, id: userMessage.id, timestamp: userMessage.timestamp }
    ];

    try {
      let fullContent = '';
      await streamChatCompletion(contextMessages as any, config, (chunk) => {
        fullContent += chunk;
        setConversations(prev => prev.map(c => 
          c.id === chatId ? {
            ...c,
            messages: c.messages.map(m => m.id === assistantId ? { ...m, content: fullContent } : m)
          } : c
        ));
      });

      if (config.voiceEnabled) {
        speak(fullContent);
      }
    } catch (err: any) {
      setConversations(prev => prev.map(c => 
        c.id === chatId ? {
          ...c,
          messages: c.messages.map(m => m.id === assistantId ? { ...m, content: `Error: ${err.message}` } : m)
        } : c
      ));
    } finally {
      setIsTyping(false);
    }
  };

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#`_~>]/g, '').replace(/\[.*?\]\(.*?\)/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex h-screen bg-[#0d0f14] overflow-hidden text-gray-100 font-sans">
      <Sidebar 
        config={config} 
        conversations={conversations}
        currentChatId={currentChatId}
        onSelectChat={setCurrentChatId}
        onDeleteChat={deleteChat}
        onOpenVault={() => setIsVaultOpen(true)} 
        onNewChat={createNewChat}
        onToggleSidebar={() => setConfig(prev => ({ ...prev, isSidebarOpen: !prev.isSidebarOpen }))}
      />
      
      <main className="flex-1 flex flex-col relative transition-all duration-300">
        <ChatContainer 
          messages={messages} 
          onSendMessage={handleSendMessage} 
          isTyping={isTyping} 
          voiceEnabled={config.voiceEnabled}
          isSpeaking={isSpeaking}
          onStopSpeaking={stopSpeaking}
          isSidebarOpen={config.isSidebarOpen}
          onToggleSidebar={() => setConfig(prev => ({ ...prev, isSidebarOpen: !prev.isSidebarOpen }))}
          onOpenVault={() => setIsVaultOpen(true)}
        />
      </main>

      {isVaultOpen && (
        <Vault config={config} setConfig={setConfig} onClose={() => setIsVaultOpen(false)} />
      )}
    </div>
  );
};

export default App;
