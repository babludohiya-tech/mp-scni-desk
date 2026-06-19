# MP SCNI Desk — Fee & Limitation Calculator

A professional web application for court staff and lawyers to calculate **Ad-Valorem Court Fees** and check **Limitation periods** for Cheque Bounce cases (Section 138 NI Act) under the Madhya Pradesh Court Fees (Amendment) Act, 2008.

## Features

- **Court Fee Calculator** — 3 MP slabs with ₹200 minimum and ₹1,50,000 cap
- **Limitation Checker** — Cheque validity (3 months) → Notice period (30 days) → Filing period (45 days)
- **Sequential workflow** — Limitation section appears only after fee is calculated
- **dd/mm/yyyy date format** — Auto-formatting with slash insertion
- **Time remaining display** — Shows remaining days or "exceeded by X days"
- **Indian Rupee formatting** — Proper lakh/crore grouping (₹ 1,50,000)
- **PWA support** — Installable on Android, works offline
- **Responsive design** — Works on mobile, tablet, and desktop

## Tech Stack

- Vanilla HTML5, CSS3, JavaScript (no frameworks, no build step)
- Progressive Web App (PWA) with Service Worker
- Google Fonts (Inter, Playfair Display)

## Deployment

This is a static site — just serve the files. No build step required.

### GitHub Pages (Recommended)
1. Push this repo to GitHub
2. Go to Settings → Pages → Source: Deploy from branch → `master` / `/ (root)`
3. Your app will be live at `https://USERNAME.github.io/mp-scni-desk/`

## License

For official court reference only. Not a substitute for legal advice.
