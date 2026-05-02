'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ASSET_CONFIG } from '@/lib/assets';
import IdleOverlay from './IdleOverlay';
import Subtitles from './Subtitles';
import FloatingControls from './FloatingControls';

const CV_URL = 'https://drive.google.com/file/d/1RyQRN930zeyjLZe2o_J52zWEB1kWyWQF';
const ChromeDino = dynamic(() => import('react-chrome-dino'), { ssr: false });

const V2_BASE = `${ASSET_CONFIG.basePath}/v2`;

// Maps section → cue index → image filename(s) shown during that cue
const SECTION_IMAGES = {
  'Objective': [
    ['objective-1-1.png'],                                                                    // cue 1: programming / DevOps
    ['objective-2-1.png', 'objective-2-2.png', 'objective-2-3.png', 'objective-2-4.png'],    // cue 2: Power Platform, Python, JavaScript, Cloud
    ['objective-3-1.png', 'objective-3-2.png'],                                              // cue 3: Azure & OCI
  ],
  'Skills': [
    ['skills-1-1.png', 'skills-1-2.png', 'skills-1-3.png', 'skills-1-4.png'],               // cue 1: Power Platform, Automate, Apps, Dataverse
    ['skills-2-1.png', 'skills-2-2.png', 'skills-2-3.png'],                                 // cue 2: Python, JavaScript, AI
    ['skills-3-1.png', 'skills-3-2.png'],                                                    // cue 3: Azure & OCI
  ],
  'Applied Skills': [
    ['applied-skills-1-1.png'],                                                              // cue 1: ms-applied-power-automate
    ['applied-skills-2-1.png', 'applied-skills-2-2.png'],                                   // cue 2: ms-applied-power-apps-canvas, dataverse
  ],
  'Projects': [
    ['projects-1-1.png'],                                                                    // cue 1: PPE CCTV
    ['projects-2-1.png'],                                                                    // cue 2: ALOPA Chrome Extension
    ['projects-3-1.png'],                                                                    // cue 3: Food Price Forecasting
    ['projects-4-1.png'],                                                                    // cue 4: Local LLM (Mistral 7B)
    ['projects-5-1.png'],                                                                    // cue 5: YouTube Q&A
  ],
  'Certifications': [
    ['certifications-02-1.png', 'certifications-02-2.png'],                                  // cue 01: general intro — MS & Oracle logos
    ['certifications-02-1.png', 'certifications-02-2.png'],                                  // cue 02: Microsoft & Oracle logos
    ['certifications-03-1.png', 'certifications-03-2.png'],                                  // cue 03: ms-azure-ai-fundamentals, ai-engineer
    ['certifications-04-1.png', 'certifications-04-2.png'],                                  // cue 04: ms-azure-administrator, power-platform
    ['certifications-05-1.png'],                                                             // cue 05: oci-logo
    ['certifications-06-1.png', 'certifications-06-2.png'],                                  // cue 06: oci-architect-associate, multicloud
    ['certifications-07-1.png', 'certifications-07-2.png', 'certifications-07-3.png'],       // cue 07: oci-genai, ai-foundations, foundations
    ['certifications-08-1.png', 'certifications-08-2.png'],                                  // cue 08: oci-data-management, specialty
    ['certifications-09-1.png', 'certifications-09-2.png'],                                  // cue 09: pcep-python, jse-javascript
    ['certifications-10-1.png'],                                                             // cue 10: neo4j-certified-professional
    ['certifications-11-1.png', 'certifications-11-2.png'],                                  // cue 11: neo4j-graph-data-science, certified-professional
  ],
};

// Sections that cycle images one at a time (with interval in ms)
const SINGLE_IMAGE_SECTIONS = new Set(['Certifications', 'Applied Skills']);
const CYCLE_INTERVAL = 2000;

// Cue indices (0-based) that show logos side-by-side instead of cycling
const LOGO_CUES = {
  'Certifications': new Set([0, 1]), // cues 1 & 2 are MS/Oracle logos, not certificates
};

