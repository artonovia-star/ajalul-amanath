import { useState } from "react";
import { useAuth } from "./AuthContext"; // ADD THIS
import useReminders from "./useReminders";
import "./CropsCalculator.css";

export default function CropsCalculator({ onBack }) {
  const { user } = useAuth(); // ADD THIS
  const { addReminder } = useReminders(user); // PASS USER HERE

  const [harvestLitres, setHarvestLitres] = useState("");
  const [irrigation, setIrrigation] = useState("rain");
  const [cropState, setCropState] = useState("peeled"); // peeled | unpeeled
  const [showInfo, setShowInfo] = useState(true);

  const num = (v) => Number(v) || 0;

  /* ================= SHAFI'I RULES (UPDATED LOGIC) ================= */

  // 5 wasaq ≈ 960 Litre
  const WASAQ_LITRES = 960;

  // Nisab based on crop state
  const NISAB_LITRES =
    cropState === "peeled"
      ? WASAQ_LITRES       // 960 L
      : WASAQ_LITRES * 2; // 1920 L

  const isZakatDue = num(harvestLitres) >= NISAB_LITRES;

  // Irrigation rates
  let rate = 0;
  if (irrigation === "rain") rate = 1 / 10;         // 10%
  if (irrigation === "artificial") rate = 1 / 20;   // 5%
  if (irrigation === "mixed") rate = 1 / 15;        // ~6.67%

  const zakatAmountLitres = isZakatDue
    ? num(harvestLitres) * rate
    : 0;

  /* ================= REMINDER HANDLER ================= */
  const handleAddToReminder = () => {
    const success = addReminder({
      type: "Crops (ʿUshr)",
      zakathAmount: `${zakatAmountLitres.toFixed(2)} L`,
      details: {
        "Total Harvest": `${harvestLitres} L`,
        "Irrigation": irrigation === "rain" ? "Natural" : irrigation === "artificial" ? "Artificial" : "Mixed",
        "Rate": `${(rate * 100).toFixed(1)}%`,
        "Zakāh": `${zakatAmountLitres.toFixed(2)} L`
      }
    });

    if (success) {
      alert("✓ Reminder added successfully!");
    }
  };
  return (
    <div className="calculator-screen">
      <button className="gold-back" onClick={onBack}>
        BACK
      </button>

      <h2 className="title">Crops & Fruits (ʿUshr)</h2>
      <p className="subtitle">Shafi'ee Madhhab · Fathul Mueen</p>

      {/* ================= INFO MODAL ================= */}
      {showInfo && (
        <div className="info-overlay">
          <div className="info-modal">
            <h3>Zakath on Crops (ʿUshr)</h3>

            <p>
              Zakath on crops is paid{" "}
              <strong>at the time of harvest</strong>. There is{" "}
              <strong>no hawl (one-year waiting)</strong> in the
              Shafi'ee madhhab.
            </p>

            <p>
              According to Shafi'ee rules:
              <br />
              5 Wasaq ≈ 960 Litres
            </p>

            <p>
              Nisab:
              <br />
              • Peeled / edible: <strong>960 L</strong>
              <br />
              • Unpeeled: <strong>1920 L</strong>
            </p>

            <p>
              Zakāh rate depends on irrigation method:
              <br />
              • Rain / River: 10%
              <br />
              • Well / Pump / Paid: 5%
              <br />
              • Mixed: 6.67%
            </p>

            <button
              className="close-info"
              onClick={() => setShowInfo(false)}
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* HARVEST */}
      <div className="calc-card">
        <h3>Total Harvest</h3>

        <div className="input-group">
          <input
            type="number"
            placeholder="Total harvest (litres)"
            value={harvestLitres}
            onChange={(e) => setHarvestLitres(e.target.value)}
          />
        </div>

        <label className="radio">
          <input
            type="radio"
            value="peeled"
            checked={cropState === "peeled"}
            onChange={(e) => setCropState(e.target.value)}
          />
          Peeled / Edible
        </label>

        <label className="radio">
          <input
            type="radio"
            value="unpeeled"
            checked={cropState === "unpeeled"}
            onChange={(e) => setCropState(e.target.value)}
          />
          Unpeeled (With peel / husk)
        </label>

        <small className="nisab-note">
          Nisab: {NISAB_LITRES} L
        </small>
      </div>

      {/* IRRIGATION */}
      <div className="calc-card">
        <h3>Irrigation Method</h3>

        <label className="radio">
          <input
            type="radio"
            value="rain"
            checked={irrigation === "rain"}
            onChange={(e) => setIrrigation(e.target.value)}
          />
          Rain / River (10%)
        </label>
        <small className="radio-note">
          Natural irrigation without human effort.
        </small>

        <label className="radio">
          <input
            type="radio"
            value="artificial"
            checked={irrigation === "artificial"}
            onChange={(e) => setIrrigation(e.target.value)}
          />
          Well / Pump / Paid (5%)
        </label>
        <small className="radio-note">
          Irrigation involving cost or labor.
        </small>

        <label className="radio">
          <input
            type="radio"
            value="mixed"
            checked={irrigation === "mixed"}
            onChange={(e) => setIrrigation(e.target.value)}
          />
          Mixed Irrigation (6.67%)
        </label>
        <small className="radio-note">
          Both natural and artificial methods used.
        </small>
      </div>

      {/* RESULT */}
      <div className="result-box">
        {isZakatDue ? (
          <>
            <p className="due">Zakath is DUE</p>

            <p className="amount">
              Zakath to give:{" "}
              <strong>{zakatAmountLitres.toFixed(2)} L</strong>
            </p>

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