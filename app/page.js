'use client';

import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    // AI response will go here later
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'AI response coming soon! Integration in progress.'
      }]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">
            Talk to Miguel
          </h1>
          <p className="text-gray-300 text-lg">
            AI-Powered Interactive Resume • Computer Science Graduate
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
          
          {/* Avatar Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-6xl">👤</span>
                </div>
                <p className="text-white/60">Ready Player Me Avatar Loading...</p>
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 flex flex-col">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Ask Me Anything
            </h2>
            
            {/* Messages */}
            <div className="flex-1 space-y-4 mb-4 overflow-y-auto max-h-96">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 mt-8">
                  <p className="mb-2">👋 Hi! I'm Miguel's AI assistant.</p>
                  <p className="text-sm">Ask me about:</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>• My AI/ML projects</p>
                    <p>• Technical skills & certifications</p>
                    <p>• Education & experience</p>
                    <p>• What I'm looking for in a role</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-blue-600 ml-8'
                        : 'bg-white/20 mr-8'
                    }`}
                  >
                    <p className="text-white">{msg.content}</p>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="bg-white/20 p-4 rounded-lg mr-8">
                  <p className="text-white/60">Thinking...</p>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about my skills, projects, or experience..."
                className="flex-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
              >
                Send
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>Built with Next.js, Ready Player Me & AI • Portfolio Project by Miguel</p>
        </div>
      </div>
    </div>
  );
}