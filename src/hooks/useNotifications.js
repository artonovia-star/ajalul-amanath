// src/hooks/useNotifications.js
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const INITIAL_NOTIFICATIONS = [
  { id: 1, png: '', headline: '', content: '', status: 'draft', publishedAt: null },
  { id: 2, png: '', headline: '', content: '', status: 'draft', publishedAt: null },
  { id: 3, png: '', headline: '', content: '', status: 'draft', publishedAt: null },
  { id: 4, png: '', headline: '', content: '', status: 'draft', publishedAt: null },
  { id: 5, png: '', headline: '', content: '', status: 'draft', publishedAt: null }
];

/**
 * Hook for managing global notifications (admin-controlled)
 * - Admin can create/edit/publish/expire notifications
 * - All users see published notifications in real-time
 */
export function useNotifications(isAdmin = false) {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [loading, setLoading] = useState(true);

  // Real-time listener for global notifications
  useEffect(() => {
    const notifRef = doc(db, 'global/notifications', 'notifications');

    const unsubscribe = onSnapshot(
      notifRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setNotifications(data.list || INITIAL_NOTIFICATIONS);
        } else {
          // Initialize if doesn't exist
          if (isAdmin) {
            await setDoc(notifRef, { list: INITIAL_NOTIFICATIONS });
          }
          setNotifications(INITIAL_NOTIFICATIONS);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to notifications:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [isAdmin]);

  /**
   * Admin function: Update notifications
   */
  const updateNotifications = async (updatedList) => {
    if (!isAdmin) return;

    await setDoc(doc(db, 'global/notifications', 'notifications'), {
      list: updatedList,
      lastUpdated: Date.now()
    });
  };

  /**
   * Get only published notifications (for users)
   */
  const publishedNotifications = notifications.filter(n => n.status === 'published');

  return {
    notifications,
    publishedNotifications,
    updateNotifications,
    loading
  };
}

export default useNotifications;
