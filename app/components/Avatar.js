'use client';

import { useState, useRef, useEffect } from 'react';

export default function Avatar({ isSpeaking, videoToPlay, onVideoEnd }) {
  const videoRef = useRef(null);
  const idleVideoRef = useRef(null);
  const introVideoRef = useRef(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [introPlayed, setIntroPlayed] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  // Force play intro video on mount
  useEffect(() => {
    const playIntro = async () => {
      if (introVideoRef.current && !introPlayed) {
        try {
          await introVideoRef.current.play();
        } catch (error) {
          console.log('Autoplay prevented:', error);
          // If autoplay fails, skip to idle
          handleIntroEnd();
        }
      }
    };
    
    playIntro();
  }, []);

  const handleIntroEnd = () => {
    setShowIntro(false);
    setIntroPlayed(true);
    if (idleVideoRef.current) {
      idleVideoRef.current.play().catch(err => console.log('Idle play error:', err));
    }
  };

  useEffect(() => {
    if (videoToPlay && videoRef.current && introPlayed) {
      setIsPlayingVideo(true);
      if (idleVideoRef.current) {
        idleVideoRef.current.pause();
      }
      videoRef.current.src = videoToPlay;
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  }, [videoToPlay, introPlayed]);

  const handleVideoEnd = () => {
    setIsPlayingVideo(false);
    if (idleVideoRef.current) {
      idleVideoRef.current.play();
    }
    if (onVideoEnd) {
      onVideoEnd();
    }
  };

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center overflow-hidden">
      {/* Intro Video */}
      <video
        ref={introVideoRef}
        className={`w-full h-full object-contain transition-opacity duration-500 ${showIntro ? 'opacity-100' : 'opacity-0'}`}
        onEnded={handleIntroEnd}
        playsInline
        muted
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        style={{ pointerEvents: 'none', display: showIntro ? 'block' : 'none' }}
      >
        <source src="/Intro.mp4" type="video/mp4" />
      </video>

      {/* Idle Loop Video */}
      <video
        ref={idleVideoRef}
        className={`w-full h-full object-contain transition-opacity duration-500 ${!showIntro && !isPlayingVideo ? 'opacity-100' : 'opacity-0'}`}
        loop
        muted
        playsInline
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        style={{ pointerEvents: 'none', display: !showIntro ? 'block' : 'none' }}
      >
        <source src="/Idle.mp4" type="video/mp4" />
      </video>

      {/* Content Video Overlay */}
      {videoToPlay && introPlayed && (
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${isPlayingVideo ? 'opacity-100' : 'opacity-0'}`}
          onEnded={handleVideoEnd}
          playsInline
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
          style={{ pointerEvents: 'none' }}
        />
      )}
    </div>
  );
}
