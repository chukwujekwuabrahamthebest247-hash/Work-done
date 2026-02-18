
import React from 'react';
import { Config, Conversation } from '../types';

interface SidebarProps {
  config: Config;
  conversations: Conversation[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onOpenVault: () => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  config, 
  conversations, 
  currentChatId, 
  onSelectChat, 
  onDeleteChat,
  onOpenVault, 
  onNewChat, 
  onToggleSidebar 
}) => {
  if (!config.isSidebarOpen) return null;

  return (
    <div className="w-72 bg-[#0b0d11] border-r border-gray-800 flex flex-col p-4 space-y-4 animate-in slide-in-from-left duration-300 z-30">
      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">N</div>
          <span className="font-bold text-lg tracking-tight">Nexus Pro</span>
        </div>
        <button 
          onClick={onToggleSidebar}
          className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-500 transition-colors"
          title="Collapse"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <button 
        onClick={onNewChat}
        className="flex items-center justify-center space-x-2 w-full py-3 bg-blue-600 hover:bg-blue-500 transition-all rounded-2xl font-bold text-white shadow-xl shadow-blue-500/10 active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        <span className="text-sm">New Link</span>
      </button>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-2 py-2 text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Neural History</div>
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
          {conversations.length === 0 ? (
            <div className="text-[11px] text-gray-600 italic px-2 py-4 text-center">No active history.</div>
          ) : (
            conversations.map((chat) => (
              <div 
                key={chat.id}
                className={`group flex items-center justify-between rounded-xl transition-all border ${
                  currentChatId === chat.id 
                    ? 'bg-gray-800/80 border-gray-700 shadow-lg' 
                    : 'border-transparent hover:bg-gray-800/40 hover:border-gray-800/60'
                }`}
              >
                <button 
                  onClick={() => onSelectChat(chat.id)}
                  className="flex-1 text-left px-3 py-3 overflow-hidden"
                >
                  <span className={`text-[13px] block truncate ${currentChatId === chat.id ? 'text-white font-bold' : 'text-gray-400 font-medium'}`}>
                    {chat.title}
                  </span>
                  <span className="text-[9px] text-gray-600 font-mono mt-0.5 block">
                    {new Date(chat.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                  className="p-2 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all mr-1"
                  title="Archive Link"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-800">
        <button 
          onClick={onOpenVault}
          className="flex items-center space-x-3 w-full px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-2xl transition-all border border-transparent hover:border-gray-700 group active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-sm font-bold">Security Vault</span>
        </button>
      </div>
    </div>
  );
};
