'use client';

import { useState, useEffect, useRef } from 'react';

const deployments = [
  {
    name: 'Vercel',
    url: 'https://miguel-ai.vercel.app/',
    color: 'bg-black',
    textColor: 'text-black'
  },
  {
    name: 'Netlify',
    url: 'https://miguel-ai-2.netlify.app/',
    color: 'bg-teal-500',
    textColor: 'text-teal-600'
  },
  {
    name: 'Render',
    url: 'https://miguel-ai.onrender.com/',
    color: 'bg-purple-500',
    textColor: 'text-purple-600'
  },
  {
    name: 'Cloudflare',
    url: 'https://miguel-ai.pages.dev/',
    color: 'bg-orange-500',
    textColor: 'text-orange-600'
  },
  {
    name: 'GitHub',
    url: 'https://miggyl.github.io/me/',
    color: 'bg-black',
    textColor: 'text-black'
  }
];

export default function DeploymentSelector() {
  const [selectedDeployment, setSelectedDeployment] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Detect current deployment based on hostname and set as default
    const hostname = window.location.hostname;
    
    if (hostname.includes('vercel.app')) {
      setSelectedDeployment(deployments[0]);
    } else if (hostname.includes('netlify.app')) {
      setSelectedDeployment(deployments[1]);
    } else if (hostname.includes('onrender.com')) {
      setSelectedDeployment(deployments[2]);
    } else {
      // Default to Vercel for localhost or other domains
      setSelectedDeployment(deployments[0]);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDeploymentSelect = (deployment) => {
    setSelectedDeployment(deployment);
    setIsOpen(false);
    
    // Redirect to the selected deployment if it's different from current
    if (deployment.name !== selectedDeployment?.name) {
      window.location.href = deployment.url;
    }
  };

  if (!selectedDeployment) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
      >
        <div className={`w-2 h-2 rounded-full ${selectedDeployment.color}`}></div>
        <span>{selectedDeployment.name}</span>
        <svg 
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px] z-50">
          {deployments.map((deployment) => (
            <button
              key={deployment.name}
              onClick={() => handleDeploymentSelect(deployment)}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center gap-2 ${
                selectedDeployment.name === deployment.name ? 'bg-gray-50' : ''
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${deployment.color}`}></div>
              <span className={deployment.textColor}>{deployment.name}</span>
              {selectedDeployment.name === deployment.name && (
                <svg className="w-3 h-3 ml-auto text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
