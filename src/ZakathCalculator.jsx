import { useState } from "react";
import "./ZakathCalculator.css";

import btnSilverGold from "./assets/buttons/btn-silver-gold.png";
import btnMoney from "./assets/buttons/btn-money.png";
import btnLivestock from "./assets/buttons/btn-livestock.png";
import btnCrops from "./assets/buttons/btn-crops.png";

import SilverGoldCalculator from "./SilverGoldCalculator";
import MoneyTradeCalculator from "./MoneyTradeCalculator";
import LivestockCalculator from "./LivestockCalculator";
import CropsCalculator from "./CropsCalculator";

export default function ZakathCalculator({ onBack }) {
  // null | silverGold | moneyTrade | livestock | crops
  const [activeCalc, setActiveCalc] = useState(null);

  /* ================= SILVER & GOLD ================= */
  if (activeCalc === "silverGold") {
    return <SilverGoldCalculator onBack={() => setActiveCalc(null)} />;
  }

  /* ================= MONEY & TRADE ================= */
  if (activeCalc === "moneyTrade") {
    return <MoneyTradeCalculator onBack={() => setActiveCalc(null)} />;
  }

  /* ================= LIVESTOCK ================= */
  if (activeCalc === "livestock") {
    return <LivestockCalculator onBack={() => setActiveCalc(null)} />;
  }

  /* ================= CROPS & FRUITS ================= */
  if (activeCalc === "crops") {
    return <CropsCalculator onBack={() => setActiveCalc(null)} />;
  }

  /* ================= MAIN MENU ================= */
  return (
    <div className="zakath-screen">
      <button className="zakath-back" onClick={onBack}>
        BACK
      </button>

      <div className="zakath-title">
        <h1 className="Head1">
          ZAKATH
          <p className="Head2">CALCULATOR</p>
        </h1>
      </div>

      <div className="zakath-box">
        <button
          className="zakath-btn"
          onClick={() => setActiveCalc("silverGold")}
        >
          <img src={btnSilverGold} alt="Silver & Gold" />
          <span className="btn-text">Silver & Gold</span>
        </button>

        <button
          className="zakath-btn"
          onClick={() => setActiveCalc("moneyTrade")}
        >
          <img src={btnMoney} alt="Trade Goods & Money" />
          <span className="btn-text">Trade Goods & Money</span>
        </button>

        <button
          className="zakath-btn"
          onClick={() => setActiveCalc("livestock")}
        >
          <img src={btnLivestock} alt="Livestock" />
          <span className="btn-text">Livestock</span>
        </button>

        <button
          className="zakath-btn"
          onClick={() => setActiveCalc("crops")}
        >
          <img src={btnCrops} alt="Crops & Fruits" />
          <span className="btn-text">Crops & Fruits</span>
        </button>

        <h2 className="Head3">SELECT</h2>
      </div>
    </div>
  );
}
