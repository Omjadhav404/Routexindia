'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { GlassCard } from '../ui/glass-card';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isMock?: boolean;
}

export const AIChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-init',
      sender: 'ai',
      text: `Welcome to the **RouteXIndia.AI Logistics Copilot**. 

I analyze real-time highway telemetry, weather patterns, Fastag data, and driver safety logs across Indian corridors. 

**Ask me anything, or try these quick diagnostics:**`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { label: 'Optimize Route (Delhi ➔ Mumbai)', query: 'Optimize route from Delhi to Mumbai via NH-48. Show distances, corridors, and terrain.', type: 'route' },
    { label: 'Predict ETA (Waybill #RTX-PKG-209)', query: 'Predict transit duration and ETA for Waybill #RTX-PKG-209 Bangalore to Chennai.', type: 'eta' },
    { label: 'Cost Optimization (Surat ➔ Pune)', query: 'Analyze fuel expenditures and toll savings for cargo container Surat to Pune.', type: 'cost' },
    { label: 'Demand Forecast (Q3 Monsoon)', query: 'Provide seasonal logistics demand forecast for Q3 across Western NH sectors.', type: 'demand' },
    { label: 'Fleet Utilization (West Hub)', query: 'Run load matching and vehicle idle analysis for West Operating Hub.', type: 'fleet' },
    { label: 'GST Compliance HSN 7208', query: 'GST tax bracket advisory and compliance audit check for steel items HSN 7208.', type: 'compliance' }
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend: string, contextType = 'general') => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend, contextType }),
      });
      const data = await res.json();
      
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.text || 'I encountered an issue generating a response.',
        isMock: data.isMock,
      };
      
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'Error connecting to the AI platform. Running local simulation... \n\n**Recommendation**: Verify your `GROQ_API_KEY` is configured in `.env.local`.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple formatter to parse basic markdown stars and lists into styled HTML safely
  const formatText = (text: string) => {
    // Replace markdown bold **text**
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-400 font-bold">$1</strong>');
    
    // Replace bullet points
    html = html.replace(/^\*\s(.*)$/gm, '<li class="ml-4 list-disc text-slate-300 my-1">$1</li>');
    
    // Replace headings ### text
    html = html.replace(/^###\s(.*)$/gm, '<h4 class="text-base font-bold text-slate-100 border-b border-slate-800 pb-1 mt-3 mb-2 flex items-center gap-1.5"><span class="w-1.5 h-3 bg-blue-500 rounded"></span>$1</h4>');
    
    // Split into paragraphs
    return html.split('\n').map((para, i) => {
      if (para.startsWith('<li') || para.startsWith('<h4')) {
        return <div key={i} dangerouslySetInnerHTML={{ __html: para }} />;
      }
      return para.trim() ? <p key={i} className="mb-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: para }} /> : <div key={i} className="h-2" />;
    });
  };

  return (
    <GlassCard glowColor="purple" className="flex flex-col h-[600px] p-0 border-slate-800/80">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 flex items-center gap-1.5">
              AI Command Copilot
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-400 border border-purple-900/40">
                Groq Active
              </span>
            </h3>
            <p className="text-xs text-slate-500">Real-time routing, fuel estimation, & risks</p>
          </div>
        </div>
        <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
      </div>

      {/* Message Ledger */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar bg-slate-950/10">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                  : 'bg-slate-900/90 text-slate-200 border border-slate-800/80 rounded-bl-none shadow-[0_4px_12px_rgba(0,0,0,0.2)]'
              }`}
            >
              {formatText(msg.text)}
              {msg.isMock && (
                <span className="block text-[9px] uppercase font-mono tracking-wider text-purple-400 mt-2 text-right">
                  [DEMO MODE fallback activated]
                </span>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl rounded-bl-none px-4 py-3 flex items-center gap-2.5 shadow-md">
              <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
              <span className="text-xs text-slate-500 font-mono">Analyzing logistics telemetry...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick suggestions */}
      <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/30">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Suggested Diagnostics:</p>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => handleSend(p.query, p.type)}
              className="text-[11px] text-slate-400 hover:text-blue-400 hover:border-blue-900/40 bg-slate-900/80 hover:bg-blue-950/10 border border-slate-800/80 px-2.5 py-1.5 rounded-lg transition-all text-left flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {p.label}
              <ArrowRight className="w-3 h-3 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-4 border-t border-slate-800 flex gap-2 bg-slate-950/40"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask copilot to optimize, calculate fuel, or check weather risk..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 placeholder-slate-600 transition-all"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </GlassCard>
  );
};
