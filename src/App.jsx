// App.jsx
import { useState, useRef, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import ZakathCalculator from "./ZakathCalculator";
import WhatIsZakath from "./WhatIsZakath";
import ChatBot from "./ChatBot";
import ReminderScreen from "./ReminderScreen";
import NotificationCenter from "./NotificationCenter";
import NotificationPanel from "./NotificationPanel";
import UserNotifications from "./UserNotifications";
import daysCard from "./assets/svg1.svg";
import chatSvg from "./assets/svg2.svg";
import aboutSvg from "./assets/svg3.svg";
import calculatorSvg from "./assets/svg4.svg";
import infoSvg from "./assets/svg5.svg";
import videoSvg from "./assets/svg6.svg";
import logo from "./assets/logo.png";
import bgAudio from "./assets/audio/background.mp3";

/* ================= CONSTANTS ================= */
const HIJRI_YEAR_DAYS = 354;
const GREGORIAN_DAY_MS = 24 * 60 * 60 * 1000;

const MONTH_NAMES = [
  "Muharram","Safar","Rabi I","Rabi II","Jumada I","Jumada II",
  "Rajab","Sha'aban","Ramadan","Shawwal","Dhul Qa'dah","Dhul Hijjah"
];

export default function App() {
  const { user, isAdmin } = useAuth();

  /* ================= SCREEN ================= */
  const [screen, setScreen] = useState("home");
  const [showAppInfo, setShowAppInfo] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [hasVisibleNotifications, setHasVisibleNotifications] = useState(false);

  /* ================= AUDIO (BACKGROUND MUSIC) ================= */
  const audioRef = useRef(null);
  const [isMusicEnabled, setIsMusicEnabled] = useState(() => {
    const saved = localStorage.getItem("musicEnabled");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    audioRef.current = new Audio(bgAudio);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;
    
    if (isMusicEnabled) {
      audioRef.current.play().catch(() => {});
    }
    
    return () => audioRef.current?.pause();
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (isMusicEnabled) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
    localStorage.setItem("musicEnabled", JSON.stringify(isMusicEnabled));
  }, [isMusicEnabled]);

  /* ================= ADMIN STATES ================= */
  const [showSettings, setShowSettings] = useState(false);
  const [showAdminSheet, setShowAdminSheet] = useState(false);
  const [adminSetDate, setAdminSetDate] = useState({ day: "", month: "", year: "" });
  const longPressTimer = useRef(null);

  /* ================= TODAY HIJRI (GLOBAL - FROM FIREBASE) ================= */
  const [todayHijri, setTodayHijri] = useState(() => {
    const saved = localStorage.getItem("todayHijri");
    return saved ? JSON.parse(saved) : { day: 4, month: 8, year: 1447 };
  });

  // Real-time sync of global Hijri date from Firebase
  useEffect(() => {
    const docRef = doc(db, "global", "todayHijri");
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTodayHijri(data);
        localStorage.setItem("todayHijri", JSON.stringify(data));
      }
    });

    return () => unsubscribe();
  }, []);

  /* ================= NISAB (USER-SPECIFIC - FROM FIREBASE) ================= */
  const [nisabHijri, setNisabHijri] = useState(() => {
    const saved = localStorage.getItem("nisabHijri");
    return saved ? JSON.parse(saved) : null;
  });

  const [daysRemaining, setDaysRemaining] = useState(0);
  const [tempHijri, setTempHijri] = useState({ day: "", month: "", year: "" });

  // Load user's nisab date from Firebase
  useEffect(() => {
    if (!user) return;

    const loadUserNisab = async () => {
      try {
        const docRef = doc(db, `users/${user.uid}/zakath`, 'nisabDate');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setNisabHijri(data);
          localStorage.setItem(`${user.uid}_nisabHijri`, JSON.stringify(data));
        }
      } catch (error) {
        console.error('Error loading nisab date:', error);
      }
    };

    loadUserNisab();
  }, [user]);

 /* ================= AUTO DAY PASS @ 7:00 PM IST (ADMIN ONLY) ================= */
