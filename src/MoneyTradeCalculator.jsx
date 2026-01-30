import { useState } from "react";
import { useAuth } from "./AuthContext"; // ADD THIS
import useReminders from "./useReminders";
import "./MoneyTradeCalculator.css";

export default function MoneyTradeCalculator({ onBack }) {
  const { user } = useAuth(); // ADD THIS
  const { addReminder } = useReminders(user); // PASS USER HERE
  
  /* ================= INTRO NOTICE ================= */
  const [showIntro, setShowIntro] = useState(true);

  const [cashAmount, setCashAmount] = useState("");
  const [tradeValue, setTradeValue] = useState("");

  const [rateType, setRateType] = useState("gold"); // gold | silver
  const [rateValue, setRateValue] = useState("");

  const num = (v) => Number(v) || 0;

  /* ================= TOTAL WEALTH ================= */
  const totalWealth = num(cashAmount) + num(tradeValue);

  /* ================= SHAFI'I NISAB ================= */
  const GOLD_NISAB = 85;    // grams
  const SILVER_NISAB = 595; // grams

  const nisabGrams =
    rateType === "gold" ? GOLD_NISAB : SILVER_NISAB;

  const nisabValue =
    num(rateValue) > 0
      ? nisabGrams * num(rateValue)
      : Infinity;

  const zakathDue = totalWealth >= nisabValue;
  const zakathAmount = zakathDue ? totalWealth * 0.025 : 0;

  /* ================= REMINDER HANDLER ================= */
  const handleAddToReminder = () => {
    const success = addReminder({
      type: "Trade & Money",
      zakathAmount: zakathAmount.toFixed(2),
      details: {
        "Cash": `₹ ${cashAmount}`,
        "Trade Goods": `₹ ${tradeValue}`,
        "Total": `₹ ${totalWealth}`,
        "Nisab Basis": rateType === "gold" ? "Gold (85g)" : "Silver (595g)"
      }
    });

    if (success) {
      alert("✓ Reminder added successfully!");
    }
  };

  return (
    <div className="calculator-screen">
      {/* ================= INTRO MODAL ================= */}
      {showIntro && (
        <div className="intro-overlay">
          <div className="intro-box">
            <h3>How This Calculator Works</h3>

            <p>
              In the <strong>Shafi'ee Madhhab</strong>, Zakah on
              <strong> money and trade goods</strong> is calculated
              using the <strong>Gold or Silver nisab</strong>.
            </p>

            <p>
              ➭ Please enter the <strong>current gold or silver rate</strong> first,
              then enter your cash and trade goods value.
            </p>

            <button
              className="intro-btn"
              onClick={() => setShowIntro(false)}
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* BACK */}
      <button className="gold-back" onClick={onBack}>
        BACK
      </button>

      <h2 className="title">Trade Goods & Money</h2>
      <p className="subtitle">
        Shafi'ee Madhhab · Fathul Mueen
      </p>

      {/* CASH */}
      <div className="calc-card">
        <h3>Cash & Bank Balance</h3>
        <div className="input-group">
          <input
            type="number"
            placeholder="Total cash (₹)"
            value={cashAmount}
            onChange={(e) => setCashAmount(e.target.value)}
          />
        </div>
      </div>

      {/* TRADE GOODS */}
      <div className="calc-card">
        <h3>Trade Goods</h3>
        <div className="input-group">
          <input
            type="number"
            placeholder="Market value (₹)"
            value={tradeValue}
            onChange={(e) => setTradeValue(e.target.value)}
          />
        </div>
        <small className="nisab-note">
          Current selling price
        </small>
      </div>

      {/* RATE TOGGLE */}
      <div className="calc-card">
        <h3>Nisab Basis</h3>

        <div className="rate-toggle">
          <button
            className={rateType === "gold" ? "active" : ""}
            onClick={() => setRateType("gold")}
          >
            Gold
          </button>
          <button
            className={rateType === "silver" ? "active" : ""}
            onClick={() => setRateType("silver")}
          >
            Silver
          </button>
        </div>

        <div className="input-group">
          <input
            type="number"
            placeholder={`₹ / gram (${rateType})`}
            value={rateValue}
            onChange={(e) => setRateValue(e.target.value)}
          />
        </div>

        <small className="nisab-note">
          Nisab: {nisabGrams}g of {rateType}
        </small>
      </div>

      {/* RESULT */}
      <div className="result-box">
        <p className="result-b">Total Zakathable Wealth</p>
        <h2>₹ {totalWealth.toLocaleString('en-IN')}</h2>

        {zakathDue ? (
          <>
            <p className="due">Zakath is DUE</p>
            <p className="amount">
              ₹ {zakathAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </p>

            {/* ADD TO REMINDER */}
            <button
              className="add-reminder-btn"
              onClick={handleAddToReminder}
            >
              ＋ Add to Reminder
            </button>
          </>
        ) : (
          <p className="not-due">
            Zakath not due (Nisab not reached)
          </p>
        )}
      </div>
    </div>
  );
}