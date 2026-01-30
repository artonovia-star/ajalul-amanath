import { useState } from "react";
import { useAuth } from "./AuthContext"; // ADD THIS
import useReminders from "./useReminders";
import "./SilverGoldCalculator.css";


export default function SilverGoldCalculator({ onBack }) {
  const { user } = useAuth(); // ADD THIS
  const { addReminder } = useReminders(user); // PASS USER HERE
  

  const [goldGrams, setGoldGrams] = useState("");
  const [silverGrams, setSilverGrams] = useState("");
  const [includeSilver, setIncludeSilver] = useState(true);

  const num = (v) => Number(v) || 0;

  /* ================= VALUES ================= */
  const goldValue = num(goldGrams);
  const silverValue = includeSilver ? num(silverGrams) : 0;
  const total = goldValue + silverValue;

  /* ================= NISAB (SHAFI'I) ================= */
  const GOLD_NISAB_GRAMS = 85;
  const SILVER_NISAB_GRAMS = 595;

  const goldNisabValue = GOLD_NISAB_GRAMS;
  const silverNisabValue = includeSilver ? SILVER_NISAB_GRAMS : Infinity;
  const effectiveNisab = Math.min(goldNisabValue, silverNisabValue);

  const zakathDue = total >= effectiveNisab;
  const zakathAmount = zakathDue ? total * 0.025 : 0;

  /* ================= ZAKATH IN GRAMS ================= */
  const goldZakathGrams =
    total > 0 ? (num(goldGrams) / total) * zakathAmount : 0;

  const silverZakathGrams =
    includeSilver && total > 0
      ? (num(silverGrams) / total) * zakathAmount
      : 0;

  /* ================= REMINDER HANDLER ================= */
  const handleAddToReminder = () => {
    const success = addReminder({
      type: "Gold & Silver",
      zakathAmount: `${zakathAmount.toFixed(2)} g`,
      details: {
        "Gold": `${goldGrams || 0} g`,
        "Silver": `${silverGrams || 0} g`,
        "Total Zakāh": `${zakathAmount.toFixed(2)} g`
      }
    });

    if (success) {
      alert("✓ Reminder added successfully!");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="calculator-screen">
      <button className="gold-back" onClick={onBack}>
        BACK
      </button>

      <h2 className="title">Silver & Gold Zakath</h2>
      <p className="subtitle">Shafiʿee Madhhab · Fathul Mueen</p>

      {/* GOLD */}
      <div className="calc-card">
        <h3>Gold</h3>
        <div className="input-group">
          <input
            type="number"
            placeholder="Grams"
            value={goldGrams}
            onChange={(e) => setGoldGrams(e.target.value)}
          />
        </div>
        <small className="nisab-note">Nisab: 85 grams</small>
      </div>

      {/* SILVER */}
      <div className="calc-card">
        <h3>Silver</h3>
        <div className="input-group">
          <input
            type="number"
            placeholder="Grams"
            value={silverGrams}
            onChange={(e) => setSilverGrams(e.target.value)}
            disabled={!includeSilver}
          />
        </div>

        <label className="toggle">
          <input
            type="checkbox"
            checked={includeSilver}
            onChange={() => setIncludeSilver(!includeSilver)}
          />
          Include silver
        </label>

        <small className="nisab-note">Nisab: 595 grams</small>
      </div>

      {/* RESULT */}
      <div className="result-box">
        <p className="result-b">Zakah to Give</p>

        {zakathDue ? (
          <>
            <p className="due">Zakah is DUE</p>

            {goldZakathGrams > 0 && (
              <p className="amount">
                Gold: {goldZakathGrams.toFixed(2)} g
              </p>
            )}

            {includeSilver && silverZakathGrams > 0 && (
              <p className="amount">
                Silver: {silverZakathGrams.toFixed(2)} g
              </p>
            )}

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