useEffect(() => {
  if (!isAdmin) return;

  const getISTTimestamp = () => {
    const now = new Date();

    // Convert current time to IST
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const ist = new Date(utc + 5.5 * 60 * 60 * 1000);

    // Set cutoff to 7:00 PM IST
    ist.setHours(19, 0, 0, 0);

    return ist.getTime();
  };

  const lastUpdated = localStorage.getItem("lastHijriUpdateAt7PM");
  const today7PM = getISTTimestamp();

  // If first run, just store timestamp
  if (!lastUpdated) {
    localStorage.setItem("lastHijriUpdateAt7PM", today7PM);
    return;
  }

  // If current time is past today's 7 PM IST
  const now = Date.now();
  if (now >= today7PM && Number(lastUpdated) < today7PM) {
    const updateDate = async () => {
      const updated = advanceHijriByDays(todayHijri, 1);
      setTodayHijri(updated);

      try {
        const docRef = doc(db, "global", "todayHijri");
        await setDoc(docRef, updated);
      } catch (error) {
        console.error("Error updating Hijri date:", error);
      }
    };

    updateDate();
    localStorage.setItem("lastHijriUpdateAt7PM", today7PM);
  }
}, [isAdmin, todayHijri]);


  /* ================= CALCULATION ================= */
  const daysBetween = (start, end) => {
    let days = 0;
    days += (end.year - start.year) * HIJRI_YEAR_DAYS;
    days += (end.month - start.month) * 29.5;
    days += (end.day - start.day);
    return Math.floor(days);
  };

  useEffect(() => {
    if (!nisabHijri) return;
    const passed = daysBetween(nisabHijri, todayHijri);
    
    if (passed >= HIJRI_YEAR_DAYS) {
      // More than 1 year has passed - show negative (days passed beyond the year)
      setDaysRemaining(-(passed - HIJRI_YEAR_DAYS));
    } else {
      // Less than 1 year - show days remaining
      setDaysRemaining(HIJRI_YEAR_DAYS - passed);
    }
  }, [nisabHijri, todayHijri]);

  const startCalculation = async () => {
    if (!tempHijri.day || !tempHijri.month || !tempHijri.year) {
      alert("Please select full Hijri date");
      return;
    }

    const date = {
      day: Number(tempHijri.day),
      month: Number(tempHijri.month),
      year: Number(tempHijri.year)
    };

    setNisabHijri(date);
    
    // Save to Firebase if user is logged in
    if (user) {
      try {
        const docRef = doc(db, `users/${user.uid}/zakath`, 'nisabDate');
        await setDoc(docRef, date);
      } catch (error) {
        console.error('Error saving nisab date:', error);
      }
    }
    
    // Also save to localStorage
    localStorage.setItem(user ? `${user.uid}_nisabHijri` : "nisabHijri", JSON.stringify(date));
    setShowSettings(false);
  };

  /* ================= ADMIN LOGIC ================= */
  const handlePressStart = () => {
    if (!isAdmin) return; // Only admin can access
    
    longPressTimer.current = setTimeout(() => {
      setShowAdminSheet(true);
    }, 2000);
  };

  const handlePressEnd = () => {
    clearTimeout(longPressTimer.current);
  };

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

  const allowNextDay = async () => {
    const updated = advanceHijriByDays(todayHijri, 1);
    setTodayHijri(updated);
    
    // Save to Firebase (global)
    try {
      const docRef = doc(db, "global", "todayHijri");
      await setDoc(docRef, updated);
    } catch (error) {
      console.error('Error updating global Hijri date:', error);
      alert('Failed to update date. Please try again.');
    }
  };

  const enterNextMonth = async () => {
    if (!window.confirm("Confirm moon sighted?")) return;

    const updated = {
      day: 1,
      month: todayHijri.month === 12 ? 1 : todayHijri.month + 1,
      year: todayHijri.month === 12 ? todayHijri.year + 1 : todayHijri.year
    };
    
    setTodayHijri(updated);
    
    // Save to Firebase (global)
    try {
      const docRef = doc(db, "global", "todayHijri");
      await setDoc(docRef, updated);
    } catch (error) {
      console.error('Error updating global Hijri date:', error);
      alert('Failed to update date. Please try again.');
    }
  };

  const setTodayHijriManually = async () => {
    if (!adminSetDate.day || !adminSetDate.month || !adminSetDate.year) {
      alert("Select full Hijri date");
      return;
    }

    const updated = {
      day: Number(adminSetDate.day),
      month: Number(adminSetDate.month),
      year: Number(adminSetDate.year)
    };

    setTodayHijri(updated);
    
    // Save to Firebase (global)
    try {
      const docRef = doc(db, "global", "todayHijri");
      await setDoc(docRef, updated);
      alert("Today Hijri date updated globally!");
    } catch (error) {
      console.error('Error updating global Hijri date:', error);
      alert('Failed to update date. Please try again.');
    }
  };

  /* ================= SCREEN ROUTING ================= */
  if (screen === "calculator") return <ZakathCalculator onBack={() => setScreen("home")} />;
  if (screen === "aboutZakath") return <WhatIsZakath onBack={() => setScreen("home")} />;
  if (screen === "chatbot") return <ChatBot onBack={() => setScreen("home")} />;

  /* ================= HOME ================= */
  return (
    <div className="app">
      {/* ================= USER NOTIFICATIONS ================= */}
      <UserNotifications onVisibilityChange={setHasVisibleNotifications} />

      {/* ================= MAIN CONTENT (BLURRED WHEN NOTIFICATIONS VISIBLE) ================= */}
      <div className={`app-main-content ${hasVisibleNotifications ? 'blurred' : ''}`}>
      <div className="top-bar">
        <button 
          className="icon-btn1"
          onClick={() => setShowNotificationPanel(true)}
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button
          className="icon-btn2"
          onClick={() => setIsMusicEnabled(!isMusicEnabled)}
        >
          <span className="material-symbols-outlined">
            {isMusicEnabled ? "music_note" : "music_off"}
          </span>
        </button>
      </div>

      <p className="ayah">"وأقيموا الصّلاة وآتوا الزّكاة"</p>
      <img src={logo} className="app-logo" alt="logo" />

      <div className="days-card">
        <img src={daysCard} className="days-svg" alt="" />
        <div className="days-overlay">
          <div className="days-text">
            <div
              className="days-top admin-trigger"
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
              onTouchStart={handlePressStart}
              onTouchEnd={handlePressEnd}
            >
              <span className="days-number">{Math.abs(daysRemaining)}</span>
              <span className="days-label">{daysRemaining < 0 ? 'Days Passed' : 'Days Left'}</span>
            </div>
            <div className="days-date">
              {todayHijri.day} {MONTH_NAMES[todayHijri.month - 1]} {todayHijri.year}
            </div>
          </div>
        </div>

        <button
          className={`toggle-btn ${showSettings ? "open" : ""}`}
          onClick={() => setShowSettings(!showSettings)}
        >
          <span className="material-symbols-outlined">keyboard_arrow_down</span>
        </button>
      </div>

      {showSettings && (
        <div className="date-settings">
          <p className="settings-title">Nisab Start Date (Hijri)</p>
          <div className="date-row">
            <select onChange={e => setTempHijri({ ...tempHijri, day: e.target.value })}>
              <option value="">Day</option>
              {[...Array(30)].map((_, i) => <option key={i}>{i + 1}</option>)}
            </select>
            <select onChange={e => setTempHijri({ ...tempHijri, month: e.target.value })}>
              <option value="">Month</option>
              {MONTH_NAMES.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
            <select onChange={e => setTempHijri({ ...tempHijri, year: e.target.value })}>
              <option value="">Year</option>
              {[...Array(30)].map((_, i) => <option key={i}>{1440 + i}</option>)}
            </select>
          </div>
          <button className="start-btn" onClick={startCalculation}>Start</button>
          {!user && (
            <p className="settings-hint">Sign in to sync across devices</p>
          )}
        </div>
      )}

      <div className="svg-section">
        <div className="svg-row1">
          <img src={chatSvg} className="svg-chat" onClick={() => setScreen("chatbot")} alt="Chat" />
          <div className="svg-row2">
            <img src={aboutSvg} className="svg-wide" onClick={() => setScreen("aboutZakath")} alt="About" />
            <img src={calculatorSvg} className="svg-normal" onClick={() => setScreen("calculator")} alt="Calculator" />
          </div>
        </div>
        <div className="svg-row">
          <img src={infoSvg} className="svg-small" onClick={() => setShowAppInfo(true)} alt="Info" />
          <img src={videoSvg} className="svg-wide1" onClick={() => setShowReminder(true)} alt="Reminders" />
        </div>
      </div>

      {/* ADMIN SHEET - Only accessible if user is admin */}
      {showAdminSheet && isAdmin && (
        <div className="admin-overlay" onClick={() => setShowAdminSheet(false)}>
          <div className="admin-panel" onClick={(e) => e.stopPropagation()}>
            <div className="admin-handle"></div>
            
            <h2 className="admin-title">Admin Panel</h2>
            <p className="admin-email-badge">Logged in as: {user?.email}</p>
            
            {/* HIJRI DATE SECTION */}
            <div className="admin-section">
              <h3 className="admin-section-title">📅 Hijri Date Management</h3>
              
              <button className="admin-action-btn primary" onClick={allowNextDay}>
                <span className="material-symbols-outlined">navigate_next</span>
                Advance One Day
              </button>
              
              <button className="admin-action-btn primary" onClick={enterNextMonth}>
                <span className="material-symbols-outlined">calendar_month</span>
                Enter Next Hijri Month
              </button>
              
              <p className="admin-subsection-title">Set Today Hijri Date</p>
              <div className="date-row">
                <select onChange={e => setAdminSetDate({ ...adminSetDate, day: e.target.value })}>
                  <option value="">Day</option>
                  {[...Array(30)].map((_, i) => <option key={i}>{i + 1}</option>)}
                </select>
                <select onChange={e => setAdminSetDate({ ...adminSetDate, month: e.target.value })}>
                  <option value="">Month</option>
                  {MONTH_NAMES.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
                <select onChange={e => setAdminSetDate({ ...adminSetDate, year: e.target.value })}>
                  <option value="">Year</option>
                  {[...Array(30)].map((_, i) => <option key={i}>{1440 + i}</option>)}
                </select>
              </div>
              <button className="admin-action-btn secondary" onClick={setTodayHijriManually}>
                Set Today Date
              </button>
            </div>

            {/* NOTIFICATION SECTION */}
            <div className="admin-section">
              <h3 className="admin-section-title">🔔 Notification Center</h3>
              
              <button 
                className="admin-action-btn accent"
                onClick={() => {
                  setShowAdminSheet(false);
                  setShowNotificationCenter(true);
                }}
              >
                <span className="material-symbols-outlined">notifications_active</span>
                Open Notification Center
              </button>
            </div>

            <button className="admin-close-btn" onClick={() => setShowAdminSheet(false)}>
              Close Panel
            </button>
          </div>
        </div>
      )}

      {/* NOTIFICATION CENTER - Admin only */}
      {showNotificationCenter && isAdmin && (
        <NotificationCenter onClose={() => setShowNotificationCenter(false)} />
      )}

      {/* NOTIFICATION PANEL - For all users */}
      {showNotificationPanel && (
        <NotificationPanel onClose={() => setShowNotificationPanel(false)} />
      )}

      {/* REMINDER SCREEN */}
      <ReminderScreen open={showReminder} onClose={() => setShowReminder(false)} />

      {showAppInfo && (
        <div className="info-overlay" onClick={() => setShowAppInfo(false)}>
          <div className="info-sheet" onClick={e => e.stopPropagation()}>
            <div className="info-handle"></div>
            <div className="info-header">
              <h2>Shafi'ee Zakath Guide</h2>
              <span className="version">v2.0.0</span>
            </div>

            <div className="info-section">
              <h4>Purpose</h4>
              <p>
                A complete Zakath guidance app strictly based on
                <strong> Shafi'ee Madhhab</strong>, <em>Fathul Mueen References</em>.
              </p>
            </div>

            <div className="info-section">
              <h4>What this App Offers</h4>
              <ul>
                <li>✔ Accurate Hijri Zakath tracking</li>
                <li>✔ Shafi'ee-based Zakath calculator</li>
                <li>✔ Clear rulings with fiqh discipline</li>
                <li>✔ Cloud sync with Firebase</li>
                <li>✔ Real-time notifications</li>
              </ul>
            </div>

            <div className="info-section">
              <h4>Fiqh Reference</h4>
              <p>
                Based on classical Shafi'ee sources, primarily
                <strong> Fathul Mueen</strong> with relied opinions.
              </p>
            </div>

            <div className="info-section muted">
              <p>© For educational & personal use</p>
            </div>

            <button className="info-close-btn" onClick={() => setShowAppInfo(false)}>
              Close
            </button>
          </div>
        </div>
      )}
      </div>
      {/* End of app-main-content */}
    </div>
  );
}