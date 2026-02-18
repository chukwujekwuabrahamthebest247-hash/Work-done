
import React, { useState, useEffect } from 'react';
import { Config, OpenRouterModel } from '../types';
import { VAULT_PASSWORD, DEFAULT_OPENROUTER_MODELS } from '../constants';
import { fetchOpenRouterModels } from '../services/apiService';

interface VaultProps {
  config: Config;
  setConfig: React.Dispatch<React.SetStateAction<Config>>;
  onClose: () => void;
}

export const Vault: React.FC<VaultProps> = ({ config, setConfig, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [models, setModels] = useState<OpenRouterModel[]>(DEFAULT_OPENROUTER_MODELS);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  useEffect(() => {
    if (isAuthenticated && config.openRouterKey) {
      loadModels();
    }
  }, [isAuthenticated]);

  const loadModels = async () => {
    setIsLoadingModels(true);
    const remoteModels = await fetchOpenRouterModels(config.openRouterKey);
    if (remoteModels.length > 0) {
      setModels(remoteModels);
    }
    setIsLoadingModels(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === VAULT_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("Invalid Security Password");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-50 p-4">
        <div className="bg-[#1a1d24] w-full max-w-md p-8 rounded-[2rem] border border-gray-800 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-yellow-500/10 text-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-yellow-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Security Terminal</h2>
            <p className="text-gray-400 text-sm mt-2">Access Global API Configuration Vault</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Vault Password"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3.5 text-center tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all font-mono"
              autoFocus
            />
            <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-[0.98]">
              DECRYPT VAULT
            </button>
            <button type="button" onClick={onClose} className="w-full text-gray-500 text-xs hover:text-gray-300 uppercase tracking-widest font-bold transition-colors">
              Abort Session
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 md:p-8 overflow-y-auto">
      <div className="bg-[#111318] w-full max-w-6xl p-6 md:p-10 rounded-[2.5rem] border border-gray-800 shadow-2xl h-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
              <span className="text-yellow-500 uppercase tracking-tighter">Neural Engine Core</span>
              <span className="bg-green-500/10 text-green-500 text-[10px] px-2 py-0.5 rounded border border-green-500/30 uppercase tracking-widest font-black">ENCRYPTED_SYNC</span>
            </h2>
            <p className="text-gray-500 text-xs mt-1">Configure your global AI identity, research engines, and primary neural model.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 grid lg:grid-cols-3 gap-8 overflow-y-auto pr-4 custom-scrollbar">
          {/* Column 1: API Keys & Identity */}
          <div className="space-y-8">
            <section className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Main Engine (OpenRouter)</label>
              </div>
              <input 
                type="password"
                value={config.openRouterKey}
                onChange={(e) => setConfig({...config, openRouterKey: e.target.value})}
                placeholder="sk-or-..."
                className="w-full bg-gray-900 border border-gray-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 font-mono text-sm shadow-inner transition-all"
              />
            </section>

            <section className="space-y-4">
               <div className="flex items-center space-x-2">
                <div className="w-1.5 h-4 bg-purple-500 rounded-full"></div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Neural System Directives</label>
              </div>
              <textarea 
                value={config.systemPrompt}
                onChange={(e) => setConfig({...config, systemPrompt: e.target.value})}
                placeholder="How should the AI behave? (e.g., 'Always act as a helpful expert coding assistant...')"
                className="w-full bg-gray-900 border border-gray-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-purple-500 text-sm shadow-inner transition-all h-48 resize-none font-medium text-gray-300 leading-relaxed"
              />
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-tight">This prompt governs the logic of every model you select.</p>
            </section>
          </div>

          {/* Column 2: Research & Toggles */}
          <div className="space-y-8">
            <section className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-4 bg-green-500 rounded-full"></div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Research Grounding Keys</label>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-600 uppercase">SERPER</span>
                  <input 
                    type="password"
                    value={config.serperKey}
                    onChange={(e) => setConfig({...config, serperKey: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-2xl pl-16 pr-5 py-4 focus:outline-none focus:border-green-500 font-mono text-sm transition-all shadow-inner"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-600 uppercase">TAVILY</span>
                  <input 
                    type="password"
                    value={config.tavilyKey}
                    onChange={(e) => setConfig({...config, tavilyKey: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-2xl pl-16 pr-5 py-4 focus:outline-none focus:border-green-500 font-mono text-sm transition-all shadow-inner"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4 p-6 bg-gray-900/50 rounded-[2rem] border border-gray-800">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Web Research</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-tighter">Serper & Tavily Integration</span>
                </div>
                <button 
                  onClick={() => setConfig({...config, isResearchEnabled: !config.isResearchEnabled})}
                  className={`w-14 h-7 rounded-full p-1 transition-colors ${config.isResearchEnabled ? 'bg-green-600' : 'bg-gray-700'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-lg transition-transform ${config.isResearchEnabled ? 'translate-x-7' : ''}`}></div>
                </button>
              </div>
              <div className="flex justify-between items-center border-t border-gray-800 pt-4 mt-4">
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Neural Voice Core</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-tighter">AI Output to Audio</span>
                </div>
                <button 
                  onClick={() => setConfig({...config, voiceEnabled: !config.voiceEnabled})}
                  className={`w-14 h-7 rounded-full p-1 transition-colors ${config.voiceEnabled ? 'bg-blue-600' : 'bg-gray-700'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-lg transition-transform ${config.voiceEnabled ? 'translate-x-7' : ''}`}></div>
                </button>
              </div>
            </section>
          </div>

          {/* Column 3: Model Selection */}
          <div className="space-y-4 bg-gray-900/20 p-2 rounded-[2rem] border border-gray-800/50">
            <div className="flex items-center justify-between mb-4 px-4 pt-4">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-4 bg-yellow-500 rounded-full"></div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Primary Neural Link</label>
              </div>
              <button onClick={loadModels} className="text-[9px] text-blue-400 hover:text-blue-300 flex items-center space-x-1 font-black transition-colors bg-blue-400/5 px-2 py-1 rounded border border-blue-400/20">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${isLoadingModels ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>RESYNC</span>
              </button>
            </div>
            <div className="space-y-2 h-[500px] overflow-y-auto pr-2 custom-scrollbar px-2">
              {models.map(model => (
                <button
                  key={model.id}
                  onClick={() => setConfig({...config, selectedModel: model.id})}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex justify-between items-center group ${
                    config.selectedModel === model.id 
                      ? 'bg-blue-600 border-blue-500 shadow-xl' 
                      : 'bg-[#1a1d24] border-gray-800 hover:border-gray-600'
                  }`}
                >
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className={`text-sm font-bold truncate ${config.selectedModel === model.id ? 'text-white' : 'text-gray-200 group-hover:text-blue-400'}`}>{model.name}</span>
                    <span className={`text-[9px] font-mono mt-0.5 truncate ${config.selectedModel === model.id ? 'text-blue-200' : 'text-gray-500'}`}>{model.id}</span>
                  </div>
                  {model.isFree && (
                    <span className={`flex-shrink-0 text-[8px] px-2 py-0.5 rounded-full border font-black tracking-widest ml-2 ${
                      config.selectedModel === model.id 
                        ? 'bg-white text-blue-600 border-white' 
                        : 'bg-green-500/10 text-green-400 border-green-500/30'
                    }`}>FREE</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Engine Privacy Link</span>
            <span className="text-[9px] text-blue-500/50 uppercase font-black">ACTIVE MODEL OBFUSCATED FROM MAIN UI</span>
          </div>
          <button onClick={onClose} className="bg-white text-black px-12 py-3 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all active:scale-95 shadow-xl shadow-white/5">
            COMMIT SECURITY CHANGES
          </button>
        </div>
      </div>
    </div>
  );
};
