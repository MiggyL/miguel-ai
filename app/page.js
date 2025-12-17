'use client';

import { useState, useRef, useEffect } from 'react';
import Avatar from './components/Avatar';
import ReactMarkdown from 'react-markdown';  // ADD THIS LINE

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);  // ADD THIS
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
  
  const playVideo = (videoName) => {
    setCurrentVideo(`/${videoName}.mp4`);
  };
  
  const handleVideoEnd = () => {
    setCurrentVideo(null);
  };

  const quickPrompts = [
    "Tell me about your AI projects",
    "What certifications do you have?",
    "What technologies do you work with?",
    "What role are you looking for?"
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#1f1f1f]">
      {/* Top Bar - Light Gemini Style */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
              M
            </div>
            <span className="text-lg font-medium text-gray-800">MiguelAI</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Online</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        
        {/* Avatar Card - Compact */}
        <div className="mb-6 bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
          <div className="grid md:grid-cols-5 gap-6 items-center">
            <div className="md:col-span-1">
              <div className="aspect-[2/3] rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 border border-gray-200">
                <Avatar 
                  isSpeaking={isLoading} 
                  videoToPlay={currentVideo}
                  onVideoEnd={handleVideoEnd}
                />
              </div>
            </div>
            <div className="md:col-span-4 space-y-3">
              <h2 className="text-2xl font-semibold text-gray-900">Miguel Lacanienta</h2>
              <p className="text-gray-600">BS Computer Science • AI Specialization • Mapúa University</p>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => playVideo('Objective')}
                  className="px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 cursor-pointer"
                >
                  Objective
                </button>
                <button className="px-4 py-2 rounded-full bg-purple-50 text-purple-700 text-sm font-medium border border-purple-200 hover:bg-purple-100 hover:border-purple-300 transition-all duration-200 cursor-pointer">
                  Skills
                </button>
                <button className="px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-medium border border-green-200 hover:bg-green-100 hover:border-green-300 transition-all duration-200 cursor-pointer">
                  Certifications
                </button>
                <button className="px-4 py-2 rounded-full bg-orange-50 text-orange-700 text-sm font-medium border border-orange-200 hover:bg-orange-100 hover:border-orange-300 transition-all duration-200 cursor-pointer">
                  Applied Skills
                </button>
                <button className="px-4 py-2 rounded-full bg-pink-50 text-pink-700 text-sm font-medium border border-pink-200 hover:bg-pink-100 hover:border-pink-300 transition-all duration-200 cursor-pointer">
                  Projects
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-6">
              <h3 className="text-4xl font-medium text-gray-900 mb-4">Hi, I'm Miguel 👋</h3>
              <p className="text-gray-600 text-lg mb-8">What would you like to know?</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(prompt)}
                    className="text-left p-4 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 transition-all duration-200 shadow-sm"
                  >
                    <p className="text-sm text-gray-700">{prompt}</p>
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
                    <p className="text-sm font-medium mb-2 text-gray-500">
                      {msg.role === 'user' ? 'You' : 'Miguel'}
                    </p>
                    <div className="text-base leading-relaxed text-gray-800">
                      <ReactMarkdown
                        components={{
                          p: ({node, ...props}) => <p className="my-1" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-none space-y-2 my-2 ml-0" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-none space-y-2 my-2 ml-0" {...props} />,
                          li: ({node, ...props}) => (
                            <li className="flex gap-2 items-start">
                              <span className="text-blue-600 mt-1 flex-shrink-0">•</span>
                              <span className="flex-1">{props.children}</span>
                            </li>
                          ),
                          h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-3 mb-1" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-base font-bold mt-2 mb-1" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-sm font-semibold mt-2 mb-1" {...props} />,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
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
                    <p className="text-sm font-medium mb-2 text-gray-500">Miguel</p>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Box - Fixed at Bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#F0F4F8] via-[#F0F4F8] to-transparent p-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl border border-gray-300 shadow-lg">
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
                  className="flex-1 bg-transparent px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none resize-none max-h-32"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">MiguelAI can make mistakes. Verify important information.</p>
          </div>
        </div>

        {/* Spacer for fixed input */}
        <div className="h-32"></div>
      </div>
    </div>
  );
}















