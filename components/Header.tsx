import React, { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { WeatherData, FontSizes } from '../types';

interface HeaderProps {
  weather: WeatherData | null;
  hijriOffset: number;
  onOpenSettings: () => void;
  maghribTime?: Date;
  masjidName: string;
  subLocation: string;
  fontSizes: FontSizes;
}

const Header: React.FC<HeaderProps> = ({ weather, hijriOffset, onOpenSettings, maghribTime, masjidName, subLocation, fontSizes }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return {
      hoursStr: `${displayHours < 10 ? '0' + displayHours : displayHours}`,
      minutesStr: `${displayMinutes}`,
      ampm,
      day: date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
    };
  };

  const { hoursStr, minutesStr, ampm, day } = formatTime(time);

  const getHijriDate = (date: Date, offset: number, maghrib?: Date) => {
    const adjustedDate = new Date(date);
    
    // Apply Maghrib rule: if now > maghrib, next hijri day
    if (maghrib && date.getTime() >= maghrib.getTime()) {
        adjustedDate.setDate(adjustedDate.getDate() + 1);
    }
    
    adjustedDate.setDate(adjustedDate.getDate() + offset);

    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric', calendar: 'islamic-umalqura' };
    let parts;
    try {
        parts = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', options).formatToParts(adjustedDate);
    } catch (e) {
        // Fallback for browsers without umalqura
        parts = new Intl.DateTimeFormat('en-US-u-ca-islamic', options).formatToParts(adjustedDate);
    }
    
    const d = parts.find(p => p.type === 'day')?.value || '01';
    const m = parts.find(p => p.type === 'month')?.value || 'Ramadan';
    const y = parts.find(p => p.type === 'year')?.value || '1445';
    
    return { day: d, month: m.toUpperCase(), year: y };
  };

  const hijri = getHijriDate(time, hijriOffset, maghribTime);

  const monthName = time.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
  const dayNum = time.getDate();
  const year = time.getFullYear();

  return (
    <div className="flex flex-col md:flex-row items-center justify-between bg-neon-panel rounded-[3rem] border-2 border-neon-blue px-8 py-4 mb-6 relative overflow-hidden">
       {/* Left: Clock */}
       <div className="flex flex-col justify-center items-start min-w-[220px]">
          <div className="flex items-baseline">
            <span className="text-[5rem] font-display font-bold leading-none text-neon-blue tracking-tighter">
              {hoursStr}
              <span className={`${time.getSeconds() % 2 === 0 ? 'opacity-100' : 'opacity-0'} transition-opacity duration-75`}>:</span>
              {minutesStr}
            </span>
            <span className="text-4xl font-light text-neon-blue ml-2">{ampm}</span>
          </div>
          <div className="text-4xl font-bold tracking-[0.2em] text-neon-blue w-full">
            {day}
          </div>
       </div>

       {/* Divider */}
       <div className="hidden md:block h-24 w-px bg-gray-700 mx-4"></div>

       {/* Location */}
       <div className="flex flex-col items-center justify-center mx-4 text-center">
          <h1 
            className="font-bold text-neon-blue tracking-tight whitespace-nowrap"
            style={{ fontSize: `${fontSizes?.masjidName || 30}px`, lineHeight: 1.2 }}
          >
            {masjidName}
          </h1>
          <p className="text-gray-400 text-lg tracking-widest uppercase mt-1">{subLocation}</p>
       </div>

       {/* Divider */}
       <div className="hidden md:block h-24 w-px bg-gray-700 mx-4"></div>

       {/* Gregorian Date */}
       <div className="flex flex-col items-center justify-center mx-4">
          <span className="text-neon-blue text-sm tracking-widest mb-0">{monthName}</span>
          <span 
            className="font-bold text-white leading-none"
            style={{ fontSize: `${fontSizes?.gregorianDate || 60}px` }}
          >
            {dayNum}
          </span>
          <span className="text-gray-400 text-sm mt-1">{year}</span>
       </div>

       {/* Divider */}
       <div className="hidden md:block h-24 w-px bg-gray-700 mx-4"></div>

       {/* Temperature */}
       <div className="flex flex-col items-center justify-center mx-4">
          <span className="text-gray-300 text-sm tracking-widest mb-0">TEMPERATURE</span>
          <div className="flex items-start">
            <span 
                className="font-bold text-neon-blue leading-none"
                style={{ fontSize: `${fontSizes?.temperature || 60}px` }}
            >
                {weather?.temp || 22}
            </span>
            <span className="text-2xl text-gray-400 mt-1 ml-1">°C</span>
          </div>
          <span className="text-gray-400 text-sm mt-1 uppercase">{weather?.location || "PATNA, IN"}</span>
       </div>

       {/* Divider */}
       <div className="hidden md:block h-24 w-px bg-gray-700 mx-4"></div>

       {/* Hijri Date */}
       <div className="flex flex-col items-center justify-center mx-4">
          <span className="text-neon-blue text-sm tracking-widest mb-0">{hijri.month}</span>
          <span 
            className="font-bold text-white leading-none"
            style={{ fontSize: `${fontSizes?.hijriDate || 60}px` }}
          >
            {hijri.day}
          </span>
          <span className="text-gray-400 text-sm mt-1">{hijri.year.split(' ')[0]}</span>
       </div>

       {/* Icons */}
       <div className="absolute top-4 right-6 flex flex-col gap-2 items-center">
          <Settings 
            className="w-6 h-6 text-white cursor-pointer hover:text-neon-blue transition-colors" 
            onClick={onOpenSettings}
          />
       </div>
    </div>
  );
};

export default Header;