import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import './NotificationPanel.css';

export default function NotificationPanel({ onClose }) {
  const { user, signInWithGoogle, signOut } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [dismissedNotifications, setDismissedNotifications] = useState({});
  const [loading, setLoading] = useState(false);

  // ✅ REAL-TIME LISTENER: Load published notifications from Firebase (global)
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

  // ✅ Load user's dismissed notifications
  useEffect(() => {
    const loadDismissed = async () => {
      if (user) {
        // Logged-in user: Load from Firebase with real-time sync
        try {
          const docRef = doc(db, `users/${user.uid}/preferences`, 'dismissed_notifications');
          
          const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
              setDismissedNotifications(docSnap.data().dismissed || {});
            }
          });

          return unsubscribe;
        } catch (error) {
          console.error('Error loading dismissed notifications:', error);
        }
      } else {
        // Non-logged-in user: Load from localStorage
        const saved = localStorage.getItem('dismissed_notifications');
        setDismissedNotifications(saved ? JSON.parse(saved) : {});
      }
    };

    loadDismissed();
  }, [user]);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      alert('Failed to sign in. Please try again.');
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setDismissedNotifications({});
    } catch (error) {
      alert('Failed to sign out. Please try again.');
    }
  };

  // ✅ Handle آمين button - Save dismissed notification
  const handleDismiss = async (notificationId) => {
    const updatedDismissed = {
      ...dismissedNotifications,
      [notificationId]: Date.now()
    };

    setDismissedNotifications(updatedDismissed);

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

  // ✅ Separate notifications into: Active (not dismissed) & Dismissed
  const activeNotifications = notifications.filter(n => {
    const dismissedTime = dismissedNotifications[n.id];
    if (!dismissedTime) return true;
    // Don't show if dismissed after publication
    return n.publishedAt > dismissedTime;
  });

  const dismissedNotificationsList = notifications.filter(n => {
    const dismissedTime = dismissedNotifications[n.id];
    return dismissedTime && n.publishedAt <= dismissedTime;
  });

  return (
    <div className="notification-panel-overlay" onClick={onClose}>
      <div className="notification-panel" onClick={(e) => e.stopPropagation()}>
        <div className="np-header">
          <div className="np-header-content">
            <h2 className="np-title">Notifications</h2>
            <p className="np-subtitle">Stay updated with important announcements</p>
          </div>
          <button className="np-close-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* ✅ Login Section */}
        <div className="np-login-section">
          {!user ? (
            <button 
              className="np-google-btn" 
              onClick={handleSignIn}
              disabled={loading}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </button>
          ) : (
            <div className="np-user-info">
              <div className="np-user-avatar">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} />
                ) : (
                  <span className="material-symbols-outlined">person</span>
                )}
              </div>
              <div className="np-user-details">
                <p className="np-user-name">{user.displayName || 'User'}</p>
                <p className="np-user-email">{user.email}</p>
              </div>
              <button className="np-signout-btn" onClick={handleSignOut}>
                <span className="material-symbols-outlined">logout</span>
              </button>
            </div>
          )}
        </div>

        {/* ✅ Active Notifications Section */}
        <div className="np-notifications">
          {activeNotifications.length === 0 && dismissedNotificationsList.length === 0 ? (
            <div className="np-empty">
              <span className="material-symbols-outlined">notifications_off</span>
              <p>No new notifications</p>
            </div>
          ) : (
            <>
              {/* Active Notifications */}
              {activeNotifications.length > 0 && (
                <div className="np-section">
                  <h3 className="np-section-title">Active Notifications</h3>
                  {activeNotifications.map((notification) => (
                    <div key={notification.id} className="np-notification-card">
                      {notification.png && (
                        <div className="np-notification-image">
                          <img src={notification.png} alt={notification.headline} />
                        </div>
                      )}
                      <div className="np-notification-content">
                        <h3 className="np-notification-headline">{notification.headline}</h3>
                        <p className="np-notification-text">{notification.content}</p>
                        
                        {/* Button Container */}
                        <div className="np-buttons">
                          {/* Info Button (only if link exists) */}
                          {notification.link && (
                            <button
                              className="np-info-btn"
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
                            className="np-ameen-btn"
                            onClick={() => handleDismiss(notification.id)}
                          >
                            <span className="ameen-text">آمين</span>
                            <span className="ameen-icon">🤲</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Dismissed Notifications (Saved - Info button only) */}
              {dismissedNotificationsList.length > 0 && user && (
                <div className="np-section">
                  <h3 className="np-section-title">Saved Notifications</h3>
                  {dismissedNotificationsList.map((notification) => (
                    <div key={notification.id} className="np-notification-card np-dismissed">
                      {notification.png && (
                        <div className="np-notification-image">
                          <img src={notification.png} alt={notification.headline} />
                        </div>
                      )}
                      <div className="np-notification-content">
                        <h3 className="np-notification-headline">{notification.headline}</h3>
                        <p className="np-notification-text">{notification.content}</p>
                        
                        <div className="np-saved-section">
                          <p className="np-saved-badge">✓ Saved</p>
                          
                          {/* Info Button for saved notifications */}
                          {notification.link && (
                            <button
                              className="np-info-btn-saved"
                              onClick={() => handleInfoClick(notification.link)}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 16v-4M12 8h.01"/>
                              </svg>
                              <span>Info</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Prompt for non-logged-in users */}
              {!user && activeNotifications.length > 0 && (
                <p className="np-login-prompt">Sign in to save notifications permanently</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}