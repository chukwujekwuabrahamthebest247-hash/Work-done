
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';

interface ChatContainerProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isTyping: boolean;
  voiceEnabled: boolean;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenVault: () => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ 
  messages, 
  onSendMessage, 
  isTyping,
  voiceEnabled,
  isSpeaking,
  onStopSpeaking,
  isSidebarOpen,
  onToggleSidebar,
  onOpenVault
}) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;
    onSendMessage(input);
    setInput('');
  };

  const startRecording = () => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition not supported in this browser.");
      return;
    }

    if (recognitionRef.current) recognitionRef.current.stop();

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      if (finalTranscript || interimTranscript) {
        setInput(prev => {
          return prev.trim() + ' ' + (finalTranscript + interimTranscript).trim();
        });
      }
    };

    recognitionRef.current.onstart = () => setIsRecording(true);
    recognitionRef.current.onend = () => setIsRecording(false);
    recognitionRef.current.onerror = () => setIsRecording(false);

    recognitionRef.current.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full max-w-5xl mx-auto relative h-full">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800/50 bg-[#0d0f14]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          {!isSidebarOpen && (
            <button 
              onClick={onToggleSidebar}
              className="p-2 hover:bg-gray-800 rounded-xl text-gray-400 hover:text-white transition-all border border-transparent hover:border-gray-700"
              title="Expand Sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Neural Link Sync</span>
            <span className="text-[9px] text-gray-500 font-bold uppercase">SECURE PROTOCOL</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {voiceEnabled && (
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-blue-500/5 rounded-full border border-blue-500/10">
              <div className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-blue-500 animate-ping' : 'bg-gray-600'}`}></div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Voice {isSpeaking ? 'Streaming' : 'Ready'}</span>
            </div>
          )}
          
          <button 
            onClick={onOpenVault}
            className="flex items-center space-x-2 px-3 py-1.5 bg-gray-800/50 hover:bg-gray-800 rounded-xl border border-gray-700/50 transition-all text-gray-400 hover:text-white group"
            title="Access Security Vault"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest">Settings</span>
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-60 max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] flex items-center justify-center font-black text-4xl shadow-2xl shadow-blue-500/20 rotate-3 transition-transform hover:rotate-0 cursor-default">N</div>
            <div className="space-y-3">
              <h1 className="text-4xl font-black tracking-tighter text-white">System Ready.</h1>
              <p className="text-sm text-gray-400 leading-relaxed font-medium uppercase tracking-widest">Integrated Neural Search Interface.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
              {['Market Analysis', 'Deep Search', 'Coding Help', 'Content Strategy'].map(t => (
                <button key={t} onClick={() => setInput(t)} className="p-3 bg-gray-900/50 border border-gray-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 hover:border-blue-500/50 transition-all text-gray-500 hover:text-blue-400">
                  {t}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div 
              key={m.id} 
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2 duration-500`}
            >
              <div className={`max-w-[85%] rounded-[1.8rem] p-5 md:p-6 ${
                m.role === 'user' 
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl shadow-blue-500/10' 
                  : 'bg-[#161920] border border-gray-800 shadow-xl'
              }`}>
                {m.researchResults && m.role === 'assistant' && (
                  <div className="mb-5 p-3 bg-black/40 rounded-2xl border border-gray-800/50">
                    <div className="flex items-center space-x-2 text-blue-400 font-black text-[10px] uppercase tracking-widest mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                      <span>Research Grounding Sync</span>
                    </div>
                    <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                      {m.researchResults.map((res, i) => (
                        <a key={i} href={res.url} target="_blank" rel="noreferrer" className="flex-shrink-0 bg-gray-800/80 p-2 px-4 rounded-xl hover:bg-gray-700 transition-all border border-gray-700 text-[10px] font-bold text-gray-300 hover:text-white flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                          <span>{res.title.substring(0, 30)}...</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-[15px] leading-relaxed font-medium">
                  {m.content}
                </div>
                {m.content === '' && isTyping && m.role === 'assistant' && (
                  <div className="flex space-x-2 items-center py-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-duration:0.8s]"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s] [animation-duration:0.8s]"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s] [animation-duration:0.8s]"></div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-6 md:p-10 bg-gradient-to-t from-[#0d0f14] via-[#0d0f14] to-transparent">
        <div className="max-w-4xl mx-auto relative">
          {/* Floating Stop Voice Button */}
          {isSpeaking && (
            <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-30 animate-in slide-in-from-bottom-2 duration-300">
              <button 
                onClick={onStopSpeaking}
                className="flex items-center space-x-2.5 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-2xl shadow-red-500/40 transition-all active:scale-90 font-black text-xs border-2 border-white/10 group"
              >
                <div className="relative">
                  <div className="w-3 h-3 bg-white rounded-sm"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-white rounded-sm animate-ping opacity-75"></div>
                </div>
                <span className="tracking-widest uppercase">STOP AI SPEECH</span>
              </button>
            </div>
          )}

          <form 
            onSubmit={handleSubmit}
            className="relative group"
          >
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={isRecording ? "Listening..." : "Message Nexus Pro..."}
              className={`w-full bg-[#1a1d24] border-2 border-gray-800 rounded-[2rem] py-5 pl-8 pr-40 focus:outline-none focus:border-blue-600/50 transition-all text-[15px] shadow-2xl resize-none min-h-[64px] max-h-48 ${isRecording ? 'border-red-500/50 ring-4 ring-red-500/5' : ''}`}
              disabled={isTyping}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-3">
              <button
                type="button"
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={stopRecording}
                className={`p-3 rounded-2xl transition-all shadow-xl active:scale-90 ${
                  isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white'
                }`}
                title="Hold to Record"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className={`p-3 rounded-2xl transition-all active:scale-95 ${
                  input.trim() ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/30 hover:bg-blue-500' : 'bg-gray-800 text-gray-600'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </form>
          <div className="flex justify-center mt-6 space-x-8">
             <div className="flex items-center space-x-2 opacity-30">
               <span className="text-[10px] font-bold uppercase tracking-widest">Grounding Active</span>
               <div className={`w-2 h-2 rounded-full ${messages.length > 0 ? 'bg-blue-500 shadow-[0_0_8px_blue]' : 'bg-gray-600'}`}></div>
             </div>
             <div className="flex items-center space-x-2 opacity-30">
               <span className="text-[10px] font-bold uppercase tracking-widest">Neural Link</span>
               <div className={`w-2 h-2 rounded-full ${isTyping ? 'bg-green-500 shadow-[0_0_8px_green]' : 'bg-gray-600'}`}></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
