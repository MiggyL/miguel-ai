'use client';

import { useState, useRef, useEffect } from 'react';

export default function Avatar({ isSpeaking, videoToPlay, onVideoEnd }) {
  const videoRef = useRef(null);
  const idleVideoRef = useRef(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  // Auto-play idle video on mount
  useEffect(() => {
    if (idleVideoRef.current) {
      idleVideoRef.current.play();
    }
  }, []);

  useEffect(() => {
    if (videoToPlay && videoRef.current) {
      setIsPlayingVideo(true);
      // Pause idle video when playing content
      if (idleVideoRef.current) {
        idleVideoRef.current.pause();
      }
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  }, [videoToPlay]);

  const handleVideoEnd = () => {
    setIsPlayingVideo(false);
    // Resume idle video
    if (idleVideoRef.current) {
      idleVideoRef.current.play();
    }
    if (onVideoEnd) {
      onVideoEnd();
    }
  };

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center overflow-hidden">
      {/* Idle Loop Video (Always Playing in Background) */}
      <video
        ref={idleVideoRef}
        className={`w-full h-full object-cover transition-opacity duration-500 ${isPlayingVideo ? 'opacity-0' : 'opacity-100'}`}
        loop
        muted
        playsInline
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        style={{ pointerEvents: 'none' }}
      >
        <source src="/Idle.mp4" type="video/mp4" />
      </video>

      {/* Content Video Overlay */}
      {videoToPlay && (
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isPlayingVideo ? 'opacity-100' : 'opacity-0'}`}
          onEnded={handleVideoEnd}
          playsInline
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
          style={{ pointerEvents: 'none' }}
        >
          <source src={videoToPlay} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
