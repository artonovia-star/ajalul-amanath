// useFirebaseSync.js
import { useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Hook to sync global data from Firebase (admin-controlled)
 * Used for: Today's Hijri date, Notification Center
 */
export function useGlobalData(collectionName, documentId, localState, setLocalState) {
  useEffect(() => {
    const docRef = doc(db, collectionName, documentId);

    // Real-time listener for global data
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLocalState(data);
        // Also update localStorage for offline access
        localStorage.setItem(documentId, JSON.stringify(data));
      }
    });

    return () => unsubscribe();
  }, [collectionName, documentId, setLocalState]);
}

/**
 * Hook to sync user-specific data from Firebase
 * Used for: Nisab date, Reminders, Dismissed notifications
 */
export function useUserData(userId, collectionName, documentId, localState, setLocalState) {
  useEffect(() => {
    if (!userId) return;

    const docRef = doc(db, `users/${userId}/${collectionName}`, documentId);

    // Fetch user data once on mount
    const fetchData = async () => {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLocalState(data);
        localStorage.setItem(`${userId}_${documentId}`, JSON.stringify(data));
      }
    };

    fetchData();

    // Real-time listener for user data
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLocalState(data);
        localStorage.setItem(`${userId}_${documentId}`, JSON.stringify(data));
      }
    });

    return () => unsubscribe();
  }, [userId, collectionName, documentId, setLocalState]);
}

/**
 * Function to save global data (admin only)
 */
export async function saveGlobalData(collectionName, documentId, data) {
  try {
    const docRef = doc(db, collectionName, documentId);
    await setDoc(docRef, data, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving global data:', error);
    return false;
  }
}

/**
 * Function to save user-specific data
 */
export async function saveUserData(userId, collectionName, documentId, data) {
  try {
    const docRef = doc(db, `users/${userId}/${collectionName}`, documentId);
    await setDoc(docRef, data, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving user data:', error);
    return false;
  }
}
