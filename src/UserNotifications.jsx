import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import './UserNotifications.css';

export default function UserNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [dismissedIds, setDismissedIds] = useState({});

  // ✅ REAL-TIME LISTENER: Load notifications from Firebase (global)
  useEffect(() => {
    const docRef = doc(db, 'global', 'notifications');
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const publishedNotifications = (data.list || []).filter(n => n.status === 'published');
        setNotifications(publishedNotifications);
      }
    }, (error) => {
      console.error('Error loading notifications:', error);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Load user's dismissed notifications from Firebase OR localStorage
  useEffect(() => {
    const loadDismissed = async () => {
      if (user) {
        // Logged-in user: Load from Firebase
        try {
          const docRef = doc(db, `users/${user.uid}/preferences`, 'dismissed_notifications');
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setDismissedIds(docSnap.data().dismissed || {});
          }
        } catch (error) {
          console.error('Error loading dismissed notifications:', error);
        }
      } else {
        // Non-logged-in user: Load from localStorage
        const saved = localStorage.getItem('dismissed_notifications');
        setDismissedIds(saved ? JSON.parse(saved) : {});
      }
    };

    loadDismissed();
  }, [user]);

  // ✅ Handle آمين button click
  const handleDismiss = async (notificationId) => {
    const updatedDismissed = {
      ...dismissedIds,
      [notificationId]: Date.now()
    };

    setDismissedIds(updatedDismissed);

    if (user) {
      // Save to Firebase for logged-in users
      try {
        const docRef = doc(db, `users/${user.uid}/preferences`, 'dismissed_notifications');
        await setDoc(docRef, { dismissed: updatedDismissed });
      } catch (error) {
        console.error('Error saving dismissed notification:', error);
      }
    } else {
      // Save to localStorage for non-logged-in users
      localStorage.setItem('dismissed_notifications', JSON.stringify(updatedDismissed));
    }
  };

  // ✅ Handle Info button click
  const handleInfoClick = (link) => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  // ✅ Filter: Show notifications that haven't been dismissed (or re-published after dismissal)
  const visibleNotifications = notifications.filter(n => {
    const dismissedTime = dismissedIds[n.id];
    if (!dismissedTime) return true;
    // Show again if re-published after user dismissed it
    return n.publishedAt > dismissedTime;
  });

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="user-notifications">
      {visibleNotifications.map((notification) => (
        <div key={notification.id} className="user-notification-card">
          {/* Image */}
          {notification.png && (
            <div className="un-image-container">
              <img 
                src={notification.png} 
                alt={notification.headline}
                className="un-image"
              />
            </div>
          )}

          {/* Headline */}
          <h3 className="un-headline">{notification.headline}</h3>

          {/* Content */}
          <p className="un-content">{notification.content}</p>

          {/* Button Container */}
          <div className="un-buttons">
            {/* Info Button (only if link exists) */}
            {notification.link && (
              <button
                className="un-info-btn"
                onClick={() => handleInfoClick(notification.link)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
                <span>Info</span>
              </button>
            )}

            {/* آمين Button */}
            <button
              className="un-ameen-btn"
              onClick={() => handleDismiss(notification.id)}
            >
              <span className="ameen-text">{notification.buttonText || 'آمين'}</span>
              <span className="ameen-icon">🤲</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}