'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Avatar from './components/Avatar';
import QRCode from './components/QRCode';
import ModelSelector from './components/ModelSelector';
import VersionToggle from './components/VersionToggle';
import Banner from './components/Banner';
import ReactMarkdown from 'react-markdown';
import { getVideoPath, ASSET_CONFIG } from '@/lib/assets';

const SOCIALS = [
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/miguel-lacanienta/',
    svg: (
      <svg viewBox="0 0 24 24" className="w-full h-full" aria-hidden="true">
        <rect width="24" height="24" rx="4" fill="#0A66C2" />
        <path fill="white" d="M7.06 9.5h-3v9h3v-9zM5.56 5.05c-.97 0-1.75.78-1.75 1.75s.78 1.75 1.75 1.75 1.75-.78 1.75-1.75-.78-1.75-1.75-1.75zM20.5 18.5h-3v-4.6c0-1.1-.9-2-2-2s-2 .9-2 2v4.6h-3v-9h3v1.2c.7-1 1.8-1.5 3-1.5 2.2 0 4 1.8 4 4v5.3z" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/playlist?list=PLwgavg1OXIfHLX6Qj4jHYGD5Os5n4X8JV',
    svg: (
      <svg viewBox="0 0 24 24" className="w-full h-full" aria-hidden="true">
        <rect x="0" y="3.5" width="24" height="17" rx="4" fill="#FF0000" />
        <polygon points="10,8 10,16 16,12" fill="white" />
      </svg>
    ),
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/@mlacanienta',
    svg: (
      <svg viewBox="0 0 24 24" className="w-full h-full" aria-hidden="true">
        <rect width="24" height="24" rx="4" fill="black" />
        <path
          fill="#25F4EE"
          transform="translate(-1 1)"
          d="M16.5 7.6a3.6 3.6 0 0 1-2.8-3.2v-.3h-2.6v9.7c0 1.2-1 2.2-2.2 2.2a2.2 2.2 0 0 1-1.7-3.6 2.2 2.2 0 0 1 1.7-.8c.2 0 .5 0 .7.1v-2.6a4.7 4.7 0 0 0-.7 0 4.7 4.7 0 0 0-3.4 8 4.8 4.8 0 0 0 8.1-3.4v-5a6.1 6.1 0 0 0 3.5 1.1V7.5a3.6 3.6 0 0 1-.6 0z"
        />
        <path
          fill="#FE2C55"
          transform="translate(1 -1)"
          d="M16.5 7.6a3.6 3.6 0 0 1-2.8-3.2v-.3h-2.6v9.7c0 1.2-1 2.2-2.2 2.2a2.2 2.2 0 0 1-1.7-3.6 2.2 2.2 0 0 1 1.7-.8c.2 0 .5 0 .7.1v-2.6a4.7 4.7 0 0 0-.7 0 4.7 4.7 0 0 0-3.4 8 4.8 4.8 0 0 0 8.1-3.4v-5a6.1 6.1 0 0 0 3.5 1.1V7.5a3.6 3.6 0 0 1-.6 0z"
        />
        <path
          fill="white"
          d="M16.5 7.6a3.6 3.6 0 0 1-2.8-3.2v-.3h-2.6v9.7c0 1.2-1 2.2-2.2 2.2a2.2 2.2 0 0 1-1.7-3.6 2.2 2.2 0 0 1 1.7-.8c.2 0 .5 0 .7.1v-2.6a4.7 4.7 0 0 0-.7 0 4.7 4.7 0 0 0-3.4 8 4.8 4.8 0 0 0 8.1-3.4v-5a6.1 6.1 0 0 0 3.5 1.1V7.5a3.6 3.6 0 0 1-.6 0z"
        />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/mlacanienta',
    svg: (
      <svg viewBox="0 0 24 24" className="w-full h-full" aria-hidden="true">
        <circle cx="12" cy="12" r="12" fill="#1877F2" />
        <path
          fill="white"
          d="M13.5 8.5h1.7V6h-1.7c-1.66 0-3 1.34-3 3v1.5H8.5v2.5h2v6h2.5v-6h2l.5-2.5h-2.5V9c0-.28.22-.5.5-.5z"
        />
      </svg>
    ),
  },
];

function SocialIcons() {
  return (
    <div className="flex items-center gap-2">
      {SOCIALS.map((s) => (
        <a
          key={s.name}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.name}
          className="w-6 h-6 hover:scale-110 transition-transform"
        >
          {s.svg}
        </a>
      ))}
    </div>
  );
}

