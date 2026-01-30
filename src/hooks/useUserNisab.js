// src/hooks/useUserNisab.js
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const HIJRI_YEAR_DAYS = 354;

/**
 * Hook for managing user's Nisab date
 * - Stored per user in Firebase
 * - Syncs across devices when logged in
 * - Falls back to localStorage when not logged in
 */
export function useUserNisab(user, todayHijri) {
  const [nisabHijri, setNisabHijri] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load nisab date from Firebase or localStorage
  useEffect(() => {
    const loadNisabDate = async () => {
      if (user) {
        // Load from Firebase
        const nisabRef = doc(db, `users/${user.uid}/zakath`, 'nisabDate');
        
        const unsubscribe = onSnapshot(
          nisabRef,
          async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              setNisabHijri({
                day: data.day,
                month: data.month,
                year: data.year
              });
            } else {
              // Check localStorage for migration
              const stored = localStorage.getItem('nisabHijri');
              if (stored) {
                const parsed = JSON.parse(stored);
                setNisabHijri(parsed);
                // Migrate to Firebase
                await setDoc(nisabRef, {
                  ...parsed,
                  setAt: Date.now()
                });
              } else {
                setNisabHijri(null);
              }
            }
            setLoading(false);
          },
          (error) => {
            console.error('Error listening to nisab date:', error);
            setLoading(false);
          }
        );

        return unsubscribe;
      } else {
        // Load from localStorage when not logged in
        const stored = localStorage.getItem('nisabHijri');
        setNisabHijri(stored ? JSON.parse(stored) : null);
        setLoading(false);
      }
    };

    loadNisabDate();
  }, [user]);

  // Calculate days remaining
  useEffect(() => {
    if (!nisabHijri || !todayHijri) return;

    const daysBetween = (start, end) => {
      let days = 0;
      days += (end.year - start.year) * HIJRI_YEAR_DAYS;
      days += (end.month - start.month) * 29.5;
      days += (end.day - start.day);
      return Math.floor(days);
    };

    const passed = daysBetween(nisabHijri, todayHijri);
    setDaysRemaining(Math.max(0, HIJRI_YEAR_DAYS - passed));
  }, [nisabHijri, todayHijri]);

  /**
   * Set nisab start date
   */
  const setNisabDate = async (day, month, year) => {
    const date = {
      day: Number(day),
      month: Number(month),
      year: Number(year)
    };

    setNisabHijri(date);

    if (user) {
      // Save to Firebase
      await setDoc(doc(db, `users/${user.uid}/zakath`, 'nisabDate'), {
        ...date,
        setAt: Date.now()
      });
    } else {
      // Save to localStorage
      localStorage.setItem('nisabHijri', JSON.stringify(date));
    }
  };

  return {
    nisabHijri,
    daysRemaining,
    setNisabDate,
    loading
  };
}

export default useUserNisab;
