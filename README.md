# Polymarket P&L Dashboard

A real-time dashboard to track daily and weekly profit/loss across multiple Polymarket wallets. Built with React + Vite, deployed on Vercel (bypasses India geo-restriction automatically).

---

## 🚀 Quick Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Add your wallet addresses
Open `src/wallets.config.js` and add your wallets:

```js
const wallets = [
  {
    label: "Ghost Wallet 1",        // display name — anything you want
    address: "0xABC123...",         // actual wallet address
  },
  {
    label: "Ghost Wallet 2",
    address: "0xDEF456...",
  },
  {
    label: "Copy Wallet (Bot)",
    address: "0xGHI789...",
  },
];
```

You can add as many wallets as you want — just add more objects to the array.

### 3. Run locally
```bash
npm run dev
```
Open http://localhost:5173

> ⚠️ Note: Running locally in India will fail because Polymarket API is geo-blocked.
> Either use a VPN, or test after deploying to Vercel (which uses US servers).

---

## 🌐 Deploy to Vercel

### Option A — Vercel CLI (recommended)
```bash
npm install -g vercel
vercel
```
Follow the prompts. Vercel auto-detects Vite.

### Option B — GitHub + Vercel Dashboard
1. Push this project to a GitHub repo
2. Go to vercel.com → New Project → Import your repo
3. Vercel will auto-build and deploy

### Why Vercel bypasses the India geo-block
The `/api/trades.js` and `/api/positions.js` files are **Vercel Serverless Functions**.
When your browser calls `/api/trades?wallet=0x...`, the request goes to Vercel's US servers,
which then fetch from Polymarket. So Polymarket only sees a US IP — not your Indian IP.

---

## 📁 Project Structure

```
polymarket-dashboard/
├── api/
│   ├── trades.js          ← Vercel serverless: fetches trade history
│   └── positions.js       ← Vercel serverless: fetches open positions
├── src/
│   ├── wallets.config.js  ← ✅ ADD YOUR WALLETS HERE
│   ├── components/
│   │   ├── WalletCard.jsx    — per-wallet card with stats + chart
│   │   ├── PnLChart.jsx      — recharts area chart (daily / cumulative)
│   │   ├── TradeTable.jsx    — recent trades table
│   │   └── SummaryBar.jsx    — combined totals across all wallets
│   ├── hooks/
│   │   └── useWalletData.js  — data fetching + auto-refresh every 5 min
│   ├── utils/
│   │   └── pnlCalculator.js  — P&L math (daily, weekly, all-time)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── vercel.json
├── vite.config.js
└── package.json
```

---

## 📊 Features

- **Per wallet**: Today's P&L, Weekly P&L, All-Time P&L, Open Positions value
- **Combined summary bar** across all wallets at the top
- **Area chart** — toggle between Cumulative or Daily view
- **Trade history table** — last 20 trades per wallet
- **Auto-refresh** every 5 minutes
- **Dark terminal UI** — clean, professional look

---

## 🛠 Tech Stack

| | |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Fonts | Syne + Space Mono |
| Serverless | Vercel Functions (Node.js) |
| Data | Polymarket CLOB API + Gamma API |