// About video: keyword regex → section button / chatbox, matched against a rolling
// text window of the last ~1.2s from the per-word SRT (about/{en,de}-words.srt).
// Multi-word phrase regexes match across word boundaries thanks to the rolling join.
const ABOUT_KEYWORDS = {
  EN: {
    sections: [
      { re: /Applied\s+Skills/i, value: 'Applied Skills' },
      { re: /\bObjective\b/i, value: 'Objective' },
      { re: /\bCertifications?\b/i, value: 'Certifications' },
      { re: /\bProjects?\b/i, value: 'Projects' },
      { re: /\bSkills\b/i, value: 'Skills' },
    ],
    chat: /\bchat\b|\bask\b|\bbelow\b|\brespond\b|\bbackground\b|\bLlama\b|\bGemma\b|\bMistral\b/i,
  },
  DE: {
    sections: [
      { re: /praktischen\s+Fertigkeiten|angewandten\s+F[aä]higkeiten/i, value: 'Applied Skills' },
      { re: /Zielen|Zielsetzung|\bZiele?\b/i, value: 'Objective' },
      { re: /Zertifizierungen/i, value: 'Certifications' },
      { re: /Projekten|Projekte/i, value: 'Projects' },
      { re: /F[aä]higkeiten/i, value: 'Skills' },
    ],
    chat: /Fragen|Hintergrund|antworte|\bunten\b|KI-Modell|\bLama\b|\bGemma\b|\bMistral\b/i,
  },
};

// How long a button / chat highlight lingers after its keyword stops being in the window.
const ABOUT_HIGHLIGHT_AFTERGLOW = 1.5;

// Map section button labels to video filenames in EN/ and DE/ (remote miguel-app assets)
const SECTION_VIDEO_MAP = {
  'Objective': 'objective.mp4',
  'Skills': 'skills.mp4',
  'Certifications': 'certifications.mp4',
  'Applied Skills': 'applied.mp4',
  'Projects': 'projects.mp4',
};

const PROJECT_SEGMENTS = {
  'Interactive Resume': {
    segments: ['seg1_intro.mp4', 'seg2_skills.mp4', 'seg3_experience.mp4', 'seg4_certs.mp4', 'seg5_contact.mp4'],
    labels: ['Intro', 'Skills', 'Experience', 'Certifications', 'Contact'],
  },
  'DTR System': {
    segments: ['dtr_seg1.mp4', 'dtr_seg2.mp4', 'dtr_seg3.mp4', 'dtr_seg4.mp4', 'dtr_seg5.mp4'],
    labels: ['The System', 'The Team', 'Miguel Joins', 'Calendar View', 'The Impact'],
  },
};

export { PROJECT_SEGMENTS };

