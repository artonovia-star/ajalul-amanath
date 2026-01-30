import { useState } from "react";
import { useAuth } from "./AuthContext";
import useReminders from "./useReminders";
import "./LivestockCalculator.css";

export default function LivestockCalculator({ onBack }) {
  const { user } = useAuth();
  const { addReminder } = useReminders(user);

  const [animalType, setAnimalType] = useState("sheep");
  const [count, setCount] = useState("");

  const num = (v) => Number(v) || 0;

  /* ================= ZAKATH LOGIC (SHAFI'I) ================= */

  const formatSheepZakath = (qty) => {
    if (qty === 1) {
      return "1 ضأن (1 year old) OR 1 معز (2 years old)";
    }
    return `${qty} ضأن (1 year old) OR ${qty} معز (2 years old)`;
  };

  const calculateCamelZakath = (n) => {
    if (n < 5) return "No Zakath due";
    if (n <= 9) return "1 sheep";
    if (n <= 14) return "2 sheep";
    if (n <= 19) return "3 sheep";
    if (n <= 24) return "4 sheep";
    if (n <= 35) return "1 Bint Makhad (1-year-old female camel)";
    if (n <= 45) return "1 Bint Labun (2-year-old female camel)";
    if (n <= 60) return "1 Hiqqah (3-year-old female camel)";
    if (n <= 75) return "1 Jadhaʿah (4-year-old female camel)";
    if (n <= 90) return "2 Bint Labun (2-year-old female camels)";
    if (n <= 120) return "2 Hiqqah (3-year-old female camels)";

    // 121+ → calculate using 40s & 50s
    let remaining = n;
    let bintLabun = 0;
    let hiqqah = 0;

    // Prefer 50s when possible (fiqh-valid approach)
    while (remaining >= 50) {
      remaining -= 50;
      hiqqah++;
    }

    while (remaining >= 40) {
      remaining -= 40;
      bintLabun++;
    }

    let result = [];
    if (hiqqah > 0) result.push(`${hiqqah} Hiqqah`);
    if (bintLabun > 0) result.push(`${bintLabun} Bint Labun`);

    return result.join(" and ");
  };

  const getZakath = () => {
    const n = num(count);
    if (n <= 0) return null;

    //  SHEEP & GOATS
    if (animalType === "sheep") {
      if (n < 40) return "No Zakath due";

      let sheepDue = 0;
      if (n <= 120) sheepDue = 1;
      else if (n <= 200) sheepDue = 2;
      else if (n <= 399) sheepDue = 3;
      else sheepDue = Math.floor(n / 100);

      return formatSheepZakath(sheepDue);
    }

    //  CATTLE
    if (animalType === "cattle") {
      if (n < 30) return "No Zakath due";
      if (n < 40) return "1 Tabiʿ (1-year-old calf)";
      if (n < 60) return "1 Musinnah (2-year-old cow)";
      if (n === 60) return "2 Tabiʿ";

      // 61+ → calculate in 30s & 40s
      let remaining = n;
      let tabi = 0;
      let musinnah = 0;

      while (remaining >= 40) {
        remaining -= 40;
        musinnah++;
      }

      while (remaining >= 30) {
        remaining -= 30;
        tabi++;
      }

      let result = [];
      if (musinnah > 0) result.push(`${musinnah} Musinnah`);
      if (tabi > 0) result.push(`${tabi} Tabiʿ`);

      return result.join(" and ");
    }

    //  CAMELS
    if (animalType === "camel") {
      return calculateCamelZakath(n);
    }

    return null;
  };

  const zakathResult = getZakath();
  const zakathDue =
    zakathResult &&
    !zakathResult.toLowerCase().includes("no zakath");

  /* ================= REMINDER HANDLER ================= */

  const handleAddToReminder = () => {
    const success = addReminder({
      type: "Livestock",
      zakathAmount: zakathResult,
      details: {
        "Animal Type":
          animalType.charAt(0).toUpperCase() + animalType.slice(1),
        "Total Count": `${count} animals`,
        "Zakāh Due": zakathResult,
      },
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

      <h2 className="title">Livestock Zakath</h2>
      <p className="subtitle">Shafi'ee Madhhab · Fathul Mueen</p>

      <div className="calc-card">
        <h3>Animal Type</h3>

        <div className="animal-select">
          <button
            className={animalType === "sheep" ? "active" : ""}
            onClick={() => setAnimalType("sheep")}
          >
             Sheep & Goats
          </button>

          <button
            className={animalType === "cattle" ? "active" : ""}
            onClick={() => setAnimalType("cattle")}
          >
             Cattle
          </button>

          <button
            className={animalType === "camel" ? "active" : ""}
            onClick={() => setAnimalType("camel")}
          >
             Camels
          </button>
        </div>
      </div>

      <div className="calc-card">
        <h3>Number of Animals</h3>

        <div className="input-group">
          <input
            type="number"
            placeholder="Enter total count"
            value={count}
            onChange={(e) => setCount(e.target.value)}
          />
        </div>

        <small className="nisab-note">
          Grazing · not for work · one lunar year completed
        </small>
      </div>

      <div className="result-box">
        <p className="result-b">Zakath Ruling</p>

        {zakathResult ? (
          <>
            <h2>{zakathResult}</h2>

            {zakathDue && (
              <button
                className="add-reminder-btn"
                onClick={handleAddToReminder}
              >
                ＋ Add to Reminder
              </button>
            )}
          </>
        ) : (
          <p className="not-due">Enter animal count</p>
        )}

        <p className="fiqh-note">
          Zakath is given in animals, not money (Shafi'ee Madhhab)
        </p>
      </div>
    </div>
  );
}
