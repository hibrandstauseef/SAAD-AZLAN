import { useState, useEffect } from 'react';
import { PrayerData, PrayerTime, HeroState, PrayerName, AppSettings } from '../types';

interface HeroLogicResult {
  state: HeroState;
  activePrayer: PrayerTime | null;
  countdownSeconds: number;
  displayMessage: string;
  displayName: string;
}

export const useHeroLogic = (
  prayers: PrayerData | null, 
  settings: AppSettings
): HeroLogicResult => {
  const [result, setResult] = useState<HeroLogicResult>({
    state: HeroState.NEXT_PRAYER,
    activePrayer: null,
    countdownSeconds: 0,
    displayMessage: '',
    displayName: ''
  });

  const hijriOffset = settings.hijriOffset;
  const logic = settings.logicSettings;

  useEffect(() => {
    if (!prayers) return;

    const calculateState = () => {
      const now = new Date();
      const nowMs = now.getTime();

      const allPrayers = [
        prayers.fajr,
        prayers.dhuhr,
        prayers.asr,
        prayers.maghrib,
        prayers.isha,
        prayers.taraweeh
      ].filter((p): p is PrayerTime => !!p);

      // We need to check states in Priority Order for ALL prayers.
      // Priority:
      // 1. PRE_IQAMA (30s before Iqama)
      // 2. ADHAN_MOMENT (At Adhan + 60s)
      // 3. PRE_ADHAN (60s before Adhan)
      // 4. IQAMA_WAIT (Between Adhan end and Pre-Iqama)
      // 5. PRAYER_ACTIVE (At Iqama + 10m)
      // 6. NEXT_PRAYER (Default)

      // Let's define the windows for a single prayer P:
      // AdhanTime = A
      // IqamaTime = I
      
      // PRE_ADHAN: [A - 60s, A)
      // ADHAN_MOMENT: [A, A + 60s)
      // IQAMA_WAIT: [A + 60s, I - 30s)  -- Note: If A+60s > I-30s, this state is skipped/invalid.
      // PRE_IQAMA: [I - 30s, I)
      // PRAYER_ACTIVE: [I, I + 10m)

      let matchedState: HeroLogicResult | null = null;

      // Iterate all prayers to see if any match the specific active windows
      for (const p of allPrayers) {
          const A = p.dateObj.getTime();
          const I = p.iqamaDateObj.getTime();
          
          const preAdhanStart = A - (logic.preAdhanSeconds * 1000);
          const adhanEnd = A + (logic.adhanDurationSeconds * 1000);
          const preIqamaStart = I - (logic.preIqamaSeconds * 1000);
          
          // Custom duration for Taraweeh (settings), else use normal prayer duration
          const durationMins = p.name.includes(PrayerName.Taraweeh) 
            ? (settings.taraweehSettings.durationMinutes || 60)
            : logic.prayerDurationMinutes;
          
          const prayerEnd = I + (durationMins * 60 * 1000);

          // PRIORITY 1: PRE_IQAMA (30s before Iqama)
          if (nowMs >= preIqamaStart && nowMs < I) {
              matchedState = {
                  state: HeroState.PRE_IQAMA,
                  activePrayer: p,
                  countdownSeconds: Math.floor((I - nowMs) / 1000),
                  displayMessage: '', // UI shows Name + Seconds
                  displayName: p.name
              };
              break; 
          }

          // PRIORITY 2: PRE_ADHAN (60s before Adhan)
          if (nowMs >= preAdhanStart && nowMs < A) {
             matchedState = {
                 state: HeroState.PRE_ADHAN,
                 activePrayer: p,
                 countdownSeconds: Math.floor((A - nowMs) / 1000),
                 displayMessage: '',
                 displayName: p.name
             };
             break;
          }

          // PRIORITY 3: ADHAN_MOMENT (After Adhan for X sec)
          if (nowMs >= A && nowMs < adhanEnd) {
              matchedState = {
                  state: HeroState.ADHAN_MOMENT,
                  activePrayer: p,
                  countdownSeconds: 0, // No timer
                  displayMessage: `${p.name} Azan`,
                  displayName: p.name
              };
              break;
          }

          // PRIORITY 4: IQAMA_WAIT (Countdown to Iqama)
          // Valid only if we are past Adhan Moment and before Pre-Iqama
          if (nowMs >= adhanEnd && nowMs < preIqamaStart) {
              matchedState = {
                  state: HeroState.IQAMA_WAIT,
                  activePrayer: p,
                  countdownSeconds: Math.floor((I - nowMs) / 1000), // Time to Iqama
                  displayMessage: `${p.name} Jamat in`, // Helper text handled in UI
                  displayName: p.name
              };
              break;
          }

          // PRIORITY 5: PRAYER_ACTIVE (Now Prayer)
          if (nowMs >= I && nowMs < prayerEnd) {
              matchedState = {
                  state: HeroState.PRAYER_ACTIVE,
                  activePrayer: p,
                  countdownSeconds: 0,
                  displayMessage: `NOW ${p.name}`,
                  displayName: p.name
              };
              break;
          }
      }

      if (matchedState) {
          setResult(matchedState);
          return;
      }

      // FALLBACK: DEFAULT (NEXT PRAYER)
      const sortedPrayers = [...allPrayers].sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
      let nextIndex = sortedPrayers.findIndex(p => p.dateObj.getTime() > nowMs);
      let nextPrayer = nextIndex !== -1 ? sortedPrayers[nextIndex] : sortedPrayers[0];
      let isNextTomorrow = nextIndex === -1;
      
      let targetTime = new Date(nextPrayer.dateObj);
      if (isNextTomorrow) targetTime.setDate(targetTime.getDate() + 1);
      
      const msToNext = targetTime.getTime() - nowMs;
      const secToNext = Math.floor(msToNext / 1000);

      setResult({
        state: HeroState.NEXT_PRAYER,
        activePrayer: nextPrayer,
        countdownSeconds: secToNext,
        displayMessage: 'UPCOMING AZAN',
        displayName: nextPrayer.name
      });
    };

    calculateState();
    const interval = setInterval(calculateState, 1000);
    return () => clearInterval(interval);

  }, [prayers, settings]);

  return result;
};