import { useEffect } from 'react';
import { useAuth } from './AuthContext';
import useReminders from './useReminders';
import './ReminderScreen.css';

const MONTH_NAMES = [
  "Muharram", "Safar", "Rabiʿ I", "Rabiʿ II", "Jumada I", "Jumada II",
  "Rajab", "Shaʿban", "Ramadan", "Shawwal", "Dhu al-Qaʿdah", "Dhu al-Hijjah"
];

export default function ReminderScreen({ open, onClose }) {
  const { user } = useAuth();
  const { pending, paid, markAsPaid, deleteReminder, clearAll, count, loading } = useReminders(user);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [open]);

  if (!open) return null;

  const formatHijriDate = (hijriDate) => {
    if (!hijriDate) return '—';
    return `${hijriDate.day} ${MONTH_NAMES[hijriDate.month - 1]} ${hijriDate.year} AH`;
  };

  const getAmountLabel = (type) => {
    if (type === "Gold & Silver") return "Zakah to Give";
    if (type === "Crops (ʿUshr)") return "Zakah to Give";
    if (type === "Livestock") return "Zakah to Give";
    if (type === "Trade & Money") return "Zakah Amount";
    return "Zakah Amount";
  };

  const formatAmount = (amount) => {
    if (!amount) return '—';
    
    // If it's a string that contains letters (units like "g", "L", "sheep"), return as-is
    if (typeof amount === 'string' && /[a-zA-Z]/.test(amount)) {
      return amount;
    }
    
    // Otherwise, it's a pure number (Money/Trade case), format as currency
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return amount;
    return `₹ ${numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleMarkPaid = (id) => {
    markAsPaid(id);
    // Auto-delete after animation
    setTimeout(() => {
      deleteReminder(id);
    }, 2000);
  };

  return (
    <div className="reminder-overlay" onClick={onClose}>
      <div className="reminder-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Handle */}
        <div className="reminder-handle" />

        {/* Header */}
        <div className="reminder-header">
          <div>
            <h2 className="reminder-title">Zakah Reminders</h2>
            <p className="reminder-subtitle">
              {count}/10 reminders · {pending.length} pending
              {user && <span className="sync-badge"> · Cloud Synced</span>}
              {!user && <span className="local-badge"> · Local Only</span>}
            </p>
          </div>
          
          {count > 0 && (
            <button className="clear-all-btn" onClick={clearAll}>
              Clear All
            </button>
          )}
        </div>

        {/* Content */}
        <div className="reminder-content">
          {/* Loading State */}
          {loading && (
            <div className="empty-state">
              <div className="empty-icon">⏳</div>
              <p className="empty-text">Loading reminders...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && count === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p className="empty-text">No reminders yet</p>
              <p className="empty-subtext">
                Add Zakah reminders from calculators
              </p>
              {!user && (
                <p className="empty-hint">
                  💡 Sign in to sync reminders across devices
                </p>
              )}
            </div>
          )}

          {/* Pending Reminders */}
          {!loading && pending.length > 0 && (
            <div className="reminder-section">
              <h3 className="section-title">Pending ({pending.length})</h3>
              
              {pending.map((reminder) => (
                <div key={reminder.id} className="reminder-card pending">
                  <button
                    className="delete-btn"
                    onClick={() => deleteReminder(reminder.id)}
                    aria-label="Delete reminder"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>

                  <div className="card-header">
                    <span className="status-badge pending">Pending</span>
                    <span className="card-type">{reminder.type}</span>
                  </div>

                  <div className="card-amount">
                    <p className="amount-label">{getAmountLabel(reminder.type)}</p>
                    <p className="amount-value">{formatAmount(reminder.zakathAmount)}</p>
                  </div>

                  {reminder.details && Object.keys(reminder.details).length > 0 && (
                    <div className="card-details">
                      {Object.entries(reminder.details).map(([key, value]) => (
                        <div key={key} className="detail-row">
                          <span className="detail-label">{key}:</span>
                          <span className="detail-value">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="card-meta">
                    <p className="meta-label">Added On</p>
                    <p className="meta-value">{formatHijriDate(reminder.dueDate)}</p>
                  </div>

                  <button
                    className="mark-paid-btn"
                    onClick={() => handleMarkPaid(reminder.id)}
                  >
                    ✓ Mark as Paid
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Paid Reminders */}
          {!loading && paid.length > 0 && (
            <div className="reminder-section">
              <h3 className="section-title">Paid ({paid.length})</h3>
              
              {paid.map((reminder) => (
                <div key={reminder.id} className="reminder-card paid">
                  <button
                    className="delete-btn"
                    onClick={() => deleteReminder(reminder.id)}
                    aria-label="Delete reminder"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>

                  <div className="card-header">
                    <span className="status-badge paid">✓ Paid</span>
                    <span className="card-type">{reminder.type}</span>
                  </div>

                  <div className="card-amount">
                    <p className="amount-label">{getAmountLabel(reminder.type)}</p>
                    <p className="amount-value">{formatAmount(reminder.zakathAmount)}</p>
                  </div>

                  {reminder.details && Object.keys(reminder.details).length > 0 && (
                    <div className="card-details">
                      {Object.entries(reminder.details).map(([key, value]) => (
                        <div key={key} className="detail-row">
                          <span className="detail-label">{key}:</span>
                          <span className="detail-value">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="card-meta">
                    <p className="meta-label">Paid On</p>
                    <p className="meta-value">{reminder.paidDate || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Close Button */}
        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}