'use client';

import { useState, useRef, useEffect } from 'react';
import Avatar from './components/Avatar';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message || data.error
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    }
    
    setIsLoading(false);
  };

  const quickPrompts = [
    "Tell me about your AI projects",
    "What certifications do you have?",
    "What technologies do you work with?",
    "What role are you looking for?"
  ];

  return (
    <div className="min-h-screen bg-[##F0F4F8] text-[#e3e3e3]">
      {/* Top Bar - Gemini Style */}
      <header className="sticky top-0 z-50 bg-[##F0F4F8]/95 backdrop-blur-sm border-b border-[#2f2f2f]">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
              M
            </div>
            <span className="text-lg font-medium">Miguel AI</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Online</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Avatar Card - Compact */}
        <div className="mb-8 bg-[#282828] rounded-2xl p-6 border border-[#3c4043]">
          <div className="grid md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-1">
              <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-600/10">
                <Avatar isSpeaking={isLoading} />
              </div>
            </div>
            <div className="md:col-span-2 space-y-3">
              <h2 className="text-2xl font-semibold">Computer Science Graduate</h2>
              <p className="text-gray-400">BS Computer Science • AI Specialization • Mapúa University</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm border border-blue-500/20">Python</span>
                <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm border border-purple-500/20">AI/ML</span>
                <span className="px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 text-sm border border-pink-500/20">RAG Systems</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-4xl font-medium mb-4">Hi, I'm Miguel 👋</h3>
              <p className="text-gray-400 text-lg mb-8">What would you like to know?</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(prompt)}
                    className="text-left p-4 rounded-xl bg-[#282828] hover:bg-[#303134] border border-[#3c4043] transition-all duration-200"
                  >
                    <p className="text-sm text-gray-300">{prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {messages.map((msg, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0">
                    {msg.role === 'user' ? (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm">
                        Y
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        M
                      </div>
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-sm font-medium mb-2 text-gray-400">
                      {msg.role === 'user' ? 'You' : 'Miguel'}
                    </p>
                    <div className="text-base leading-relaxed text-gray-200">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    M
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-sm font-medium mb-2 text-gray-400">Miguel</p>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Box - Fixed at Bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[##F0F4F8] via-[##F0F4F8] to-transparent p-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#282828] rounded-3xl border border-[#3c4043] shadow-2xl">
              <div className="flex items-end gap-2 p-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask Miguel anything..."
                  rows="1"
                  className="flex-1 bg-transparent px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none resize-none max-h-32"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">Miguel AI can make mistakes. Verify important information.</p>
          </div>
        </div>

        {/* Spacer for fixed input */}
        <div className="h-32"></div>
      </div>
    </div>
  );
}
