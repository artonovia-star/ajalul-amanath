// NotificationCenter.jsx
import { useState, useEffect, useRef } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import './NotificationCenter.css';

const STORAGE_KEY = 'zakath_notifications';

export default function NotificationCenter({ onClose }) {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [
      { id: 1, png: '', headline: '', content: '', link: '', buttonText: 'آمين', status: 'draft', publishedAt: null },
      { id: 2, png: '', headline: '', content: '', link: '', buttonText: 'آمين', status: 'draft', publishedAt: null },
      { id: 3, png: '', headline: '', content: '', link: '', buttonText: 'آمين', status: 'draft', publishedAt: null },
      { id: 4, png: '', headline: '', content: '', link: '', buttonText: 'آمين', status: 'draft', publishedAt: null },
      { id: 5, png: '', headline: '', content: '', link: '', buttonText: 'آمين', status: 'draft', publishedAt: null }
    ];
  });

  const [activeCard, setActiveCard] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const isLoadingRef = useRef(false);
  const saveTimeoutRef = useRef(null);
  const lastSavedRef = useRef(null);

  // Load notifications from Firebase on mount ONCE
  useEffect(() => {
    const loadFromFirebase = async () => {
      isLoadingRef.current = true;
      try {
        const docRef = doc(db, 'global', 'notifications');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.list && Array.isArray(data.list)) {
            const updatedList = data.list.map(n => ({
              id: n.id,
              png: n.png || '',
              headline: n.headline || '',
              content: n.content || '',
              link: n.link || '',
              buttonText: n.buttonText || 'آمين',
              status: n.status || 'draft',
              publishedAt: n.publishedAt || null
            }));
            setNotifications(updatedList);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
            lastSavedRef.current = JSON.stringify(updatedList);
          }
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        // Small delay to ensure state is settled
        setTimeout(() => {
          isLoadingRef.current = false;
        }, 500);
      }
    };

    loadFromFirebase();
  }, []); // Only run once on mount

  // Save to Firebase with debounce - ONLY if data actually changed
  useEffect(() => {
    // Skip if loading or syncing
    if (isLoadingRef.current || syncing) return;
    
    // Check if data actually changed
    const currentData = JSON.stringify(notifications);
    if (currentData === lastSavedRef.current) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounced save
    saveTimeoutRef.current = setTimeout(async () => {
      setSyncing(true);
      try {
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, currentData);
        
        // Save to Firebase
        const docRef = doc(db, 'global', 'notifications');
        await setDoc(docRef, { 
          list: notifications,
          lastUpdated: Date.now()
        });
        
        // Update last saved reference
        lastSavedRef.current = currentData;
        
        console.log('✅ Saved to Firebase successfully');
      } catch (error) {
        console.error('❌ Error saving to Firebase:', error);
      } finally {
        setSyncing(false);
      }
    }, 1500); // 1.5 second debounce

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [notifications, syncing]);

  const handleImageUpload = async (id, e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Show uploading state
      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, uploadingImage: true } : n
        )
      );

      // Create unique filename with timestamp
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const filename = `notification_${id}_${timestamp}.${fileExt}`;
      
      // Upload to Firebase Storage
      const imageRef = storageRef(storage, `notifications/${filename}`);
      const snapshot = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log(`✅ Image uploaded for notification ${id}:`, downloadURL);

      // Update state with new image URL
      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, png: downloadURL, uploadingImage: false } : n
        )
      );
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, uploadingImage: false } : n
        )
      );
    }
  };

  const handleHeadlineChange = (id, value) => {
    if (value.length <= 100) {
      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, headline: value } : n
        )
      );
    }
  };

  const handleContentChange = (id, value) => {
    if (value.length <= 500) {
      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, content: value } : n
        )
      );
    }
  };

  const handleLinkChange = (id, value) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, link: value } : n
      )
    );
  };

  const handleButtonTextChange = (id, value) => {
    if (value.length <= 20) {
      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, buttonText: value } : n
        )
      );
    }
  };

  const handleStart = (id) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification.png || !notification.headline || !notification.content) {
      alert('⚠️ Please fill in all required fields (Image, Headline, Content)');
      return;
    }
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, status: 'ready' } : n
      )
    );
    alert('✔ Notification is ready! Click "Publish" to make it live.');
  };

  const handlePublish = (id) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id
          ? { ...n, status: 'published', publishedAt: Date.now() }
          : n
      )
    );
    alert('✔ Notification published! All users can now see it.');
  };

  const handleExpire = (id) => {
    if (!window.confirm('Expire this notification? Users will no longer see it.')) {
      return;
    }
    setNotifications(prev =>
      prev.map(n =>
        n.id === id
          ? { 
              id: n.id, 
              png: '', 
              headline: '', 
              content: '', 
              link: '', 
              buttonText: 'آمين', 
              status: 'draft', 
              publishedAt: null 
            }
          : n
      )
    );
    alert('✔ Notification expired and cleared.');
  };

  return (
    <div className="notification-center-overlay" onClick={onClose}>
      <div className="notification-center-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="nc-header">
          <div>
            <h2 className="nc-title">Notification Center</h2>
            <p className="nc-subtitle">
              Admin Panel · Manage 5 Notifications
              {syncing && <span style={{ color: '#fbbf24' }}> · Saving...</span>}
            </p>
          </div>
          <button className="nc-close-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Notification Cards */}
        <div className="nc-content">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`nc-card ${activeCard === notification.id ? 'active' : ''}`}
              onClick={() => setActiveCard(activeCard === notification.id ? null : notification.id)}
            >
              {/* Card Header */}
              <div className="nc-card-header">
                <div className="nc-card-number">Notification {notification.id}</div>
                <div className={`nc-status-badge ${notification.status}`}>
                  {notification.status === 'draft' && '📝 Draft'}
                  {notification.status === 'ready' && '⏳ Ready'}
                  {notification.status === 'published' && '🟢 Published'}
                </div>
              </div>

              {/* Expandable Content */}
              {activeCard === notification.id && (
                <div className="nc-card-body" onClick={(e) => e.stopPropagation()}>
                  {/* Image Upload */}
                  <div className="nc-field">
                    <label className="nc-label">
                      <span className="material-symbols-outlined">image</span>
                      Upload Image
                    </label>
                    <div className="nc-image-upload">
                      {notification.png ? (
                        <div className="nc-image-preview">
                          <img src={notification.png} alt="Notification" />
                          <button 
                            className="nc-image-remove"
                            onClick={(e) => {
                              e.stopPropagation();
                              setNotifications(prev =>
                                prev.map(n =>
                                  n.id === notification.id ? { ...n, png: '' } : n
                                )
                              );
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <label className="nc-upload-box" onClick={(e) => e.stopPropagation()}>
                          {notification.uploadingImage ? (
                            <>
                              <span className="material-symbols-outlined">hourglass_empty</span>
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined">cloud_upload</span>
                              <span>Click to upload</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg"
                            onChange={(e) => {
                              e.stopPropagation();
                              handleImageUpload(notification.id, e);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            style={{ display: 'none' }}
                            disabled={notification.uploadingImage}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Headline */}
                  <div className="nc-field">
                    <label className="nc-label">
                      <span className="material-symbols-outlined">title</span>
                      Headline (Max 2 lines recommended)
                    </label>
                    <textarea
                      className="nc-input nc-headline-input"
                      placeholder="Enter notification headline..."
                      value={notification.headline}
                      onChange={(e) => handleHeadlineChange(notification.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      maxLength={100}
                      rows={2}
                    />
                    <small className="nc-char-count">{notification.headline.length}/100</small>
                  </div>

                  {/* Content */}
                  <div className="nc-field">
                    <label className="nc-label">
                      <span className="material-symbols-outlined">description</span>
                      Content
                    </label>
                    <textarea
                      className="nc-textarea"
                      placeholder="Enter notification content..."
                      value={notification.content}
                      onChange={(e) => handleContentChange(notification.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      rows={6}
                      maxLength={500}
                    />
                    <small className="nc-char-count">{notification.content.length}/500</small>
                  </div>

                  {/* Link (Optional) */}
                  <div className="nc-field">
                    <label className="nc-label">
                      <span className="material-symbols-outlined">link</span>
                      Info Link (Optional)
                    </label>
                    <input
                      type="url"
                      className="nc-input"
                      placeholder="https://example.com (leave empty if not needed)"
                      value={notification.link}
                      onChange={(e) => handleLinkChange(notification.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <small className="nc-hint">
                      {notification.link ? '✔ Info button will be shown' : 'ℹ️ No link = no Info button'}
                    </small>
                  </div>

                  {/* Button Text (Customizable) */}
                  <div className="nc-field">
                    <label className="nc-label">
                      <span className="material-symbols-outlined">touch_app</span>
                      Button Text
                    </label>
                    <input
                      type="text"
                      className="nc-input"
                      placeholder="آمين"
                      value={notification.buttonText}
                      onChange={(e) => handleButtonTextChange(notification.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      maxLength={20}
                    />
                    <small className="nc-char-count">{notification.buttonText.length}/20</small>
                  </div>

                  {/* Action Buttons */}
                  <div className="nc-actions">
                    {notification.status === 'draft' && (
                      <button
                        className="nc-btn nc-btn-start"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStart(notification.id);
                        }}
                        disabled={!notification.png || !notification.headline || !notification.content}
                      >
                        <span className="material-symbols-outlined">play_arrow</span>
                        Start
                      </button>
                    )}

                    {notification.status === 'ready' && (
                      <button
                        className="nc-btn nc-btn-publish"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePublish(notification.id);
                        }}
                      >
                        <span className="material-symbols-outlined">publish</span>
                        Publish
                      </button>
                    )}

                    {notification.status === 'published' && (
                      <button
                        className="nc-btn nc-btn-expire"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExpire(notification.id);
                        }}
                      >
                        <span className="material-symbols-outlined">cancel</span>
                        Expire
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}