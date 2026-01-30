// src/components/NotificationSidebar.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './NotificationSidebar.css';

export default function NotificationSidebar({ isOpen, onClose, notifications }) {
  const { user, isAdmin, signInWithGoogle, signOut } = useAuth();
  const [dismissedIds, setDismissedIds] = useState({});
  const [loading, setLoading] = useState(false);

  // Load dismissed notifications for logged-in user
  useEffect(() => {
    if (user) {
      loadDismissedNotifications();
    } else {
      // Load from localStorage for non-logged-in users
      const stored = localStorage.getItem('dismissed_notifications');
      setDismissedIds(stored ? JSON.parse(stored) : {});
    }
  }, [user]);

  const loadDismissedNotifications = async () => {
    if (!user) return;

    try {
      const dismissedRef = doc(db, `users/${user.uid}/notifications`, 'dismissed');
      const docSnap = await getDoc(dismissedRef);
      
      if (docSnap.exists()) {
        setDismissedIds(docSnap.data().ids || {});
      } else {
        // Check localStorage for migration
        const stored = localStorage.getItem('dismissed_notifications');
        if (stored) {
          const parsed = JSON.parse(stored);
          setDismissedIds(parsed);
          // Migrate to Firebase
          await setDoc(dismissedRef, { ids: parsed });
        }
      }
    } catch (error) {
      console.error('Error loading dismissed notifications:', error);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      alert('Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (notificationId) => {
    const updated = {
      ...dismissedIds,
      [notificationId]: Date.now()
    };
    setDismissedIds(updated);

    if (user) {
      // Save to Firebase
      await setDoc(doc(db, `users/${user.uid}/notifications`, 'dismissed'), {
        ids: updated
      });
    } else {
      // Save to localStorage
      localStorage.setItem('dismissed_notifications', JSON.stringify(updated));
    }
  };

  // Filter out dismissed notifications
  const visibleNotifications = notifications.filter(n => {
    const dismissedTime = dismissedIds[n.id];
    if (!dismissedTime) return true;
    // Show again if re-published after dismissal
    return n.publishedAt > dismissedTime;
  });

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="sidebar-backdrop" onClick={onClose} />
      )}

      {/* Sidebar */}
      <div className={`notification-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Close Button */}
        <button className="sidebar-close" onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Login Section */}
        <div className="sidebar-login-section">
          {!user ? (
            <>
              <div className="login-prompt">
                <span className="material-symbols-outlined">account_circle</span>
                <p>Sign in to sync your data across devices</p>
              </div>
              <button 
                className="google-signin-btn" 
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
            </>
          ) : (
            <div className="user-profile">
              <div className="user-info">
                <img 
                  src={user.photoURL || '/default-avatar.png'} 
                  alt={user.displayName}
                  className="user-avatar"
                />
                <div className="user-details">
                  <p className="user-name">{user.displayName}</p>
                  <p className="user-email">{user.email}</p>
                  {isAdmin && <span className="admin-badge">Admin</span>}
                </div>
              </div>
              <button className="signout-btn" onClick={signOut}>
                <span className="material-symbols-outlined">logout</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Section */}
        <div className="sidebar-notifications">
          <h3 className="sidebar-section-title">
            <span className="material-symbols-outlined">notifications</span>
            Notifications
          </h3>

          {visibleNotifications.length === 0 ? (
            <div className="no-notifications">
              <span className="material-symbols-outlined">notifications_off</span>
              <p>No new notifications</p>
            </div>
          ) : (
            <div className="notifications-list">
              {visibleNotifications.map((notification) => (
                <div key={notification.id} className="sidebar-notification-card">
                  {notification.png && (
                    <img 
                      src={notification.png} 
                      alt={notification.headline}
                      className="notification-image"
                    />
                  )}
                  <h4 className="notification-headline">{notification.headline}</h4>
                  <p className="notification-content">{notification.content}</p>
                  <button
                    className="notification-dismiss-btn"
                    onClick={() => handleDismiss(notification.id)}
                  >
                    <span className="ameen-text">آمين</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
