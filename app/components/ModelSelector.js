'use client';

import { useState, useRef, useEffect } from 'react';

export default function ModelSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const models = [
    {
      id: 'groq',
      name: 'Llama 3.3 70B',
      provider: 'Groq',
      description: 'Fast and efficient (Current)',
      isSelected: true
    },
    {
      id: 'gemini',
      name: 'Gemini Pro',
      provider: 'Google',
      description: 'Google\'s advanced AI',
      isSelected: false
    },
    {
      id: 'openai',
      name: 'GPT-4o Mini',
      provider: 'OpenAI',
      description: 'Most capable AI model',
      isSelected: false
    }
  ];

  const selectedModel = models.find(m => m.isSelected);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Compact Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        <span className="text-xs font-medium text-gray-700">{selectedModel?.name}</span>
        <svg 
          className={`w-3 h-3 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu - Opens Upward */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-80 bg-white rounded-2xl border border-gray-200 shadow-xl z-50 overflow-hidden">
          <div className="p-3">
            {/* Model Options */}
            <div className="space-y-1">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    console.log('Selected:', model.name);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                    model.isSelected 
                      ? 'bg-blue-50 border-2 border-blue-200' 
                      : 'border-2 border-transparent hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{model.name}</div>
                      <div className="text-xs text-gray-500">{model.provider}</div>
                    </div>
                    {model.isSelected && (
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{model.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
