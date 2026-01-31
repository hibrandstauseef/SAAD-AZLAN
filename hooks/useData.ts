import { useState, useEffect } from 'react';
import { PrayerData, WeatherData, PrayerTime, AppSettings, CustomPrayerDay } from '../types';
import { getNextPrayer, fetchRawTimings, createPrayerDataFromTimings } from '../services/prayerService';
import { getWeather } from '../services/weatherService';
import { getCustomPrayerTimes } from '../services/storageService';
import { DEFAULT_LOCATION } from '../constants';

export const useData = (settings: AppSettings) => {
  const [prayers, setPrayers] = useState<PrayerData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [nextPrayerData, setNextPrayerData] = useState<{current: PrayerTime, next: PrayerTime, isNextTomorrow: boolean} | null>(null);
  const [rawApiData, setRawApiData] = useState<any>(null);
  const [customCsvData, setCustomCsvData] = useState<CustomPrayerDay[]>([]);

  // 1. Load CSV Data on Mount
  useEffect(() => {
    const data = getCustomPrayerTimes();
    setCustomCsvData(data);
    
    // Listen for storage events
    const handleStorageChange = () => {
         const newData = getCustomPrayerTimes();
         setCustomCsvData(newData);
    };
    window.addEventListener('storage-csv-update', handleStorageChange);
    return () => window.removeEventListener('storage-csv-update', handleStorageChange);
  }, []);

  // 2. Fetch Raw API Data periodically (Hourly) for Date sync
  const fetchData = async () => {
    const apiData = await fetchRawTimings(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng);
    setRawApiData(apiData);
    const w = await getWeather(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng);
    setWeather(w);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60 * 60 * 1000); 
    return () => clearInterval(interval);
  }, []);

  // 3. Recalculate Prayer Objects
  useEffect(() => {
    if (!rawApiData) return; // Wait for date

    const updatePrayers = () => {
        // Pass CSV data here
        const p = createPrayerDataFromTimings(rawApiData, customCsvData, settings);
        setPrayers(p);
    };

    updatePrayers();
    const interval = setInterval(updatePrayers, 10000);
    return () => clearInterval(interval);
  }, [rawApiData, settings, customCsvData]); // Re-run if CSV changes

  // 4. Update Next Prayer pointer
  useEffect(() => {
    if (prayers) {
        const updateNext = () => {
            const next = getNextPrayer(prayers, settings, customCsvData);
            setNextPrayerData(next);
        };
        updateNext();
        const timer = setInterval(updateNext, 60000);
        return () => clearInterval(timer);
    }
  }, [prayers, settings, customCsvData]); // Re-run if settings or CSV change

  return { prayers, weather, nextPrayerData };
};