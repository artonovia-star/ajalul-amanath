// src/hooks/useHijriDate.js
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const HIJRI_YEAR_DAYS = 354;
const GREGORIAN_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Hook for managing global Hijri date
 * - Reads from Firebase `global/hijri/current`
 * - Auto-advances daily based on last opened
 * - Admin can manually update
 */
export function useHijriDate(isAdmin = false) {
  const [todayHijri, setTodayHijri] = useState({ day: 4, month: 8, year: 1447 });
  const [loading, setLoading] = useState(true);

  // Real-time listener for global Hijri date
  useEffect(() => {
    const hijriRef = doc(db, 'global', 'hijri', 'current');

    const unsubscribe = onSnapshot(
      hijriRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const hijriDate = {
            day: data.day,
            month: data.month,
            year: data.year
          };

          // Check if we need to auto-advance days
          const lastOpened = localStorage.getItem('lastOpenedDate');
          const today = new Date().setHours(0, 0, 0, 0);

          if (lastOpened) {
            const diffDays = Math.floor((today - Number(lastOpened)) / GREGORIAN_DAY_MS);
            
            if (diffDays > 0) {
              // Advance the date
              const advancedDate = advanceHijriByDays(hijriDate, diffDays);
              
              // Update Firebase (only if we're the first user to open today)
              if (isAdmin) {
                await setDoc(doc(db, 'global/hijri', 'current'), {
                  ...advancedDate,
                  lastUpdated: Date.now()
                });
              }
              
              setTodayHijri(advancedDate);
            } else {
              setTodayHijri(hijriDate);
            }
          } else {
            setTodayHijri(hijriDate);
          }

          localStorage.setItem('lastOpenedDate', today);
        } else {
          // Initialize if doesn't exist (first time setup)
          if (isAdmin) {
            await setDoc(doc(db, 'global/hijri', 'current'), {
              day: 4,
              month: 8,
              year: 1447,
              lastUpdated: Date.now()
            });
          }
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to Hijri date:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [isAdmin]);

  /**
   * Advance Hijri date by specified days
   */
  const advanceHijriByDays = (hijri, days) => {
    let { day, month, year } = hijri;
    for (let i = 0; i < days; i++) {
      day++;
      if (day > 30) {
        day = 1;
        month++;
        if (month > 12) {
          month = 1;
          year++;
        }
      }
    }
    return { day, month, year };
  };

  /**
   * Admin function: Advance one day
   */
  const advanceOneDay = async () => {
    if (!isAdmin) return;

    const advanced = advanceHijriByDays(todayHijri, 1);
    await setDoc(doc(db, 'global/hijri', 'current'), {
      ...advanced,
      lastUpdated: Date.now()
    });
  };

  /**
   * Admin function: Enter next month
   */
  const enterNextMonth = async () => {
    if (!isAdmin) return;
    if (!window.confirm('Confirm moon sighted?')) return;

    const nextMonth = {
      day: 1,
      month: todayHijri.month === 12 ? 1 : todayHijri.month + 1,
      year: todayHijri.month === 12 ? todayHijri.year + 1 : todayHijri.year
    };

    await setDoc(doc(db, 'global/hijri', 'current'), {
      ...nextMonth,
      lastUpdated: Date.now()
    });
  };

  /**
   * Admin function: Set specific date
   */
  const setHijriDate = async (day, month, year) => {
    if (!isAdmin) return;

    await setDoc(doc(db, 'global/hijri', 'current'), {
      day: Number(day),
      month: Number(month),
      year: Number(year),
      lastUpdated: Date.now()
    });
  };

  return {
    todayHijri,
    loading,
    advanceOneDay,
    enterNextMonth,
    setHijriDate
  };
}

export default useHijriDate;