const DEPLOYMENTS = [
  { name: 'Vercel',     host: 'vercel.app',   url: 'https://miguel-ai.vercel.app/?v=2',     dot: 'bg-black' },
  { name: 'Netlify',    host: 'netlify.app',  url: 'https://miguel-ai.netlify.app/?v=2',    dot: 'bg-teal-500' },
  { name: 'Render',     host: 'onrender.com', url: 'https://miguel-ai.onrender.com/?v=2',   dot: 'bg-purple-500' },
  { name: 'Cloudflare', host: 'pages.dev',    url: 'https://miguel-ai.pages.dev/?v=2',      dot: 'bg-orange-500' },
];

function MirrorNoteInline() {
  const [hostname, setHostname] = useState('');
  useEffect(() => { setHostname(window.location.hostname); }, []);
  const others = DEPLOYMENTS.filter((d) => !hostname.includes(d.host));
  if (others.length === 0) return null;
  return (
    <>
      {' · Chat down? Try: '}
      {others.map((d, i) => (
        <span key={d.name}>
          {i > 0 && ' · '}
          <a href={d.url} className="text-blue-600 hover:underline">{d.name}</a>
        </span>
      ))}
    </>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const version = searchParams.get('v') === '1' ? 1 : 2;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [selectedModel, setSelectedModel] = useState('groq'); // ADD THIS
  const [isAltAvatar, setIsAltAvatar] = useState(false);
  const [language, setLanguage] = useState('english'); // 'english' or 'german'
  const [chatHighlight, setChatHighlight] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Basic input validation
    if (input.length > 500) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Your message is too long. Please keep it under 500 characters.'
      }]);
      return;
    }

    // Detect suspicious patterns
    const suspiciousPatterns = [
      /ignore.*previous.*instructions?/i,
      /disregard.*above/i,
      /forget.*you.*are/i,
      /you.*are.*now/i,
      /new.*instructions?:/i,
      /system.*prompt/i,
      /override.*settings?/i,
    ];

    const hasSuspiciousContent = suspiciousPatterns.some(pattern => pattern.test(input));

    if (hasSuspiciousContent) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I detected an unusual pattern in your message. Please ask a straightforward question about Miguel\'s qualifications.'
      }]);
      return;
    }

    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          model: selectedModel
        }),
      });

      const data = await response.json();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message || data.error,
        model: selectedModel
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
    setCurrentVideo(getVideoPath(videoName, { isReal: isAltAvatar, language }));
  };

  const handleVideoEnd = () => {
    setCurrentVideo(null);
  };

  const handleAvatarSwitch = () => {
    setIsAltAvatar(prev => !prev);
  };

  const handleLanguageToggle = () => {
    setLanguage(language === 'english' ? 'german' : 'english');
  };

  const quickPrompts = [
    "Tell me about your AI projects",
    "What certifications do you have?",
    "What technologies do you work with?",
    "What role are you looking for?"
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#1f1f1f] overflow-x-hidden">
      {/* Top Bar - Light Gemini Style — desktop: name left / tabs centered /
          socials right. Mobile: name + socials on row 1, tabs on row 2 so
          3 tabs don't squeeze the socials off-screen. */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-2.5 sm:py-3 flex flex-col gap-2 sm:grid sm:grid-cols-3 sm:items-center sm:gap-3">
          <div className="flex items-center justify-between sm:justify-start gap-2 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base sm:text-lg font-medium text-gray-800 truncate">Miguel Lacanienta</span>
              <VersionToggle />
            </div>
            <div className="sm:hidden">
              <SocialIcons />
            </div>
          </div>
          <nav className="flex justify-center items-center gap-1">
            <a
              href="https://miguel-app.pages.dev/"
              aria-current="page"
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-900 text-white"
            >
              Resume
            </a>
            <a
              href="https://miguel-folio.pages.dev/"
              className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              Portfolio
            </a>
            <a
              href="/cover-letter"
              className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              Cover Letter
            </a>
          </nav>
          <div className="hidden sm:flex justify-end">
            <SocialIcons />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 pt-4 pb-3">

        {/* v2: Video Banner */}
        {version === 2 && (
          <div className="mb-4">
            <Banner onChatHighlight={setChatHighlight} />
          </div>
        )}

        {/* v1: Original Avatar Card */}
        {version === 1 && (
          <>
            <div className="mb-4 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-center">
              <span className="text-xs text-amber-700 font-medium">You are viewing v1 (previous release)</span>
            </div>
            <div className="mb-6 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative overflow-hidden">
              <QRCode />
              <div className="grid md:grid-cols-3 gap-6 items-end min-w-0">
                <div className="md:col-span-1 flex justify-center">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden w-40 sm:w-56 md:w-full">
                    <Avatar
                      isSpeaking={isLoading}
                      videoToPlay={currentVideo}
                      onVideoEnd={handleVideoEnd}
                      isAltAvatar={isAltAvatar}
                      onAvatarSwitch={handleAvatarSwitch}
                      language={language}
                      onLanguageToggle={handleLanguageToggle}
                    />
                  </div>
                </div>
                <div className="md:col-span-2 flex flex-col h-full min-w-0">
                  <div className="flex-1 flex flex-col justify-center space-y-4">
                    <div className="text-center">
                      <h2 className="text-2xl font-semibold text-gray-900">Miguel Lacanienta</h2>
                      <p className="text-gray-600 mt-1">BS Computer Science • AI Specialization • Mapúa University</p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <button
                        onClick={() => playVideo('objective')}
                        className="px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 cursor-pointer">
                        Objective
                      </button>
                      <button
                        onClick={() => playVideo('skills')}
                        className="px-4 py-2 rounded-full bg-purple-50 text-purple-700 text-sm font-medium border border-purple-200 hover:bg-purple-100 hover:border-purple-300 transition-all duration-200 cursor-pointer">
                        Skills
                      </button>
                      <button
                        onClick={() => playVideo('certs')}
                        className="px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-medium border border-green-200 hover:bg-green-100 hover:border-green-300 transition-all duration-200 cursor-pointer">
                        Certifications
                      </button>
                      <button
                        onClick={() => playVideo('applied')}
                        className="px-4 py-2 rounded-full bg-orange-50 text-orange-700 text-sm font-medium border border-orange-200 hover:bg-orange-100 hover:border-orange-300 transition-all duration-200 cursor-pointer">
                        Applied Skills
                      </button>
                      <button
                        onClick={() => playVideo('projects')}
                        className="px-4 py-2 rounded-full bg-pink-50 text-pink-700 text-sm font-medium border border-pink-200 hover:bg-pink-100 hover:border-pink-300 transition-all duration-200 cursor-pointer">
                        Projects
                      </button>
                    </div>
                  </div>

                  {/* Powered By Ticker */}
                  <div className="bg-gray-800 rounded-lg overflow-hidden mt-4">
                    <div className="py-2 px-3">
                      <div className="flex items-center justify-start gap-2 mb-1">
                        <span className="text-white text-xs font-semibold">Powered by:</span>
                      </div>
                      <div className="relative overflow-hidden">
                        <div className="flex animate-scroll">
                          {/* First complete set */}
                          <div className="flex items-center gap-3 flex-shrink-0 pr-3">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 rounded-full min-w-fit">
                              <img src={`${ASSET_CONFIG.basePath}/chatgpt_icon.png`} alt="ChatGPT" className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-white text-xs font-medium whitespace-nowrap">ChatGPT</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 rounded-full min-w-fit">
                              <img src={`${ASSET_CONFIG.basePath}/claude_icon.png`} alt="Claude" className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-white text-xs font-medium whitespace-nowrap">Claude</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 rounded-full min-w-fit">
                              <img src={`${ASSET_CONFIG.basePath}/llama_icon.png`} alt="Llama 3.3" className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-white text-xs font-medium whitespace-nowrap">Llama 3.3</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 rounded-full min-w-fit">
                              <img src={`${ASSET_CONFIG.basePath}/gemma_icon.png`} alt="Gemma 3" className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-white text-xs font-medium whitespace-nowrap">Gemma 3</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 rounded-full min-w-fit">
                              <img src={`${ASSET_CONFIG.basePath}/mistral_icon.png`} alt="Mistral Large" className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-white text-xs font-medium whitespace-nowrap">Mistral Large</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 rounded-full min-w-fit">
                              <img src={`${ASSET_CONFIG.basePath}/elevenlabs_icon.png`} alt="ElevenLabs" className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-white text-xs font-medium whitespace-nowrap">ElevenLabs</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 rounded-full min-w-fit">
                              <img src={`${ASSET_CONFIG.basePath}/sora_icon.png`} alt="Sora 2" className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-white text-xs font-medium whitespace-nowrap">Sora 2</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 rounded-full min-w-fit">
                              <img src={`${ASSET_CONFIG.basePath}/capcut_icon.png`} alt="CapCut" className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-white text-xs font-medium whitespace-nowrap">CapCut</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 rounded-full min-w-fit">
                              <img src={`${ASSET_CONFIG.basePath}/pippit_icon.png`} alt="Pippit" className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-white text-xs font-medium whitespace-nowrap">Pippit</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 rounded-full min-w-fit">
                              <img src={`${ASSET_CONFIG.basePath}/github_icon.png`} alt="GitHub" className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-white text-xs font-medium whitespace-nowrap">GitHub</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 rounded-full min-w-fit">
                              <img src={`${ASSET_CONFIG.basePath}/vercel_icon.png`} alt="Vercel" className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-white text-xs font-medium whitespace-nowrap">Vercel</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 rounded-full min-w-fit">
                              <img src={`${ASSET_CONFIG.basePath}/netlify_icon.png`} alt="Netlify" className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-white text-xs font-medium whitespace-nowrap">Netlify</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 rounded-full min-w-fit">
                              <img src={`${ASSET_CONFIG.basePath}/render_icon.png`} alt="Render" className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-white text-xs font-medium whitespace-nowrap">Render</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 rounded-full min-w-fit">
                              <img src={`${ASSET_CONFIG.basePath}/cloudflare_icon.png`} alt="Cloudflare" className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-white text-xs font-medium whitespace-nowrap">Cloudflare</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 rounded-full min-w-fit">
                              <img src={`${ASSET_CONFIG.basePath}/kiro_icon.png`} alt="Kiro" className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-white text-xs font-medium whitespace-nowrap">Kiro</span>
                            </div>
                          </div>
                          {/* Duplicate set for seamless loop */}
                          <div className="flex items-center gap-3 flex-shrink-0 pr-3">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 rounded-full min-w-fit">
                              <img src={`${ASSET_CONFIG.basePath}/chatgpt_icon.png`} alt="ChatGPT" className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-white text-xs font-medium whitespace-nowrap">ChatGPT</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 rounded-full min-w-fit">
                              <img src={`${ASSET_CONFIG.basePath}/claude_icon.png`} alt="Claude" className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-white text-xs font-medium whitespace-nowrap">Claude</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 rounded-full min-w-fit">
                              <img src={`${ASSET_CONFIG.basePath}/llama_icon.png`} alt="Llama 3.3" className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-white text-xs font-medium whitespace-nowrap">Llama 3.3</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 rounded-full min-w-fit">
                              <img src={`${ASSET_CONFIG.basePath}/gemma_icon.png`} alt="Gemma 3" className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-white text-xs font-medium whitespace-nowrap">Gemma 3</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 rounded-full min-w-fit">
                              <img src={`${ASSET_CONFIG.basePath}/mistral_icon.png`} alt="Mistral Large" className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-white text-xs font-medium whitespace-nowrap">Mistral Large</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 rounded-full min-w-fit">
                              <img src={`${ASSET_CONFIG.basePath}/elevenlabs_icon.png`} alt="ElevenLabs" className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-white text-xs font-medium whitespace-nowrap">ElevenLabs</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 rounded-full min-w-fit">
                              <img src={`${ASSET_CONFIG.basePath}/sora_icon.png`} alt="Sora 2" className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-white text-xs font-medium whitespace-nowrap">Sora 2</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 rounded-full min-w-fit">
                              <img src={`${ASSET_CONFIG.basePath}/capcut_icon.png`} alt="CapCut" className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-white text-xs font-medium whitespace-nowrap">CapCut</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 rounded-full min-w-fit">
                              <img src={`${ASSET_CONFIG.basePath}/pippit_icon.png`} alt="Pippit" className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-white text-xs font-medium whitespace-nowrap">Pippit</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 rounded-full min-w-fit">
                              <img src={`${ASSET_CONFIG.basePath}/github_icon.png`} alt="GitHub" className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-white text-xs font-medium whitespace-nowrap">GitHub</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 rounded-full min-w-fit">
                              <img src={`${ASSET_CONFIG.basePath}/vercel_icon.png`} alt="Vercel" className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-white text-xs font-medium whitespace-nowrap">Vercel</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 rounded-full min-w-fit">
                              <img src={`${ASSET_CONFIG.basePath}/netlify_icon.png`} alt="Netlify" className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-white text-xs font-medium whitespace-nowrap">Netlify</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 rounded-full min-w-fit">
                              <img src={`${ASSET_CONFIG.basePath}/render_icon.png`} alt="Render" className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-white text-xs font-medium whitespace-nowrap">Render</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 rounded-full min-w-fit">
                              <img src={`${ASSET_CONFIG.basePath}/cloudflare_icon.png`} alt="Cloudflare" className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-white text-xs font-medium whitespace-nowrap">Cloudflare</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 rounded-full min-w-fit">
                              <img src={`${ASSET_CONFIG.basePath}/kiro_icon.png`} alt="Kiro" className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-white text-xs font-medium whitespace-nowrap">Kiro</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Chat Area */}
        <div className="space-y-6">
          {messages.length === 0 ? (
            <div className="text-center mt-4">
              <h3 className="text-4xl font-medium text-gray-900 mb-1">Hi, I'm Miguel 👋</h3>
              <p className="text-gray-600 text-lg mb-2">What would you like to know?</p>

              <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(prompt)}
                    className="px-3 py-1.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 transition-all duration-200 shadow-sm text-xs text-gray-700 whitespace-nowrap"
                  >
                    {prompt}
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

                    {/* Model Indicator - Only for assistant messages */}
                    {msg.role === 'assistant' && msg.model && (
                      <div className="mt-3">
                        <div className="border-t border-gray-200 mb-2"></div>
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 border border-gray-200">
                          <svg className="w-3 h-3 text-gray-500 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                          </svg>
                          <span className="text-xs font-medium text-gray-600">
                            {msg.model === 'groq' && 'Llama 3.3 70B'}
                            {msg.model === 'gemini' && 'Gemma 3 27B'}
                            {msg.model === 'mistral' && 'Mistral Large'}
                          </span>
                        </div>
                      </div>
                    )}
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
            <div className={`bg-white rounded-3xl border shadow-lg transition-all duration-300 ${
              chatHighlight
                ? 'border-blue-400 shadow-[0_0_24px_rgba(96,165,250,0.55)] ring-2 ring-blue-300/60 scale-[1.01]'
                : 'border-gray-300'
            }`}>
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

                {/* Model Selector */}
                <ModelSelector
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                />

                {/* Send Button */}
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
            <p className="text-center text-xs text-gray-500 mt-2">
              MiguelAI can make mistakes. Verify important information.<MirrorNoteInline />
            </p>
          </div>
        </div>

        {/* Spacer for fixed input */}
        <div className="h-32"></div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F0F4F8]" />}>
      <HomeContent />
    </Suspense>
  );
}