export default function Banner({ onChatHighlight, centerSlot, onLanguageChange } = {}) {
  const videoRef = useRef(null);
  const sectionVideoRef = useRef(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(-1);
  const [activeProject, setActiveProject] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [language, setLanguage] = useState('EN');
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [gameOpen, setGameOpen] = useState(false);

  // Notify parent when the banner's language changes — used by hosts that
  // need to mirror the language selection (e.g. cover-letter page sends
  // it to the LLM as the output language).
  useEffect(() => {
    onLanguageChange?.(language);
  }, [language, onLanguageChange]);

  useEffect(() => {
    if (!gameOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setGameOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gameOpen]);

  useEffect(() => {
    if (!gameOpen) return;
    const host = document.getElementById('dino-game-host');
    if (!host) return;
    const prune = () => {
      const canvases = host.querySelectorAll('canvas.runner-canvas');
      for (let i = 1; i < canvases.length; i++) canvases[i].remove();
    };
    prune();
    const obs = new MutationObserver(prune);
    obs.observe(host, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, [gameOpen]);
  const [sectionVisible, setSectionVisible] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [currentImages, setCurrentImages] = useState([]);
  const [highlightedSections, setHighlightedSections] = useState(() => new Set());
  const cuesRef = useRef([]);
  // About: rolling-window keyword tracking for button + chatbox highlights
  const aboutCurrentBtnRef = useRef(null);
  const aboutBtnExpiryRef = useRef(0);
  const aboutChatExpiryRef = useRef(0);
  const aboutChatActiveRef = useRef(false);
  const [cycleImages, setCycleImages] = useState([]);  // full image list for cycling sections

  // Cycle through images one at a time for Certifications / Applied Skills
  useEffect(() => {
    if (cycleImages.length <= 1) return;
    setCurrentImages([cycleImages[0]]);
    let idx = 0;
    const id = setInterval(() => {
      idx = idx + 1;
      if (idx >= cycleImages.length) { clearInterval(id); return; }
      setCurrentImages([cycleImages[idx]]);
    }, CYCLE_INTERVAL);
    return () => clearInterval(id);
  }, [cycleImages]);

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
    setIsMuted(!isMuted);
  };

  const playSegments = useCallback(async (projectTitle) => {
    const config = PROJECT_SEGMENTS[projectTitle];
    if (!config || isPlaying) return;
    setIsPlaying(true);
    setActiveProject(projectTitle);

    const video = videoRef.current;
    if (!video) return;

    video.scrollIntoView({ behavior: 'smooth', block: 'center' });

    for (let i = 0; i < config.segments.length; i++) {
      setCurrentSegment(i);
      video.loop = false;
      video.src = `${V2_BASE}/${config.segments[i]}`;
      video.load();

      await new Promise((resolve) => {
        video.oncanplay = () => {
          video.play().catch(() => {});
        };
        video.onended = resolve;
        video.onerror = resolve;
      });
    }

    setCurrentSegment(-1);
    setIsPlaying(false);
    setActiveProject(null);
    video.loop = true;
    video.src = `${V2_BASE}/bg.mp4`;
    video.load();
    video.play().catch(() => {});
  }, [isPlaying]);

  const resetSectionState = () => {
    setSectionVisible(false);
    setActiveSection(null);
    setCurrentImages([]);
    setCycleImages([]);
    setHighlightedSections(new Set());
    aboutCurrentBtnRef.current = null;
    aboutBtnExpiryRef.current = 0;
    aboutChatExpiryRef.current = 0;
    aboutChatActiveRef.current = false;
    onChatHighlight?.(false);
    setOverlayVisible(true);
  };

  const handleSectionClick = (section) => {
    setGameOpen(false);
    const src = section === 'About'
      ? `/about/${language.toLowerCase()}.mp4`
      : (SECTION_VIDEO_MAP[section]
          ? `${V2_BASE}/${language}/${SECTION_VIDEO_MAP[section]}`
          : null);
    if (!src) return;

    const sectionVideo = sectionVideoRef.current;
    if (!sectionVideo) return;

    setOverlayVisible(false);
    setActiveSection(section);

    let started = false;
    sectionVideo.src = src;
    sectionVideo.load();
    sectionVideo.oncanplay = () => {
      if (started) return;
      started = true;
      setSectionVisible(true);
      sectionVideo.play().catch(() => {});
    };
    sectionVideo.onended = resetSectionState;
    sectionVideo.onerror = resetSectionState;
  };

  return (
    <div className="relative bg-black rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <audio ref={audioRef} loop src={`${V2_BASE}/ambient.mp3`} />
      <div className="w-full aspect-[4/5] md:aspect-[1173/640]">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          onClick={overlayVisible ? () => handleSectionClick('About') : undefined}
          className={`w-full h-full object-cover ${overlayVisible ? 'cursor-pointer' : ''}`}
          src={`${V2_BASE}/bg.mp4`}
        />
      </div>

      {/* Idle avatar overlay — bottom-right, always playing */}
      <video
        autoPlay
        loop
        muted
        playsInline
        onClick={overlayVisible ? () => handleSectionClick('About') : undefined}
        className={`absolute bottom-0 right-0 object-cover rounded-br-2xl h-[45%] md:h-[35%] ${overlayVisible ? 'cursor-pointer' : ''}`}
        style={{ aspectRatio: '1/1', zIndex: 5 }}
        src={`${V2_BASE}/idle.mp4`}
      />

      {/* Section video overlay — plays on top of idle avatar */}
      <video
        ref={sectionVideoRef}
        playsInline
        className="absolute bottom-0 right-0 object-cover rounded-br-2xl transition-opacity duration-300 h-[45%] md:h-[35%]"
        style={{
          aspectRatio: '1/1',
          zIndex: 7,
          opacity: sectionVisible ? 1 : 0,
          pointerEvents: sectionVisible ? 'auto' : 'none',
        }}
      />


      {/* Subtitles — displayed beside the avatar during section playback */}
      <Subtitles
        videoRef={sectionVideoRef}
        language={language}
        section={activeSection}
        srtUrl={activeSection === 'About' ? `/about/${language.toLowerCase()}.srt` : undefined}
        onCueChange={(idx, cues) => {
          cuesRef.current = cues || [];

          // About: button + chat highlights are driven by the word-level SRT below
          if (activeSection === 'About') return;

          const images = SECTION_IMAGES[activeSection]?.[idx];
          if (!images || images.length === 0) {
            setCurrentImages([]);
            setCycleImages([]);
            return;
          }

          const isLogoCue = LOGO_CUES[activeSection]?.has(idx);
          if (!isLogoCue && SINGLE_IMAGE_SECTIONS.has(activeSection) && images.length > 1) {
            // Cycle one at a time — store full list, effect handles the rest
            setCycleImages(images);
          } else {
            setCycleImages([]);
            setCurrentImages(images);
          }
        }}
      />

      {/* About — silent word-level SRT drives precise per-keyword button + chatbox highlights */}
      {activeSection === 'About' && (
        <Subtitles
          silent
          videoRef={sectionVideoRef}
          language={language}
          srtUrl={`/about/${language.toLowerCase()}-words.srt`}
          onCueChange={(_idx, cues) => {
            const now = sectionVideoRef.current?.currentTime ?? 0;
            const kw = ABOUT_KEYWORDS[language];
            if (!kw) return;

            // Rolling 1.2s window — joins adjacent per-word cues so phrase regexes
            // like /Applied\s+Skills/ can match across word boundaries.
            const WINDOW = 1.2;
            const recent = cues
              .filter((c) => c.end > now - WINDOW && c.start <= now)
              .map((c) => c.text)
              .join(' ');

            // Section button: pick the most recently-ending keyword in the window
            let btnMatch = null;
            let bestEnd = -1;
            for (const { re, value } of kw.sections) {
              const m = recent.match(re);
              if (m && m.index + m[0].length > bestEnd) {
                bestEnd = m.index + m[0].length;
                btnMatch = value;
              }
            }
            if (btnMatch) {
              aboutCurrentBtnRef.current = btnMatch;
              aboutBtnExpiryRef.current = now + ABOUT_HIGHLIGHT_AFTERGLOW;
              setHighlightedSections(new Set([btnMatch]));
            } else if (aboutCurrentBtnRef.current && now > aboutBtnExpiryRef.current) {
              aboutCurrentBtnRef.current = null;
              setHighlightedSections(new Set());
            }

            // Chatbox highlight: any chat keyword in the window keeps it lit
            if (kw.chat.test(recent)) {
              aboutChatExpiryRef.current = now + ABOUT_HIGHLIGHT_AFTERGLOW;
              if (!aboutChatActiveRef.current) {
                aboutChatActiveRef.current = true;
                onChatHighlight?.(true);
              }
            } else if (aboutChatActiveRef.current && now > aboutChatExpiryRef.current) {
              aboutChatActiveRef.current = false;
              onChatHighlight?.(false);
            }
          }}
        />
      )}

      {/* Blur backdrop — behind images, subtitles, and avatar during section playback */}
      {sectionVisible && (
        <div className="absolute inset-0 z-[3] bg-black/60 backdrop-blur-sm transition-opacity duration-300" />
      )}

      {/* Slideshow images — synced to SRT cues; 2x2 grid for 3-4 items, row for 1-2 */}
      {currentImages.length > 0 && (
        <div className="absolute inset-0 z-[4] flex items-center justify-center pointer-events-none" style={{ paddingBottom: currentImages.length >= 3 ? '12%' : '0' }}>
          {currentImages.length >= 3 ? (
            <div className="grid grid-cols-2 gap-3 items-center justify-items-center" style={{ width: '65%', maxHeight: '70%' }}>
              {currentImages.map((img) => (
                <img
                  key={img}
                  src={`${V2_BASE}/images/${img}`}
                  alt=""
                  className="rounded-md shadow-lg object-contain"
                  style={{ maxWidth: '100%', maxHeight: '32vh' }}
                />
              ))}
              {/* Empty cell to fill 2x2 when only 3 items */}
              {currentImages.length === 3 && <div />}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3" style={{ width: '65%', maxHeight: '80%' }}>
              {currentImages.map((img) => (
                <img
                  key={img}
                  src={`${V2_BASE}/images/${img}`}
                  alt=""
                  className="rounded-md shadow-lg object-contain"
                  style={{
                    maxWidth: currentImages.length === 1 ? '100%' : `${Math.floor(90 / currentImages.length)}%`,
                    maxHeight: '80%',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Top-left: EN|DE toggle + Play intro — hidden during section playback */}
      <div className={`absolute top-3 left-3 z-[6] flex items-center gap-2 transition-opacity duration-300 ${overlayVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex items-center gap-1 px-2 py-0.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-md opacity-50 hover:opacity-100 transition-all">
          <button onClick={() => setLanguage('EN')} className={`text-[11px] sm:text-xs font-medium tracking-wide cursor-pointer transition-colors ${language === 'EN' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}>
            EN
          </button>
          <span className="text-white/30 text-[11px]">|</span>
          <button onClick={() => setLanguage('DE')} className={`text-[11px] sm:text-xs font-medium tracking-wide cursor-pointer transition-colors ${language === 'DE' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}>
            DE
          </button>
        </div>
        <button onClick={() => handleSectionClick('About')} className="opacity-50 hover:opacity-100 transition-opacity cursor-pointer" aria-label="Play about">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="none">
            <polygon points="6 3 20 12 6 21 6 3" />
          </svg>
        </button>
      </div>

      {/* Idle overlay: name, title, section buttons.
          When the host page passes a centerSlot render-prop, render that
          instead of the default IdleOverlay (e.g. cover-letter page swaps
          the section buttons for its form). The render-prop receives
          { language, setLanguage } so the slot can stay in sync with the
          banner's language toggle. */}
      {typeof centerSlot === 'function'
        ? centerSlot({ language, setLanguage, overlayVisible })
        : <IdleOverlay visible={overlayVisible} onSectionClick={handleSectionClick} />}

      {/* About highlight overlay — non-interactive replica of IdleOverlay with glow on mentioned buttons */}
      {activeSection === 'About' && (
        <div className="absolute inset-0 flex items-center justify-center z-[6] pointer-events-none">
          <div className="text-center -mt-4 flex flex-col items-center">
            <h1 className="text-white text-3xl sm:text-4xl font-bold tracking-tight drop-shadow-lg">
              Miguel Lacanienta
            </h1>
            <p className="text-white/80 text-sm sm:text-base font-light mt-1.5 tracking-wide drop-shadow-md">
              BS Computer Science &middot; AI Specialization &middot; Map&uacute;a University &apos;25
            </p>
            <div className="mt-2 flex flex-wrap md:flex-nowrap items-center justify-center gap-1.5 px-2">
              {['Objective', 'Skills', 'Certifications', 'Applied Skills', 'Projects'].map((section) => {
                const isFocused = highlightedSections.has(section);
                const anyFocused = highlightedSections.size > 0;
                const isDimmed = anyFocused && !isFocused;
                return (
                  <span
                    key={section}
                    className={`px-2 py-0.5 rounded-md text-[11px] sm:text-xs font-medium tracking-wide transition-all duration-300 border ${
                      isFocused
                        ? 'text-white bg-white/25 border-white/60 shadow-[0_0_14px_rgba(255,255,255,0.5)] scale-110'
                        : isDimmed
                        ? 'text-white/70 bg-white/10 border-white/15 opacity-30 blur-[1px]'
                        : 'text-white/70 bg-white/10 border-white/15'
                    }`}
                  >
                    {section}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom-left: Resume button */}
      <a href="https://drive.google.com/file/d/1RyQRN930zeyjLZe2o_J52zWEB1kWyWQF" target="_blank" rel="noopener noreferrer" className="absolute bottom-3 left-3 z-[6] px-2 py-0.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-md text-white/70 text-[11px] sm:text-xs font-medium tracking-wide hover:text-white hover:bg-white/20 transition-all cursor-pointer opacity-50 hover:opacity-100 no-underline">
        CV
      </a>

      {/* Audio toggle button */}
      <button
        onClick={toggleAudio}
        className="absolute top-3 right-3 z-10 opacity-50 hover:opacity-80 transition-opacity cursor-pointer"
        aria-label={isMuted ? 'Unmute background music' : 'Mute background music'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
          {isMuted && <line x1="3" y1="3" x2="21" y2="21" />}
        </svg>
      </button>

      {/* Segment indicator overlay */}
      {isPlaying && currentSegment >= 0 && activeProject && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
          <div className="flex items-center gap-2">
            {PROJECT_SEGMENTS[activeProject].labels.map((label, i) => (
              <div key={label} className="flex items-center gap-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentSegment
                      ? 'w-8 bg-blue-400'
                      : i < currentSegment
                      ? 'w-4 bg-blue-400/50'
                      : 'w-4 bg-white/30'
                  }`}
                />
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    i === currentSegment ? 'text-blue-300' : 'text-white/40'
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <FloatingControls
        language={language}
        onLanguageChange={setLanguage}
        isMuted={isMuted}
        onToggleMute={toggleAudio}
        onPlayAbout={() => handleSectionClick('About')}
        onPlayGame={() => setGameOpen(true)}
        cvHref={CV_URL}
      />

      {gameOpen && (
        <div className="absolute inset-0 z-[70] bg-white overflow-hidden">
          <div className="w-full h-full flex flex-col justify-center" id="dino-game-host">
            <ChromeDino />
          </div>
          <button
            onClick={() => setGameOpen(false)}
            className="absolute top-2 right-2 z-[71] w-8 h-8 rounded-full bg-gray-900/90 text-white hover:bg-gray-800 flex items-center justify-center cursor-pointer shadow-lg"
            aria-label="Close game"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
