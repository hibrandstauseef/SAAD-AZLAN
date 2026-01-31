import React, { useState, useEffect } from 'react';
import { PrayerData, AppSettings, PrayerName } from '../types';
import { AlertTriangle } from 'lucide-react';

interface PrayerListProps {
  prayers: PrayerData | null;
  activePrayerName: string | undefined;
  settings: AppSettings;
}

const PrayerList: React.FC<PrayerListProps> = ({ prayers, activePrayerName, settings }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!prayers) return (
      <div className="bg-black rounded-[3rem] border border-gray-800 p-8 h-full flex items-center justify-center">
          <span className="text-gray-500 animate-pulse text-2xl tracking-widest uppercase">Loading Namaz Data...</span>
      </div>
  );

  if (prayers.error) {
      return (
          <div className="bg-black rounded-[3rem] border border-red-900/50 p-8 h-full flex flex-col items-center justify-center text-center">
              <AlertTriangle className="w-24 h-24 text-red-500 mb-6" />
              <h2 className="text-4xl font-bold text-white mb-4">DATA MISSING</h2>
              <p className="text-gray-400 text-xl max-w-md">{prayers.error}</p>
              <p className="text-sm text-gray-600 mt-8 uppercase tracking-widest">Please upload a valid CSV in settings.</p>
          </div>
      );
  }

  const list = [
    prayers.fajr,
    prayers.dhuhr,
    prayers.asr,
    prayers.maghrib,
    prayers.isha,
    prayers.taraweeh
  ].filter(Boolean); // Filters out undefined taraweeh if not Ramadan

  // Logic to determine if a specific prayer is currently "Active" (Adhan -> Namaz End)
  const isPrayerActive = (prayer: any) => {
    if (!prayer) return false;
    const start = prayer.dateObj.getTime();
    // Namaz End = Iqama Time + Duration
    const duration = prayer.name.includes(PrayerName.Taraweeh) 
        ? (settings.taraweehSettings.durationMinutes || 60)
        : settings.logicSettings.prayerDurationMinutes;
    const end = prayer.iqamaDateObj.getTime() + (duration * 60000);
    const currentTime = now.getTime();
    return currentTime >= start && currentTime < end;
  };

  const currentlyActivePrayer = list.find(p => isPrayerActive(p));

  const { fontSizes } = settings;

  return (
    <div className="bg-black rounded-[3rem] border border-gray-800 p-10 h-full flex flex-col justify-between">
       {/* Header */}
       <div className="grid grid-cols-12 gap-4 text-gray-500 text-xl font-bold tracking-[0.2em] uppercase mb-4 px-8 border-b border-gray-800 pb-6">
          <div className="col-span-4">NAMAZ</div>
          <div className="col-span-4 text-center">AZAN</div>
          <div className="col-span-4 text-right">JAMAT</div>
       </div>

       {/* List */}
       <div className="flex flex-col flex-grow justify-around py-4">
         {list.map((p, index) => {
            const isThisPrayerActive = currentlyActivePrayer?.name === p!.name;
            const isThisPrayerNext = !currentlyActivePrayer && activePrayerName === p!.name;
            
            // Highlight row if it is either Active (NOW) or Next (when no active prayer)
            const isHighlighted = isThisPrayerActive || isThisPrayerNext;
            
            let badgeText = '';
            if (isThisPrayerActive) {
                badgeText = 'NOW';
            } else if (isThisPrayerNext) {
                badgeText = 'NEXT';
            }

            return (
              <div key={p!.name} className="relative group w-full">
                
                {/* Badge */}
                {isHighlighted && (
                    <div className={`absolute -top-4 left-12 bg-black px-4 z-20 border-2 text-sm rounded-full uppercase tracking-wider font-bold ${
                        isThisPrayerActive ? 'border-neon-blue text-neon-blue' : 'border-neon-blue text-neon-blue'
                    }`}>
                        {badgeText}
                    </div>
                )}

                <div 
                  className={`
                    grid grid-cols-12 gap-4 px-8 py-7 rounded-[2.5rem] items-center transition-all duration-300 w-full
                    ${isHighlighted 
                        ? 'bg-[#0a1a25] border-[3px] border-neon-blue scale-[1.05] z-10' 
                        : 'border border-transparent hover:bg-white/5'
                    }
                  `}
                >
                  <div 
                    className={`col-span-4 font-bold tracking-tight ${isHighlighted ? 'text-neon-blue' : 'text-white'}`}
                    style={{ fontSize: `${fontSizes?.prayerName || 36}px` }}
                  >
                    {p!.name}
                  </div>
                  <div 
                    className={`col-span-4 text-center font-display font-medium tracking-wide ${isHighlighted ? 'text-neon-blue' : 'text-white'}`}
                    style={{ fontSize: `${fontSizes?.adhanTime || 36}px` }}
                  >
                    {p!.adhan === '-' ? <span className="opacity-30">-</span> : (
                        <>
                            {p!.adhan.slice(0, -2)}<span className="text-[0.6em] ml-1.5 font-sans font-normal opacity-60 align-top">{p!.adhan.slice(-2)}</span>
                        </>
                    )}
                  </div>
                  <div 
                    className={`col-span-4 text-right font-display font-medium tracking-wide ${isHighlighted ? 'text-neon-blue' : 'text-white'}`}
                    style={{ fontSize: `${fontSizes?.iqamaTime || 36}px` }}
                  >
                    {p!.iqama.slice(0, -2)}<span className="text-[0.6em] ml-1.5 font-sans font-normal opacity-60 align-top">{p!.iqama.slice(-2)}</span>
                  </div>
                </div>
              </div>
            );
         })}
       </div>
    </div>
  );
};

export default PrayerList;