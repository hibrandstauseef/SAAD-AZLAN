import React, { useState, useEffect } from 'react';
import { PrayerData, AppSettings, HeroState } from '../types';
import { useHeroLogic } from '../hooks/useHeroLogic';

interface ActivePrayerDisplayProps {
  prayers: PrayerData | null;
  settings: AppSettings;
}

const ActivePrayerDisplay: React.FC<ActivePrayerDisplayProps> = ({ prayers, settings }) => {
  
  const { state, activePrayer, countdownSeconds, displayMessage, displayName } = useHeroLogic(prayers, settings);
  const [showHeroImage, setShowHeroImage] = useState(true);

  // --- SLIDESHOW LOGIC FOR HERO MODE ---
  useEffect(() => {
      // Only run if feature enabled and mode is hero
      if (!settings.displayImageEnabled || settings.displayImageMode !== 'hero') return;

      // If slideshow disabled, always show image
      if (!settings.slideshowEnabled) {
          setShowHeroImage(true);
          return;
      }

      // Interval Logic
      const duration = showHeroImage 
          ? (settings.slideshowImageDuration || 10) * 1000 
          : (settings.slideshowDashboardDuration || 10) * 1000;

      const timer = setTimeout(() => {
          setShowHeroImage(prev => !prev);
      }, duration);

      return () => clearTimeout(timer);
  }, [settings.displayImageEnabled, settings.displayImageMode, settings.slideshowEnabled, settings.slideshowImageDuration, settings.slideshowDashboardDuration, showHeroImage]);


  // --- FEATURE: DISPLAY IMAGE (HERO MODE) ---
  const shouldRenderHeroImage = 
      settings.displayImageEnabled && 
      settings.displayImageMode === 'hero' && 
      settings.displayImageUrl &&
      (!settings.slideshowEnabled || showHeroImage);

  if (shouldRenderHeroImage) {
      return (
          <div className="bg-black h-full rounded-[3rem] border border-gray-800 flex flex-col items-center justify-center relative overflow-hidden">
             <img 
                src={settings.displayImageUrl} 
                alt="Hero Display"
                className="w-full h-full block m-0 p-0"
                style={{ objectFit: 'fill' }}
             />
          </div>
      );
  }

  const shouldShowTrigger = settings.triggerLocation === 'HERO' || true; // Always show logic for now in Hero

  // Helper to format seconds HH:MM:SS
  const formatCountdown = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    return {
      h: h < 10 ? `0${h}` : `${h}`,
      m: m < 10 ? `0${m}` : `${m}`,
      s: s < 10 ? `0${s}` : `${s}`
    };
  };

  if (!prayers || !activePrayer) return (
      <div className="h-full w-full flex items-center justify-center bg-gray-900 rounded-[3rem] border border-gray-800">
          <span className="text-2xl text-gray-500 tracking-widest uppercase">Initializing...</span>
      </div>
  );

  // --- STATE 1: PRE_ADHAN (60s Before Adhan) ---
  if (state === HeroState.PRE_ADHAN && shouldShowTrigger) {
    return (
      <div className="bg-black h-full rounded-[3rem] border-[6px] border-neon-blue p-8 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center justify-center h-full gap-4 w-full">
          <h1 className="text-[7vw] lg:text-[8vw] font-bold text-white uppercase tracking-wider leading-none opacity-90 text-center break-words max-w-full px-4">
            {displayName}
          </h1>
          <div className="text-4xl text-neon-blue font-bold tracking-[0.5em] uppercase text-center">
             AZAN IN
          </div>
          <div className="text-[25vw] font-bold text-neon-blue leading-none font-sans tabular-nums tracking-tighter mt-4">
            {countdownSeconds < 10 ? `0${countdownSeconds}` : countdownSeconds}
          </div>
        </div>
      </div>
    );
  }

  // --- STATE 2: ADHAN_MOMENT (At Adhan Time) ---
  if (state === HeroState.ADHAN_MOMENT && shouldShowTrigger) {
    return (
      <div className="bg-neon-panel h-full rounded-[3rem] border-[4px] border-neon-blue p-8 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="relative z-10 text-center flex flex-col items-center h-full justify-center gap-6 w-full">
           <h1 className="text-[10vw] lg:text-[12vw] font-bold text-white leading-none uppercase tracking-tight text-center break-words max-w-full px-4">
             {displayName}
           </h1>
           <div className="text-[10vw] text-gray-400 tracking-[0.2em] font-bold uppercase leading-none">
              AZAN
           </div>
        </div>
      </div>
    );
  }

  // --- STATE 4: PRE_IQAMA (30s Before Iqama) ---
  if (state === HeroState.PRE_IQAMA && shouldShowTrigger) {
    return (
      <div className="bg-black h-full rounded-[3rem] border-[8px] border-neon-blue p-8 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center justify-center h-full gap-2 w-full">
          
          {/* Header Group */}
          <div className="flex flex-col items-center justify-center gap-0 mb-4 w-full">
              <div className="text-4xl md:text-5xl text-neon-blue font-bold tracking-[0.2em] uppercase text-center">
                JAMAT
              </div>
              <h1 className="text-[7vw] lg:text-[8vw] font-bold text-white uppercase tracking-wider leading-none my-1 text-center break-words max-w-full px-4">
                {displayName}
              </h1>
              <div className="text-4xl md:text-5xl text-neon-blue font-bold tracking-[0.2em] uppercase text-center">
                IN
              </div>
          </div>
          
          <div className="text-[25vw] font-bold text-neon-blue leading-none font-sans tabular-nums tracking-tighter">
            {countdownSeconds < 10 ? `0${countdownSeconds}` : countdownSeconds}
          </div>
          
          <div className="text-3xl text-white tracking-[1em] uppercase mt-6 opacity-80 text-center">
             STRAIGHTEN LINES
          </div>
        </div>
      </div>
    );
  }

  // --- STATE 5: PRAYER_ACTIVE (At Iqama Time) ---
  if (state === HeroState.PRAYER_ACTIVE && shouldShowTrigger) {
    return (
      <div className="bg-black h-full rounded-[3rem] border border-gray-800 p-8 flex flex-col items-center justify-center relative overflow-hidden">
         <div className="relative z-10 text-center flex flex-col items-center h-full justify-center gap-10 w-full">
            <h1 className="text-[10vw] lg:text-[12vw] font-bold text-white leading-none uppercase tracking-tight text-center break-words max-w-full px-4">
              {displayName}
            </h1>
         </div>
      </div>
    )
  }

  // --- STATE 6: DEFAULT (Next Prayer OR Iqama Wait) ---
  const timeLeft = formatCountdown(countdownSeconds);
  const showHours = parseInt(timeLeft.h) > 0;
  
  return (
    <div className="bg-black h-full rounded-[3rem] border border-gray-800 p-8 lg:p-12 flex flex-col items-center justify-between relative overflow-hidden">
      
      {/* Top: Header */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full mt-4">
        <div className="inline-block px-6 py-2 mb-6 rounded-full bg-gray-900 border border-gray-800 text-gray-300 text-xl md:text-2xl tracking-[0.3em] font-medium uppercase">
          {displayMessage}
        </div>
        
        <h1 className="text-[9vw] lg:text-[10vw] font-bold text-neon-blue leading-[0.85] tracking-tighter uppercase text-center break-words max-w-full px-4">
          {displayName}
        </h1>
      </div>

      {/* Divider */}
      <div className="w-3/4 h-px bg-gray-800 my-8"></div>

      {/* Bottom: Countdown */}
      <div className="relative z-10 flex-1 flex items-start justify-center w-full pb-8">
        <div className="flex items-center gap-4 lg:gap-8">
           {/* Hours */}
           {showHours && (
             <>
                <div className="flex flex-col items-center">
                    <span className="text-[10vw] lg:text-[9vw] font-bold text-white leading-none font-sans tabular-nums tracking-tighter">
                    {timeLeft.h}
                    </span>
                    <span className="text-xl md:text-2xl text-gray-500 tracking-[0.3em] font-medium mt-2">HRS</span>
                </div>
                <div className="text-[8vw] lg:text-[7vw] text-gray-700 font-thin -mt-10 pb-4">:</div>
             </>
           )}

           {/* Minutes */}
           <div className="flex flex-col items-center">
              <span className="text-[10vw] lg:text-[9vw] font-bold text-white leading-none font-sans tabular-nums tracking-tighter">
                {timeLeft.m}
              </span>
              <span className="text-xl md:text-2xl text-gray-500 tracking-[0.3em] font-medium mt-2">MIN</span>
           </div>

           <div className="text-[8vw] lg:text-[7vw] text-gray-700 font-thin -mt-10 pb-4">:</div>

           {/* Seconds */}
           <div className="flex flex-col items-center">
              <span className="text-[10vw] lg:text-[9vw] font-bold text-neon-blue leading-none font-sans tabular-nums tracking-tighter">
                {timeLeft.s}
              </span>
              <span className="text-xl md:text-2xl text-gray-500 tracking-[0.3em] font-medium mt-2">SEC</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ActivePrayerDisplay;