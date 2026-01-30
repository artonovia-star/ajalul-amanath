import "./WhatIsZakath.css";

export default function WhatIsZakath({ onBack }) {
  return (
    <div className="what-screen">

      {/* BACK */}
      <button className="zakath-back" onClick={onBack}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        BACK
      </button>

      {/* HEADER */}
      <div className="what-header">
        <div className="header-ornament">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <circle cx="30" cy="30" r="28" stroke="url(#gold-gradient)" strokeWidth="1.5" opacity="0.6"/>
            <circle cx="30" cy="30" r="22" stroke="url(#gold-gradient)" strokeWidth="1" opacity="0.4"/>
            <path d="M30 15 L35 25 L45 27 L37.5 35 L40 45 L30 40 L20 45 L22.5 35 L15 27 L25 25 Z" 
                  fill="url(#gold-gradient)" opacity="0.8"/>
            <defs>
              <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D4AF37"/>
                <stop offset="50%" stopColor="#F4E4B0"/>
                <stop offset="100%" stopColor="#C5A028"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 className="what-title">What is Zakath?</h1>
        <p className="what-subtitle">
          According to the Shafiʿee Madhhab · Fathul Mueen
        </p>
      </div>

      {/* ================= CARD 1 ================= */}
      <div className="what-card">
        <div className="card-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="url(#icon-grad-1)" strokeWidth="1.5" opacity="0.3"/>
            <path d="M24 8 C28 8, 32 12, 32 16 C32 20, 28 24, 24 24 M24 24 C20 24, 16 28, 16 32 C16 36, 20 40, 24 40" 
                  stroke="url(#icon-grad-1)" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="24" cy="24" r="3" fill="url(#icon-grad-1)"/>
            <defs>
              <linearGradient id="icon-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4DD0E1"/>
                <stop offset="100%" stopColor="#00ACC1"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h2 className="card-title">
          Definition of Zakath
          <span className="ar">تعريف الزكاة</span>
        </h2>

        <div className="card-section ar-text">
          الزكاة لغةً: النماء والطهارة  
          <br />
          وشرعًا: اسمٌ لمالٍ مخصوصٍ، يجب إخراجه من مالٍ مخصوصٍ
          لطائفةٍ مخصوصةٍ بشروطٍ مخصوصة
        </div>

        <div className="card-divider" />

        <div className="card-section en-text">
          Zakath linguistically means growth and purification.
          <br /><br />
          In Islamic law, it is a specific portion of wealth that becomes
          obligatory to give to specific recipients under specific conditions.
        </div>

        <div className="card-ref">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" opacity="0.5">
            <path d="M8 1L3 3v4c0 3.5 2 6.5 5 8 3-1.5 5-4.5 5-8V3l-5-2z"/>
          </svg>
          Reference: Fathul Mueen, Kithab al zakath
        </div>
      </div>

      {/* ================= CARD 2 ================= */}
      <div className="what-card">
        <div className="card-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="16" r="8" stroke="url(#icon-grad-2)" strokeWidth="2"/>
            <path d="M12 38 C12 30, 16 26, 24 26 C32 26, 36 30, 36 38" 
                  stroke="url(#icon-grad-2)" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="24" cy="16" r="4" fill="url(#icon-grad-2)" opacity="0.3"/>
            <defs>
              <linearGradient id="icon-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#66BB6A"/>
                <stop offset="100%" stopColor="#43A047"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h2 className="card-title">
          Who Must Pay Zakath?
          <span className="ar">على من تجب الزكاة؟</span>
        </h2>

        <div className="card-section ar-text">
          تجب الزكاة على المسلم الحر إذا ملك نصابًا تامًّا
          ملكًا مستقرًا، ومضى عليه الحول
        </div>

        <div className="card-divider" />

        <div className="card-section en-text">
          Zakath is obligatory upon:
          <ul>
            <li>A Muslim</li>
            <li>Who is free (not a slave)</li>
            <li>Who owns wealth reaching the niṣāb</li>
            <li>With full ownership</li>
            <li>After one lunar year (hawl)</li>
          </ul>
        </div>

        <div className="card-ref">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" opacity="0.5">
            <path d="M8 1L3 3v4c0 3.5 2 6.5 5 8 3-1.5 5-4.5 5-8V3l-5-2z"/>
          </svg>
          Reference: Fathul Mueen
        </div>
      </div>

      {/* ================= CARD 3 ================= */}
      <div className="what-card">
        <div className="card-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path d="M24 8 C20 12, 16 16, 16 24 C16 28, 18 30, 20 32 L24 36 L28 32 C30 30, 32 28, 32 24 C32 16, 28 12, 24 8" 
                  stroke="url(#icon-grad-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20 20 C20 20, 22 18, 24 18 C26 18, 28 20, 28 20" 
                  stroke="url(#icon-grad-3)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
            <circle cx="24" cy="24" r="2" fill="url(#icon-grad-3)"/>
            <defs>
              <linearGradient id="icon-grad-3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFA726"/>
                <stop offset="100%" stopColor="#FB8C00"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h2 className="card-title">
          Who Can Receive Zakath?
          <span className="ar">مصارف الزكاة</span>
        </h2>

        <div className="card-section ar-text">
          إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ وَالْمَسَاكِينِ
          وَالْعَامِلِينَ عَلَيْهَا وَالْمُؤَلَّفَةِ قُلُوبُهُمْ
          وَفِي الرِّقَابِ وَالْغَارِمِينَ
          وَفِي سَبِيلِ اللَّهِ وَابْنِ السَّبِيلِ
        </div>

        <div className="card-divider" />

        <div className="card-section en-text">
          Zakath may only be given to the eight categories mentioned in the Qur'an:
          the poor, the needy, Zakath collectors, those whose hearts are reconciled,
          freeing slaves, debtors, in the path of Allah, and the traveler.
        </div>

        <div className="card-ref">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" opacity="0.5">
            <path d="M8 1L3 3v4c0 3.5 2 6.5 5 8 3-1.5 5-4.5 5-8V3l-5-2z"/>
          </svg>
          Reference: Qur'an 9:60 · Shafi'ee fiqh restriction applies
        </div>
      </div>

      {/* ================= CARD 4 ================= */}
      <div className="what-card">
        <div className="card-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x="16" y="12" width="16" height="20" rx="2" 
                  stroke="url(#icon-grad-4)" strokeWidth="2"/>
            <circle cx="24" cy="22" r="4" stroke="url(#icon-grad-4)" strokeWidth="2"/>
            <path d="M24 26 L24 28" stroke="url(#icon-grad-4)" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 36 L36 36" stroke="url(#icon-grad-4)" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="24" cy="22" r="2" fill="url(#icon-grad-4)" opacity="0.4"/>
            <defs>
              <linearGradient id="icon-grad-4" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D4AF37"/>
                <stop offset="50%" stopColor="#F4E4B0"/>
                <stop offset="100%" stopColor="#C5A028"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h2 className="card-title">
          Zakathable Wealth
          <span className="ar">الأموال الزكوية</span>
        </h2>

        <div className="card-section ar-text">
          تجب الزكاة في الذهب، والفضة، والنقود،
          وعروض التجارة، والماشية، والزروع والثمار
        </div>

        <div className="card-divider" />

        <div className="card-section en-text">
          According to the Shafi'ee Madhhab, Zakath is obligatory on:
          gold, silver, money, trade goods, livestock, and crops—each with
          its own conditions and nisab.
        </div>

        <div className="card-ref">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" opacity="0.5">
            <path d="M8 1L3 3v4c0 3.5 2 6.5 5 8 3-1.5 5-4.5 5-8V3l-5-2z"/>
          </svg>
          Reference: Fathul Mueen
        </div>
      </div>

    </div>
  );
}