import { useState } from "react";
import "./ZakathCalculator.css";

import SilverGoldCalculator from "./SilverGoldCalculator";
import MoneyTradeCalculator from "./MoneyTradeCalculator";
import LivestockCalculator from "./LivestockCalculator";
import CropsCalculator from "./CropsCalculator";

export default function ZakathCalculator({ onBack }) {
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
      {/* Header Section */}
      <div className="zakath-header">
        <button className="zakath-back" onClick={onBack}>
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Back</span>
        </button>
      </div>

      {/* Title Section */}
      <div className="zakath-title-section">
        <div className="title-icon-wrapper">
          <span className="material-symbols-outlined">calculate</span>
        </div>
        <h1 className="zakath-main-title">Zakath Calculator</h1>
        <p className="zakath-subtitle">Choose a category to calculate your Zakath</p>
      </div>

      {/* Calculator Grid */}
      <div className="zakath-calculator-grid">
        <button
          className="calculator-card silver-gold-card"
          onClick={() => setActiveCalc("silverGold")}
        >
          <div className="card-shimmer"></div>
          <div className="card-icon-section">
            <span className="material-symbols-outlined">diamond</span>
          </div>
          <div className="card-text-section">
            <h3 className="card-title">Silver & Gold</h3>
            <p className="card-description">Calculate on precious metals</p>
          </div>
          <div className="card-arrow-icon">
            <span className="material-symbols-outlined">arrow_forward</span>
          </div>
        </button>

        <button
          className="calculator-card money-card"
          onClick={() => setActiveCalc("moneyTrade")}
        >
          <div className="card-shimmer"></div>
          <div className="card-icon-section">
            <span className="material-symbols-outlined">account_balance_wallet</span>
          </div>
          <div className="card-text-section">
            <h3 className="card-title">Trade Goods & Money</h3>
            <p className="card-description">Calculate on cash & trade items</p>
          </div>
          <div className="card-arrow-icon">
            <span className="material-symbols-outlined">arrow_forward</span>
          </div>
        </button>

        <button
          className="calculator-card livestock-card"
          onClick={() => setActiveCalc("livestock")}
        >
          <div className="card-shimmer"></div>
          <div className="card-icon-section">
            <span className="material-symbols-outlined">pets</span>
          </div>
          <div className="card-text-section">
            <h3 className="card-title">Livestock</h3>
            <p className="card-description">Calculate on animals & cattle</p>
          </div>
          <div className="card-arrow-icon">
            <span className="material-symbols-outlined">arrow_forward</span>
          </div>
        </button>

        <button
          className="calculator-card crops-card"
          onClick={() => setActiveCalc("crops")}
        >
          <div className="card-shimmer"></div>
          <div className="card-icon-section">
            <span className="material-symbols-outlined">agriculture</span>
          </div>
          <div className="card-text-section">
            <h3 className="card-title">Crops & Fruits</h3>
            <p className="card-description">Calculate on agricultural produce</p>
          </div>
          <div className="card-arrow-icon">
            <span className="material-symbols-outlined">arrow_forward</span>
          </div>
        </button>
      </div>

      {/* Footer Info */}
      
    </div>
  );
}