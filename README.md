# FinPlan India - Premium static financial calculators

A blazing-fast, lightweight, offline-first personal finance planner and calculators suite tailored for Indian retail investors. Built with a minimal, premium aesthetic inspired by Apple, Vercel, and Linear, using **zero external dependencies, zero frameworks, and zero tracking**.

## Key Features

- **25 Personal Finance Calculators**: Covers Mutual Funds, SWP, Retirement, FIRE, Goals (Education, Marriage, Downpayments), Portfolio, Loans, and Taxes.
- **Mathematical Accuracy**: Investment growth calculators use true **CAGR equivalent monthly returns** `(1 + annualRate)^(1/12) - 1` rather than dividing by 12.
- **Pure SVG Rendering**: Interactive, responsive multi-line graphs and donut allocation charts rendered programmatically.
- **Indian Taxation Estimator**: Evaluates Equity LTCG (12.5% tax, ₹1.25L exemption as of FY 2024-25) and debt/custom tax rates.
- **100% Client-Side Exports**: Instantly export calculations to Excel-compatible UTF-8 CSV or JSON formats.
- **Interactive Syncing**: Parameters sync to URL queries dynamically so users can bookmark and share results.
- **Offline & Static-Ready**: Works out-of-the-box locally, on GitHub Pages, Netlify, Cloudflare Pages, or any static host.
- **Dark Mode Support**: Seamless light/dark mode preference synced with `localStorage`.

---

## Directory Structure

```
/
├── index.html                  - Main dashboard / listing page
├── sitemap.xml                 - SEO sitemap for index search optimization
├── robots.txt                  - Search engine crawler directives
├── build.js                    - Node.js script compiling pages programmatically
├── css/
│   └── style.css               - CSS variables, responsive grids, custom sliders, print sheets
└── js/
    ├── engine.js               - Financial compounding math, XIRR solver, SVG charts, CSV exports
    └── shared.js               - Dynamic header, side nav rendering, theme persistent storage
```

---

## Mathematical Equations

### 1. CAGR Monthly Equivalent Compound Rate
To maintain precision, annual growth is compounded geometrically:
$$\text{monthlyRate} = (1 + \text{annualRate})^{1/12} - 1$$

### 2. SIP Future Value (FV)
$$\text{FV} = P \times \frac{(1 + \text{monthlyRate})^m - 1}{\text{monthlyRate}} \times (1 + \text{monthlyRate})$$
Where:
- $P$ is the monthly investment amount
- $m$ is the total months ($years \times 12$)

### 3. Inflation Parity
$$\text{realValue} = \frac{\text{nominalValue}}{(1 + \text{inflation})^n}$$
Where $n$ is duration in years.

### 4. Indian LTCG Capital Gains Tax (Equities)
As per the Indian Budget 2024:
$$\text{Taxable Gains} = \max(0, \text{Total Gains} - 1,25,000)$$
$$\text{Estimated Tax} = \text{Taxable Gains} \times 12.5\%$$

---

## How to Run Locally

Since the project is built with vanilla HTML/CSS/JS, you can run it directly by opening `index.html` in your browser.

To run with a local web server (for absolute URLs and sitemaps testing):

### Using Python (Standard)
```bash
python3 -m http.server 8000
```
Then navigate to `http://localhost:8000`.

### Using Node.js (Live Server)
```bash
npx live-server
```

---

## Compiling / Customizing Calculators
If you make changes to templates or add new calculators, you can modify `build.js` and re-run:
```bash
node build.js
```

---

## Deployment Instructions

### GitHub Pages
1. Push this repository to GitHub.
2. Go to **Settings > Pages** in your GitHub repository.
3. Select **Deploy from a branch**, choose `main` (or the respective branch) and `/ (root)` folder.
4. Click **Save**.

### Netlify
1. Log into Netlify.
2. Select **Add new site > Import from Git**.
3. Choose your repository.
4. Keep the **Build command** empty and **Publish directory** as `.` (root).
5. Click **Deploy**.

### Cloudflare Pages
1. Log into your Cloudflare dashboard and select **Workers & Pages**.
2. Select **Create application > Pages > Connect to Git**.
3. Choose your repository.
4. Select **None** as the framework preset.
5. Keep **Build command** empty and **Build output directory** as `/` or leave empty.
6. Click **Save and Deploy**.
