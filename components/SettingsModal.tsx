import React, { useState, useEffect } from 'react';
import { X, Clock, Hourglass, Sliders, Moon, FileSpreadsheet, Upload, Download, Palette, MapPin, Image as ImageIcon, PlayCircle, Type } from 'lucide-react';
import { AppSettings, TriggerLocation, PrayerData, FontSizes } from '../types';
import { parseCSV, generateSampleCSV } from '../services/csvService';
import { saveCustomPrayerTimes, getCustomPrayerTimes } from '../services/storageService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
  prayers: PrayerData | null;
}

const THEME_COLORS = [
  { name: 'Blue', value: '#00a8ff' },
  { name: 'Cyan', value: '#00d2d3' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Gold', value: '#eab308' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave, prayers }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [csvStatus, setCsvStatus] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
        setLocalSettings(settings);
        const existing = getCustomPrayerTimes();
        if (existing.length > 0) {
            setCsvStatus(`Loaded ${existing.length} days of prayer times.`);
        } else {
            setCsvStatus("No custom prayer times found.");
        }
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleHijriChange = (val: string) => {
    setLocalSettings({
      ...localSettings,
      hijriOffset: parseInt(val) || 0
    });
  };

  const handleLocationChange = (val: TriggerLocation) => {
    setLocalSettings({
        ...localSettings,
        triggerLocation: val
    });
  };

  const handleLogicChange = (key: keyof AppSettings['logicSettings'], val: string) => {
      setLocalSettings({
          ...localSettings,
          logicSettings: {
              ...localSettings.logicSettings,
              [key]: parseInt(val) || 0
          }
      });
  }

  const handleTaraweehChange = (key: keyof AppSettings['taraweehSettings'], val: string) => {
      setLocalSettings({
          ...localSettings,
          taraweehSettings: {
              ...localSettings.taraweehSettings,
              [key]: parseInt(val) || 0
          }
      });
  }
  
  const handleColorChange = (color: string) => {
      setLocalSettings({
          ...localSettings,
          themeColor: color
      });
  };

  const handleFontChange = (key: keyof FontSizes, val: string) => {
      setLocalSettings({
          ...localSettings,
          fontSizes: {
              ...localSettings.fontSizes,
              [key]: parseInt(val) || 0
          }
      });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          const text = e.target?.result as string;
          const data = parseCSV(text);
          if (data.length > 0) {
              saveCustomPrayerTimes(data);
              setCsvStatus(`Successfully loaded ${data.length} days.`);
              // Trigger update in useData
              window.dispatchEvent(new Event('storage-csv-update'));
          } else {
              setCsvStatus("Error: Invalid CSV format or empty file.");
          }
      };
      reader.readAsText(file);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
          const base64 = reader.result as string;
          setLocalSettings({
              ...localSettings,
              displayImageUrl: base64
          });
      };
      reader.readAsDataURL(file);
  };

  const downloadSample = () => {
      const csvContent = generateSampleCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "sample_namaz_times.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const save = () => {
    onSave(localSettings);
    onClose();
  };

  const isCustomColor = !THEME_COLORS.some(c => c.value === localSettings.themeColor);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#101010] border border-gray-800 rounded-3xl w-full max-w-2xl p-6 md:p-8 shadow-2xl relative flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-3xl font-bold text-white mb-6 border-b border-gray-800 pb-4">Settings</h2>

        <div className="space-y-8 overflow-y-auto pr-2 custom-scrollbar flex-grow">
          
          {/* Mosque Details */}
          <div>
            <label className="block text-neon-blue text-sm uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Masjid Details
             </label>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                     <label className="block text-gray-400 text-xs uppercase mb-1">Masjid Name</label>
                     <input 
                        type="text" 
                        value={localSettings.masjidName} 
                        onChange={e => setLocalSettings({...localSettings, masjidName: e.target.value})} 
                        className="bg-black border border-gray-700 rounded w-full p-2 text-white font-bold" 
                     />
                 </div>
                 <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                     <label className="block text-gray-400 text-xs uppercase mb-1">Sub Location</label>
                     <input 
                        type="text" 
                        value={localSettings.subLocation} 
                        onChange={e => setLocalSettings({...localSettings, subLocation: e.target.value})} 
                        className="bg-black border border-gray-700 rounded w-full p-2 text-white font-bold" 
                     />
                 </div>
             </div>
          </div>

          <div className="border-t border-gray-800"></div>

          {/* Font Customization */}
          <div>
            <label className="block text-neon-blue text-sm uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                <Type className="w-4 h-4" /> Font Sizes (px)
             </label>
             <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <div>
                         <label className="block text-gray-400 text-[10px] uppercase mb-1">Namaz Name</label>
                         <input type="number" value={localSettings.fontSizes?.prayerName || 36} onChange={e => handleFontChange('prayerName', e.target.value)} className="bg-black border border-gray-700 rounded w-full p-2 text-white font-bold text-center" />
                     </div>
                     <div>
                         <label className="block text-gray-400 text-[10px] uppercase mb-1">Azan Time</label>
                         <input type="number" value={localSettings.fontSizes?.adhanTime || 36} onChange={e => handleFontChange('adhanTime', e.target.value)} className="bg-black border border-gray-700 rounded w-full p-2 text-white font-bold text-center" />
                     </div>
                     <div>
                         <label className="block text-gray-400 text-[10px] uppercase mb-1">Jamat Time</label>
                         <input type="number" value={localSettings.fontSizes?.iqamaTime || 36} onChange={e => handleFontChange('iqamaTime', e.target.value)} className="bg-black border border-gray-700 rounded w-full p-2 text-white font-bold text-center" />
                     </div>
                     <div>
                         <label className="block text-gray-400 text-[10px] uppercase mb-1">Masjid Name</label>
                         <input type="number" value={localSettings.fontSizes?.masjidName || 30} onChange={e => handleFontChange('masjidName', e.target.value)} className="bg-black border border-gray-700 rounded w-full p-2 text-white font-bold text-center" />
                     </div>
                     <div>
                         <label className="block text-gray-400 text-[10px] uppercase mb-1">Temperature</label>
                         <input type="number" value={localSettings.fontSizes?.temperature || 60} onChange={e => handleFontChange('temperature', e.target.value)} className="bg-black border border-gray-700 rounded w-full p-2 text-white font-bold text-center" />
                     </div>
                     <div>
                         <label className="block text-gray-400 text-[10px] uppercase mb-1">Hijri Date</label>
                         <input type="number" value={localSettings.fontSizes?.hijriDate || 60} onChange={e => handleFontChange('hijriDate', e.target.value)} className="bg-black border border-gray-700 rounded w-full p-2 text-white font-bold text-center" />
                     </div>
                     <div>
                         <label className="block text-gray-400 text-[10px] uppercase mb-1">Gregorian Date</label>
                         <input type="number" value={localSettings.fontSizes?.gregorianDate || 60} onChange={e => handleFontChange('gregorianDate', e.target.value)} className="bg-black border border-gray-700 rounded w-full p-2 text-white font-bold text-center" />
                     </div>
                 </div>
             </div>
          </div>

          <div className="border-t border-gray-800"></div>

          {/* Display Image Settings */}
          <div>
            <label className="block text-neon-blue text-sm uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Display Image
             </label>
             <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 flex flex-col gap-4">
                {/* Toggle and Upload */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                         <div className="flex flex-col">
                             <span className="text-white font-bold text-sm">Enable Display Image</span>
                             <span className="text-[10px] text-gray-500">Show a poster image</span>
                         </div>
                    </div>
                    <button 
                       onClick={() => setLocalSettings({...localSettings, displayImageEnabled: !localSettings.displayImageEnabled})}
                       className={`w-14 h-7 rounded-full p-1 transition-colors ${localSettings.displayImageEnabled ? 'bg-neon-blue' : 'bg-gray-700'}`}
                    >
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${localSettings.displayImageEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
                    </button>
                </div>

                {/* Controls - Only show if enabled */}
                <div className={`space-y-4 transition-opacity ${localSettings.displayImageEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                    
                    {/* Mode Selector */}
                    <div>
                        <label className="block text-gray-400 text-xs uppercase mb-2">Display Mode</label>
                        <div className="flex gap-2">
                             <button
                                onClick={() => setLocalSettings({...localSettings, displayImageMode: 'fullscreen'})}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${
                                    localSettings.displayImageMode === 'fullscreen' 
                                    ? 'bg-neon-blue text-black border-neon-blue' 
                                    : 'bg-black text-gray-400 border-gray-700 hover:border-gray-500'
                                }`}
                             >
                                 FULLSCREEN
                             </button>
                             <button
                                onClick={() => setLocalSettings({...localSettings, displayImageMode: 'hero'})}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${
                                    localSettings.displayImageMode === 'hero' 
                                    ? 'bg-neon-blue text-black border-neon-blue' 
                                    : 'bg-black text-gray-400 border-gray-700 hover:border-gray-500'
                                }`}
                             >
                                 HERO BOX
                             </button>
                        </div>
                    </div>

                    {/* Slideshow Settings */}
                     <div className="bg-black/50 p-3 rounded-lg border border-gray-800">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-gray-300 text-xs uppercase font-bold flex items-center gap-2">
                                <PlayCircle className="w-3 h-3" /> Slideshow Mode
                            </label>
                            <button 
                                onClick={() => setLocalSettings({...localSettings, slideshowEnabled: !localSettings.slideshowEnabled})}
                                className={`w-10 h-5 rounded-full p-0.5 transition-colors ${localSettings.slideshowEnabled ? 'bg-neon-blue' : 'bg-gray-700'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${localSettings.slideshowEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        {localSettings.slideshowEnabled && (
                            <div className="grid grid-cols-2 gap-3 mt-2 animate-in slide-in-from-top-2 duration-200">
                                <div>
                                    <label className="block text-gray-500 text-[10px] uppercase mb-1">Image Duration (Sec)</label>
                                    <input 
                                        type="number" 
                                        value={localSettings.slideshowImageDuration} 
                                        onChange={e => setLocalSettings({...localSettings, slideshowImageDuration: parseInt(e.target.value) || 10})} 
                                        className="bg-gray-900 border border-gray-700 rounded w-full p-1.5 text-white text-sm font-bold text-center" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-500 text-[10px] uppercase mb-1">Dashboard Duration (Sec)</label>
                                    <input 
                                        type="number" 
                                        value={localSettings.slideshowDashboardDuration} 
                                        onChange={e => setLocalSettings({...localSettings, slideshowDashboardDuration: parseInt(e.target.value) || 10})} 
                                        className="bg-gray-900 border border-gray-700 rounded w-full p-1.5 text-white text-sm font-bold text-center" 
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Image Upload */}
                    <div>
                         <label className="block text-gray-400 text-xs uppercase mb-2">Upload Image</label>
                         <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-700 rounded-lg hover:border-neon-blue cursor-pointer transition-colors group">
                            <div className="flex flex-col items-center gap-2">
                                <Upload className="w-6 h-6 text-gray-500 group-hover:text-neon-blue transition-colors" />
                                <span className="text-xs text-gray-400 font-bold group-hover:text-white">CLICK TO UPLOAD</span>
                            </div>
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                         </label>
                         {localSettings.displayImageUrl && (
                             <div className="mt-2 text-[10px] text-green-400 flex items-center gap-1">
                                 ✓ Image Loaded
                             </div>
                         )}
                    </div>
                </div>
             </div>
          </div>

          <div className="border-t border-gray-800"></div>

          {/* CSV Upload Section */}
          <div className="bg-gray-900/30 p-4 rounded-xl border border-dashed border-gray-700">
             <label className="block text-neon-blue text-sm uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" /> Custom Namaz Time (CSV)
             </label>
             
             <div className="flex flex-col gap-4">
                 <div className="flex items-center gap-4">
                     <label className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg cursor-pointer transition-colors text-sm font-bold">
                         <Upload className="w-4 h-4" />
                         UPLOAD CSV
                         <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                     </label>
                     <button 
                        onClick={downloadSample}
                        className="flex items-center gap-2 px-4 py-2 bg-black border border-gray-700 hover:border-neon-blue text-gray-300 hover:text-white rounded-lg transition-all text-sm font-bold"
                     >
                         <Download className="w-4 h-4" />
                         SAMPLE
                     </button>
                 </div>
                 <div className={`text-xs font-mono ${csvStatus.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                     {csvStatus}
                 </div>
                 <div className="text-[10px] text-gray-500">
                     Required Format: Date (YYYY-MM-DD), Fajr_Azan (HH:MM), Fajr_Jamat... <br/>
                     Times must be in 24-hour format. One row per date.
                 </div>
             </div>
          </div>
          
          <div className="border-t border-gray-800"></div>

          {/* Theme Color Picker */}
          <div>
            <label className="block text-neon-blue text-sm uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4" /> Theme Color
             </label>
             <div className="flex flex-wrap gap-3">
                 {THEME_COLORS.map((color) => (
                     <button
                        key={color.name}
                        onClick={() => handleColorChange(color.value)}
                        className={`
                            w-10 h-10 rounded-full border-2 transition-all hover:scale-110 relative
                            ${localSettings.themeColor === color.value ? 'border-white scale-110 ring-2 ring-white/50' : 'border-transparent'}
                        `}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                     >
                         {localSettings.themeColor === color.value && (
                             <div className="absolute inset-0 flex items-center justify-center">
                                 <div className="w-2 h-2 bg-black rounded-full" />
                             </div>
                         )}
                     </button>
                 ))}
                 
                 {/* Custom Color Button */}
                 <div 
                    className={`
                        w-10 h-10 rounded-full border-2 transition-all hover:scale-110 relative overflow-hidden flex items-center justify-center
                        ${isCustomColor ? 'border-white scale-110 ring-2 ring-white/50' : 'border-transparent'}
                    `}
                    style={{ 
                        background: isCustomColor 
                            ? localSettings.themeColor 
                            : 'conic-gradient(from 0deg, #ef4444, #eab308, #22c55e, #3b82f6, #a855f7, #ef4444)'
                    }}
                    title="Custom Color"
                 >
                    <input 
                        type="color"
                        value={localSettings.themeColor}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                    {isCustomColor && (
                        <div className="w-2 h-2 bg-black rounded-full pointer-events-none shadow-sm" />
                    )}
                 </div>
             </div>
          </div>

          <div className="border-t border-gray-800"></div>

          {/* Trigger Location Selector */}
          <div>
            <label className="block text-neon-blue text-sm uppercase tracking-widest font-bold mb-3">
              Notification Style
            </label>
            <div className="grid grid-cols-3 gap-3">
                {(['HERO', 'CARD', 'FULLSCREEN'] as TriggerLocation[]).map((loc) => (
                    <button
                        key={loc}
                        onClick={() => handleLocationChange(loc)}
                        className={`
                            py-3 px-2 rounded-lg text-sm font-bold uppercase transition-all
                            ${localSettings.triggerLocation === loc 
                                ? 'bg-neon-blue text-black shadow-[0_0_10px_rgba(0,168,255,0.3)]' 
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }
                        `}
                    >
                        {loc}
                    </button>
                ))}
            </div>
          </div>

          <div className="border-t border-gray-800"></div>

          {/* Hijri Adjustment */}
          <div>
             <div className="flex justify-between items-center mb-2">
                <label className="text-neon-blue text-sm uppercase tracking-widest font-bold">
                  Hijri Adjustment
                </label>
             </div>
             <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 flex items-center justify-between">
                <span className="text-gray-300 text-sm">Days Offset</span>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => handleHijriChange((localSettings.hijriOffset - 1).toString())}
                        className="w-8 h-8 rounded-full bg-gray-800 text-white hover:bg-neon-blue hover:text-black flex items-center justify-center font-bold"
                    >-</button>
                    <span className="text-xl font-bold text-white w-8 text-center">{localSettings.hijriOffset > 0 ? `+${localSettings.hijriOffset}` : localSettings.hijriOffset}</span>
                    <button 
                        onClick={() => handleHijriChange((localSettings.hijriOffset + 1).toString())}
                        className="w-8 h-8 rounded-full bg-gray-800 text-white hover:bg-neon-blue hover:text-black flex items-center justify-center font-bold"
                    >+</button>
                </div>
             </div>
          </div>

          <div className="border-t border-gray-800"></div>

          {/* Taraweeh Settings */}
          <div>
             <label className="block text-neon-blue text-sm uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                <Moon className="w-4 h-4" /> 
                Taraweeh Configuration
                <span className="text-gray-500 text-xs normal-case ml-2 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">(Active only in Ramadan)</span>
             </label>
             <div className="grid grid-cols-3 gap-4">
                 <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                     <label className="block text-gray-400 text-xs uppercase mb-1">Normal Delay (Min)</label>
                     <div className="text-[10px] text-gray-500 mb-2">After Isha Jamat</div>
                     <input type="number" value={localSettings.taraweehSettings.normalOffsetMinutes} onChange={e => handleTaraweehChange('normalOffsetMinutes', e.target.value)} className="bg-black border border-gray-700 rounded w-full p-2 text-white font-bold" />
                 </div>
                 <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                     <label className="block text-gray-400 text-xs uppercase mb-1">Special Delay (Min)</label>
                     <div className="text-[10px] text-gray-500 mb-2">Nights 21, 23...</div>
                     <input type="number" value={localSettings.taraweehSettings.specialOffsetMinutes} onChange={e => handleTaraweehChange('specialOffsetMinutes', e.target.value)} className="bg-black border border-gray-700 rounded w-full p-2 text-white font-bold" />
                 </div>
                 <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                     <label className="block text-gray-400 text-xs uppercase mb-1">Duration (Min)</label>
                     <div className="text-[10px] text-gray-500 mb-2">Namaz Length</div>
                     <input type="number" value={localSettings.taraweehSettings.durationMinutes} onChange={e => handleTaraweehChange('durationMinutes', e.target.value)} className="bg-black border border-gray-700 rounded w-full p-2 text-white font-bold" />
                 </div>
             </div>
          </div>

          <div className="border-t border-gray-800"></div>

          {/* Logic Settings */}
          <div>
             <label className="block text-neon-blue text-sm uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                <Sliders className="w-4 h-4" /> Logic Timings (Seconds)
             </label>
             <div className="grid grid-cols-2 gap-4">
                 <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                     <label className="block text-gray-400 text-xs uppercase mb-1">Pre-Azan Trigger</label>
                     <input type="number" value={localSettings.logicSettings.preAdhanSeconds} onChange={e => handleLogicChange('preAdhanSeconds', e.target.value)} className="bg-black border border-gray-700 rounded w-full p-2 text-white font-bold" />
                 </div>
                 <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                     <label className="block text-gray-400 text-xs uppercase mb-1">Azan Duration</label>
                     <input type="number" value={localSettings.logicSettings.adhanDurationSeconds} onChange={e => handleLogicChange('adhanDurationSeconds', e.target.value)} className="bg-black border border-gray-700 rounded w-full p-2 text-white font-bold" />
                 </div>
                 <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                     <label className="block text-gray-400 text-xs uppercase mb-1">Pre-Jamat Trigger</label>
                     <input type="number" value={localSettings.logicSettings.preIqamaSeconds} onChange={e => handleLogicChange('preIqamaSeconds', e.target.value)} className="bg-black border border-gray-700 rounded w-full p-2 text-white font-bold" />
                 </div>
                 <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                     <label className="block text-gray-400 text-xs uppercase mb-1">Now Namaz (Mins)</label>
                     <input type="number" value={localSettings.logicSettings.prayerDurationMinutes} onChange={e => handleLogicChange('prayerDurationMinutes', e.target.value)} className="bg-black border border-gray-700 rounded w-full p-2 text-white font-bold" />
                 </div>
             </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-800">
            <button 
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-gray-800 text-white hover:bg-gray-700 transition-colors font-bold tracking-wide"
            >
                CANCEL
            </button>
            <button 
                onClick={save}
                className="px-6 py-3 rounded-xl bg-neon-blue text-black hover:bg-neon-cyan transition-colors font-bold tracking-wide shadow-[0_0_15px_rgba(0,168,255,0.4)]"
            >
                SAVE CHANGES
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;