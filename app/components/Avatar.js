'use client';

import { useState, useRef, useEffect } from 'react';

export default function Avatar({ isSpeaking, videoToPlay, onVideoEnd }) {
  const videoRef = useRef(null);
  const idleVideoRef = useRef(null);
  const introVideoRef = useRef(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [introPlayed, setIntroplayed] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  // Play intro video on mount
  useEffect(() => {
    if (introVideoRef.current && !introPlayed) {
      introVideoRef.current.play();
    }
  }, [introPlayed]);

  // Handle intro video end
  const handleIntroEnd = () => {
    setShowIntro(false);
    setIntroplayed(true);
    // Start idle video
    if (idleVideoRef.current) {
      idleVideoRef.current.play();
    }
  };

  // Start idle video after intro
  useEffect(() => {
    if (introPlayed && idleVideoRef.current && !isPlayingVideo) {
      idleVideoRef.current.play();
    }
  }, [introPlayed, isPlayingVideo]);

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
      {/* Intro Video (Plays Once) */}
      {showIntro && (
        <video
          ref={introVideoRef}
          className="w-full h-full object-contain"
          onEnded={handleIntroEnd}
          playsInline
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
          style={{ pointerEvents: 'none' }}
        >
          <source src="/Intro.mp4" type="video/mp4" />
        </video>
      )}

      {/* Idle Loop Video (After Intro) */}
      {!showIntro && (
        <video
          ref={idleVideoRef}
          className={`w-full h-full object-contain transition-opacity duration-500 ${isPlayingVideo ? 'opacity-0' : 'opacity-100'}`}
          loop
          muted
          playsInline
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
          style={{ pointerEvents: 'none' }}
        >
          <source src="/Idle.mp4" type="video/mp4" />
        </video>
      )}

      {/* Content Video Overlay (Button Videos) */}
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
