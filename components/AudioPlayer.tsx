import React, { useState, useRef, useEffect } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';

interface AudioPlayerProps {
  streamUrl: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ streamUrl }) => {
  const { translate, language } = useLocalization();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.error("Error playing audio:", error);
          // Optionally show a user-friendly error message
        });
      }
      // Note: onPlay and onPause events in the audio tag will set isPlaying
    }
  };
  
  useEffect(() => {
    if (audioRef.current) {
      const currentAudio = audioRef.current;
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      
      currentAudio.addEventListener('play', handlePlay);
      currentAudio.addEventListener('pause', handlePause);
      
      // When streamUrl changes, reset the audio element
      currentAudio.pause();
      currentAudio.load(); // This applies the new src from the audio tag
      setIsPlaying(false); // Reset playing state explicitly

      return () => {
        currentAudio.removeEventListener('play', handlePlay);
        currentAudio.removeEventListener('pause', handlePause);
      };
    }
  }, [streamUrl]);


  return (
    <div className="flex flex-col items-center space-y-3 p-4 bg-csp-secondary-bg dark:bg-csp-primary-dark rounded-lg shadow-sm">
      <audio ref={audioRef} src={streamUrl} preload="none" loop={false} className="w-full hidden"> {/* preload="none" to prevent auto-load unless user clicks play */}
        Your browser does not support the audio element.
      </audio>
      <button
        onClick={togglePlayPause}
        className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm button-glow-effect relative
                    ${isPlaying 
                        ? 'bg-csp-error hover:opacity-90' 
                        : 'bg-csp-accent dark:bg-csp-accent-dark dark:text-csp-primary-dark hover:opacity-90'}`}
        aria-label={isPlaying ? translate('pauseRadio') : translate('playRadio')}
      >
        <span className="relative z-10 flex items-center"> {/* Ensure text is above glow */}
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 inline mr-2 rtl:ml-2 rtl:mr-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 inline mr-2 rtl:ml-2 rtl:mr-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653Z" />
            </svg>
          )}
          {isPlaying ? translate('pauseRadio') : translate('playRadio')}
        </span>
      </button>
    </div>
  );
};

export default AudioPlayer;
