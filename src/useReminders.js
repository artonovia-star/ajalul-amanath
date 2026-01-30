// useReminders.js
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const STORAGE_KEY = 'zakath_reminders';
const MAX_REMINDERS = 10;

/**
 * Custom hook for managing Zakāh reminders with Firebase sync
 * Uses Firebase for authenticated users, localStorage as fallback
 */
export function useReminders(user) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load reminders on mount
  useEffect(() => {
    const loadReminders = async () => {
      if (user) {
        // Load from Firebase for authenticated users
        try {
          const docRef = doc(db, `users/${user.uid}/zakath`, 'reminders');
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setReminders(data.list || []);
          } else {
            // Check localStorage for migration
            const stored = localStorage.getItem(`${user.uid}_${STORAGE_KEY}`);
            if (stored) {
              const parsedReminders = JSON.parse(stored);
              setReminders(parsedReminders);
              // Save to Firebase
              await setDoc(docRef, { list: parsedReminders });
            } else {
              setReminders([]);
            }
          }
        } catch (error) {
          console.error('Failed to load reminders from Firebase:', error);
          // Fallback to localStorage
          const stored = localStorage.getItem(`${user.uid}_${STORAGE_KEY}`);
          setReminders(stored ? JSON.parse(stored) : []);
        }
      } else {
        // Load from localStorage for non-authenticated users
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          setReminders(stored ? JSON.parse(stored) : []);
        } catch (error) {
          console.error('Failed to load reminders:', error);
          setReminders([]);
        }
      }
      setLoading(false);
    };

    loadReminders();
  }, [user]);

  // Persist reminders whenever they change
  useEffect(() => {
    if (loading) return; // Don't save during initial load

    const saveReminders = async () => {
      try {
        if (user) {
          // Save to Firebase
          const docRef = doc(db, `users/${user.uid}/zakath`, 'reminders');
          await setDoc(docRef, { list: reminders });
          // Also save to localStorage as backup
          localStorage.setItem(`${user.uid}_${STORAGE_KEY}`, JSON.stringify(reminders));
        } else {
          // Save to localStorage only
          localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
        }
      } catch (error) {
        console.error('Failed to save reminders:', error);
      }
    };

    saveReminders();
  }, [reminders, user, loading]);

  /**
   * Add a new reminder
   * @param {Object} reminderData - { type, zakathAmount, details }
   * @returns {boolean} - Success status
   */
  const addReminder = (reminderData) => {
    if (reminders.length >= MAX_REMINDERS) {
      alert(`⚠️ Maximum ${MAX_REMINDERS} reminders allowed. Please clear some reminders first.`);
      return false;
    }

    // Get current Hijri date
    const todayHijri = JSON.parse(
      localStorage.getItem('todayHijri') || 
      '{"day":1,"month":1,"year":1447}'
    );

    // Store the date when user added the reminder
    const reminderDate = {
      day: Number(todayHijri.day),
      month: Number(todayHijri.month),
      year: Number(todayHijri.year)
    };

    const newReminder = {
      id: `rem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: reminderData.type,
      zakathAmount: reminderData.zakathAmount || reminderData.amount,
      details: reminderData.details || {},
      dueDate: reminderDate,
      createdAt: Date.now(),
      status: 'pending'
    };

    setReminders(prev => [newReminder, ...prev]);
    return true;
  };

  /**
   * Mark a reminder as paid
   * @param {string} id - Reminder ID
   */
  const markAsPaid = (id) => {
    setReminders(prev =>
      prev.map(reminder =>
        reminder.id === id
          ? {
              ...reminder,
              status: 'paid',
              paidAt: Date.now(),
              paidDate: new Date().toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })
            }
          : reminder
      )
    );
  };

  /**
   * Delete a reminder
   * @param {string} id - Reminder ID
   */
  const deleteReminder = (id) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
  };

  /**
   * Clear all reminders
   */
  const clearAll = () => {
    if (window.confirm('Delete all reminders? This cannot be undone.')) {
      setReminders([]);
    }
  };

  // Separate pending and paid reminders
  const pending = reminders.filter(r => r.status === 'pending');
  const paid = reminders.filter(r => r.status === 'paid');

  return {
    reminders,
    pending,
    paid,
    addReminder,
    markAsPaid,
    deleteReminder,
    clearAll,
    count: reminders.length,
    maxReached: reminders.length >= MAX_REMINDERS,
    loading
  };
}

export default useReminders;