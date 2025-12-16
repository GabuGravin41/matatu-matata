import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import { Vehicle } from '../types';
import { askMatatuAssistant } from '../services/geminiService';

interface GeminiAssistantProps {
  vehicles: Vehicle[];
}

export const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ vehicles }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: "Mambo! I'm watching the roads. Ask me anything about the vehicles nearby." }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!query.trim()) return;

    const userText = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    const answer = await askMatatuAssistant(userText, vehicles);
    
    setMessages(prev => [...prev, { role: 'ai', text: answer }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 p-4 rounded-full shadow-lg shadow-orange-500/20 hover:scale-110 transition-transform flex items-center justify-center group"
        >
          <Sparkles className="w-6 h-6 mr-2 animate-pulse" />
          <span className="font-bold">AI Helper</span>
        </button>
      )}

      {isOpen && (
        <div className="bg-slate-900 border border-slate-700 w-80 md:w-96 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[500px]">
          {/* Header */}
          <div className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <h3 className="font-bold text-white">MatatuLive AI</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/95">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-xl p-3 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-slate-700 text-slate-200 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 rounded-xl rounded-bl-none p-3 flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
                  <span className="text-xs text-slate-400">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-slate-800 border-t border-slate-700 flex items-center space-x-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Is Super Metro full?"
              className="flex-1 bg-slate-900 border border-slate-600 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-yellow-400"
            />
            <button 
              onClick={handleSend}
              disabled={loading || !query.trim()}
              className="p-2 bg-yellow-500 text-slate-900 rounded-full hover:bg-yellow-400 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
