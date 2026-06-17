const fs = require('fs');
const path = require('path');

// Ensure directories exist
const calcDir = path.join(__dirname, 'calculators');
if (!fs.existsSync(calcDir)) {
  fs.mkdirSync(calcDir, { recursive: true });
}
if (!fs.existsSync(path.join(__dirname, 'css'))) {
  fs.mkdirSync(path.join(__dirname, 'css'));
}
if (!fs.existsSync(path.join(__dirname, 'js'))) {
  fs.mkdirSync(path.join(__dirname, 'js'));
}

// -------------------------------------------------------------
// HTML LAYOUT TEMPLATE FOR CALCULATORS
// -------------------------------------------------------------

function getCalculatorHtml(calc) {
  // Generate inputs HTML
  let inputsHtml = '';
  calc.inputs.forEach(input => {
    // Determine prefix / suffix
    let prefixHtml = '';
    let suffixHtml = '';
    const id = input.id.toLowerCase();
    const label = input.label.toLowerCase();
    
    if (id.includes('sip') || id.includes('amount') || id.includes('principal') || id.includes('withdrawal') || id.includes('lump') || id.includes('corpus') || id.includes('worth') || id.includes('cost') || id.includes('payment') || id.includes('value') || id.includes('rent') || id.includes('salary') || id.includes('fee') || id.includes('income') || id.includes('expense') || id.includes('emi') || id.includes('loan') || id.includes('cap') || label.includes('₹') || label.includes('amount') || /\brs\b/.test(label) || label.includes('rupees') || label.includes('investment') || label.includes('value')) {
      prefixHtml = `<span class="input-prefix">₹</span>`;
    }
    
    if (id.includes('rate') || id.includes('return') || id.includes('percent') || id.includes('inflation') || id.includes('tax') || id.includes('ratio') || id.includes('allocation') || id.includes('yield') || label.includes('%') || label.includes('rate') || label.includes('return')) {
      suffixHtml = `<span class="input-suffix">%</span>`;
    } else if (id.includes('year') || id.includes('duration') || id.includes('period') || id.includes('term') || id.includes('age') || label.includes('year') || label.includes('duration') || label.includes('period')) {
      suffixHtml = `<span class="input-suffix">Yrs</span>`;
    } else if (id.includes('month') || label.includes('month')) {
      suffixHtml = `<span class="input-suffix">Mo</span>`;
    }
    
    // Clean up label of any unit suffix to avoid redundancy
    let displayLabel = input.label.replace(/\s*\([\u20B9₹%]\)/g, '').trim();
    displayLabel = displayLabel.replace(/\s*\(years\)/gi, '').trim();
    displayLabel = displayLabel.replace(/\s*\(cagr\s*%\)/gi, '').trim();

    if (input.type === 'slider' || input.type === 'number') {
      const stepVal = input.step || 1;
      const minVal = input.min !== undefined ? input.min : 0;
      
      inputsHtml += `
        <div class="input-group">
          <div class="input-label-row">
            <label for="${input.id}" class="draggable-label">${displayLabel}</label>
          </div>
          <div class="input-wrapper">
            ${prefixHtml}
            <input type="number" id="${input.id}" min="${minVal}" step="${stepVal}" value="${input.value}" aria-label="${displayLabel}">
            ${suffixHtml}
            <div class="input-steppers">
              <button class="step-btn" type="button" tabindex="-1">-</button>
              <button class="step-btn" type="button" tabindex="-1">+</button>
            </div>
          </div>
        </div>
      `;
    } else if (input.type === 'select') {
      inputsHtml += `
        <div class="input-group">
          <div class="input-label-row">
            <label for="${input.id}">${displayLabel}</label>
          </div>
          <div class="input-wrapper">
            <select id="${input.id}" aria-label="${displayLabel}">
              ${input.options.map(o => `<option value="${o.value}" ${o.value === input.value ? 'selected' : ''}>${o.label}</option>`).join('')}
            </select>
          </div>
        </div>
      `;
    }
  });

  // Check if compounding is supported
  let compoundingSectionHtml = '';
  if (calc.supportCompounding) {
    compoundingSectionHtml = `
      <div class="settings-section">
        <div class="settings-toggle" id="compounding-toggle">
          <span>Compounding Frequency</span>
          <svg viewBox="0 0 24 24" width="14" height="14"><path d="M7 10l5 5 5-5z"/></svg>
        </div>
        <div class="settings-content" id="compounding-settings-content">
          <div class="input-group" style="margin-top: 1rem;">
            <label for="compounding-freq" style="font-size: 0.85rem; font-weight:600; display:block; margin-bottom:0.4rem;">Compounding Method</label>
            <div class="input-wrapper">
              <select id="compounding-freq" style="font-size: 0.85rem; padding: 0.5rem;">
                <option value="monthly" selected>Monthly Compounding (Standard MF)</option>
                <option value="yearly">Yearly Compounding</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Check if taxation is supported
  let taxSectionHtml = '';
  if (calc.supportTax) {
    taxSectionHtml = `
      <div class="settings-section">
        <div class="settings-toggle" id="tax-toggle">
          <span>Taxation Settings (Indian IT Rules)</span>
          <svg viewBox="0 0 24 24" width="14" height="14"><path d="M7 10l5 5 5-5z"/></svg>
        </div>
        <div class="settings-content" id="tax-settings-content">
          <div class="input-group" style="margin-top: 1rem;">
            <label for="tax-type" style="font-size: 0.85rem; font-weight:600; display:block; margin-bottom:0.4rem;">Asset Class Tax Type</label>
            <div class="input-wrapper">
              <select id="tax-type" style="font-size: 0.85rem; padding: 0.5rem;">
                <option value="none">No Tax Estimation</option>
                <option value="equity_ltcg" selected>Equity LTCG (12.5% tax, ₹1.25L Exemption)</option>
                <option value="equity_stcg">Equity STCG (20.0% flat tax)</option>
                <option value="slab">Income Tax Slab Rate</option>
              </select>
            </div>
          </div>
          <div class="input-group" id="custom-tax-group" style="display: none; margin-top: 1rem;">
            <div class="input-label-row">
              <label for="custom-tax-rate" class="draggable-label">Flat Tax Rate / Slab (%)</label>
            </div>
            <div class="input-wrapper">
              <input type="number" id="custom-tax-rate" min="0" max="50" step="1" value="30">
              <span class="input-suffix">%</span>
              <div class="input-steppers">
                <button class="step-btn" type="button" tabindex="-1">-</button>
                <button class="step-btn" type="button" tabindex="-1">+</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Check if inflation is supported
  let inflationSectionHtml = '';
  if (calc.supportInflation) {
    inflationSectionHtml = `
      <div class="settings-section">
        <div class="settings-toggle" id="inflation-toggle">
          <span>Inflation Adjustment</span>
          <svg viewBox="0 0 24 24" width="14" height="14"><path d="M7 10l5 5 5-5z"/></svg>
        </div>
        <div class="settings-content" id="inflation-settings-content">
          <div class="input-group" style="margin-top: 1rem;">
            <div class="input-label-row">
              <label for="inflation-rate" class="draggable-label">Expected Annual Inflation (%)</label>
            </div>
            <div class="input-wrapper">
              <input type="number" id="inflation-rate" min="0" max="15" step="0.5" value="6">
              <span class="input-suffix">%</span>
              <div class="input-steppers">
                <button class="step-btn" type="button" tabindex="-1">-</button>
                <button class="step-btn" type="button" tabindex="-1">+</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Generate metric summary cards
  let metricsHtml = '';
  calc.results.forEach((metric, idx) => {
    let subHtml = '';
    let label = metric.label;
    if (metric.id === 'adjusted-corpus') {
      label = "Real Corpus (Today's Purchasing Power)";
      subHtml = `<span class="metric-sub" id="real-gain-loss">-</span>`;
    } else if (metric.subLabel) {
      subHtml = `<span class="metric-sub">${metric.subLabel}</span>`;
    }
    const isConditionalTax = metric.conditional === 'tax';
    metricsHtml += `
      <div class="metric-card${isConditionalTax ? ' metric-card-conditional' : ''}" ${isConditionalTax ? 'data-conditional="tax" style="display:none;"' : ''}>
        <span class="metric-label">${label}</span>
        <span class="metric-value" id="${metric.id}">-</span>
        ${subHtml}
      </div>
    `;
  });

  // Breadcrumb / URL parameter schema Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FinancialCalculator",
    "name": calc.title,
    "description": calc.metaDescription,
    "url": `https://finplanindia.com/calculators/${calc.filename}`,
    "category": "Financial Tool"
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${calc.title} - India | FinPlan India</title>
  <meta name="description" content="${calc.metaDescription}">
  <meta name="keywords" content="${calc.keywords}">
  <meta name="author" content="FinPlan India">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${calc.title} - Indian Mutual Fund & Personal Finance Planner">
  <meta property="og:description" content="${calc.metaDescription}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://finplanindia.com/calculators/${calc.filename}">
  <meta property="og:site_name" content="FinPlan India">
  
  <link rel="stylesheet" href="../css/style.css">
  <script type="application/ld+json">
    ${JSON.stringify(jsonLd, null, 2)}
  </script>
</head>
<body>
  <div class="app-container">
    <header id="global-header"></header>
    
    <div class="main-content">
      <aside id="global-sidebar" class="sidebar"></aside>
      
      <main class="calculator-workspace">
        <div class="calculator-header">
          <h1>${calc.title}</h1>
          <p class="calculator-description">${calc.subtitle || calc.metaDescription}</p>
        </div>
        
        <!-- Top Section: Parameters (Inputs) | Results (Summary Cards) -->
        <div class="calculator-top-section">
          <!-- Inputs Card (core numeric parameters only) -->
          <div class="inputs-card">
            ${inputsHtml}
            ${calc.customInputsHtml || ''}
          </div>
          
          <!-- Results Summary Card -->
          <div class="results-summary-card">
            <span class="results-title">Calculated Results</span>
            <div class="summary-grid">
              ${metricsHtml}
            </div>
          </div>
        </div>
        
        <!-- Horizontal Settings Bar (Compounding / Inflation / Tax) -->
        ${(calc.supportCompounding || calc.supportInflation || calc.supportTax) ? `
        <div class="settings-bar">
          ${calc.supportCompounding ? `
          <div class="settings-bar-item">
            <span class="settings-bar-label">Compounding</span>
            <div class="settings-bar-toggle">
              <button class="toggle-btn toggle-btn-active" id="freq-monthly-btn" type="button">Monthly</button>
              <button class="toggle-btn" id="freq-yearly-btn" type="button">Yearly</button>
            </div>
            <input type="hidden" id="compounding-freq" value="monthly">
          </div>` : ''}
          ${calc.supportInflation ? `
          <div class="settings-bar-item">
            <span class="settings-bar-label">Inflation</span>
            <div class="input-wrapper" style="width:120px;">
              <input type="number" id="inflation-rate" min="0" max="15" step="0.5" value="6" style="padding:0.4rem 0.5rem;font-size:0.9rem;">
              <span class="input-suffix">%</span>
            </div>
          </div>` : ''}
          ${calc.supportTax ? `
          <div class="settings-bar-item">
            <span class="settings-bar-label">Taxation</span>
            <div class="input-wrapper" style="width:260px;">
              <select id="tax-type" style="font-size:0.85rem;padding:0.4rem 0.5rem;">
                <option value="none">No Tax Estimation</option>
                <option value="equity_ltcg" selected>Equity LTCG (12.5%, ₹1.25L exempt)</option>
                <option value="equity_stcg">Equity STCG (20% flat)</option>
                <option value="slab">Income Tax Slab Rate</option>
              </select>
            </div>
          </div>
          <div class="settings-bar-item" id="custom-tax-group" style="display:none;">
            <span class="settings-bar-label">Slab Rate</span>
            <div class="input-wrapper" style="width:100px;">
              <input type="number" id="custom-tax-rate" min="0" max="50" step="1" value="30" style="padding:0.4rem 0.5rem;font-size:0.9rem;">
              <span class="input-suffix">%</span>
            </div>
          </div>` : ''}
        </div>` : ''}
        
        <!-- Graph Section (Full Width) -->
        ${calc.noChart ? '' : `
        <div class="chart-card full-width-card">
          <div class="chart-header">
            <span class="chart-title">Visual Projection</span>
            <div class="chart-legend" id="chart-legend-container">
              ${calc.chartLegend || `
                <div class="legend-item"><span class="legend-color" style="background-color: var(--text-secondary);"></span>Invested</div>
                <div class="legend-item"><span class="legend-color" style="background-color: var(--accent-color);"></span>Corpus</div>
                ${calc.supportInflation ? `<div class="legend-item"><span class="legend-color" style="background-color: var(--success-color);"></span>Real Value</div>` : ''}
              `}
            </div>
          </div>
          <div class="chart-svg-container" id="chart-container"></div>
        </div>
        `}
        
        <!-- Table Section (Full Width) -->
        ${calc.noTable ? '' : `
        <div class="action-toolbar full-width-toolbar">
          <button class="btn btn-secondary" id="btn-copy-table">Copy Table</button>
          <button class="btn btn-secondary" id="btn-export-json">Export JSON</button>
          <button class="btn btn-primary" id="btn-export-csv">Export CSV</button>
        </div>
        
        <div class="table-card full-width-card">
          <span class="table-title">Yearly Breakdowns</span>
          <table id="projections-table">
            <thead>
              <tr id="table-headers-row">
                <!-- Headers generated in JS -->
              </tr>
            </thead>
            <tbody id="table-body">
              <!-- Data generated in JS -->
            </tbody>
          </table>
        </div>
        `}
        
        <!-- SEO Content -->
        <section class="seo-content">
          ${calc.seoContent}
        </section>
      </main>
    </div>
    
    <footer id="global-footer"></footer>
  </div>

  <script src="../js/engine.js"></script>
  <script src="../js/shared.js"></script>
  <script>
    // Calculator Specific Script
    document.addEventListener('DOMContentLoaded', () => {
      ${calc.bindingScript}
    });
  </script>
</body>
</html>`;
}

// -------------------------------------------------------------
// 25 CALCULATORS CONFIGURATIONS & INTERACTIVE SCRIPTS
// -------------------------------------------------------------

const calculators = [
  // 1. SIP Calculator
  {
    filename: 'sip.html',
    title: 'SIP Calculator',
    metaDescription: 'Calculate your mutual fund SIP (Systematic Investment Plan) returns in real-time. Optimize for Indian mutual funds with inflation adjustment and capital gains taxation.',
    keywords: 'sip calculator, mutual fund sip, sip interest, cagr compounding, ltcg tax equity',
    inputs: [
      { id: 'monthly_sip', label: 'Monthly SIP (₹)', min: 500, max: 200000, step: 500, value: 10000, type: 'slider', displayValue: '₹10,000' },
      { id: 'return_rate', label: 'Expected Annual Return (CAGR %)', min: 1, max: 30, step: 0.5, value: 12, type: 'slider', displayValue: '12%' },
      { id: 'years', label: 'Duration (Years)', min: 1, max: 40, step: 1, value: 15, type: 'slider', displayValue: '15' }
    ],
    results: [
      { id: 'total-invested', label: 'Invested Amount' },
      { id: 'total-gains', label: 'Total Gains' },
      { id: 'total-corpus', label: 'Nominal Corpus' },
      { id: 'adjusted-corpus', label: 'Inflation Adjusted' },
      { id: 'post-tax-corpus', label: 'Post-Tax Corpus', conditional: 'tax' }
    ],
    supportTax: true,
    supportInflation: true,
    seoContent: `
      <h2>Understanding Mutual Fund SIP Compounding</h2>
      <p>A Systematic Investment Plan (SIP) allows you to invest a fixed amount regularly in mutual funds, helping you benefit from rupee cost averaging and power of compounding.</p>
      <h3>Formula & Mathematical Approach</h3>
      <p>Unlike standard simple calculators that divide the rate by 12, our system computes compounding returns based on the true <strong>monthly equivalent CAGR</strong> rate:</p>
      <div class="formula-box">
        <math display="block">
          <mi>i</mi>
          <mo>=</mo>
          <msup>
            <mrow>
              <mo>(</mo>
              <mn>1</mn>
              <mo>+</mo>
              <mfrac>
                <mi>annualRate</mi>
                <mn>100</mn>
              </mfrac>
              <mo>)</mo>
            </mrow>
            <mfrac>
              <mn>1</mn>
              <mn>12</mn>
            </mfrac>
          </msup>
          <mo>−</mo>
          <mn>1</mn>
        </math>
        <math display="block">
          <mi>FV</mi>
          <mo>=</mo>
          <mi>P</mi>
          <mo>×</mo>
          <mfrac>
            <mrow>
              <msup>
                <mrow>
                  <mo>(</mo>
                  <mn>1</mn>
                  <mo>+</mo>
                  <mi>i</mi>
                  <mo>)</mo>
                </mrow>
                <mi>m</mi>
              </msup>
              <mo>−</mo>
              <mn>1</mn>
            </mrow>
            <mi>i</mi>
          </mfrac>
          <mo>×</mo>
          <mrow>
            <mo>(</mo>
            <mn>1</mn>
            <mo>+</mo>
            <mi>i</mi>
            <mo>)</mo>
          </mrow>
        </math>
      </div>
      <p>Where <em>P</em> is monthly SIP, <em>i</em> is monthly rate, and <em>m</em> is the total number of months.</p>
      <h3>Frequently Asked Questions</h3>
      <div class="faq-list">
        <div class="faq-item">
          <div class="faq-question">What is CAGR compounding?</div>
          <div class="faq-answer">Compound Annual Growth Rate (CAGR) measures the geometric progression ratio that provides a constant rate of return over the period. Using CAGR monthly compounding is the standard for retail investment evaluations.</div>
        </div>
        <div class="faq-item">
          <div class="faq-question">How is Equity LTCG taxed in India?</div>
          <div class="faq-answer">Starting FY 2024-25, Long-Term Capital Gains (LTCG) on equity investments are taxed at 12.5% for gains exceeding ₹1.25 Lakhs in a financial year.</div>
        </div>
      </div>
    `,
    bindingScript: `
      const defaults = { monthly_sip: 10000, return_rate: 12, years: 15, 'tax-type': 'equity', 'custom-tax-rate': 20, 'inflation-rate': 6 };
      let state = FinanceEngine.getUrlParams(defaults);
      
      const elements = ['monthly_sip', 'return_rate', 'years', 'tax-type', 'custom-tax-rate', 'inflation-rate'];
      
      function syncUI() {
        elements.forEach(id => {
          const el = document.getElementById(id);
          if (!el) return;
          el.value = state[id];
          const valDisplay = document.getElementById(id + '-val');
          if (valDisplay) {
            if (id === 'monthly_sip') valDisplay.textContent = FinanceEngine.formatINR(state[id]);
            else if (id === 'return_rate' || id === 'custom-tax-rate' || id === 'inflation-rate') valDisplay.textContent = state[id] + '%';
            else valDisplay.textContent = state[id];
          }
        });
        
        // Hide/show flat tax input based on selection
        const customTaxGroup = document.getElementById('custom-tax-group');
        if (customTaxGroup) {
          customTaxGroup.style.display = state['tax-type'] === 'custom' ? 'block' : 'none';
        }
      }
      
      function calculate() {
        const P = isNaN(state.monthly_sip) ? 10000 : state.monthly_sip;
        const annualRate = isNaN(state.return_rate) ? 12 : state.return_rate;
        const years = isNaN(state.years) || state.years <= 0 ? 15 : state.years;
        const i = FinanceEngine.getMonthlyRate(annualRate);
        const months = years * 12;
        const compoundingFreq = state['compounding-freq'] || 'monthly';
        
        const totalInvested = P * months;
        const fv = P * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
        const totalGains = fv - totalInvested;
        
        // Inflation adjustment
        const inflationRate = state['inflation-rate'];
        const r_real = ((1 + annualRate / 100) / (1 + inflationRate / 100)) - 1;
        const realCorpus = FinanceEngine.getRealValue(fv, inflationRate, years);
        const realGains = realCorpus - totalInvested;
        
        // Tax estimation
        const taxResults = FinanceEngine.estimateTax(totalGains, state['tax-type'], state['custom-tax-rate']);
        const estimatedTax = taxResults.tax;
        const postTaxCorpus = fv - estimatedTax;
        
        // Update summary cards
        document.getElementById('total-invested').textContent = FinanceEngine.formatINRSmart(totalInvested);
        document.getElementById('total-gains').textContent = FinanceEngine.formatINRSmart(totalGains);
        document.getElementById('total-corpus').textContent = FinanceEngine.formatINRSmart(fv);
        document.getElementById('adjusted-corpus').textContent = FinanceEngine.formatINRSmart(realCorpus);
        const realGainLossEl = document.getElementById('real-gain-loss');
        if (realGainLossEl) {
          const realCAGR = (r_real * 100).toFixed(2);
          realGainLossEl.innerHTML = "Real CAGR: " + realCAGR + "% &nbsp;&middot;&nbsp; Real Gain: " + FinanceEngine.formatINRSmart(realGains);
        }
        // Post-tax card (conditional)
        const postTaxEl = document.getElementById('post-tax-corpus');
        if (postTaxEl) postTaxEl.textContent = FinanceEngine.formatINRSmart(postTaxCorpus);
        document.querySelectorAll('[data-conditional="tax"]').forEach(el => {
          el.style.display = (state['tax-type'] && state['tax-type'] !== 'none') ? '' : 'none';
        });
        
        // Populate Table
        const tableBody = document.getElementById('table-body');
        const headersRow = document.getElementById('table-headers-row');
        
        const headers = ['Year', 'Invested', 'Returns', 'Corpus', 'Real Corpus', 'Taxable Gains', 'Estimated Tax', 'Post-Tax Corpus'];
        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');
        
        let tableRows = [];
        let runningBalance = 0;
        let cumulativeInvested = 0;
        
        for (let y = 1; y <= years; y++) {
          const startMonth = (y - 1) * 12 + 1;
          const endMonth = y * 12;
          
          if (compoundingFreq === 'monthly') {
            for (let m = startMonth; m <= endMonth; m++) {
              cumulativeInvested += P;
              runningBalance = (runningBalance + P) * (1 + i);
            }
          } else {
            const rate = annualRate / 100;
            const interestOnStart = runningBalance * rate;
            const interestOnDeposits = P * rate * 6.5;
            
            cumulativeInvested += P * 12;
            runningBalance = runningBalance + (P * 12) + interestOnStart + interestOnDeposits;
          }
          
          const runningRealBalance = FinanceEngine.getRealValue(runningBalance, inflationRate, y);
          
          const yGains = runningBalance - cumulativeInvested;
          const yTaxResults = FinanceEngine.estimateTax(yGains, state['tax-type'], state['custom-tax-rate']);
          const yPostTaxCorpus = runningBalance - yTaxResults.tax;
          
          tableRows.push([
            y,
            Math.round(cumulativeInvested),
            Math.round(yGains),
            Math.round(runningBalance),
            Math.round(runningRealBalance),
            Math.round(yTaxResults.taxableGains),
            Math.round(yTaxResults.tax),
            Math.round(yPostTaxCorpus)
          ]);
        }
        
        tableBody.innerHTML = tableRows.map(row => 
          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINR(v, false)) + '</td>').join('') + '</tr>'
        ).join('');
        
        // Update Chart
        const chartData = tableRows.map(row => ({
          label: 'Yr ' + row[0],
          invested: row[1],
          gains: row[2],
          nominal: row[3],
          real: row[4]
        }));
        FinanceEngine.renderLineChart('chart-container', chartData,
          ['invested', 'gains', 'nominal', 'real'],
          ['#6e6e73', '#ff9f0a', '#0071e3', '#30d158'],
          ['Invested', 'Net Gains', 'Corpus', 'Real Value']);
        
        // Bind Export Buttons
        const csvExporter = FinanceEngine.exportData('sip-calculator', 
          { 'Monthly SIP': P, 'Return CAGR %': annualRate, 'Years': years, 'Inflation %': inflationRate },
          { 'Invested Amount': totalInvested, 'Total Corpus': fv, 'Total Gains': totalGains, 'Inflation Adjusted': realCorpus, 'Estimated Tax': estimatedTax, 'Post-Tax Corpus': postTaxCorpus },
          headers,
          tableRows
        );
        
        // Remove old event listeners
        const btnCsv = document.getElementById('btn-export-csv');
        const btnJson = document.getElementById('btn-export-json');
        const btnCopy = document.getElementById('btn-copy-table');
        
        btnCsv.replaceWith(btnCsv.cloneNode(true));
        btnJson.replaceWith(btnJson.cloneNode(true));
        btnCopy.replaceWith(btnCopy.cloneNode(true));
        
        document.getElementById('btn-export-csv').addEventListener('click', csvExporter.exportCSV);
        document.getElementById('btn-export-json').addEventListener('click', csvExporter.exportJSON);
        document.getElementById('btn-copy-table').addEventListener('click', () => FinanceEngine.copyTableToClipboard(headers, tableRows));
      }
      
      // Event bindings
      elements.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', (e) => {
          state[id] = e.target.value;
          if (typeof defaults[id] === 'number') state[id] = parseFloat(state[id]);
          syncUI();
          calculate();
          FinanceEngine.updateUrlParams(state);
        });
      });
      
      syncUI();
      calculate();
    `
  },
  // 2. Step-Up SIP Calculator
  {
    filename: 'step-up-sip.html',
    title: 'Step-Up SIP Calculator',
    metaDescription: 'Maximize compounding by stepping up your monthly SIP contributions annually. Model compound interest, target inflation rates, and capital gains tax on mutual funds.',
    keywords: 'step-up sip calculator, mutual fund step up, annual step up sip, compounding planner',
    inputs: [
      { id: 'starting_sip', label: 'Starting Monthly SIP (₹)', min: 500, max: 200000, step: 500, value: 10000, type: 'slider', displayValue: '₹10,000' },
      { id: 'step_up_pct', label: 'Annual Step-Up (%)', min: 1, max: 30, step: 1, value: 10, type: 'slider', displayValue: '10%' },
      { id: 'return_rate', label: 'Expected Return (CAGR %)', min: 1, max: 30, step: 0.5, value: 12, type: 'slider', displayValue: '12%' },
      { id: 'years', label: 'Duration (Years)', min: 1, max: 40, step: 1, value: 15, type: 'slider', displayValue: '15' }
    ],
    results: [
      { id: 'total-invested', label: 'Total Invested' },
      { id: 'total-gains', label: 'Total Gains' },
      { id: 'total-corpus', label: 'Nominal Corpus' },
      { id: 'adjusted-corpus', label: 'Inflation Adjusted' },
      { id: 'post-tax-corpus', label: 'Post-Tax Corpus', conditional: 'tax' }
    ],
    supportTax: true,
    supportInflation: true,
    seoContent: `
      <h2>Why Step-Up SIP Accelerates Wealth Creation</h2>
      <p>By increasing your monthly SIP amount in proportion to your salary hikes (e.g. 10% step-up each year), your final corpus grows exponentially larger than a standard flat SIP.</p>
      <h3>Compound Algorithm</h3>
      <p>For each year $y$ in the duration, the monthly SIP becomes $P_y = P \times (1 + s)^{y-1}$, where $s$ is the annual step-up percentage. The monthly growth compounds dynamically month-on-month using CAGR rate equivalent $i = (1+r)^{1/12} - 1$.</p>
    `,
    bindingScript: `
      const defaults = { starting_sip: 10000, step_up_pct: 10, return_rate: 12, years: 15, 'tax-type': 'equity', 'custom-tax-rate': 20, 'inflation-rate': 6 };
      let state = FinanceEngine.getUrlParams(defaults);
      
      const elements = ['starting_sip', 'step_up_pct', 'return_rate', 'years', 'tax-type', 'custom-tax-rate', 'inflation-rate'];
      
      function syncUI() {
        elements.forEach(id => {
          const el = document.getElementById(id);
          if (!el) return;
          el.value = state[id];
          const valDisplay = document.getElementById(id + '-val');
          if (valDisplay) {
            if (id === 'starting_sip') valDisplay.textContent = FinanceEngine.formatINR(state[id]);
            else if (id === 'step_up_pct' || id === 'return_rate' || id === 'custom-tax-rate' || id === 'inflation-rate') valDisplay.textContent = state[id] + '%';
            else valDisplay.textContent = state[id];
          }
        });
        
        const customTaxGroup = document.getElementById('custom-tax-group');
        if (customTaxGroup) {
          customTaxGroup.style.display = state['tax-type'] === 'custom' ? 'block' : 'none';
        }
      }
      
      function calculate() {
        const startSIP = isNaN(state.starting_sip) ? 10000 : state.starting_sip;
        const stepUp = isNaN(state.step_up_pct) ? 10 : state.step_up_pct;
        const annualRate = isNaN(state.return_rate) ? 12 : state.return_rate;
        const years = isNaN(state.years) || state.years <= 0 ? 15 : state.years;
        const inflationRate = isNaN(state['inflation-rate']) ? 6 : state['inflation-rate'];
        const i = FinanceEngine.getMonthlyRate(annualRate);
        
        const r_real = ((1 + annualRate / 100) / (1 + inflationRate / 100)) - 1;
        
        const headers = ['Year', 'Monthly SIP', 'Invested', 'Returns', 'Corpus', 'Real Corpus', 'Taxable Gains', 'Estimated Tax', 'Post-Tax Corpus'];
        
        let tableRows = [];
        let runningBalance = 0;
        let cumulativeInvested = 0;
        const compoundingFreq = state['compounding-freq'] || 'monthly';
        
        for (let y = 1; y <= years; y++) {
          const currentSIP = startSIP * Math.pow(1 + stepUp / 100, y - 1);
          
          if (compoundingFreq === 'monthly') {
            for (let m = 1; m <= 12; m++) {
              cumulativeInvested += currentSIP;
              runningBalance = (runningBalance + currentSIP) * (1 + i);
            }
          } else {
            const rate = annualRate / 100;
            const interestOnStart = runningBalance * rate;
            const interestOnDeposits = currentSIP * rate * 6.5;
            
            cumulativeInvested += currentSIP * 12;
            runningBalance = runningBalance + (currentSIP * 12) + interestOnStart + interestOnDeposits;
          }
          
          const runningRealBalance = FinanceEngine.getRealValue(runningBalance, inflationRate, y);
          
          const yGains = runningBalance - cumulativeInvested;
          const yTaxResults = FinanceEngine.estimateTax(yGains, state['tax-type'], state['custom-tax-rate']);
          const yPostTaxCorpus = runningBalance - yTaxResults.tax;
          
          tableRows.push([
            y,
            Math.round(currentSIP),
            Math.round(cumulativeInvested),
            Math.round(yGains),
            Math.round(runningBalance),
            Math.round(runningRealBalance),
            Math.round(yTaxResults.taxableGains),
            Math.round(yTaxResults.tax),
            Math.round(yPostTaxCorpus)
          ]);
        }
        
        const totalInvested = tableRows[tableRows.length - 1][2];
        const fv = tableRows[tableRows.length - 1][4];
        const totalGains = fv - totalInvested;
        const realCorpus = tableRows[tableRows.length - 1][5];
        const realGains = realCorpus - totalInvested;
        const estimatedTax = tableRows[tableRows.length - 1][7];
        const postTaxCorpus = fv - estimatedTax;
        
        document.getElementById('total-invested').textContent = FinanceEngine.formatINRSmart(totalInvested);
        document.getElementById('total-gains').textContent = FinanceEngine.formatINRSmart(totalGains);
        document.getElementById('total-corpus').textContent = FinanceEngine.formatINRSmart(fv);
        document.getElementById('adjusted-corpus').textContent = FinanceEngine.formatINRSmart(realCorpus);
        const realGainLossEl = document.getElementById('real-gain-loss');
        if (realGainLossEl) {
          const realCAGR = (r_real * 100).toFixed(2);
          realGainLossEl.innerHTML = "Real CAGR: " + realCAGR + "% &nbsp;&middot;&nbsp; Real Gain: " + FinanceEngine.formatINRSmart(realGains);
        }
        const postTaxEl = document.getElementById('post-tax-corpus');
        if (postTaxEl) postTaxEl.textContent = FinanceEngine.formatINRSmart(postTaxCorpus);
        document.querySelectorAll('[data-conditional="tax"]').forEach(el => {
          el.style.display = (state['tax-type'] && state['tax-type'] !== 'none') ? '' : 'none';
        });
        
        const tableBody = document.getElementById('table-body');
        const headersRow = document.getElementById('table-headers-row');
        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');
        
        tableBody.innerHTML = tableRows.map(row => 
          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINR(v, false)) + '</td>').join('') + '</tr>'
        ).join('');
        
        const chartData = tableRows.map(row => ({
          label: 'Yr ' + row[0],
          invested: row[2],
          gains: row[3],
          nominal: row[4],
          real: row[5]
        }));
        FinanceEngine.renderLineChart('chart-container', chartData,
          ['invested', 'gains', 'nominal', 'real'],
          ['#6e6e73', '#ff9f0a', '#0071e3', '#30d158'],
          ['Invested', 'Net Gains', 'Corpus', 'Real Value']);
        
        const csvExporter = FinanceEngine.exportData('step-up-sip-calculator', 
          { 'Starting SIP': startSIP, 'Step-Up %': stepUp, 'Return CAGR %': annualRate, 'Years': years },
          { 'Invested Amount': totalInvested, 'Total Corpus': fv, 'Total Gains': totalGains, 'Inflation Adjusted': realCorpus },
          headers,
          tableRows
        );
        
        const btnCsv = document.getElementById('btn-export-csv');
        const btnJson = document.getElementById('btn-export-json');
        const btnCopy = document.getElementById('btn-copy-table');
        
        btnCsv.replaceWith(btnCsv.cloneNode(true));
        btnJson.replaceWith(btnJson.cloneNode(true));
        btnCopy.replaceWith(btnCopy.cloneNode(true));
        
        document.getElementById('btn-export-csv').addEventListener('click', csvExporter.exportCSV);
        document.getElementById('btn-export-json').addEventListener('click', csvExporter.exportJSON);
        document.getElementById('btn-copy-table').addEventListener('click', () => FinanceEngine.copyTableToClipboard(headers, tableRows));
      }
      
      elements.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', (e) => {
          state[id] = e.target.value;
          if (typeof defaults[id] === 'number') state[id] = parseFloat(state[id]);
          syncUI();
          calculate();
          FinanceEngine.updateUrlParams(state);
        });
      });
      
      syncUI();
      calculate();
    `
  },
  // 3. Reverse SIP Calculator
  {
    filename: 'reverse-sip.html',
    title: 'Reverse SIP Calculator',
    metaDescription: 'Find the required monthly SIP contribution to reach your target savings or investment corpus. Input expected CAGR and target duration.',
    keywords: 'reverse sip, target corpus calculator, monthly sip goal planner, required sip',
    inputs: [
      { id: 'target_corpus', label: 'Target Corpus (₹)', min: 100000, max: 100000000, step: 100000, value: 10000000, type: 'slider', displayValue: '₹1,00,00,000' },
      { id: 'return_rate', label: 'Expected Return (CAGR %)', min: 1, max: 30, step: 0.5, value: 12, type: 'slider', displayValue: '12%' },
      { id: 'years', label: 'Duration (Years)', min: 1, max: 40, step: 1, value: 15, type: 'slider', displayValue: '15' }
    ],
    results: [
      { id: 'required-sip', label: 'Required Monthly SIP' },
      { id: 'total-invested', label: 'Total Invested Amount' },
      { id: 'total-gains', label: 'Estimated Gains' }
    ],
    supportTax: false,
    supportInflation: false,
    seoContent: `
      <h2>Goal-Based Planning with Reverse SIP</h2>
      <p>Instead of calculating what a given SIP yields, the Reverse SIP Calculator determines exactly how much you must invest monthly today to meet a specific goal tomorrow.</p>
    `,
    bindingScript: `
      const defaults = { target_corpus: 10000000, return_rate: 12, years: 15 };
      let state = FinanceEngine.getUrlParams(defaults);
      
      const elements = ['target_corpus', 'return_rate', 'years'];
      
      function syncUI() {
        elements.forEach(id => {
          const el = document.getElementById(id);
          if (!el) return;
          el.value = state[id];
          const valDisplay = document.getElementById(id + '-val');
          if (valDisplay) {
            if (id === 'target_corpus') valDisplay.textContent = FinanceEngine.formatINR(state[id]);
            else if (id === 'return_rate') valDisplay.textContent = state[id] + '%';
            else valDisplay.textContent = state[id];
          }
        });
      }
      
      function calculate() {
        const target = state.target_corpus;
        const annualRate = state.return_rate;
        const years = state.years;
        
        const i = FinanceEngine.getMonthlyRate(annualRate);
        const months = years * 12;
        
        // Required SIP: target / [ ((1+i)^m - 1)/i * (1+i) ]
        const requiredSIP = target / (((Math.pow(1 + i, months) - 1) / i) * (1 + i));
        const totalInvested = requiredSIP * months;
        const gains = target - totalInvested;
        
        document.getElementById('required-sip').textContent = FinanceEngine.formatINR(requiredSIP) + ' / mo';
        document.getElementById('total-invested').textContent = FinanceEngine.formatINR(totalInvested);
        document.getElementById('total-gains').textContent = FinanceEngine.formatINR(gains);
        
        const headers = ['Year', 'Monthly SIP', 'Invested', 'Returns', 'Corpus'];
        let tableRows = [];
        let runningBalance = 0;
        let cumulativeInvested = 0;
        
        for (let y = 1; y <= years; y++) {
          for (let m = 1; m <= 12; m++) {
            cumulativeInvested += requiredSIP;
            runningBalance = (runningBalance + requiredSIP) * (1 + i);
          }
          
          tableRows.push([
            y,
            Math.round(requiredSIP),
            Math.round(cumulativeInvested),
            Math.round(runningBalance - cumulativeInvested),
            Math.round(runningBalance)
          ]);
        }
        
        const tableBody = document.getElementById('table-body');
        const headersRow = document.getElementById('table-headers-row');
        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');
        tableBody.innerHTML = tableRows.map(row => 
          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINR(v, false)) + '</td>').join('') + '</tr>'
        ).join('');
        
        const chartData = tableRows.map(row => ({
          label: 'Yr ' + row[0],
          invested: row[2],
          nominal: row[4]
        }));
        
        FinanceEngine.renderLineChart('chart-container', chartData, ['invested', 'nominal'], ['#6e6e73', '#0071e3']);
        
        const csvExporter = FinanceEngine.exportData('reverse-sip-calculator', 
          { 'Target Corpus': target, 'Return CAGR %': annualRate, 'Years': years },
          { 'Required Monthly SIP': requiredSIP, 'Total Invested': totalInvested, 'Total Gains': gains },
          headers,
          tableRows
        );
        
        document.getElementById('btn-export-csv').onclick = csvExporter.exportCSV;
        document.getElementById('btn-export-json').onclick = csvExporter.exportJSON;
        document.getElementById('btn-copy-table').onclick = () => FinanceEngine.copyTableToClipboard(headers, tableRows);
      }
      
      elements.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', (e) => {
          state[id] = parseFloat(e.target.value);
          syncUI();
          calculate();
          FinanceEngine.updateUrlParams(state);
        });
      });
      
      syncUI();
      calculate();
    `
  },
  // 4. Lump Sum Calculator
  {
    filename: 'lump-sum.html',
    title: 'Lump Sum Calculator',
    metaDescription: 'Calculate compound returns on lump sum investments. Estimate mutual fund or equity growth using standard annual CAGR rates, taxes, and inflation.',
    keywords: 'lump sum calculator, mutual fund lump sum, compound interest, standard cagr',
    inputs: [
      { id: 'principal', label: 'Investment Amount (₹)', min: 1000, max: 10000000, step: 5000, value: 100000, type: 'slider', displayValue: '₹1,00,000' },
      { id: 'return_rate', label: 'Expected Return (CAGR %)', min: 1, max: 30, step: 0.5, value: 12, type: 'slider', displayValue: '12%' },
      { id: 'years', label: 'Duration (Years)', min: 1, max: 45, step: 1, value: 10, type: 'slider', displayValue: '10' }
    ],
    results: [
      { id: 'total-invested', label: 'Invested Amount' },
      { id: 'total-gains', label: 'Total Gains' },
      { id: 'total-corpus', label: 'Nominal Corpus' },
      { id: 'adjusted-corpus', label: 'Inflation Adjusted' },
      { id: 'post-tax-corpus', label: 'Post-Tax Corpus', conditional: 'tax' }
    ],
    supportTax: true,
    supportInflation: true,
    seoContent: `
      <h2>Understanding Lump Sum Wealth Compounding</h2>
      <p>Lump sum investments grow based on annual CAGR compounding where the total investment begins accumulating growth from Day 1.</p>
    `,
    bindingScript: `
      const defaults = { principal: 100000, return_rate: 12, years: 10, 'tax-type': 'equity', 'custom-tax-rate': 20, 'inflation-rate': 6 };
      let state = FinanceEngine.getUrlParams(defaults);
      
      const elements = ['principal', 'return_rate', 'years', 'tax-type', 'custom-tax-rate', 'inflation-rate'];
      
      function syncUI() {
        elements.forEach(id => {
          const el = document.getElementById(id);
          if (!el) return;
          el.value = state[id];
          const valDisplay = document.getElementById(id + '-val');
          if (valDisplay) {
            if (id === 'principal') valDisplay.textContent = FinanceEngine.formatINR(state[id]);
            else if (id === 'return_rate' || id === 'custom-tax-rate' || id === 'inflation-rate') valDisplay.textContent = state[id] + '%';
            else valDisplay.textContent = state[id];
          }
        });
        
        const customTaxGroup = document.getElementById('custom-tax-group');
        if (customTaxGroup) {
          customTaxGroup.style.display = state['tax-type'] === 'custom' ? 'block' : 'none';
        }
      }
      
      function calculate() {
        const P = state.principal;
        const r = state.return_rate;
        const years = state.years;
        const inf = state['inflation-rate'];
        
        const fv = P * Math.pow(1 + r/100, years);
        const gains = fv - P;
        const realVal = FinanceEngine.getRealValue(fv, inf, years);
        const realGains = realVal - P;
        const taxResults = FinanceEngine.estimateTax(gains, state['tax-type'], state['custom-tax-rate']);
        
        document.getElementById('total-invested').textContent = FinanceEngine.formatINRSmart(P);
        document.getElementById('total-gains').textContent = FinanceEngine.formatINRSmart(gains);
        document.getElementById('total-corpus').textContent = FinanceEngine.formatINRSmart(fv);
        document.getElementById('adjusted-corpus').textContent = FinanceEngine.formatINRSmart(realVal);
        const realGainLossEl = document.getElementById('real-gain-loss');
        if (realGainLossEl) {
          const r_real = ((1 + r / 100) / (1 + inf / 100)) - 1;
          const realCAGR = (r_real * 100).toFixed(2);
          realGainLossEl.innerHTML = "Real CAGR: " + realCAGR + "% &nbsp;&middot;&nbsp; Real Gain: " + FinanceEngine.formatINRSmart(realGains);
        }
        const postTaxCorpus = fv - taxResults.tax;
        const postTaxEl = document.getElementById('post-tax-corpus');
        if (postTaxEl) postTaxEl.textContent = FinanceEngine.formatINRSmart(postTaxCorpus);
        document.querySelectorAll('[data-conditional="tax"]').forEach(el => {
          el.style.display = (state['tax-type'] && state['tax-type'] !== 'none') ? '' : 'none';
        });
        
        const headers = ['Year', 'Invested', 'Returns', 'Corpus', 'Real Corpus', 'Taxable Gains', 'Estimated Tax', 'Post-Tax Corpus'];
        let tableRows = [];
        
        for (let y = 1; y <= years; y++) {
          const yCorpus = P * Math.pow(1 + r/100, y);
          const yGains = yCorpus - P;
          const yReal = FinanceEngine.getRealValue(yCorpus, inf, y);
          const yTax = FinanceEngine.estimateTax(yGains, state['tax-type'], state['custom-tax-rate']);
          const yPostTax = yCorpus - yTax.tax;
          
          tableRows.push([
            y,
            P,
            Math.round(yGains),
            Math.round(yCorpus),
            Math.round(yReal),
            Math.round(yTax.taxableGains),
            Math.round(yTax.tax),
            Math.round(yPostTax)
          ]);
        }
        
        const tableBody = document.getElementById('table-body');
        const headersRow = document.getElementById('table-headers-row');
        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');
        tableBody.innerHTML = tableRows.map(row => 
          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINR(v, false)) + '</td>').join('') + '</tr>'
        ).join('');
        
        const chartData = tableRows.map(row => ({
          label: 'Yr ' + row[0],
          invested: row[1],
          gains: row[2],
          nominal: row[3],
          real: row[4]
        }));
        FinanceEngine.renderLineChart('chart-container', chartData,
          ['invested', 'gains', 'nominal', 'real'],
          ['#6e6e73', '#ff9f0a', '#0071e3', '#30d158'],
          ['Invested', 'Net Gains', 'Corpus', 'Real Value']);
        
        const csvExporter = FinanceEngine.exportData('lumpsum-calculator', 
          { 'Investment': P, 'Return %': r, 'Years': years },
          { 'Corpus': fv, 'Gains': gains, 'Real Value': realVal },
          headers,
          tableRows
        );
        
        document.getElementById('btn-export-csv').onclick = csvExporter.exportCSV;
        document.getElementById('btn-export-json').onclick = csvExporter.exportJSON;
        document.getElementById('btn-copy-table').onclick = () => FinanceEngine.copyTableToClipboard(headers, tableRows);
      }
      
      elements.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', (e) => {
          state[id] = parseFloat(e.target.value);
          syncUI();
          calculate();
          FinanceEngine.updateUrlParams(state);
        });
      });
      
      syncUI();
      calculate();
    `
  },
  // 5. Reverse Lump Sum Calculator
  {
    filename: 'reverse-lump-sum.html',
    title: 'Reverse Lump Sum Calculator',
    metaDescription: 'Find the required initial lump sum investment to achieve a target financial goal.',
    keywords: 'reverse lumpsum, target amount lumpsum, goal lumpsum, compound returns',
    inputs: [
      { id: 'target_corpus', label: 'Target Corpus (₹)', min: 100000, max: 100000000, step: 100000, value: 10000000, type: 'slider', displayValue: '₹1,00,00,000' },
      { id: 'return_rate', label: 'Expected Return (CAGR %)', min: 1, max: 30, step: 0.5, value: 12, type: 'slider', displayValue: '12%' },
      { id: 'years', label: 'Duration (Years)', min: 1, max: 40, step: 1, value: 15, type: 'slider', displayValue: '15' }
    ],
    results: [
      { id: 'required-lump', label: 'Required Investment' },
      { id: 'estimated-gains', label: 'Compound Gains' }
    ],
    supportTax: false,
    supportInflation: false,
    seoContent: `
      <h2>Required Lump Sum Planning</h2>
      <p>Compute the exact amount of money you must commit to an asset today in order to meet a goal at a specific future date.</p>
    `,
    bindingScript: `
      const defaults = { target_corpus: 10000000, return_rate: 12, years: 15 };
      let state = FinanceEngine.getUrlParams(defaults);
      const elements = ['target_corpus', 'return_rate', 'years'];
      
      function syncUI() {
        elements.forEach(id => {
          document.getElementById(id).value = state[id];
          const valDisplay = document.getElementById(id + '-val');
          if (valDisplay) {
            if (id === 'target_corpus') valDisplay.textContent = FinanceEngine.formatINR(state[id]);
            else if (id === 'return_rate') valDisplay.textContent = state[id] + '%';
            else valDisplay.textContent = state[id];
          }
        });
      }
      
      function calculate() {
        const target = state.target_corpus;
        const r = state.return_rate;
        const years = state.years;
        
        const reqLump = target / Math.pow(1 + r/100, years);
        const gains = target - reqLump;
        
        document.getElementById('required-lump').textContent = FinanceEngine.formatINR(reqLump);
        document.getElementById('estimated-gains').textContent = FinanceEngine.formatINR(gains);
        
        const headers = ['Year', 'Invested', 'Gains', 'Corpus'];
        let tableRows = [];
        
        for (let y = 1; y <= years; y++) {
          const yCorpus = reqLump * Math.pow(1 + r/100, y);
          tableRows.push([
            y,
            Math.round(reqLump),
            Math.round(yCorpus - reqLump),
            Math.round(yCorpus)
          ]);
        }
        
        const tableBody = document.getElementById('table-body');
        const headersRow = document.getElementById('table-headers-row');
        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');
        tableBody.innerHTML = tableRows.map(row => 
          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINR(v, false)) + '</td>').join('') + '</tr>'
        ).join('');
        
        const chartData = tableRows.map(row => ({
          label: 'Yr ' + row[0],
          invested: row[1],
          nominal: row[3]
        }));
        FinanceEngine.renderLineChart('chart-container', chartData, ['invested', 'nominal'], ['#6e6e73', '#0071e3']);
        
        const csvExporter = FinanceEngine.exportData('reverse-lumpsum-calculator', 
          { 'Target': target, 'Return %': r, 'Years': years },
          { 'Required Investment': reqLump, 'Gains': gains },
          headers,
          tableRows
        );
        document.getElementById('btn-export-csv').onclick = csvExporter.exportCSV;
        document.getElementById('btn-export-json').onclick = csvExporter.exportJSON;
        document.getElementById('btn-copy-table').onclick = () => FinanceEngine.copyTableToClipboard(headers, tableRows);
      }
      
      elements.forEach(id => {
        document.getElementById(id).addEventListener('input', (e) => {
          state[id] = parseFloat(e.target.value);
          syncUI();
          calculate();
          FinanceEngine.updateUrlParams(state);
        });
      });
      
      syncUI();
      calculate();
    `
  },
  // 6. SWP Calculator
  {
    filename: 'swp.html',
    title: 'SWP Calculator',
    metaDescription: 'Plan your regular withdrawals from mutual funds using a Systematic Withdrawal Plan (SWP) calculator. Calculate capital preservation and corpus lifespan.',
    keywords: 'swp calculator, systematic withdrawal plan, retirement monthly income, capital preservation',
    inputs: [
      { id: 'initial_corpus', label: 'Initial Corpus (₹)', min: 100000, max: 100000000, step: 100000, value: 5000000, type: 'slider', displayValue: '₹50,00,000' },
      { id: 'monthly_withdrawal', label: 'Monthly Withdrawal (₹)', min: 1000, max: 500000, step: 1000, value: 30000, type: 'slider', displayValue: '₹30,000' },
      { id: 'return_rate', label: 'Expected Return (CAGR %)', min: 1, max: 30, step: 0.5, value: 9, type: 'slider', displayValue: '9%' },
      { id: 'years', label: 'Duration (Years)', min: 1, max: 40, step: 1, value: 15, type: 'slider', displayValue: '15' }
    ],
    results: [
      { id: 'remaining-corpus', label: 'Remaining Corpus' },
      { id: 'total-withdrawn', label: 'Total Withdrawals' },
      { id: 'final-gains', label: 'Earned Returns' }
    ],
    supportTax: false,
    supportInflation: false,
    seoContent: `
      <h2>Retirement Planning with SWP</h2>
      <p>A Systematic Withdrawal Plan (SWP) allows you to withdraw a fixed amount of money regularly from your mutual fund investments, while the remaining balance continues to compound.</p>
    `,
    bindingScript: `
      const defaults = { initial_corpus: 5000000, monthly_withdrawal: 30000, return_rate: 9, years: 15 };
      let state = FinanceEngine.getUrlParams(defaults);
      const elements = ['initial_corpus', 'monthly_withdrawal', 'return_rate', 'years'];
      
      function syncUI() {
        elements.forEach(id => {
          document.getElementById(id).value = state[id];
          const valDisplay = document.getElementById(id + '-val');
          if (valDisplay) {
            if (id === 'initial_corpus' || id === 'monthly_withdrawal') valDisplay.textContent = FinanceEngine.formatINR(state[id]);
            else if (id === 'return_rate') valDisplay.textContent = state[id] + '%';
            else valDisplay.textContent = state[id];
          }
        });
      }
      
      function calculate() {
        const corpus = state.initial_corpus;
        const withdrawal = state.monthly_withdrawal;
        const r = state.return_rate;
        const years = state.years;
        
        const i = FinanceEngine.getMonthlyRate(r);
        
        let balance = corpus;
        let cumulativeWithdrawn = 0;
        let cumulativeInterest = 0;
        
        const headers = ['Year', 'Beginning Balance', 'Withdrawn', 'Interest Earned', 'Ending Balance'];
        let tableRows = [];
        
        for (let y = 1; y <= years; y++) {
          const begBal = balance;
          let yWithdrawn = 0;
          let yInterest = 0;
          
          for (let m = 1; m <= 12; m++) {
            if (balance <= 0) {
              balance = 0;
              continue;
            }
            
            const interest = balance * i;
            yInterest += interest;
            balance = balance + interest;
            
            const actualWithdraw = Math.min(balance, withdrawal);
            yWithdrawn += actualWithdraw;
            balance -= actualWithdraw;
          }
          
          cumulativeWithdrawn += yWithdrawn;
          cumulativeInterest += yInterest;
          
          tableRows.push([
            y,
            Math.round(begBal),
            Math.round(yWithdrawn),
            Math.round(yInterest),
            Math.round(balance)
          ]);
        }
        
        document.getElementById('remaining-corpus').textContent = FinanceEngine.formatINR(balance);
        document.getElementById('total-withdrawn').textContent = FinanceEngine.formatINR(cumulativeWithdrawn);
        document.getElementById('final-gains').textContent = FinanceEngine.formatINR(cumulativeInterest);
        
        const tableBody = document.getElementById('table-body');
        const headersRow = document.getElementById('table-headers-row');
        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');
        tableBody.innerHTML = tableRows.map(row => 
          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINR(v, false)) + '</td>').join('') + '</tr>'
        ).join('');
        
        const chartData = tableRows.map(row => ({
          label: 'Yr ' + row[0],
          nominal: row[4]
        }));
        FinanceEngine.renderLineChart('chart-container', chartData, ['nominal'], ['#0071e3']);
        
        const csvExporter = FinanceEngine.exportData('swp-calculator', 
          { 'Initial Corpus': corpus, 'Monthly Withdrawal': withdrawal, 'CAGR %': r, 'Years': years },
          { 'Remaining Corpus': balance, 'Total Withdrawals': cumulativeWithdrawn, 'Interest Earned': cumulativeInterest },
          headers,
          tableRows
        );
        document.getElementById('btn-export-csv').onclick = csvExporter.exportCSV;
        document.getElementById('btn-export-json').onclick = csvExporter.exportJSON;
        document.getElementById('btn-copy-table').onclick = () => FinanceEngine.copyTableToClipboard(headers, tableRows);
      }
      
      elements.forEach(id => {
        document.getElementById(id).addEventListener('input', (e) => {
          state[id] = parseFloat(e.target.value);
          syncUI();
          calculate();
          FinanceEngine.updateUrlParams(state);
        });
      });
      
      syncUI();
      calculate();
    `
  },
  // 7. Reverse SWP Calculator
  {
    filename: 'reverse-swp.html',
    title: 'Reverse SWP Calculator',
    metaDescription: 'Find the required initial corpus to generate a specific monthly withdrawal income for retirement without running out of money.',
    keywords: 'reverse swp, required retirement corpus, target swp calculator, retirement income planning',
    inputs: [
      { id: 'desired_withdrawal', label: 'Desired Monthly Income (₹)', min: 5000, max: 500000, step: 5000, value: 50000, type: 'slider', displayValue: '₹50,000' },
      { id: 'return_rate', label: 'Expected Return (CAGR %)', min: 1, max: 20, step: 0.5, value: 8, type: 'slider', displayValue: '8%' },
      { id: 'years', label: 'Duration (Years)', min: 1, max: 40, step: 1, value: 20, type: 'slider', displayValue: '20' }
    ],
    results: [
      { id: 'required-corpus', label: 'Required Initial Corpus' },
      { id: 'total-withdrawn', label: 'Total Payouts' },
      { id: 'gains-portion', label: 'Returns Needed' }
    ],
    supportTax: false,
    supportInflation: false,
    seoContent: `
      <h2>Funding Your Retirement Payouts</h2>
      <p>Estimate the required initial nest egg size to pay out a targeted monthly amount over your retirement years, assuming a specific compounding growth rate.</p>
    `,
    bindingScript: `
      const defaults = { desired_withdrawal: 50000, return_rate: 8, years: 20 };
      let state = FinanceEngine.getUrlParams(defaults);
      const elements = ['desired_withdrawal', 'return_rate', 'years'];
      
      function syncUI() {
        elements.forEach(id => {
          document.getElementById(id).value = state[id];
          const valDisplay = document.getElementById(id + '-val');
          if (valDisplay) {
            if (id === 'desired_withdrawal') valDisplay.textContent = FinanceEngine.formatINR(state[id]);
            else if (id === 'return_rate') valDisplay.textContent = state[id] + '%';
            else valDisplay.textContent = state[id];
          }
        });
      }
      
      function calculate() {
        const withdrawal = state.desired_withdrawal;
        const r = state.return_rate;
        const years = state.years;
        
        const i = FinanceEngine.getMonthlyRate(r);
        const months = years * 12;
        
        // P = W * [1 - (1+i)^-m] / i * (1+i) [Beginning of month withdrawal]
        const reqCorpus = withdrawal * ((1 - Math.pow(1 + i, -months)) / i) * (1 + i);
        const totalPayout = withdrawal * months;
        const interestRequired = totalPayout - reqCorpus;
        
        document.getElementById('required-corpus').textContent = FinanceEngine.formatINR(reqCorpus);
        document.getElementById('total-withdrawn').textContent = FinanceEngine.formatINR(totalPayout);
        document.getElementById('gains-portion').textContent = FinanceEngine.formatINR(interestRequired);
        
        const headers = ['Year', 'Beginning Balance', 'Withdrawn', 'Interest Earned', 'Ending Balance'];
        let tableRows = [];
        let balance = reqCorpus;
        
        for (let y = 1; y <= years; y++) {
          const beg = balance;
          let yInterest = 0;
          let yWithdrawn = 0;
          for (let m = 1; m <= 12; m++) {
            if (balance <= 0) continue;
            
            // Withdrawal at beginning of month
            const actualWithdraw = Math.min(balance, withdrawal);
            balance -= actualWithdraw;
            yWithdrawn += actualWithdraw;
            
            const interest = balance * i;
            balance += interest;
            yInterest += interest;
          }
          tableRows.push([
            y,
            Math.round(beg),
            Math.round(yWithdrawn),
            Math.round(yInterest),
            Math.round(balance)
          ]);
        }
        
        const tableBody = document.getElementById('table-body');
        const headersRow = document.getElementById('table-headers-row');
        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');
        tableBody.innerHTML = tableRows.map(row => 
          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINR(v, false)) + '</td>').join('') + '</tr>'
        ).join('');
        
        const chartData = tableRows.map(row => ({
          label: 'Yr ' + row[0],
          nominal: row[4]
        }));
        FinanceEngine.renderLineChart('chart-container', chartData, ['nominal'], ['#0071e3']);
        
        const csvExporter = FinanceEngine.exportData('reverse-swp-calculator', 
          { 'Desired Withdrawal': withdrawal, 'Return %': r, 'Years': years },
          { 'Required Corpus': reqCorpus, 'Total Withdrawn': totalPayout, 'Interest Required': interestRequired },
          headers,
          tableRows
        );
        document.getElementById('btn-export-csv').onclick = csvExporter.exportCSV;
        document.getElementById('btn-export-json').onclick = csvExporter.exportJSON;
        document.getElementById('btn-copy-table').onclick = () => FinanceEngine.copyTableToClipboard(headers, tableRows);
      }
      
      elements.forEach(id => {
        document.getElementById(id).addEventListener('input', (e) => {
          state[id] = parseFloat(e.target.value);
          syncUI();
          calculate();
          FinanceEngine.updateUrlParams(state);
        });
      });
      
      syncUI();
      calculate();
    `
  },
  // 8. Step-Up SWP Calculator
  {
    filename: 'step-up-swp.html',
    title: 'Step-Up SWP Calculator',
    metaDescription: 'Estimate systematic withdrawal plan sustainability with annual step-ups to match inflation or cost of living increases.',
    keywords: 'step-up swp, inflation withdrawal planner, retirement depletion calculator',
    inputs: [
      { id: 'initial_corpus', label: 'Initial Corpus (₹)', min: 100000, max: 100000000, step: 100000, value: 5000000, type: 'slider', displayValue: '₹50,00,000' },
      { id: 'monthly_withdrawal', label: 'Initial Monthly Withdrawal (₹)', min: 1000, max: 500000, step: 1000, value: 30000, type: 'slider', displayValue: '₹30,000' },
      { id: 'step_up_pct', label: 'Annual Step-Up (%)', min: 1, max: 20, step: 1, value: 6, type: 'slider', displayValue: '6%' },
      { id: 'return_rate', label: 'Expected Return (CAGR %)', min: 1, max: 20, step: 0.5, value: 9, type: 'slider', displayValue: '9%' },
      { id: 'years', label: 'Duration (Years)', min: 1, max: 40, step: 1, value: 20, type: 'slider', displayValue: '20' }
    ],
    results: [
      { id: 'remaining-corpus', label: 'Remaining Corpus' },
      { id: 'total-withdrawn', label: 'Total Payouts' },
      { id: 'depletion-year', label: 'Depletion Status', subLabel: 'Years until empty' }
    ],
    supportTax: false,
    supportInflation: false,
    seoContent: `
      <h2>Managing Inflation in Retirement Withdrawals</h2>
      <p>Stepping up your SWP withdrawals annually helps you preserve purchasing power as inflation drives costs higher.</p>
    `,
    bindingScript: `
      const defaults = { initial_corpus: 5000000, monthly_withdrawal: 30000, step_up_pct: 6, return_rate: 9, years: 20 };
      let state = FinanceEngine.getUrlParams(defaults);
      const elements = ['initial_corpus', 'monthly_withdrawal', 'step_up_pct', 'return_rate', 'years'];
      
      function syncUI() {
        elements.forEach(id => {
          document.getElementById(id).value = state[id];
          const valDisplay = document.getElementById(id + '-val');
          if (valDisplay) {
            if (id === 'initial_corpus' || id === 'monthly_withdrawal') valDisplay.textContent = FinanceEngine.formatINR(state[id]);
            else if (id === 'step_up_pct' || id === 'return_rate') valDisplay.textContent = state[id] + '%';
            else valDisplay.textContent = state[id];
          }
        });
      }
      
      function calculate() {
        const corpus = state.initial_corpus;
        const initialW = state.monthly_withdrawal;
        const stepUp = state.step_up_pct;
        const r = state.return_rate;
        const years = state.years;
        
        const i = FinanceEngine.getMonthlyRate(r);
        
        let balance = corpus;
        let cumulativeWithdrawn = 0;
        let depletionYr = 'Sufficient';
        
        const headers = ['Year', 'Monthly Withdrawal', 'Beginning Balance', 'Withdrawn', 'Interest Earned', 'Ending Balance'];
        let tableRows = [];
        
        for (let y = 1; y <= years; y++) {
          const currentW = initialW * Math.pow(1 + stepUp / 100, y - 1);
          const beg = balance;
          let yWithdrawn = 0;
          let yInterest = 0;
          
          for (let m = 1; m <= 12; m++) {
            if (balance <= 0) {
              if (depletionYr === 'Sufficient') {
                depletionYr = 'Depleted in Year ' + y;
              }
              balance = 0;
              continue;
            }
            
            // Withdrawal at beginning of month
            const actualWithdraw = Math.min(balance, currentW);
            balance -= actualWithdraw;
            yWithdrawn += actualWithdraw;
            
            const interest = balance * i;
            balance += interest;
            yInterest += interest;
          }
          
          cumulativeWithdrawn += yWithdrawn;
          
          tableRows.push([
            y,
            Math.round(currentW),
            Math.round(beg),
            Math.round(yWithdrawn),
            Math.round(yInterest),
            Math.round(balance)
          ]);
        }
        
        document.getElementById('remaining-corpus').textContent = FinanceEngine.formatINR(balance);
        document.getElementById('total-withdrawn').textContent = FinanceEngine.formatINR(cumulativeWithdrawn);
        document.getElementById('depletion-year').textContent = depletionYr;
        
        const tableBody = document.getElementById('table-body');
        const headersRow = document.getElementById('table-headers-row');
        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');
        tableBody.innerHTML = tableRows.map(row => 
          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINR(v, false)) + '</td>').join('') + '</tr>'
        ).join('');
        
        const chartData = tableRows.map(row => ({
          label: 'Yr ' + row[0],
          nominal: row[5]
        }));
        FinanceEngine.renderLineChart('chart-container', chartData, ['nominal'], ['#0071e3']);
        
        const csvExporter = FinanceEngine.exportData('step-up-swp-calculator', 
          { 'Corpus': corpus, 'Initial Withdraw': initialW, 'Step Up %': stepUp, 'Return %': r, 'Years': years },
          { 'Remaining': balance, 'Withdrawn': cumulativeWithdrawn, 'Status': depletionYr },
          headers,
          tableRows
        );
        document.getElementById('btn-export-csv').onclick = csvExporter.exportCSV;
        document.getElementById('btn-export-json').onclick = csvExporter.exportJSON;
        document.getElementById('btn-copy-table').onclick = () => FinanceEngine.copyTableToClipboard(headers, tableRows);
      }
      
      elements.forEach(id => {
        document.getElementById(id).addEventListener('input', (e) => {
          state[id] = parseFloat(e.target.value);
          syncUI();
          calculate();
          FinanceEngine.updateUrlParams(state);
        });
      });
      
      syncUI();
      calculate();
    `
  },
  // 9. Retirement Calculator
  {
    filename: 'retirement.html',
    title: 'Retirement Planner',
    metaDescription: 'Find your target retirement nest egg. Estimate required monthly savings, inflation-adjusted post-retirement expenses, and annuity lifespan.',
    keywords: 'retirement planner, retirement corpus calculator, fire nest egg size, retirement sip planner',
    inputs: [
      { id: 'current_age', label: 'Current Age (Years)', min: 18, max: 60, step: 1, value: 30, type: 'slider', displayValue: '30' },
      { id: 'retire_age', label: 'Retirement Age (Years)', min: 35, max: 70, step: 1, value: 55, type: 'slider', displayValue: '55' },
      { id: 'life_expectancy', label: 'Life Expectancy (Years)', min: 70, max: 100, step: 1, value: 85, type: 'slider', displayValue: '85' },
      { id: 'monthly_expenses', label: 'Current Monthly Expenses (₹)', min: 10000, max: 1000000, step: 5000, value: 50000, type: 'slider', displayValue: '₹50,000' },
      { id: 'pre_return', label: 'Pre-retirement Return CAGR (%)', min: 4, max: 20, step: 0.5, value: 12, type: 'slider', displayValue: '12%' },
      { id: 'post_return', label: 'Post-retirement Return CAGR (%)', min: 3, max: 15, step: 0.5, value: 8, type: 'slider', displayValue: '8%' }
    ],
    results: [
      { id: 'required-corpus', label: 'Required Corpus at Retirement' },
      { id: 'required-sip', label: 'Required Monthly SIP Today' },
      { id: 'inflated-expenses', label: 'Monthly Expense at Retirement' }
    ],
    supportTax: false,
    supportInflation: true, // we use inflation-rate from slider
    seoContent: `
      <h2>Retirement Nest Egg Strategy</h2>
      <p>Inflation is the biggest threat to retirement. A monthly expense of ₹50,000 today will expand dramatically over 20-30 years. This planner calculates your target corpus and required monthly savings.</p>
    `,
    bindingScript: `
      const defaults = { current_age: 30, retire_age: 55, life_expectancy: 85, monthly_expenses: 50000, pre_return: 12, post_return: 8, 'inflation-rate': 6 };
      let state = FinanceEngine.getUrlParams(defaults);
      const elements = ['current_age', 'retire_age', 'life_expectancy', 'monthly_expenses', 'pre_return', 'post_return', 'inflation-rate'];
      
      function syncUI() {
        elements.forEach(id => {
          document.getElementById(id).value = state[id];
          const valDisplay = document.getElementById(id + '-val');
          if (valDisplay) {
            if (id === 'monthly_expenses') valDisplay.textContent = FinanceEngine.formatINR(state[id]);
            else if (id === 'pre_return' || id === 'post_return' || id === 'inflation-rate') valDisplay.textContent = state[id] + '%';
            else valDisplay.textContent = state[id];
          }
        });
      }
      
      function calculate() {
        const curAge = state.current_age;
        let retAge = state.retire_age;
        if (retAge <= curAge) {
          retAge = curAge + 1;
          state.retire_age = retAge;
          document.getElementById('retire_age').value = retAge;
          document.getElementById('retire_age-val').textContent = retAge;
        }
        
        let lifeExp = state.life_expectancy;
        if (lifeExp <= retAge) {
          lifeExp = retAge + 5;
          state.life_expectancy = lifeExp;
          document.getElementById('life_expectancy').value = lifeExp;
          document.getElementById('life_expectancy-val').textContent = lifeExp;
        }
        
        const expenses = state.monthly_expenses;
        const preR = state.pre_return;
        const postR = state.post_return;
        const inf = state['inflation-rate'];
        
        const yearsToRet = retAge - curAge;
        const yearsInRet = lifeExp - retAge;
        
        // Expenses at retirement
        const inflatedW = expenses * Math.pow(1 + inf / 100, yearsToRet);
        
        // Post retirement compounding
        const iPost = FinanceEngine.getMonthlyRate(postR);
        const infM = FinanceEngine.getMonthlyRate(inf);
        const retirementMonths = yearsInRet * 12;
        
        // Calculate PV of retirement annuity: sum of inflated withdrawals discounted at postR
        let reqCorpus = 0;
        for (let m = 1; m <= retirementMonths; m++) {
          const w = inflatedW * Math.pow(1 + infM, m - 1);
          reqCorpus += w / Math.pow(1 + iPost, m);
        }
        
        // Pre retirement SIP accumulation to reach reqCorpus
        const iPre = FinanceEngine.getMonthlyRate(preR);
        const preMonths = yearsToRet * 12;
        const reqSIP = reqCorpus * iPre / ((Math.pow(1 + iPre, preMonths) - 1) * (1 + iPre));
        
        document.getElementById('required-corpus').textContent = FinanceEngine.formatINR(reqCorpus);
        document.getElementById('required-sip').textContent = FinanceEngine.formatINR(reqSIP) + ' / mo';
        document.getElementById('inflated-expenses').textContent = FinanceEngine.formatINR(inflatedW) + ' / mo';
        
        const headers = ['Year', 'Age', 'Accumulated Corpus', 'Inflation-Adjusted Corpus'];
        let tableRows = [];
        let balance = 0;
        
        for (let y = 1; y <= yearsToRet; y++) {
          for (let m = 1; m <= 12; m++) {
            balance = (balance + reqSIP) * (1 + iPre);
          }
          tableRows.push([
            y,
            curAge + y,
            Math.round(balance),
            Math.round(FinanceEngine.getRealValue(balance, inf, y))
          ]);
        }
        
        const tableBody = document.getElementById('table-body');
        const headersRow = document.getElementById('table-headers-row');
        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');
        tableBody.innerHTML = tableRows.map(row => 
          '<tr>' + row.map((v, idx) => '<td>' + (idx <= 1 ? v : FinanceEngine.formatINR(v, false)) + '</td>').join('') + '</tr>'
        ).join('');
        
        const chartData = tableRows.map(row => ({
          label: 'Age ' + row[1],
          nominal: row[2],
          real: row[3]
        }));
        FinanceEngine.renderLineChart('chart-container', chartData, ['nominal', 'real'], ['#0071e3', '#30d158']);
        
        const csvExporter = FinanceEngine.exportData('retirement-planner', 
          { 'Current Age': curAge, 'Retire Age': retAge, 'Life Expectancy': lifeExp, 'Current Expenses': expenses, 'Pre CAGR': preR, 'Post CAGR': postR, 'Inflation': inf },
          { 'Required Corpus': reqCorpus, 'Required SIP': reqSIP, 'Expenses At Retirement': inflatedW },
          headers,
          tableRows
        );
        document.getElementById('btn-export-csv').onclick = csvExporter.exportCSV;
        document.getElementById('btn-export-json').onclick = csvExporter.exportJSON;
        document.getElementById('btn-copy-table').onclick = () => FinanceEngine.copyTableToClipboard(headers, tableRows);
      }
      
      elements.forEach(id => {
        document.getElementById(id).addEventListener('input', (e) => {
          state[id] = parseFloat(e.target.value);
          syncUI();
          calculate();
          FinanceEngine.updateUrlParams(state);
        });
      });
      
      syncUI();
      calculate();
    `
  },
  // 10. FIRE Calculator
  {
    filename: 'fire.html',
    title: 'FIRE Calculator',
    metaDescription: 'Find your Financial Independence, Retire Early (FIRE) metrics. Calculate Lean FIRE, Fat FIRE, and SWR sustainability rules.',
    keywords: 'fire calculator, lean fire, fat fire, financial independence retire early, safe withdrawal rate',
    inputs: [
      { id: 'annual_expenses', label: 'Annual Expenses (₹)', min: 100000, max: 10000000, step: 50000, value: 600000, type: 'slider', displayValue: '₹6,00,000' },
      { id: 'swr', label: 'Safe Withdrawal Rate (SWR %)', min: 2, max: 6, step: 0.1, value: 3.5, type: 'slider', displayValue: '3.5%' },
      { id: 'current_savings', label: 'Current Net Worth (₹)', min: 0, max: 50000000, step: 100000, value: 2000000, type: 'slider', displayValue: '₹20,00,000' },
      { id: 'monthly_savings', label: 'Monthly Savings Rate (₹)', min: 0, max: 500000, step: 2000, value: 40000, type: 'slider', displayValue: '₹40,000' },
      { id: 'return_rate', label: 'Return CAGR (%)', min: 4, max: 20, step: 0.5, value: 12, type: 'slider', displayValue: '12%' }
    ],
    results: [
      { id: 'fire-number', label: 'Standard FIRE Number' },
      { id: 'lean-fire', label: 'Lean FIRE' },
      { id: 'fat-fire', label: 'Fat FIRE' }
    ],
    supportTax: false,
    supportInflation: true,
    seoContent: `
      <h2>Financial Independence Retire Early (FIRE) Strategy</h2>
      <p>Your FIRE Number represents the target investment portfolio size where your annual expenses are fully covered by a safe, inflation-adjusted withdrawal rate (typically 3% to 4%) indefinitely.</p>
    `,
    bindingScript: `
      const defaults = { annual_expenses: 600000, swr: 3.5, current_savings: 2000000, monthly_savings: 40000, return_rate: 12, 'inflation-rate': 6 };
      let state = FinanceEngine.getUrlParams(defaults);
      const elements = ['annual_expenses', 'swr', 'current_savings', 'monthly_savings', 'return_rate', 'inflation-rate'];
      
      function syncUI() {
        elements.forEach(id => {
          document.getElementById(id).value = state[id];
          const valDisplay = document.getElementById(id + '-val');
          if (valDisplay) {
            if (id === 'annual_expenses' || id === 'current_savings' || id === 'monthly_savings') valDisplay.textContent = FinanceEngine.formatINR(state[id]);
            else if (id === 'swr' || id === 'return_rate' || id === 'inflation-rate') valDisplay.textContent = state[id] + '%';
            else valDisplay.textContent = state[id];
          }
        });
      }
      
      function calculate() {
        const expenses = state.annual_expenses;
        const swr = state.swr;
        const savings = state.current_savings;
        const monthlyS = state.monthly_savings;
        const r = state.return_rate;
        const inf = state['inflation-rate'];
        
        const fireNo = expenses / (swr / 100);
        const leanFire = fireNo * 0.75;
        const fatFire = fireNo * 1.5;
        
        document.getElementById('fire-number').textContent = FinanceEngine.formatINR(fireNo);
        document.getElementById('lean-fire').textContent = FinanceEngine.formatINR(leanFire);
        document.getElementById('fat-fire').textContent = FinanceEngine.formatINR(fatFire);
        
        const headers = ['Year', 'Annual Expenses (Inflated)', 'Net Worth', 'FIRE Target'];
        let tableRows = [];
        let nw = savings;
        const i = FinanceEngine.getMonthlyRate(r);
        
        for (let y = 1; y <= 35; y++) {
          const infExpenses = expenses * Math.pow(1 + inf / 100, y);
          const yTarget = infExpenses / (swr / 100);
          
          for (let m = 1; m <= 12; m++) {
            nw = (nw + monthlyS) * (1 + i);
          }
          
          tableRows.push([
            y,
            Math.round(infExpenses),
            Math.round(nw),
            Math.round(yTarget)
          ]);
        }
        
        const tableBody = document.getElementById('table-body');
        const headersRow = document.getElementById('table-headers-row');
        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');
        tableBody.innerHTML = tableRows.map(row => 
          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINR(v, false)) + '</td>').join('') + '</tr>'
        ).join('');
        
        const chartData = tableRows.map(row => ({
          label: 'Yr ' + row[0],
          invested: row[3], // fire target
          nominal: row[2]   // net worth
        }));
        FinanceEngine.renderLineChart('chart-container', chartData, ['invested', 'nominal'], ['#6e6e73', '#0071e3']);
        
        const csvExporter = FinanceEngine.exportData('fire-calculator', 
          { 'Expenses': expenses, 'SWR %': swr, 'Savings NW': savings, 'Monthly Add': monthlyS, 'CAGR %': r },
          { 'FIRE Number': fireNo, 'Lean FIRE': leanFire, 'Fat FIRE': fatFire },
          headers,
          tableRows
        );
        document.getElementById('btn-export-csv').onclick = csvExporter.exportCSV;
        document.getElementById('btn-export-json').onclick = csvExporter.exportJSON;
        document.getElementById('btn-copy-table').onclick = () => FinanceEngine.copyTableToClipboard(headers, tableRows);
      }
      
      elements.forEach(id => {
        document.getElementById(id).addEventListener('input', (e) => {
          state[id] = parseFloat(e.target.value);
          syncUI();
          calculate();
          FinanceEngine.updateUrlParams(state);
        });
      });
      
      syncUI();
      calculate();
    `
  },
  // 11. Goal Calculator
  {
    filename: 'goal.html',
    title: 'Goal Planner',
    metaDescription: 'Find required SIP and lump sum investments needed to hit a target money goal.',
    keywords: 'goal calculator, goal planner, sip goal planner, financial targets calculator',
    inputs: [
      { id: 'target_goal', label: 'Goal Target Amount (₹)', min: 10000, max: 50000000, step: 10000, value: 5000000, type: 'slider', displayValue: '₹50,00,000' },
      { id: 'years', label: 'Years to Goal', min: 1, max: 30, step: 1, value: 8, type: 'slider', displayValue: '8' },
      { id: 'return_rate', label: 'Expected CAGR (%)', min: 1, max: 25, step: 0.5, value: 12, type: 'slider', displayValue: '12%' }
    ],
    results: [
      { id: 'inflated-goal', label: 'Inflation-Adjusted Target' },
      { id: 'required-sip', label: 'Required Monthly SIP' },
      { id: 'required-lump', label: 'Required Lump Sum' }
    ],
    supportTax: false,
    supportInflation: true,
    seoContent: `
      <h2>Financial Goal Planning</h2>
      <p>Estimate the target amount needed to satisfy a goal in the future, adjusting for inflation, and view the required savings rate to achieve it.</p>
    `,
    bindingScript: `
      const defaults = { target_goal: 5000000, years: 8, return_rate: 12, 'inflation-rate': 6 };
      let state = FinanceEngine.getUrlParams(defaults);
      const elements = ['target_goal', 'years', 'return_rate', 'inflation-rate'];
      
      function syncUI() {
        elements.forEach(id => {
          document.getElementById(id).value = state[id];
          const valDisplay = document.getElementById(id + '-val');
          if (valDisplay) {
            if (id === 'target_goal') valDisplay.textContent = FinanceEngine.formatINR(state[id]);
            else if (id === 'return_rate' || id === 'inflation-rate') valDisplay.textContent = state[id] + '%';
            else valDisplay.textContent = state[id];
          }
        });
      }
      
      function calculate() {
        const goal = state.target_goal;
        const years = state.years;
        const r = state.return_rate;
        const inf = state['inflation-rate'];
        
        const inflatedGoal = goal * Math.pow(1 + inf / 100, years);
        const i = FinanceEngine.getMonthlyRate(r);
        const months = years * 12;
        
        const reqSIP = inflatedGoal * i / ((Math.pow(1 + i, months) - 1) * (1 + i));
        const reqLump = inflatedGoal / Math.pow(1 + r/100, years);
        
        document.getElementById('inflated-goal').textContent = FinanceEngine.formatINR(inflatedGoal);
        document.getElementById('required-sip').textContent = FinanceEngine.formatINR(reqSIP) + ' / mo';
        document.getElementById('required-lump').textContent = FinanceEngine.formatINR(reqLump);
        
        const headers = ['Year', 'SIP Cumulative Invested', 'SIP Corpus', 'Lump Sum Corpus'];
        let tableRows = [];
        let sipBal = 0;
        let sipInvested = 0;
        
        for (let y = 1; y <= years; y++) {
          for (let m = 1; m <= 12; m++) {
            sipInvested += reqSIP;
            sipBal = (sipBal + reqSIP) * (1 + i);
          }
          const lumpBal = reqLump * Math.pow(1 + r/100, y);
          tableRows.push([
            y,
            Math.round(sipInvested),
            Math.round(sipBal),
            Math.round(lumpBal)
          ]);
        }
        
        const tableBody = document.getElementById('table-body');
        const headersRow = document.getElementById('table-headers-row');
        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');
        tableBody.innerHTML = tableRows.map(row => 
          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINR(v, false)) + '</td>').join('') + '</tr>'
        ).join('');
        
        const chartData = tableRows.map(row => ({
          label: 'Yr ' + row[0],
          invested: row[2],
          nominal: row[3]
        }));
        FinanceEngine.renderLineChart('chart-container', chartData, ['invested', 'nominal'], ['#0071e3', '#30d158']);
        
        const csvExporter = FinanceEngine.exportData('goal-planner', 
          { 'Goal': goal, 'Years': years, 'CAGR %': r, 'Inflation': inf },
          { 'Inflated Target': inflatedGoal, 'Required SIP': reqSIP, 'Required Lump': reqLump },
          headers,
          tableRows
        );
        document.getElementById('btn-export-csv').onclick = csvExporter.exportCSV;
        document.getElementById('btn-export-json').onclick = csvExporter.exportJSON;
        document.getElementById('btn-copy-table').onclick = () => FinanceEngine.copyTableToClipboard(headers, tableRows);
      }
      
      elements.forEach(id => {
        document.getElementById(id).addEventListener('input', (e) => {
          state[id] = parseFloat(e.target.value);
          syncUI();
          calculate();
          FinanceEngine.updateUrlParams(state);
        });
      });
      
      syncUI();
      calculate();
    `
  },
  // 12. Education Planner
  {
    filename: 'education-planner.html',
    title: 'Education Planner',
    metaDescription: 'Plan and invest for your child\'s higher education costs. Adjust for education-specific inflation and mutual fund compounding.',
    keywords: 'education planner, college fund calculator, child education corpus, sip college fund',
    inputs: [
      { id: 'college_cost', label: 'Current College Admission Cost (₹)', min: 100000, max: 20000000, step: 100000, value: 2000000, type: 'slider', displayValue: '₹20,00,000' },
      { id: 'years_to_college', label: 'Years until College', min: 1, max: 21, step: 1, value: 12, type: 'slider', displayValue: '12' },
      { id: 'return_rate', label: 'Expected CAGR (%)', min: 4, max: 20, step: 0.5, value: 12, type: 'slider', displayValue: '12%' }
    ],
    results: [
      { id: 'inflated-cost', label: 'Inflated College Cost' },
      { id: 'required-sip', label: 'Required Monthly SIP' },
      { id: 'required-lump', label: 'Required Lump Sum' }
    ],
    supportTax: false,
    supportInflation: true, // defaults to 10% for education inflation
    seoContent: `
      <h2>Education Cost Inflation Planning</h2>
      <p>Education costs in India often expand at 8% to 10% annually, which is higher than normal CPI inflation. Accumulating a target fund is crucial.</p>
    `,
    bindingScript: `
      const defaults = { college_cost: 2000000, years_to_college: 12, return_rate: 12, 'inflation-rate': 10 };
      let state = FinanceEngine.getUrlParams(defaults);
      const elements = ['college_cost', 'years_to_college', 'return_rate', 'inflation-rate'];
      
      function syncUI() {
        elements.forEach(id => {
          document.getElementById(id).value = state[id];
          const valDisplay = document.getElementById(id + '-val');
          if (valDisplay) {
            if (id === 'college_cost') valDisplay.textContent = FinanceEngine.formatINR(state[id]);
            else if (id === 'return_rate' || id === 'inflation-rate') valDisplay.textContent = state[id] + '%';
            else valDisplay.textContent = state[id];
          }
        });
      }
      
      function calculate() {
        const cost = state.college_cost;
        const years = state.years_to_college;
        const r = state.return_rate;
        const inf = state['inflation-rate'];
        
        const inflated = cost * Math.pow(1 + inf / 100, years);
        const i = FinanceEngine.getMonthlyRate(r);
        const months = years * 12;
        
        const reqSIP = inflated * i / ((Math.pow(1 + i, months) - 1) * (1 + i));
        const reqLump = inflated / Math.pow(1 + r/100, years);
        
        document.getElementById('inflated-cost').textContent = FinanceEngine.formatINR(inflated);
        document.getElementById('required-sip').textContent = FinanceEngine.formatINR(reqSIP) + ' / mo';
        document.getElementById('required-lump').textContent = FinanceEngine.formatINR(reqLump);
        
        const headers = ['Year', 'SIP Invested', 'SIP Corpus', 'Lump Sum Corpus'];
        let tableRows = [];
        let sipBal = 0;
        let sipInvest = 0;
        for (let y = 1; y <= years; y++) {
          for (let m = 1; m <= 12; m++) {
            sipInvest += reqSIP;
            sipBal = (sipBal + reqSIP) * (1 + i);
          }
          const lump = reqLump * Math.pow(1 + r/100, y);
          tableRows.push([y, Math.round(sipInvest), Math.round(sipBal), Math.round(lump)]);
        }
        
        const tableBody = document.getElementById('table-body');
        const headersRow = document.getElementById('table-headers-row');
        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');
        tableBody.innerHTML = tableRows.map(row => 
          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINR(v, false)) + '</td>').join('') + '</tr>'
        ).join('');
        
        const chartData = tableRows.map(row => ({
          label: 'Yr ' + row[0],
          invested: row[2],
          nominal: row[3]
        }));
        FinanceEngine.renderLineChart('chart-container', chartData, ['invested', 'nominal'], ['#0071e3', '#30d158']);
        
        const csvExporter = FinanceEngine.exportData('education-planner', 
          { 'Current Cost': cost, 'Years': years, 'Return %': r, 'Inflation %': inf },
          { 'Inflated Cost': inflated, 'SIP': reqSIP, 'Lump Sum': reqLump },
          headers,
          tableRows
        );
        document.getElementById('btn-export-csv').onclick = csvExporter.exportCSV;
        document.getElementById('btn-export-json').onclick = csvExporter.exportJSON;
        document.getElementById('btn-copy-table').onclick = () => FinanceEngine.copyTableToClipboard(headers, tableRows);
      }
      
      elements.forEach(id => {
        document.getElementById(id).addEventListener('input', (e) => {
          state[id] = parseFloat(e.target.value);
          syncUI();
          calculate();
          FinanceEngine.updateUrlParams(state);
        });
      });
      
      syncUI();
      calculate();
    `
  },
  // 13. Marriage Planner
  {
    filename: 'marriage-planner.html',
    title: 'Marriage Planner',
    metaDescription: 'Plan for wedding expenses. Compute required monthly savings and lump sum targets with inflation adjustments.',
    keywords: 'marriage planner, wedding cost calculator, wedding savings planner, wedding fund sip',
    inputs: [
      { id: 'wedding_cost', label: 'Current Marriage Cost Estimate (₹)', min: 100000, max: 20000000, step: 100000, value: 2000000, type: 'slider', displayValue: '₹20,00,000' },
      { id: 'years_to_marriage', label: 'Years to Wedding', min: 1, max: 15, step: 1, value: 6, type: 'slider', displayValue: '6' },
      { id: 'return_rate', label: 'Expected CAGR (%)', min: 4, max: 20, step: 0.5, value: 12, type: 'slider', displayValue: '12%' }
    ],
    results: [
      { id: 'inflated-cost', label: 'Inflated Wedding Cost' },
      { id: 'required-sip', label: 'Required Monthly SIP' },
      { id: 'required-lump', label: 'Required Lump Sum' }
    ],
    supportTax: false,
    supportInflation: true,
    seoContent: `
      <h2>Wedding Goal Planner</h2>
      <p>Estimate weddings budgets inflation over time and secure capital allocation rules for the goal.</p>
    `,
    bindingScript: `
      const defaults = { wedding_cost: 2000000, years_to_marriage: 6, return_rate: 12, 'inflation-rate': 7 };
      let state = FinanceEngine.getUrlParams(defaults);
      const elements = ['wedding_cost', 'years_to_marriage', 'return_rate', 'inflation-rate'];
      
      function syncUI() {
        elements.forEach(id => {
          document.getElementById(id).value = state[id];
          const valDisplay = document.getElementById(id + '-val');
          if (valDisplay) {
            if (id === 'wedding_cost') valDisplay.textContent = FinanceEngine.formatINR(state[id]);
            else if (id === 'return_rate' || id === 'inflation-rate') valDisplay.textContent = state[id] + '%';
            else valDisplay.textContent = state[id];
          }
        });
      }
      
      function calculate() {
        const cost = state.wedding_cost;
        const years = state.years_to_marriage;
        const r = state.return_rate;
        const inf = state['inflation-rate'];
        
        const inflated = cost * Math.pow(1 + inf / 100, years);
        const i = FinanceEngine.getMonthlyRate(r);
        const months = years * 12;
        
        const reqSIP = inflated * i / ((Math.pow(1 + i, months) - 1) * (1 + i));
        const reqLump = inflated / Math.pow(1 + r/100, years);
        
        document.getElementById('inflated-cost').textContent = FinanceEngine.formatINR(inflated);
        document.getElementById('required-sip').textContent = FinanceEngine.formatINR(reqSIP) + ' / mo';
        document.getElementById('required-lump').textContent = FinanceEngine.formatINR(reqLump);
        
        const headers = ['Year', 'SIP Invested', 'SIP Corpus', 'Lump Sum Corpus'];
        let tableRows = [];
        let sipBal = 0;
        let sipInvest = 0;
        for (let y = 1; y <= years; y++) {
          for (let m = 1; m <= 12; m++) {
            sipInvest += reqSIP;
            sipBal = (sipBal + reqSIP) * (1 + i);
          }
          const lump = reqLump * Math.pow(1 + r/100, y);
          tableRows.push([y, Math.round(sipInvest), Math.round(sipBal), Math.round(lump)]);
        }
        
        const tableBody = document.getElementById('table-body');
        const headersRow = document.getElementById('table-headers-row');
        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');
        tableBody.innerHTML = tableRows.map(row => 
          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINR(v, false)) + '</td>').join('') + '</tr>'
        ).join('');
        
        const chartData = tableRows.map(row => ({
          label: 'Yr ' + row[0],
          invested: row[2],
          nominal: row[3]
        }));
        FinanceEngine.renderLineChart('chart-container', chartData, ['invested', 'nominal'], ['#0071e3', '#30d158']);
        
        const csvExporter = FinanceEngine.exportData('marriage-planner', 
          { 'Current Cost': cost, 'Years': years, 'Return %': r, 'Inflation %': inf },
          { 'Inflated Cost': inflated, 'SIP': reqSIP, 'Lump': reqLump },
          headers,
          tableRows
        );
        document.getElementById('btn-export-csv').onclick = csvExporter.exportCSV;
        document.getElementById('btn-export-json').onclick = csvExporter.exportJSON;
        document.getElementById('btn-copy-table').onclick = () => FinanceEngine.copyTableToClipboard(headers, tableRows);
      }
      
      elements.forEach(id => {
        document.getElementById(id).addEventListener('input', (e) => {
          state[id] = parseFloat(e.target.value);
          syncUI();
          calculate();
          FinanceEngine.updateUrlParams(state);
        });
      });
      
      syncUI();
      calculate();
    `
  },
  // 14. House Down Payment Planner
  {
    filename: 'house-down-payment.html',
    title: 'House Down Payment Planner',
    metaDescription: 'Plan for your dream house down payment. Model property value inflation, custom down payment percentage, and investment SIP rules.',
    keywords: 'house down payment planner, home loan down payment, house saving calculator',
    inputs: [
      { id: 'property_value', label: 'Target Property Value Today (₹)', min: 1000000, max: 100000000, step: 500000, value: 8000000, type: 'slider', displayValue: '₹80,00,000' },
      { id: 'down_pay_pct', label: 'Down Payment (%)', min: 10, max: 100, step: 5, value: 20, type: 'slider', displayValue: '20%' },
      { id: 'years', label: 'Years to Purchase', min: 1, max: 15, step: 1, value: 5, type: 'slider', displayValue: '5' },
      { id: 'return_rate', label: 'Expected CAGR (%)', min: 4, max: 20, step: 0.5, value: 12, type: 'slider', displayValue: '12%' }
    ],
    results: [
      { id: 'inflated-downpayment', label: 'Required Down Payment' },
      { id: 'required-sip', label: 'Required Monthly SIP' },
      { id: 'required-lump', label: 'Required Lump Sum' }
    ],
    supportTax: false,
    supportInflation: true, // defaults to 7% property inflation
    seoContent: `
      <h2>Real Estate Buying Planner</h2>
      <p>Estimate the inflated cost of your target down payment and create a savings strategy.</p>
    `,
    bindingScript: `
      const defaults = { property_value: 8000000, down_pay_pct: 20, years: 5, return_rate: 12, 'inflation-rate': 7 };
      let state = FinanceEngine.getUrlParams(defaults);
      const elements = ['property_value', 'down_pay_pct', 'years', 'return_rate', 'inflation-rate'];
      
      function syncUI() {
        elements.forEach(id => {
          document.getElementById(id).value = state[id];
          const valDisplay = document.getElementById(id + '-val');
          if (valDisplay) {
            if (id === 'property_value') valDisplay.textContent = FinanceEngine.formatINR(state[id]);
            else if (id === 'down_pay_pct' || id === 'return_rate' || id === 'inflation-rate') valDisplay.textContent = state[id] + '%';
            else valDisplay.textContent = state[id];
          }
        });
      }
      
      function calculate() {
        const val = state.property_value;
        const pct = state.down_pay_pct;
        const years = state.years;
        const r = state.return_rate;
        const inf = state['inflation-rate'];
        
        const inflatedProp = val * Math.pow(1 + inf / 100, years);
        const reqDownPayment = inflatedProp * (pct / 100);
        
        const i = FinanceEngine.getMonthlyRate(r);
        const months = years * 12;
        const reqSIP = reqDownPayment * i / ((Math.pow(1 + i, months) - 1) * (1 + i));
        const reqLump = reqDownPayment / Math.pow(1 + r/100, years);
        
        document.getElementById('inflated-downpayment').textContent = FinanceEngine.formatINR(reqDownPayment);
        document.getElementById('required-sip').textContent = FinanceEngine.formatINR(reqSIP) + ' / mo';
        document.getElementById('required-lump').textContent = FinanceEngine.formatINR(reqLump);
        
        const headers = ['Year', 'SIP Invested', 'SIP Corpus', 'Lump Sum Corpus'];
        let tableRows = [];
        let sipBal = 0;
        let sipInvest = 0;
        for (let y = 1; y <= years; y++) {
          for (let m = 1; m <= 12; m++) {
            sipInvest += reqSIP;
            sipBal = (sipBal + reqSIP) * (1 + i);
          }
          const lump = reqLump * Math.pow(1 + r/100, y);
          tableRows.push([y, Math.round(sipInvest), Math.round(sipBal), Math.round(lump)]);
        }
        
        const tableBody = document.getElementById('table-body');
        const headersRow = document.getElementById('table-headers-row');
        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');
        tableBody.innerHTML = tableRows.map(row => 
          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINR(v, false)) + '</td>').join('') + '</tr>'
        ).join('');
        
        const chartData = tableRows.map(row => ({
          label: 'Yr ' + row[0],
          invested: row[2],
          nominal: row[3]
        }));
        FinanceEngine.renderLineChart('chart-container', chartData, ['invested', 'nominal'], ['#0071e3', '#30d158']);
        
        const csvExporter = FinanceEngine.exportData('house-downpayment-planner', 
          { 'Prop Value': val, 'Down Pay %': pct, 'Years': years, 'Return %': r, 'Property Inflation %': inf },
          { 'Down Payment Required': reqDownPayment, 'SIP': reqSIP, 'Lump Sum': reqLump },
          headers,
          tableRows
        );
        document.getElementById('btn-export-csv').onclick = csvExporter.exportCSV;
        document.getElementById('btn-export-json').onclick = csvExporter.exportJSON;
        document.getElementById('btn-copy-table').onclick = () => FinanceEngine.copyTableToClipboard(headers, tableRows);
      }
      
      elements.forEach(id => {
        document.getElementById(id).addEventListener('input', (e) => {
          state[id] = parseFloat(e.target.value);
          syncUI();
          calculate();
          FinanceEngine.updateUrlParams(state);
        });
      });
      
      syncUI();
      calculate();
    `
  },
  // 15. Child Corpus Planner
  {
    filename: 'child-corpus.html',
    title: 'Child Corpus Planner',
    metaDescription: 'Build a major corpus for your child\'s future milestones. Calculate target savings with CAGR growth and inflation.',
    keywords: 'child corpus calculator, child milestones savings, child future calculator',
    inputs: [
      { id: 'target_amount', label: 'Desired Milestone Amount Today (₹)', min: 100000, max: 20000000, step: 100000, value: 5000000, type: 'slider', displayValue: '₹50,00,000' },
      { id: 'current_age', label: 'Child\'s Current Age (Years)', min: 0, max: 17, step: 1, value: 2, type: 'slider', displayValue: '2' },
      { id: 'target_age', label: 'Target Milestone Age (Years)', min: 18, max: 25, step: 1, value: 21, type: 'slider', displayValue: '21' },
      { id: 'return_rate', label: 'Expected CAGR (%)', min: 4, max: 20, step: 0.5, value: 12, type: 'slider', displayValue: '12%' }
    ],
    results: [
      { id: 'inflated-corpus', label: 'Inflated Target Corpus' },
      { id: 'required-sip', label: 'Required Monthly SIP' },
      { id: 'required-lump', label: 'Required Lump Sum' }
    ],
    supportTax: false,
    supportInflation: true,
    seoContent: `
      <h2>Child Milestones Wealth Planning</h2>
      <p>Estimate targets for major milestones (weddings, business capital, downpayment gifts) at child milestone ages.</p>
    `,
    bindingScript: `
      const defaults = { target_amount: 5000000, current_age: 2, target_age: 21, return_rate: 12, 'inflation-rate': 6 };
      let state = FinanceEngine.getUrlParams(defaults);
      const elements = ['target_amount', 'current_age', 'target_age', 'return_rate', 'inflation-rate'];
      
      function syncUI() {
        elements.forEach(id => {
          document.getElementById(id).value = state[id];
          const valDisplay = document.getElementById(id + '-val');
          if (valDisplay) {
            if (id === 'target_amount') valDisplay.textContent = FinanceEngine.formatINR(state[id]);
            else if (id === 'return_rate' || id === 'inflation-rate') valDisplay.textContent = state[id] + '%';
            else valDisplay.textContent = state[id];
          }
        });
      }
      
      function calculate() {
        const amt = state.target_amount;
        const curA = state.current_age;
        let tarA = state.target_age;
        if (tarA <= curA) {
          tarA = curA + 1;
          state.target_age = tarA;
          document.getElementById('target_age').value = tarA;
          document.getElementById('target_age-val').textContent = tarA;
        }
        
        const r = state.return_rate;
        const inf = state['inflation-rate'];
        
        const years = tarA - curA;
        const inflated = amt * Math.pow(1 + inf / 100, years);
        const i = FinanceEngine.getMonthlyRate(r);
        const months = years * 12;
        
        const reqSIP = inflated * i / ((Math.pow(1 + i, months) - 1) * (1 + i));
        const reqLump = inflated / Math.pow(1 + r/100, years);
        
        document.getElementById('inflated-corpus').textContent = FinanceEngine.formatINR(inflated);
        document.getElementById('required-sip').textContent = FinanceEngine.formatINR(reqSIP) + ' / mo';
        document.getElementById('required-lump').textContent = FinanceEngine.formatINR(reqLump);
        
        const headers = ['Year', 'SIP Invested', 'SIP Corpus', 'Lump Sum Corpus'];
        let tableRows = [];
        let sipBal = 0;
        let sipInvest = 0;
        for (let y = 1; y <= years; y++) {
          for (let m = 1; m <= 12; m++) {
            sipInvest += reqSIP;
            sipBal = (sipBal + reqSIP) * (1 + i);
          }
          const lump = reqLump * Math.pow(1 + r/100, y);
          tableRows.push([y, Math.round(sipInvest), Math.round(sipBal), Math.round(lump)]);
        }
        
        const tableBody = document.getElementById('table-body');
        const headersRow = document.getElementById('table-headers-row');
        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');
        tableBody.innerHTML = tableRows.map(row => 
          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINR(v, false)) + '</td>').join('') + '</tr>'
        ).join('');
        
        const chartData = tableRows.map(row => ({
          label: 'Yr ' + row[0],
          invested: row[2],
          nominal: row[3]
        }));
        FinanceEngine.renderLineChart('chart-container', chartData, ['invested', 'nominal'], ['#0071e3', '#30d158']);
        
        const csvExporter = FinanceEngine.exportData('child-corpus-planner', 
          { 'Target Amount': amt, 'Child Age': curA, 'Target Age': tarA, 'Return %': r, 'Inflation %': inf },
          { 'Inflated Target': inflated, 'SIP': reqSIP, 'Lump Sum': reqLump },
          headers,
          tableRows
        );
        document.getElementById('btn-export-csv').onclick = csvExporter.exportCSV;
        document.getElementById('btn-export-json').onclick = csvExporter.exportJSON;
        document.getElementById('btn-copy-table').onclick = () => FinanceEngine.copyTableToClipboard(headers, tableRows);
      }
      
      elements.forEach(id => {
        document.getElementById(id).addEventListener('input', (e) => {
          state[id] = parseFloat(e.target.value);
          syncUI();
          calculate();
          FinanceEngine.updateUrlParams(state);
        });
      });
      
      syncUI();
      calculate();
    `
  },
  // 16. Net Worth Projection
  {
    filename: 'net-worth-projection.html',
    title: 'Net Worth Projection',
    metaDescription: 'Model your future net worth by combining current assets, debts, yearly savings additions, and expected growth rates.',
    keywords: 'net worth projection, wealth builder calculator, asset liability projection',
    inputs: [
      { id: 'equity_assets', label: 'Equity Assets (₹)', min: 0, max: 50000000, step: 100000, value: 2000000, type: 'slider', displayValue: '₹20,00,000' },
      { id: 'debt_assets', label: 'Debt / Cash Assets (₹)', min: 0, max: 20000000, step: 50000, value: 1000000, type: 'slider', displayValue: '₹10,00,000' },
      { id: 'liabilities', label: 'Total Outstanding Debts (₹)', min: 0, max: 20000000, step: 50000, value: 500000, type: 'slider', displayValue: '₹5,00,000' },
      { id: 'annual_savings', label: 'Yearly Savings Additions (₹)', min: 0, max: 5000000, step: 20000, value: 500000, type: 'slider', displayValue: '₹5,00,000' },
      { id: 'growth_rate', label: 'Average Asset Growth CAGR (%)', min: 1, max: 25, step: 0.5, value: 10, type: 'slider', displayValue: '10%' }
    ],
    results: [
      { id: 'net-worth', label: 'Current Net Worth' },
      { id: 'projected-assets', label: 'Assets (15 Yrs)' },
      { id: 'projected-nw', label: 'Net Worth (15 Yrs)' }
    ],
    supportTax: false,
    supportInflation: false,
    seoContent: `
      <h2>Projecting Net Worth Expansion</h2>
      <p>Your net worth is defined as Total Assets minus Total Liabilities. Growing this number involves growing assets while paying down debt.</p>
    `,
    bindingScript: `
      const defaults = { equity_assets: 2000000, debt_assets: 1000000, liabilities: 500000, annual_savings: 500000, growth_rate: 10 };
      let state = FinanceEngine.getUrlParams(defaults);
      const elements = ['equity_assets', 'debt_assets', 'liabilities', 'annual_savings', 'growth_rate'];
      
      function syncUI() {
        elements.forEach(id => {
          document.getElementById(id).value = state[id];
          const valDisplay = document.getElementById(id + '-val');
          if (valDisplay) {
            if (id === 'growth_rate') valDisplay.textContent = state[id] + '%';
            else valDisplay.textContent = FinanceEngine.formatINR(state[id]);
          }
        });
      }
      
      function calculate() {
        const equity = state.equity_assets;
        const debt = state.debt_assets;
        const liab = state.liabilities;
        const savings = state.annual_savings;
        const growth = state.growth_rate;
        
        const curNW = equity + debt - liab;
        
        const headers = ['Year', 'Assets', 'Liabilities', 'Net Worth'];
        let tableRows = [];
        let runningAssets = equity + debt;
        let runningLiab = liab;
        
        for (let y = 1; y <= 15; y++) {
          runningAssets = runningAssets * (1 + growth / 100) + savings;
          runningLiab = Math.max(0, runningLiab - savings * 0.2); // assume paying off 20% of savings towards liabilities
          tableRows.push([y, Math.round(runningAssets), Math.round(runningLiab), Math.round(runningAssets - runningLiab)]);
        }
        
        document.getElementById('net-worth').textContent = FinanceEngine.formatINR(curNW);
        document.getElementById('projected-assets').textContent = FinanceEngine.formatINR(runningAssets);
        document.getElementById('projected-nw').textContent = FinanceEngine.formatINR(runningAssets - runningLiab);
        
        const tableBody = document.getElementById('table-body');
        const headersRow = document.getElementById('table-headers-row');
        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');
        tableBody.innerHTML = tableRows.map(row => 
          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINR(v, false)) + '</td>').join('') + '</tr>'
        ).join('');
        
        const chartData = tableRows.map(row => ({
          label: 'Yr ' + row[0],
          invested: row[2], // liabilities
          nominal: row[3]   // net worth
        }));
        FinanceEngine.renderLineChart('chart-container', chartData, ['invested', 'nominal'], ['#e5484d', '#30d158']);
        
        const csvExporter = FinanceEngine.exportData('net-worth-projection', 
          { 'Equity': equity, 'Debt': debt, 'Liabilities': liab, 'Savings Addition': savings, 'Growth CAGR': growth },
          { 'Current NW': curNW, 'Assets 15Yr': runningAssets, 'Net Worth 15Yr': runningAssets - runningLiab },
          headers,
          tableRows
        );
        document.getElementById('btn-export-csv').onclick = csvExporter.exportCSV;
        document.getElementById('btn-export-json').onclick = csvExporter.exportJSON;
        document.getElementById('btn-copy-table').onclick = () => FinanceEngine.copyTableToClipboard(headers, tableRows);
      }
      
      elements.forEach(id => {
        document.getElementById(id).addEventListener('input', (e) => {
          state[id] = parseFloat(e.target.value);
          syncUI();
          calculate();
          FinanceEngine.updateUrlParams(state);
        });
      });
      
      syncUI();
      calculate();
    `
  },
  // 17. Asset Allocation Calculator
  {
    filename: 'asset-allocation.html',
    title: 'Asset Allocation Calculator',
    metaDescription: 'Rebalance your portfolio by calculating current allocation deviations from target equity, debt, gold, and cash weights.',
    keywords: 'asset allocation calculator, portfolio rebalancing tool, target asset weights',
    inputs: [
      { id: 'equity_val', label: 'Current Equity (₹)', min: 0, max: 20000000, step: 50000, value: 500000, type: 'slider', displayValue: '₹5,00,000' },
      { id: 'debt_val', label: 'Current Debt (₹)', min: 0, max: 20000000, step: 50000, value: 300000, type: 'slider', displayValue: '₹3,00,000' },
      { id: 'gold_val', label: 'Current Gold (₹)', min: 0, max: 10000000, step: 20000, value: 100000, type: 'slider', displayValue: '₹1,00,000' },
      { id: 'cash_val', label: 'Current Cash (₹)', min: 0, max: 10000000, step: 10000, value: 100000, type: 'slider', displayValue: '₹1,00,000' },
      { id: 'target_equity', label: 'Target Equity (%)', min: 0, max: 100, step: 5, value: 60, type: 'slider', displayValue: '60%' },
      { id: 'target_debt', label: 'Target Debt (%)', min: 0, max: 100, step: 5, value: 20, type: 'slider', displayValue: '20%' },
      { id: 'target_gold', label: 'Target Gold (%)', min: 0, max: 100, step: 5, value: 10, type: 'slider', displayValue: '10%' }
    ],
    results: [
      { id: 'total-portfolio', label: 'Total Portfolio Value' },
      { id: 'rebalance-action', label: 'Rebalance Status', subLabel: 'Requires adjustments' }
    ],
    supportTax: false,
    supportInflation: false,
    noChart: false,
    chartLegend: `
      <div class="legend-item"><span class="legend-color" style="background-color: #0071e3;"></span>Equity</div>
      <div class="legend-item"><span class="legend-color" style="background-color: #30d158;"></span>Debt</div>
      <div class="legend-item"><span class="legend-color" style="background-color: #ffd60a;"></span>Gold</div>
      <div class="legend-item"><span class="legend-color" style="background-color: #86868b;"></span>Cash</div>
    `,
    seoContent: `
      <h2>Portfolio Rebalancing Analysis</h2>
      <p>Maintaining target asset allocation weights secures optimal risk-adjusted returns. Rebalancing periodically prevents style drift.</p>
    `,
    bindingScript: `
      const defaults = { equity_val: 500000, debt_val: 300000, gold_val: 100000, cash_val: 100000, target_equity: 60, target_debt: 20, target_gold: 10 };
      let state = FinanceEngine.getUrlParams(defaults);
      const elements = ['equity_val', 'debt_val', 'gold_val', 'cash_val', 'target_equity', 'target_debt', 'target_gold'];
      
      function syncUI() {
        elements.forEach(id => {
          document.getElementById(id).value = state[id];
          const valDisplay = document.getElementById(id + '-val');
          if (valDisplay) {
            if (id.startsWith('target_')) valDisplay.textContent = state[id] + '%';
            else valDisplay.textContent = FinanceEngine.formatINR(state[id]);
          }
        });
      }
      
      function calculate() {
        const eq = state.equity_val;
        const dt = state.debt_val;
        const gd = state.gold_val;
        const cs = state.cash_val;
        const total = eq + dt + gd + cs;
        
        let tEq = state.target_equity;
        let tDt = state.target_debt;
        let tGd = state.target_gold;
        let tCs = 100 - (tEq + tDt + tGd);
        if (tCs < 0) {
          tCs = 0;
          // Normalize others
          const sum = tEq + tDt + tGd;
          tEq = Math.round((tEq / sum) * 100);
          tDt = Math.round((tDt / sum) * 100);
          tGd = 100 - (tEq + tDt);
        }
        
        const currentAlloc = {
          equity: total > 0 ? (eq / total) * 100 : 0,
          debt: total > 0 ? (dt / total) * 100 : 0,
          gold: total > 0 ? (gd / total) * 100 : 0,
          cash: total > 0 ? (cs / total) * 100 : 0
        };
        
        const targetAlloc = { equity: tEq, debt: tDt, gold: tGd, cash: tCs };
        
        const requiredAmounts = {
          equity: total * (tEq / 100),
          debt: total * (tDt / 100),
          gold: total * (tGd / 100),
          cash: total * (tCs / 100)
        };
        
        const deviation = {
          equity: eq - requiredAmounts.equity,
          debt: dt - requiredAmounts.debt,
          gold: gd - requiredAmounts.gold,
          cash: cs - requiredAmounts.cash
        };
        
        document.getElementById('total-portfolio').textContent = FinanceEngine.formatINR(total);
        
        // Formulate rebalance status text
        let rebalanceNeeded = false;
        const devThreshold = 5; // 5% threshold
        for (const k in currentAlloc) {
          if (Math.abs(currentAlloc[k] - targetAlloc[k]) > devThreshold) rebalanceNeeded = true;
        }
        document.getElementById('rebalance-action').textContent = rebalanceNeeded ? 'Action Needed' : 'Balanced';
        
        const headers = ['Asset Class', 'Current Value', 'Current Alloc %', 'Target Alloc %', 'Target Value', 'Adjustment (Buy/Sell)'];
        const tableRows = [
          ['Equity', eq, currentAlloc.equity.toFixed(1) + '%', targetAlloc.equity + '%', Math.round(requiredAmounts.equity), Math.round(-deviation.equity)],
          ['Debt', dt, currentAlloc.debt.toFixed(1) + '%', targetAlloc.debt + '%', Math.round(requiredAmounts.debt), Math.round(-deviation.debt)],
          ['Gold', gd, currentAlloc.gold.toFixed(1) + '%', targetAlloc.gold + '%', Math.round(requiredAmounts.gold), Math.round(-deviation.gold)],
          ['Cash', cs, currentAlloc.cash.toFixed(1) + '%', targetAlloc.cash + '%', Math.round(requiredAmounts.cash), Math.round(-deviation.cash)]
        ];
        
        const tableBody = document.getElementById('table-body');
        const headersRow = document.getElementById('table-headers-row');
        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');
        
        tableBody.innerHTML = tableRows.map(row => 
          '<tr>' + row.map((v, idx) => {
            if (idx === 0 || idx === 2 || idx === 3) return '<td>' + v + '</td>';
            const valStr = FinanceEngine.formatINR(Math.abs(v), false);
            if (idx === 5) {
              const color = v > 0 ? 'var(--success-color)' : (v < 0 ? 'var(--text-primary)' : 'var(--text-secondary)');
              const sign = v > 0 ? 'Buy ' : (v < 0 ? 'Sell ' : '');
              return \`<td style="color:\${color}; font-weight:600;">\${sign}\${v === 0 ? 'No Change' : valStr}</td>\`;
            }
            return '<td>' + valStr + '</td>';
          }).join('') + '</tr>'
        ).join('');
        
        // Render Donut Chart
        const slices = [
          { label: 'Equity', value: eq, color: '#0071e3' },
          { label: 'Debt', value: dt, color: '#30d158' },
          { label: 'Gold', value: gd, color: '#ffd60a' },
          { label: 'Cash', value: cs, color: '#86868b' }
        ];
        FinanceEngine.renderDonutChart('chart-container', slices);
        
        const csvExporter = FinanceEngine.exportData('asset-allocation', 
          { 'Current Equity': eq, 'Current Debt': dt, 'Current Gold': gd, 'Current Cash': cs },
          { 'Total Portfolio': total },
          headers,
          tableRows.map(r => [r[0], r[1], r[2], r[3], r[4], r[5]])
        );
        document.getElementById('btn-export-csv').onclick = csvExporter.exportCSV;
        document.getElementById('btn-export-json').onclick = csvExporter.exportJSON;
        document.getElementById('btn-copy-table').onclick = () => FinanceEngine.copyTableToClipboard(headers, tableRows);
      }
      
      elements.forEach(id => {
        document.getElementById(id).addEventListener('input', (e) => {
          state[id] = parseFloat(e.target.value);
          syncUI();
          calculate();
          FinanceEngine.updateUrlParams(state);
        });
      });
      
      syncUI();
      calculate();
    `
  },
  // 18. CAGR Calculator
  {
    filename: 'cagr.html',
    title: 'CAGR Calculator',
    metaDescription: 'Find the Compound Annual Growth Rate (CAGR) of your investments over any period of years.',
    keywords: 'cagr calculator, compound annual growth rate, cagr calculation formula, investment return cagr',
    inputs: [
      { id: 'initial_val', label: 'Initial Value (₹)', min: 100, max: 10000000, step: 500, value: 100000, type: 'slider', displayValue: '₹1,00,000' },
      { id: 'final_val', label: 'Final Value (₹)', min: 100, max: 50000000, step: 1000, value: 250000, type: 'slider', displayValue: '₹2,50,000' },
      { id: 'years', label: 'Duration (Years)', min: 0.1, max: 40, step: 0.1, value: 5, type: 'slider', displayValue: '5' }
    ],
    results: [
      { id: 'cagr-result', label: 'Compound Annual Growth Rate (CAGR)' },
      { id: 'absolute-return', label: 'Absolute Return' }
    ],
    supportTax: false,
    supportInflation: false,
    noChart: true,
    noTable: true,
    seoContent: `
      <h2>Compound Annual Growth Rate</h2>
      <p>CAGR measures the mean annual growth rate of an investment over a specified period of time longer than one year, assuming the investment compounds annually.</p>
      <div class="formula-box">
        <math display="block">
          <mi>CAGR</mi>
          <mo>=</mo>
          <msup>
            <mrow>
              <mo>(</mo>
              <mfrac>
                <mi>Final Value</mi>
                <mi>Initial Value</mi>
              </mfrac>
              <mo>)</mo>
            </mrow>
            <mfrac>
              <mn>1</mn>
              <mi>Years</mi>
            </mfrac>
          </msup>
          <mo>−</mo>
          <mn>1</mn>
        </math>
      </div>
    `,
    bindingScript: `
      const defaults = { initial_val: 100000, final_val: 250000, years: 5 };
      let state = FinanceEngine.getUrlParams(defaults);
      const elements = ['initial_val', 'final_val', 'years'];
      
      function syncUI() {
        elements.forEach(id => {
          document.getElementById(id).value = state[id];
          const valDisplay = document.getElementById(id + '-val');
          if (valDisplay) {
            if (id === 'years') valDisplay.textContent = state[id];
            else valDisplay.textContent = FinanceEngine.formatINR(state[id]);
          }
        });
      }
      
      function calculate() {
        const init = state.initial_val;
        const final = state.final_val;
        const years = state.years;
        
        const cagr = (Math.pow(final / init, 1 / years) - 1) * 100;
        const absReturn = ((final - init) / init) * 100;
        
        document.getElementById('cagr-result').textContent = cagr.toFixed(2) + '%';
        document.getElementById('absolute-return').textContent = absReturn.toFixed(2) + '%';
        
        const csvExporter = FinanceEngine.exportData('cagr-calculator', 
          { 'Initial': init, 'Final': final, 'Years': years },
          { 'CAGR %': cagr, 'Absolute Return %': absReturn }
        );
        document.getElementById('btn-export-csv').onclick = csvExporter.exportCSV;
        document.getElementById('btn-export-json').onclick = csvExporter.exportJSON;
        document.getElementById('btn-copy-table').style.display = 'none';
      }
      
      elements.forEach(id => {
        document.getElementById(id).addEventListener('input', (e) => {
          state[id] = parseFloat(e.target.value);
          syncUI();
          calculate();
          FinanceEngine.updateUrlParams(state);
        });
      });
      
      syncUI();
      calculate();
    `
  },
  // 19. XIRR Calculator
  {
    filename: 'xirr.html',
    title: 'XIRR Calculator',
    metaDescription: 'Calculate the Extended Internal Rate of Return (XIRR) for irregular transaction cashflows (SIPs, lump sums, and withdrawals).',
    keywords: 'xirr calculator, irregular cashflow return, xirr mutual funds, xirr solver',
    inputs: [],
    results: [
      { id: 'xirr-result', label: 'Calculated XIRR (Annualized CAGR)' }
    ],
    supportTax: false,
    supportInflation: false,
    noChart: true,
    noTable: true,
    customInputsHtml: `
      <div id="cashflow-builder" style="margin-top: 1.5rem;">
        <span style="font-weight: 600; display:block; margin-bottom: 0.5rem;">Cash Flows (Negative = Investment, Positive = Return/Balance)</span>
        <div id="flows-list" style="display:flex; flex-direction:column; gap:0.75rem;">
          <!-- Flow rows -->
        </div>
        <button class="btn btn-secondary" id="btn-add-flow" style="margin-top: 1rem; width:100%; justify-content:center;">+ Add Cash Flow</button>
      </div>
    `,
    seoContent: `
      <h2>Calculating Returns on Irregular Cash Flows</h2>
      <p>XIRR is the standard method used in personal finance to compute annualized CAGR when investments, additions, and withdrawals occur on irregular dates.</p>
    `,
    bindingScript: `
      let cashFlows = [
        { date: '2025-01-01', amount: -10000 },
        { date: '2025-06-15', amount: -5000 },
        { date: '2026-01-01', amount: 17000 }
      ];
      
      function renderFlows() {
        const container = document.getElementById('flows-list');
        container.innerHTML = '';
        
        cashFlows.forEach((flow, idx) => {
          const row = document.createElement('div');
          row.style.display = 'flex';
          row.style.gap = '0.5rem';
          row.style.alignItems = 'center';
          
          row.innerHTML = \`
            <input type="date" value="\${flow.date}" class="flow-date" style="flex: 1;" aria-label="Date">
            <input type="number" value="\${flow.amount}" class="flow-amount" style="flex: 1;" placeholder="Amount (negative if invested)" aria-label="Amount">
            <button class="btn-delete-flow" style="background:none; border:none; color:var(--text-secondary); cursor:pointer; padding: 0.5rem;" aria-label="Delete">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
          \`;
          
          row.querySelector('.flow-date').addEventListener('change', (e) => {
            cashFlows[idx].date = e.target.value;
            calculate();
          });
          
          row.querySelector('.flow-amount').addEventListener('input', (e) => {
            cashFlows[idx].amount = parseFloat(e.target.value) || 0;
            calculate();
          });
          
          row.querySelector('.btn-delete-flow').addEventListener('click', () => {
            if (cashFlows.length <= 2) {
              FinanceEngine.showToast('At least 2 cash flows are required');
              return;
            }
            cashFlows.splice(idx, 1);
            renderFlows();
            calculate();
          });
          
          container.appendChild(row);
        });
      }
      
      function calculate() {
        const parsedFlows = cashFlows.map(f => ({
          date: new Date(f.date),
          amount: f.amount
        })).filter(f => !isNaN(f.date.getTime()));
        
        const xirr = FinanceEngine.calculateXIRR(parsedFlows);
        const resultDisplay = document.getElementById('xirr-result');
        
        if (isNaN(xirr)) {
          resultDisplay.textContent = 'Solver Error (check values)';
        } else {
          resultDisplay.textContent = xirr.toFixed(2) + '%';
        }
        
        const csvExporter = FinanceEngine.exportData('xirr-calculator', 
          { 'Cashflows Count': cashFlows.length },
          { 'XIRR %': xirr },
          ['Date', 'Amount'],
          cashFlows.map(f => [f.date, f.amount])
        );
        document.getElementById('btn-export-csv').onclick = csvExporter.exportCSV;
        document.getElementById('btn-export-json').onclick = csvExporter.exportJSON;
        document.getElementById('btn-copy-table').onclick = () => FinanceEngine.copyTableToClipboard(['Date', 'Amount'], cashFlows.map(f => [f.date, f.amount]));
      }
      
      document.getElementById('btn-add-flow').onclick = () => {
        const lastFlow = cashFlows[cashFlows.length - 1];
        const nextDate = new Date(lastFlow.date);
        nextDate.setMonth(nextDate.getMonth() + 6);
        
        cashFlows.push({
          date: nextDate.toISOString().slice(0, 10),
          amount: -5000
        });
        renderFlows();
        calculate();
      };
      
      renderFlows();
      calculate();
    `
  },
  // 20. Inflation Calculator
  {
    filename: 'inflation.html',
    title: 'Inflation Calculator',
    metaDescription: 'Measure the impact of inflation on your money. Calculate future purchasing power erosion and nominal cash equivalents.',
    keywords: 'inflation calculator, purchasing power erosion, future value inflation',
    inputs: [
      { id: 'amount', label: 'Current Amount (₹)', min: 100, max: 10000000, step: 500, value: 100000, type: 'slider', displayValue: '₹1,00,000' },
      { id: 'inflation_rate', label: 'Average Annual Inflation (%)', min: 1, max: 15, step: 0.5, value: 6, type: 'slider', displayValue: '6%' },
      { id: 'years', label: 'Duration (Years)', min: 1, max: 40, step: 1, value: 10, type: 'slider', displayValue: '10' }
    ],
    results: [
      { id: 'future-nominal', label: 'Future Value Required (to keep parity)' },
      { id: 'purchasing-power', label: 'Eroded Value (Purchasing Power)' }
    ],
    supportTax: false,
    supportInflation: false,
    seoContent: `
      <h2>The Erosion of Purchasing Power</h2>
      <p>Inflation decreases the real value of cash over time. An item costing ₹10,000 today will require a higher dollar/rupee amount to purchase in 10 years.</p>
    `,
    bindingScript: `
      const defaults = { amount: 100000, inflation_rate: 6, years: 10 };
      let state = FinanceEngine.getUrlParams(defaults);
      const elements = ['amount', 'inflation_rate', 'years'];
      
      function syncUI() {
        elements.forEach(id => {
          document.getElementById(id).value = state[id];
          const valDisplay = document.getElementById(id + '-val');
          if (valDisplay) {
            if (id === 'inflation_rate') valDisplay.textContent = state[id] + '%';
            else if (id === 'years') valDisplay.textContent = state[id];
            else valDisplay.textContent = FinanceEngine.formatINR(state[id]);
          }
        });
      }
      
      function calculate() {
        const amt = state.amount;
        const inf = state.inflation_rate;
        const years = state.years;
        
        const futureNom = amt * Math.pow(1 + inf/100, years);
        const erodedVal = amt / Math.pow(1 + inf/100, years);
        
        document.getElementById('future-nominal').textContent = FinanceEngine.formatINR(futureNom);
        document.getElementById('purchasing-power').textContent = FinanceEngine.formatINR(erodedVal);
        
        const headers = ['Year', 'Purchasing Power', 'Nominal Cost Equivalency'];
        let tableRows = [];
        for (let y = 1; y <= years; y++) {
          tableRows.push([
            y,
            Math.round(amt / Math.pow(1 + inf/100, y)),
            Math.round(amt * Math.pow(1 + inf/100, y))
          ]);
        }
        
        const tableBody = document.getElementById('table-body');
        const headersRow = document.getElementById('table-headers-row');
        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');
        tableBody.innerHTML = tableRows.map(row => 
          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINR(v, false)) + '</td>').join('') + '</tr>'
        ).join('');
        
        const chartData = tableRows.map(row => ({
          label: 'Yr ' + row[0],
          nominal: row[2], // nominal cost
          real: row[1]     // real purchasing power
        }));
        FinanceEngine.renderLineChart('chart-container', chartData, ['nominal', 'real'], ['#e5484d', '#30d158']);
        
        const csvExporter = FinanceEngine.exportData('inflation-calculator', 
          { 'Amount': amt, 'Inflation %': inf, 'Years': years },
          { 'Future Nominal Required': futureNom, 'Purchasing Power': erodedVal },
          headers,
          tableRows
        );
        document.getElementById('btn-export-csv').onclick = csvExporter.exportCSV;
        document.getElementById('btn-export-json').onclick = csvExporter.exportJSON;
        document.getElementById('btn-copy-table').onclick = () => FinanceEngine.copyTableToClipboard(headers, tableRows);
      }
      
      elements.forEach(id => {
        document.getElementById(id).addEventListener('input', (e) => {
          state[id] = parseFloat(e.target.value);
          syncUI();
          calculate();
          FinanceEngine.updateUrlParams(state);
        });
      });
      
      syncUI();
      calculate();
    `
  },
  // 21. Real Return Calculator
  {
    filename: 'real-return.html',
    title: 'Real Return Calculator',
    metaDescription: 'Find your real net return on investments after subtracting tax obligations and annual inflation rates.',
    keywords: 'real return calculator, post tax real return, inflation adjusted returns',
    inputs: [
      { id: 'nominal_return', label: 'Nominal Asset Return (%)', min: 1, max: 30, step: 0.5, value: 12, type: 'slider', displayValue: '12%' },
      { id: 'tax_rate', label: 'Your Income Tax Slab (%)', min: 0, max: 40, step: 1, value: 20, type: 'slider', displayValue: '20%' },
      { id: 'inflation_rate', label: 'Expected Annual Inflation (%)', min: 1, max: 15, step: 0.5, value: 6, type: 'slider', displayValue: '6%' }
    ],
    results: [
      { id: 'post-tax-nominal', label: 'Post-Tax Nominal Return' },
      { id: 'real-return-result', label: 'Net Real Rate of Return' }
    ],
    supportTax: false,
    supportInflation: false,
    noChart: true,
    noTable: true,
    seoContent: `
      <h2>The Real Rate of Return</h2>
      <p>True purchasing power growth occurs when nominal returns exceed both taxes and inflation. Real Return is calculated as:</p>
      <div class="formula-box">
        <math display="block">
          <msub>
            <mi>R</mi>
            <mtext>post-tax</mtext>
          </msub>
          <mo>=</mo>
          <msub>
            <mi>R</mi>
            <mtext>nominal</mtext>
          </msub>
          <mo>×</mo>
          <mrow>
            <mo>(</mo>
            <mn>1</mn>
            <mo>−</mo>
            <mfrac>
              <mi>Tax Rate</mi>
              <mn>100</mn>
            </mfrac>
            <mo>)</mo>
          </mrow>
        </math>
        <math display="block">
          <msub>
            <mi>R</mi>
            <mtext>real</mtext>
          </msub>
          <mo>=</mo>
          <mfrac>
            <mrow>
              <mn>1</mn>
              <mo>+</mo>
              <msub>
                <mi>R</mi>
                <mtext>post-tax</mtext>
              </msub>
            </mrow>
            <mrow>
              <mn>1</mn>
              <mo>+</mo>
              <mfrac>
                <mi>Inflation Rate</mi>
                <mn>100</mn>
              </mfrac>
            </mrow>
          </mfrac>
          <mo>−</mo>
          <mn>1</mn>
        </math>
      </div>
    `,
    bindingScript: `
      const defaults = { nominal_return: 12, tax_rate: 20, inflation_rate: 6 };
      let state = FinanceEngine.getUrlParams(defaults);
      const elements = ['nominal_return', 'tax_rate', 'inflation_rate'];
      
      function syncUI() {
        elements.forEach(id => {
          document.getElementById(id).value = state[id];
          const valDisplay = document.getElementById(id + '-val');
          if (valDisplay) valDisplay.textContent = state[id] + '%';
        });
      }
      
      function calculate() {
        const nom = state.nominal_return / 100;
        const tax = state.tax_rate / 100;
        const inf = state.inflation_rate / 100;
        
        const postTaxNom = nom * (1 - tax);
        const realReturn = ((1 + postTaxNom) / (1 + inf) - 1) * 100;
        
        document.getElementById('post-tax-nominal').textContent = (postTaxNom * 100).toFixed(2) + '%';
        document.getElementById('real-return-result').textContent = realReturn.toFixed(2) + '%';
        
        const csvExporter = FinanceEngine.exportData('real-return-calculator', 
          { 'Nominal Return': nom*100, 'Tax Rate': tax*100, 'Inflation': inf*100 },
          { 'Post Tax Nominal %': postTaxNom*100, 'Real Return %': realReturn }
        );
        document.getElementById('btn-export-csv').onclick = csvExporter.exportCSV;
        document.getElementById('btn-export-json').onclick = csvExporter.exportJSON;
        document.getElementById('btn-copy-table').style.display = 'none';
      }
      
      elements.forEach(id => {
        document.getElementById(id).addEventListener('input', (e) => {
          state[id] = parseFloat(e.target.value);
          syncUI();
          calculate();
          FinanceEngine.updateUrlParams(state);
        });
      });
      
      syncUI();
      calculate();
    `
  },
  // 22. EMI Calculator
  {
    filename: 'emi.html',
    title: 'EMI Calculator',
    metaDescription: 'Calculate Equated Monthly Installments (EMI) for home, car, or personal loans. Generate standard interest summaries and amortization schedules.',
    keywords: 'emi calculator, loan emi, home loan calculator, reducing balance emi',
    inputs: [
      { id: 'loan_amount', label: 'Loan Amount (₹)', min: 10000, max: 20000000, step: 10000, value: 5000000, type: 'slider', displayValue: '₹50,00,000' },
      { id: 'interest_rate', label: 'Interest Rate (Nominal annual %)', min: 4, max: 20, step: 0.1, value: 8.5, type: 'slider', displayValue: '8.5%' },
      { id: 'tenure', label: 'Loan Tenure (Years)', min: 1, max: 30, step: 1, value: 20, type: 'slider', displayValue: '20' }
    ],
    results: [
      { id: 'emi-result', label: 'Equated Monthly Installment (EMI)' },
      { id: 'total-interest', label: 'Total Interest Payable' },
      { id: 'total-payment', label: 'Total Loan Payments' }
    ],
    supportTax: false,
    supportInflation: false,
    seoContent: `
      <h2>Understanding Reducing Interest Loans</h2>
      <p>EMIs are computed using a reducing balance method where interest is computed monthly on the outstanding loan balance.</p>
    `,
    bindingScript: `
      const defaults = { loan_amount: 5000000, interest_rate: 8.5, tenure: 20 };
      let state = FinanceEngine.getUrlParams(defaults);
      const elements = ['loan_amount', 'interest_rate', 'tenure'];
      
      function syncUI() {
        elements.forEach(id => {
          document.getElementById(id).value = state[id];
          const valDisplay = document.getElementById(id + '-val');
          if (valDisplay) {
            if (id === 'interest_rate') valDisplay.textContent = state[id] + '%';
            else if (id === 'tenure') valDisplay.textContent = state[id];
            else valDisplay.textContent = FinanceEngine.formatINR(state[id]);
          }
        });
      }
      
      function calculate() {
        const P = state.loan_amount;
        const R = state.interest_rate;
        const y = state.tenure;
        
        const r_m = R / 12 / 100; // nominal interest rate/12
        const m = y * 12;
        
        const emi = P * r_m * Math.pow(1 + r_m, m) / (Math.pow(1 + r_m, m) - 1);
        const totalPay = emi * m;
        const totalInt = totalPay - P;
        
        document.getElementById('emi-result').textContent = FinanceEngine.formatINR(emi) + ' / mo';
        document.getElementById('total-interest').textContent = FinanceEngine.formatINR(totalInt);
        document.getElementById('total-payment').textContent = FinanceEngine.formatINR(totalPay);
        
        const headers = ['Year', 'Principal Paid', 'Interest Paid', 'Total Paid', 'Remaining Balance'];
        let tableRows = [];
        let balance = P;
        
        for (let yr = 1; yr <= y; yr++) {
          let yrInterest = 0;
          let yrPrincipal = 0;
          
          for (let month = 1; month <= 12; month++) {
            const interest = balance * r_m;
            const principal = emi - interest;
            yrInterest += interest;
            yrPrincipal += principal;
            balance -= principal;
          }
          
          tableRows.push([
            yr,
            Math.round(yrPrincipal),
            Math.round(yrInterest),
            Math.round(yrPrincipal + yrInterest),
            Math.round(Math.max(0, balance))
          ]);
        }
        
        const tableBody = document.getElementById('table-body');
        const headersRow = document.getElementById('table-headers-row');
        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');
        tableBody.innerHTML = tableRows.map(row => 
          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINR(v, false)) + '</td>').join('') + '</tr>'
        ).join('');
        
        const chartData = tableRows.map(row => ({
          label: 'Yr ' + row[0],
          invested: row[4], // remaining balance
          nominal: row[4]
        }));
        FinanceEngine.renderLineChart('chart-container', chartData, ['invested'], ['#e5484d']);
        
        const csvExporter = FinanceEngine.exportData('emi-calculator', 
          { 'Loan Amount': P, 'Rate': R, 'Tenure': y },
          { 'EMI': emi, 'Total Interest': totalInt, 'Total Payment': totalPay },
          headers,
          tableRows
        );
        document.getElementById('btn-export-csv').onclick = csvExporter.exportCSV;
        document.getElementById('btn-export-json').onclick = csvExporter.exportJSON;
        document.getElementById('btn-copy-table').onclick = () => FinanceEngine.copyTableToClipboard(headers, tableRows);
      }
      
      elements.forEach(id => {
        document.getElementById(id).addEventListener('input', (e) => {
          state[id] = parseFloat(e.target.value);
          syncUI();
          calculate();
          FinanceEngine.updateUrlParams(state);
        });
      });
      
      syncUI();
      calculate();
    `
  },
  // 23. Loan Prepayment Calculator
  {
    filename: 'loan-prepayment.html',
    title: 'Loan Prepayment Calculator',
    metaDescription: 'Find interest savings and tenure reduction by prepaying lumpsum amounts or monthly top-ups on loans.',
    keywords: 'loan prepayment calculator, home loan prepayment savings, prepay emi calculator',
    inputs: [
      { id: 'loan_amount', label: 'Loan Amount (₹)', min: 10000, max: 20000000, step: 10000, value: 5000000, type: 'slider', displayValue: '₹50,00,000' },
      { id: 'interest_rate', label: 'Interest Rate (%)', min: 4, max: 20, step: 0.1, value: 8.5, type: 'slider', displayValue: '8.5%' },
      { id: 'tenure', label: 'Original Tenure (Years)', min: 1, max: 30, step: 1, value: 20, type: 'slider', displayValue: '20' },
      { id: 'prepay_monthly', label: 'Extra Monthly Prepayment (₹)', min: 0, max: 100000, step: 1000, value: 5000, type: 'slider', displayValue: '₹5,000' }
    ],
    results: [
      { id: 'total-interest-saved', label: 'Interest Amount Saved' },
      { id: 'months-saved', label: 'Tenure Saved', subLabel: 'Months early' },
      { id: 'new-total-interest', label: 'New Total Interest' }
    ],
    supportTax: false,
    supportInflation: false,
    seoContent: `
      <h2>The Leverage of Loan Prepayment</h2>
      <p>Adding regular pre-payments reduces your principal balance, lowering interest compound growth and saving thousands in interest payout.</p>
    `,
    bindingScript: `
      const defaults = { loan_amount: 5000000, interest_rate: 8.5, tenure: 20, prepay_monthly: 5000 };
      let state = FinanceEngine.getUrlParams(defaults);
      const elements = ['loan_amount', 'interest_rate', 'tenure', 'prepay_monthly'];
      
      function syncUI() {
        elements.forEach(id => {
          document.getElementById(id).value = state[id];
          const valDisplay = document.getElementById(id + '-val');
          if (valDisplay) {
            if (id === 'interest_rate') valDisplay.textContent = state[id] + '%';
            else if (id === 'tenure') valDisplay.textContent = state[id];
            else valDisplay.textContent = FinanceEngine.formatINR(state[id]);
          }
        });
      }
      
      function calculate() {
        const P = state.loan_amount;
        const R = state.interest_rate;
        const y = state.tenure;
        const extraM = state.prepay_monthly;
        
        const r_m = R / 12 / 100;
        const originalMonths = y * 12;
        const standardEMI = P * r_m * Math.pow(1 + r_m, originalMonths) / (Math.pow(1 + r_m, originalMonths) - 1);
        
        // 1. Original loan parameters
        let origInt = 0;
        let origBal = P;
        for (let m = 1; m <= originalMonths; m++) {
          const interest = origBal * r_m;
          origInt += interest;
          origBal = origBal - (standardEMI - interest);
        }
        
        // 2. Prepayment loan parameters
        let prepayInt = 0;
        let prepayBal = P;
        let monthsRun = 0;
        
        const headers = ['Year', 'Prepay Principal', 'Interest Paid', 'Prepay Balance', 'Original Balance'];
        let tableRows = [];
        
        let yInt = 0;
        let yPrinc = 0;
        let yOriginalBal = P;
        
        for (let m = 1; m <= originalMonths; m++) {
          if (prepayBal <= 0) break;
          
          monthsRun++;
          const interest = prepayBal * r_m;
          prepayInt += interest;
          yInt += interest;
          
          let actualPay = standardEMI;
          if (prepayBal + interest < standardEMI) {
            actualPay = prepayBal + interest;
          }
          
          let princ = actualPay - interest;
          prepayBal -= princ;
          yPrinc += princ;
          
          // Apply extra monthly prepayment
          if (prepayBal > 0) {
            const actualExtra = Math.min(prepayBal, extraM);
            prepayBal -= actualExtra;
            yPrinc += actualExtra;
          }
          
          // Record original comparison balance
          const origIntM = yOriginalBal * r_m;
          yOriginalBal -= (standardEMI - origIntM);
          if (yOriginalBal < 0) yOriginalBal = 0;
          
          if (m % 12 === 0 || prepayBal <= 0) {
            const yr = Math.ceil(m / 12);
            tableRows.push([
              yr,
              Math.round(yPrinc),
              Math.round(yInt),
              Math.round(Math.max(0, prepayBal)),
              Math.round(yOriginalBal)
            ]);
            yInt = 0;
            yPrinc = 0;
          }
        }
        
        const savedMonths = originalMonths - monthsRun;
        const savedInterest = origInt - prepayInt;
        
        document.getElementById('total-interest-saved').textContent = FinanceEngine.formatINR(savedInterest);
        document.getElementById('months-saved').textContent = savedMonths + ' months';
        document.getElementById('new-total-interest').textContent = FinanceEngine.formatINR(prepayInt);
        
        const tableBody = document.getElementById('table-body');
        const headersRow = document.getElementById('table-headers-row');
        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');
        tableBody.innerHTML = tableRows.map(row => 
          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINR(v, false)) + '</td>').join('') + '</tr>'
        ).join('');
        
        const chartData = tableRows.map(row => ({
          label: 'Yr ' + row[0],
          invested: row[3], // prepay balance
          nominal: row[4]   // original balance
        }));
        FinanceEngine.renderLineChart('chart-container', chartData, ['invested', 'nominal'], ['#30d158', '#e5484d']);
        
        const csvExporter = FinanceEngine.exportData('loan-prepayment', 
          { 'Loan Amount': P, 'Interest %': R, 'Tenure': y, 'Monthly Prepay': extraM },
          { 'Interest Saved': savedInterest, 'Months Saved': savedMonths, 'New Interest': prepayInt },
          headers,
          tableRows
        );
        document.getElementById('btn-export-csv').onclick = csvExporter.exportCSV;
        document.getElementById('btn-export-json').onclick = csvExporter.exportJSON;
        document.getElementById('btn-copy-table').onclick = () => FinanceEngine.copyTableToClipboard(headers, tableRows);
      }
      
      elements.forEach(id => {
        document.getElementById(id).addEventListener('input', (e) => {
          state[id] = parseFloat(e.target.value);
          syncUI();
          calculate();
          FinanceEngine.updateUrlParams(state);
        });
      });
      
      syncUI();
      calculate();
    `
  },
  // 24. Emergency Fund Calculator
  {
    filename: 'emergency-fund.html',
    title: 'Emergency Fund Calculator',
    metaDescription: 'Find your target emergency savings size. Calculate fixed rent, utilities, food, and variable medical coverages.',
    keywords: 'emergency fund calculator, contingency savings, cash reserve planner',
    inputs: [
      { id: 'fixed_expenses', label: 'Rent / Home Loan EMI (₹)', min: 0, max: 200000, step: 2000, value: 20000, type: 'slider', displayValue: '₹20,000' },
      { id: 'food_expenses', label: 'Groceries / Food Costs (₹)', min: 0, max: 100000, step: 1000, value: 10000, type: 'slider', displayValue: '₹10,000' },
      { id: 'insurance_utilities', label: 'Insurance & Utilities (₹)', min: 0, max: 100000, step: 1000, value: 8000, type: 'slider', displayValue: '₹8,000' },
      { id: 'coverage_months', label: 'Coverage Duration (Months)', min: 3, max: 12, step: 1, value: 6, type: 'slider', displayValue: '6' }
    ],
    results: [
      { id: 'target-fund', label: 'Total Contingency Fund' },
      { id: 'monthly-total', label: 'Total Monthly Expense' },
      { id: 'allocation-cash', label: 'Allocation: Liquid Cash (30%)' }
    ],
    supportTax: false,
    supportInflation: false,
    noChart: false,
    chartLegend: `
      <div class="legend-item"><span class="legend-color" style="background-color: #ffd60a;"></span>Cash/Savings</div>
      <div class="legend-item"><span class="legend-color" style="background-color: #0071e3;"></span>Liquid/Arbitrage</div>
      <div class="legend-item"><span class="legend-color" style="background-color: #30d158;"></span>Short-Term FD</div>
    `,
    seoContent: `
      <h2>The Contingency Nest Egg</h2>
      <p>An emergency fund provides safety against job loss, medical emergencies, or unexpected capital bills. Having 3 to 12 months is standard.</p>
    `,
    bindingScript: `
      const defaults = { fixed_expenses: 20000, food_expenses: 10000, insurance_utilities: 8000, coverage_months: 6 };
      let state = FinanceEngine.getUrlParams(defaults);
      const elements = ['fixed_expenses', 'food_expenses', 'insurance_utilities', 'coverage_months'];
      
      function syncUI() {
        elements.forEach(id => {
          document.getElementById(id).value = state[id];
          const valDisplay = document.getElementById(id + '-val');
          if (valDisplay) {
            if (id === 'coverage_months') valDisplay.textContent = state[id];
            else valDisplay.textContent = FinanceEngine.formatINR(state[id]);
          }
        });
      }
      
      function calculate() {
        const fixed = state.fixed_expenses;
        const food = state.food_expenses;
        const ins = state.insurance_utilities;
        const months = state.coverage_months;
        
        const monthlyTotal = fixed + food + ins;
        const targetFund = monthlyTotal * months;
        
        const cashAllocation = targetFund * 0.3;
        const liquidAllocation = targetFund * 0.5;
        const fdAllocation = targetFund * 0.2;
        
        document.getElementById('target-fund').textContent = FinanceEngine.formatINR(targetFund);
        document.getElementById('monthly-total').textContent = FinanceEngine.formatINR(monthlyTotal) + ' / mo';
        document.getElementById('allocation-cash').textContent = FinanceEngine.formatINR(cashAllocation);
        
        const headers = ['Asset Class', 'Recommneded %', 'Allocated Amount', 'Typical Instruments'];
        const tableRows = [
          ['Liquid Cash', '30%', Math.round(cashAllocation), 'Savings A/c / Instant Cash'],
          ['Liquid / Arbitrage Funds', '50%', Math.round(liquidAllocation), 'Mutual Fund Liquid/Arbitrage'],
          ['Short-Term FD', '20%', Math.round(fdAllocation), 'Sweep-In Fixed Deposit']
        ];
        
        const tableBody = document.getElementById('table-body');
        const headersRow = document.getElementById('table-headers-row');
        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');
        tableBody.innerHTML = tableRows.map(row => 
          '<tr>' + row.map((v, idx) => idx === 2 ? '<td>' + FinanceEngine.formatINR(v, false) + '</td>' : '<td>' + v + '</td>').join('') + '</tr>'
        ).join('');
        
        // Render Donut Chart
        const slices = [
          { label: 'Cash', value: cashAllocation, color: '#ffd60a' },
          { label: 'Liquid', value: liquidAllocation, color: '#0071e3' },
          { label: 'FD', value: fdAllocation, color: '#30d158' }
        ];
        FinanceEngine.renderDonutChart('chart-container', slices);
        
        const csvExporter = FinanceEngine.exportData('emergency-fund', 
          { 'Fixed Exp': fixed, 'Food': food, 'Ins & Utl': ins, 'Coverage Months': months },
          { 'Contingency Fund': targetFund },
          headers,
          tableRows
        );
        document.getElementById('btn-export-csv').onclick = csvExporter.exportCSV;
        document.getElementById('btn-export-json').onclick = csvExporter.exportJSON;
        document.getElementById('btn-copy-table').onclick = () => FinanceEngine.copyTableToClipboard(headers, tableRows);
      }
      
      elements.forEach(id => {
        document.getElementById(id).addEventListener('input', (e) => {
          state[id] = parseFloat(e.target.value);
          syncUI();
          calculate();
          FinanceEngine.updateUrlParams(state);
        });
      });
      
      syncUI();
      calculate();
    `
  },
  // 25. Financial Independence Timeline Calculator
  {
    filename: 'financial-independence.html',
    title: 'FI Timeline Calculator',
    metaDescription: 'Find when your investment returns will cover your living expenses, indicating financial independence.',
    keywords: 'fi timeline, financial independence timeline, when can i retire, swr retirement timeline',
    inputs: [
      { id: 'current_age', label: 'Current Age (Years)', min: 18, max: 60, step: 1, value: 28, type: 'slider', displayValue: '28' },
      { id: 'net_worth', label: 'Current Net Worth (₹)', min: 0, max: 50000000, step: 100000, value: 1500000, type: 'slider', displayValue: '₹15,00,000' },
      { id: 'monthly_savings', label: 'Monthly Savings additions (₹)', min: 1000, max: 500000, step: 1000, value: 50000, type: 'slider', displayValue: '₹50,00,000' },
      { id: 'monthly_expenses', label: 'Monthly Living Expenses (₹)', min: 5000, max: 500000, step: 1000, value: 40000, type: 'slider', displayValue: '₹40,000' },
      { id: 'return_rate', label: 'Return CAGR (%)', min: 4, max: 20, step: 0.5, value: 12, type: 'slider', displayValue: '12%' }
    ],
    results: [
      { id: 'fi-age', label: 'Age Reaching FI' },
      { id: 'fi-corpus', label: 'FI Corpus Reached' },
      { id: 'years-to-fi', label: 'Years to FI' }
    ],
    supportTax: false,
    supportInflation: true,
    seoContent: `
      <h2>The Financial Independence Timeline</h2>
      <p>Financial Independence is reached when 4% of your investment corpus exceeds your annual living expenses adjusted for inflation.</p>
    `,
    bindingScript: `
      const defaults = { current_age: 28, net_worth: 1500000, monthly_savings: 50000, monthly_expenses: 40000, return_rate: 12, 'inflation-rate': 6 };
      let state = FinanceEngine.getUrlParams(defaults);
      const elements = ['current_age', 'net_worth', 'monthly_savings', 'monthly_expenses', 'return_rate', 'inflation-rate'];
      
      function syncUI() {
        elements.forEach(id => {
          document.getElementById(id).value = state[id];
          const valDisplay = document.getElementById(id + '-val');
          if (valDisplay) {
            if (id === 'current_age' || id === 'inflation-rate') valDisplay.textContent = state[id];
            else if (id === 'return_rate') valDisplay.textContent = state[id] + '%';
            else valDisplay.textContent = FinanceEngine.formatINR(state[id]);
          }
        });
      }
      
      function calculate() {
        const curAge = state.current_age;
        const nw = state.net_worth;
        const savings = state.monthly_savings;
        const expenses = state.monthly_expenses;
        const r = state.return_rate;
        const inf = state['inflation-rate'];
        
        const i = FinanceEngine.getMonthlyRate(r);
        
        let runningNW = nw;
        let fiReached = false;
        let fiAge = 'N/A';
        let fiCorpus = 0;
        let yearsRun = 0;
        
        const headers = ['Year', 'Age', 'Living Expenses (Inflated)', 'Net Worth', 'FI Target'];
        let tableRows = [];
        
        for (let y = 1; y <= 40; y++) {
          const infExpenses = expenses * 12 * Math.pow(1 + inf/100, y);
          const fiTarget = infExpenses / 0.04; // 4% SWR
          
          for (let m = 1; m <= 12; m++) {
            runningNW = (runningNW + savings) * (1 + i);
          }
          
          if (runningNW >= fiTarget && !fiReached) {
            fiReached = true;
            fiAge = curAge + y;
            fiCorpus = runningNW;
            yearsRun = y;
          }
          
          tableRows.push([
            y,
            curAge + y,
            Math.round(infExpenses),
            Math.round(runningNW),
            Math.round(fiTarget)
          ]);
        }
        
        document.getElementById('fi-age').textContent = fiAge;
        document.getElementById('fi-corpus').textContent = FinanceEngine.formatINR(fiCorpus);
        document.getElementById('years-to-fi').textContent = fiReached ? yearsRun + ' years' : 'Out of scope (>40 yrs)';
        
        const tableBody = document.getElementById('table-body');
        const headersRow = document.getElementById('table-headers-row');
        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');
        tableBody.innerHTML = tableRows.map(row => 
          '<tr>' + row.map((v, idx) => (idx <= 1) ? '<td>' + v + '</td>' : '<td>' + FinanceEngine.formatINR(v, false) + '</td>').join('') + '</tr>'
        ).join('');
        
        const chartData = tableRows.map(row => ({
          label: 'Age ' + row[1],
          invested: row[4], // target
          nominal: row[3]   // net worth
        }));
        FinanceEngine.renderLineChart('chart-container', chartData, ['invested', 'nominal'], ['#6e6e73', '#30d158']);
        
        const csvExporter = FinanceEngine.exportData('fi-timeline', 
          { 'Age': curAge, 'Net Worth': nw, 'Savings': savings, 'Expenses': expenses, 'Return %': r },
          { 'FI Age': fiAge, 'FI Corpus': fiCorpus, 'Years to FI': yearsRun },
          headers,
          tableRows
        );
        document.getElementById('btn-export-csv').onclick = csvExporter.exportCSV;
        document.getElementById('btn-export-json').onclick = csvExporter.exportJSON;
        document.getElementById('btn-copy-table').onclick = () => FinanceEngine.copyTableToClipboard(headers, tableRows);
      }
      
      elements.forEach(id => {
        document.getElementById(id).addEventListener('input', (e) => {
          state[id] = parseFloat(e.target.value);
          syncUI();
          calculate();
          FinanceEngine.updateUrlParams(state);
        });
      });
      
      syncUI();
      calculate();
    `
  }
];

// Write individual calculator HTML files
calculators.forEach(calc => {
  const compoundingFiles = [
    'sip.html', 'step-up-sip.html', 'reverse-sip.html', 'lump-sum.html', 'reverse-lump-sum.html',
    'swp.html', 'reverse-swp.html', 'step-up-swp.html', 'retirement.html', 'fire.html',
    'goal.html', 'child-corpus.html', 'house-down-payment.html', 'marriage-planner.html', 'education-planner.html'
  ];
  
  if (compoundingFiles.includes(calc.filename)) {
    calc.supportCompounding = true;
    calc.bindingScript = calc.bindingScript
      .replace(
        /const defaults\s*=\s*\{/,
        "const defaults = { 'compounding-freq': 'monthly', "
      )
      .replace(
        /const elements\s*=\s*\[/,
        "const elements = [ 'compounding-freq', "
      );

    calc.bindingScript = calc.bindingScript.replace(
      /for\s*\(\s*let\s*m\s*=\s*startMonth;\s*m\s*<=\s*endMonth;\s*m\+\+\s*\)\s*\{\s*cumulativeInvested\s*\+=\s*P;\s*runningBalance\s*=\s*\(runningBalance\s*\+\s*P\)\s*\*\s*\(1\s*\+\s*i\);\s*\}/g,
      `const compoundingFreq = state['compounding-freq'] || 'monthly';
          if (compoundingFreq === 'monthly') {
            for (let m = startMonth; m <= endMonth; m++) {
              cumulativeInvested += P;
              runningBalance = (runningBalance + P) * (1 + i);
            }
          } else {
            const rate = annualRate / 100;
            const interestOnStart = runningBalance * rate;
            const interestOnDeposits = P * rate * 6.5;
            cumulativeInvested += P * 12;
            runningBalance = runningBalance + (P * 12) + interestOnStart + interestOnDeposits;
          }`
    );

    calc.bindingScript = calc.bindingScript.replace(
      /for\s*\(\s*let\s*m\s*=\s*1;\s*m\s*<=\s*12;\s*m\+\+\s*\)\s*\{\s*cumulativeInvested\s*\+=\s*currentSIP;\s*runningBalance\s*=\s*\(runningBalance\s*\+\s*currentSIP\)\s*\*\s*\(1\s*\+\s*i\);\s*\}/g,
      `const compoundingFreq = state['compounding-freq'] || 'monthly';
          if (compoundingFreq === 'monthly') {
            for (let m = 1; m <= 12; m++) {
              cumulativeInvested += currentSIP;
              runningBalance = (runningBalance + currentSIP) * (1 + i);
            }
          } else {
            const rate = annualRate / 100;
            const interestOnStart = runningBalance * rate;
            const interestOnDeposits = currentSIP * rate * 6.5;
            cumulativeInvested += currentSIP * 12;
            runningBalance = runningBalance + (currentSIP * 12) + interestOnStart + interestOnDeposits;
          }`
    );

    calc.bindingScript = calc.bindingScript.replace(
      /for\s*\(\s*let\s*m\s*=\s*1;\s*m\s*<=\s*12;\s*m\+\+\s*\)\s*\{\s*if\s*\(\s*balance\s*<=\s*0\s*\)\s*\{\s*if\s*\(\s*depletionYr\s*===\s*'Sufficient'\s*\)\s*\{\s*depletionYr\s*===\s*'Depleted\s*in\s*Year\s*'\s*\+\s*y;\s*\}\s*balance\s*=\s*0;\s*continue;\s*\}\s*const\s*actualWithdraw\s*=\s*Math\.min\(balance,\s*currentW\);\s*balance\s*-=\s*actualWithdraw;\s*yWithdrawn\s*\+=\s*actualWithdraw;\s*const\s*interest\s*=\s*balance\s*\*\s*i;\s*balance\s*\+=\s*interest;\s*yInterest\s*\+=\s*interest;\s*\}/,
      `const compoundingFreq = state['compounding-freq'] || 'monthly';
          if (compoundingFreq === 'monthly') {
            for (let m = 1; m <= 12; m++) {
              if (balance <= 0) {
                if (depletionYr === 'Sufficient') {
                  depletionYr = 'Depleted in Year ' + y;
                }
                balance = 0;
                continue;
              }
              const actualWithdraw = Math.min(balance, currentW);
              balance -= actualWithdraw;
              yWithdrawn += actualWithdraw;
              const interest = balance * i;
              balance += interest;
              yInterest += interest;
            }
          } else {
            const yearStart = balance;
            for (let m = 1; m <= 12; m++) {
              const actualWithdraw = Math.min(balance, currentW);
              balance -= actualWithdraw;
              yWithdrawn += actualWithdraw;
            }
            yInterest = Math.max(0, yearStart * (r / 100) - currentW * (r / 100) * 6.5);
            balance = balance + yInterest;
          }`
    );

    calc.bindingScript = calc.bindingScript.replace(
      /for\s*\(\s*let\s*m\s*=\s*1;\s*m\s*<=\s*12;\s*m\+\+\s*\)\s*\{\s*if\s*\(\s*balance\s*<=\s*0\s*\)\s*\{\s*balance\s*=\s*0;\s*continue;\s*\}\s*const\s*interest\s*=\s*balance\s*\*\s*i;\s*yInterest\s*\+=\s*interest;\s*balance\s*=\s*balance\s*\+\s*interest;\s*const\s*actualWithdraw\s*=\s*Math\.min\(balance,\s*withdrawal\);\s*yWithdrawn\s*\+=\s*actualWithdraw;\s*balance\s*-=\s*actualWithdraw;\s*\}/,
      `const compoundingFreq = state['compounding-freq'] || 'monthly';
          if (compoundingFreq === 'monthly') {
            for (let m = 1; m <= 12; m++) {
              if (balance <= 0) {
                balance = 0;
                continue;
              }
              const interest = balance * i;
              yInterest += interest;
              balance = balance + interest;
              const actualWithdraw = Math.min(balance, withdrawal);
              yWithdrawn += actualWithdraw;
              balance -= actualWithdraw;
            }
          } else {
            const yearStart = balance;
            for (let m = 1; m <= 12; m++) {
              const actualWithdraw = Math.min(balance, withdrawal);
              yWithdrawn += actualWithdraw;
              balance -= actualWithdraw;
            }
            yInterest = Math.max(0, yearStart * (r / 100) - withdrawal * (r / 100) * 6.5);
            balance = balance + yInterest;
          }`
    );

    calc.bindingScript = calc.bindingScript.replace(
      /for\s*\(\s*let\s*m\s*=\s*1;\s*m\s*<=\s*12;\s*m\+\+\s*\)\s*\{\s*if\s*\(\s*balance\s*<=\s*0\s*\)\s*continue;\s*const\s*actualWithdraw\s*=\s*Math\.min\(balance,\s*withdrawal\);\s*balance\s*-=\s*actualWithdraw;\s*yWithdrawn\s*\+=\s*actualWithdraw;\s*const\s*interest\s*=\s*balance\s*\*\s*i;\s*balance\s*\+=\s*interest;\s*yInterest\s*\+=\s*interest;\s*\}/,
      `const compoundingFreq = state['compounding-freq'] || 'monthly';
          if (compoundingFreq === 'monthly') {
            for (let m = 1; m <= 12; m++) {
              if (balance <= 0) continue;
              const actualWithdraw = Math.min(balance, withdrawal);
              balance -= actualWithdraw;
              yWithdrawn += actualWithdraw;
              const interest = balance * i;
              balance += interest;
              yInterest += interest;
            }
          } else {
            const yearStart = balance;
            for (let m = 1; m <= 12; m++) {
              const actualWithdraw = Math.min(balance, withdrawal);
              balance -= actualWithdraw;
              yWithdrawn += actualWithdraw;
            }
            yInterest = Math.max(0, balance * (r / 100));
            balance = balance + yInterest;
          }`
    );

    calc.bindingScript = calc.bindingScript.replace(
      /const requiredSIP\s*=\s*target\s*\/\s*\(\(\(Math\.pow\(1\s*\+\s*i,\s*months\)\s*-\s*1\)\s*\/\s*i\)\s*\*\s*\(1\s*\+\s*i\)\);/g,
      `let requiredSIP = 0;
        const compoundingFreq = state['compounding-freq'] || 'monthly';
        if (compoundingFreq === 'monthly') {
          requiredSIP = target / (((Math.pow(1 + i, months) - 1) / i) * (1 + i));
        } else {
          let low = 0, high = target;
          for (let iter = 0; iter < 100; iter++) {
            const mid = (low + high) / 2;
            const rows = FinanceEngine.calculateGrowth(0, mid, years, annualRate, 'yearly', 0);
            if (rows[rows.length - 1].corpus < target) low = mid;
            else high = mid;
          }
          requiredSIP = low;
        }`
    ).replace(
      /for\s*\(\s*let\s*m\s*=\s*1;\s*m\s*<=\s*12;\s*m\+\+\s*\)\s*\{\s*cumulativeInvested\s*\+=\s*requiredSIP;\s*runningBalance\s*=\s*\(runningBalance\s*\+\s*requiredSIP\)\s*\*\s*\(1\s*\+\s*i\);\s*\}/g,
      `if (compoundingFreq === 'monthly') {
            for (let m = 1; m <= 12; m++) {
              cumulativeInvested += requiredSIP;
              runningBalance = (runningBalance + requiredSIP) * (1 + i);
            }
          } else {
            const rate = annualRate / 100;
            const interestOnStart = runningBalance * rate;
            const interestOnDeposits = requiredSIP * rate * 6.5;
            cumulativeInvested += requiredSIP * 12;
            runningBalance = runningBalance + (requiredSIP * 12) + interestOnStart + interestOnDeposits;
          }`
    );

    calc.bindingScript = calc.bindingScript.replace(
      /for\s*\(\s*let\s*m\s*=\s*1;\s*m\s*<=\s*retirementMonths;\s*m\+\+\s*\)\s*\{\s*const\s*w\s*=\s*inflatedW\s*\*\s*Math\.pow\(1\s*\+\s*infM,\s*m\s*-\s*1\);\s*reqCorpus\s*\+=\s*w\s*\/\s*Math\.pow\(1\s*\+\s*iPost,\s*m\);\s*\}/g,
      `const compoundingFreq = state['compounding-freq'] || 'monthly';
        if (compoundingFreq === 'monthly') {
          for (let m = 1; m <= retirementMonths; m++) {
            const w = inflatedW * Math.pow(1 + infM, m - 1);
            reqCorpus += w / Math.pow(1 + iPost, m);
          }
        } else {
          let tempCorpus = 0;
          let low = 0, high = inflatedW * 12 * yearsInRet * 2;
          for (let iter = 0; iter < 100; iter++) {
            tempCorpus = (low + high) / 2;
            let balance = tempCorpus;
            let ok = true;
            for (let y = 1; y <= yearsInRet; y++) {
              const currentW = inflatedW * Math.pow(1 + inf / 100, y - 1);
              const yearStart = balance;
              for (let m = 1; m <= 12; m++) {
                balance -= currentW;
              }
              if (balance < 0) {
                ok = false;
                break;
              }
              const interest = Math.max(0, yearStart * (postR / 100) - currentW * (postR / 100) * 6.5);
              balance += interest;
            }
            if (ok) high = tempCorpus;
            else low = tempCorpus;
          }
          reqCorpus = high;
        }`
    ).replace(
      /const reqSIP\s*=\s*reqCorpus\s*\*\s*iPre\s*\/\s*\(\(Math\.pow\(1\s*\+\s*iPre,\s*preMonths\)\s*-\s*1\)\s*\*\s*\(1\s*\+\s*iPre\)\);/g,
      `let reqSIP = 0;
        if (compoundingFreq === 'monthly') {
          reqSIP = reqCorpus * iPre / ((Math.pow(1 + iPre, preMonths) - 1) * (1 + iPre));
        } else {
          let low = 0, high = reqCorpus;
          for (let iter = 0; iter < 100; iter++) {
            const mid = (low + high) / 2;
            const rows = FinanceEngine.calculateGrowth(0, mid, yearsToRet, preR, 'yearly', 0);
            if (rows[rows.length - 1].corpus < reqCorpus) low = mid;
            else high = mid;
          }
          reqSIP = low;
        }`
    ).replace(
      /for\s*\(\s*let\s*m\s*=\s*1;\s*m\s*<=\s*12;\s*m\+\+\s*\)\s*\{\s*balance\s*=\s*\(balance\s*\+\s*reqSIP\)\s*\*\s*\(1\s*\+\s*iPre\);\s*\}/g,
      `if (compoundingFreq === 'monthly') {
            for (let m = 1; m <= 12; m++) {
              balance = (balance + reqSIP) * (1 + iPre);
            }
          } else {
            const rate = preR / 100;
            const interest = balance * rate + reqSIP * rate * 6.5;
            balance = balance + reqSIP * 12 + interest;
          }`
    );

    calc.bindingScript = calc.bindingScript.replace(
      /for\s*\(\s*let\s*m\s*=\s*1;\s*m\s*<=\s*12;\s*m\+\+\s*\)\s*\{\s*nw\s*=\s*\(nw\s*\+\s*monthlyS\)\s*\*\s*\(1\s*\+\s*i\);\s*\}/g,
      `const compoundingFreq = state['compounding-freq'] || 'monthly';
          if (compoundingFreq === 'monthly') {
            for (let m = 1; m <= 12; m++) {
              nw = (nw + monthlyS) * (1 + i);
            }
          } else {
            const rate = r / 100;
            const interestOnStart = nw * rate;
            const interestOnDeposits = monthlyS * rate * 6.5;
            nw = nw + (monthlyS * 12) + interestOnStart + interestOnDeposits;
          }`
    );

    calc.bindingScript = calc.bindingScript.replace(
      /const reqSIP\s*=\s*inflatedGoal\s*\*\s*i\s*\/\s*\(\(Math\.pow\(1\s*\+\s*i,\s*months\)\s*-\s*1\)\s*\*\s*\(1\s*\+\s*i\)\);/g,
      `let reqSIP = 0;
        const compoundingFreq = state['compounding-freq'] || 'monthly';
        if (compoundingFreq === 'monthly') {
          reqSIP = inflatedGoal * i / ((Math.pow(1 + i, months) - 1) * (1 + i));
        } else {
          let low = 0, high = inflatedGoal;
          for (let iter = 0; iter < 100; iter++) {
            const mid = (low + high) / 2;
            const rows = FinanceEngine.calculateGrowth(0, mid, years, r, 'yearly', 0);
            if (rows[rows.length - 1].corpus < inflatedGoal) low = mid;
            else high = mid;
          }
          reqSIP = low;
        }`
    ).replace(
      /const reqSIP\s*=\s*inflated\s*\*\s*i\s*\/\s*\(\(Math\.pow\(1\s*\+\s*i,\s*months\)\s*-\s*1\)\s*\*\s*\(1\s*\+\s*i\)\);/g,
      `let reqSIP = 0;
        const compoundingFreq = state['compounding-freq'] || 'monthly';
        if (compoundingFreq === 'monthly') {
          reqSIP = inflated * i / ((Math.pow(1 + i, months) - 1) * (1 + i));
        } else {
          let low = 0, high = inflated;
          for (let iter = 0; iter < 100; iter++) {
            const mid = (low + high) / 2;
            const rows = FinanceEngine.calculateGrowth(0, mid, years, r, 'yearly', 0);
            if (rows[rows.length - 1].corpus < inflated) low = mid;
            else high = mid;
          }
          reqSIP = low;
        }`
    ).replace(
      /const reqSIP\s*=\s*reqDownPayment\s*\*\s*i\s*\/\s*\(\(Math\.pow\(1\s*\+\s*i,\s*months\)\s*-\s*1\)\s*\*\s*\(1\s*\+\s*i\)\);/g,
      `let reqSIP = 0;
        const compoundingFreq = state['compounding-freq'] || 'monthly';
        if (compoundingFreq === 'monthly') {
          reqSIP = reqDownPayment * i / ((Math.pow(1 + i, months) - 1) * (1 + i));
        } else {
          let low = 0, high = reqDownPayment;
          for (let iter = 0; iter < 100; iter++) {
            const mid = (low + high) / 2;
            const rows = FinanceEngine.calculateGrowth(0, mid, years, r, 'yearly', 0);
            if (rows[rows.length - 1].corpus < reqDownPayment) low = mid;
            else high = mid;
          }
          reqSIP = low;
        }`
    ).replace(
      /for\s*\(\s*let\s*m\s*=\s*1;\s*m\s*<=\s*12;\s*m\+\+\s*\)\s*\{\s*(sipInvest|sipInvested)\s*\+=\s*reqSIP;\s*sipBal\s*=\s*\(sipBal\s*\+\s*reqSIP\)\s*\*\s*\(1\s*\+\s*i\);\s*\}/g,
      (match, p1) => `const compoundingFreq = state['compounding-freq'] || 'monthly';
          if (compoundingFreq === 'monthly') {
            for (let m = 1; m <= 12; m++) {
              ${p1} += reqSIP;
              sipBal = (sipBal + reqSIP) * (1 + i);
            }
          } else {
            const rate = r / 100;
            const interestOnStart = sipBal * rate;
            const interestOnDeposits = reqSIP * rate * 6.5;
            ${p1} += reqSIP * 12;
            sipBal = sipBal + (reqSIP * 12) + interestOnStart + interestOnDeposits;
          }`
    );
  }
  
  if (calc.supportTax) {
    calc.bindingScript = calc.bindingScript
      .replace(/'tax-type'\s*:\s*'equity'/g, "'tax-type': 'equity_ltcg'")
      .replace(/'custom-tax-rate'\s*:\s*20/g, "'custom-tax-rate': 12.5");
      
    calc.bindingScript = calc.bindingScript.replace(
      /customTaxGroup\.style\.display\s*=\s*state\['tax-type'\]\s*===\s*'custom'\s*\?\s*'block'\s*:\s*'none';/g,
      "customTaxGroup.style.display = (state['tax-type'] === 'custom' || state['tax-type'] === 'slab') ? 'block' : 'none';"
    );
  }

  // Prevent cursor jumping when typing decimal values
  calc.bindingScript = calc.bindingScript
    .replace(/document\.getElementById\(id\)\.value\s*=\s*state\[id\];/g, "const elVal = document.getElementById(id); if (elVal && document.activeElement !== elVal) elVal.value = state[id];")
    .replace(/el\.value\s*=\s*state\[id\];/g, "if (document.activeElement !== el) el.value = state[id];");

  // Safe binding of copy and export buttons (null-guards)
  calc.bindingScript = calc.bindingScript
    .replace(/document\.getElementById\('btn-export-csv'\)\.onclick\s*=\s*/g, "if (document.getElementById('btn-export-csv')) document.getElementById('btn-export-csv').onclick = ")
    .replace(/document\.getElementById\('btn-export-json'\)\.onclick\s*=\s*/g, "if (document.getElementById('btn-export-json')) document.getElementById('btn-export-json').onclick = ")
    .replace(/document\.getElementById\('btn-copy-table'\)\.onclick\s*=\s*/g, "if (document.getElementById('btn-copy-table')) document.getElementById('btn-copy-table').onclick = ")
    .replace(/document\.getElementById\('btn-copy-table'\)\.style\.display\s*=\s*/g, "if (document.getElementById('btn-copy-table')) document.getElementById('btn-copy-table').style.display = ");
  
  const filePath = path.join(calcDir, calc.filename);
  const html = getCalculatorHtml(calc);
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`Generated: ${calc.filename}`);
});

// -------------------------------------------------------------
// MAIN DASHBOARD (index.html)
// -------------------------------------------------------------

function getDashboardHtml() {
  const categories = [
    {
      title: 'SIP & Mutual Funds',
      desc: 'Grow your wealth with periodic mutual fund and stock investing.',
      items: [
        { name: 'SIP Calculator', url: 'sip.html', desc: 'Calculate standard CAGR returns on SIP investments.' },
        { name: 'Step-Up SIP', url: 'step-up-sip.html', desc: 'Step up your SIP annually to boost compounding.' },
        { name: 'Reverse SIP', url: 'reverse-sip.html', desc: 'Compute required SIP contributions to hit target wealth.' },
        { name: 'Lump Sum', url: 'lump-sum.html', desc: 'Determine lump sum investment compounding returns.' },
        { name: 'Reverse Lump Sum', url: 'reverse-lump-sum.html', desc: 'Find target principal requirements for goals.' }
      ]
    },
    {
      title: 'SWP & Retirement',
      desc: 'Formulate safe withdrawal speeds and retirement nest egg sizing.',
      items: [
        { name: 'SWP Calculator', url: 'swp.html', desc: 'Calculate systemic withdrawal schedules.' },
        { name: 'Reverse SWP', url: 'reverse-swp.html', desc: 'Compute necessary corpus to support retirement income.' },
        { name: 'Step-Up SWP', url: 'step-up-swp.html', desc: 'Step up withdrawals over time to offset inflation.' },
        { name: 'Retirement Planner', url: 'retirement.html', desc: 'Project expenses and nest eggs for retirement.' },
        { name: 'FIRE Calculator', url: 'fire.html', desc: 'Plan Financial Independence and Early Retirement targets.' }
      ]
    },
    {
      title: 'Planners & Goals',
      desc: 'Plan child education, marriages, and downpayments with target goals.',
      items: [
        { name: 'Goal Planner', url: 'goal.html', desc: 'Input specific targets and view required monthly additions.' },
        { name: 'Education Planner', url: 'education-planner.html', desc: 'Calculate higher education cost parameters.' },
        { name: 'Marriage Planner', url: 'marriage-planner.html', desc: 'Plan marriage expenses and savings.' },
        { name: 'House Down Payment', url: 'house-down-payment.html', desc: 'Determine real estate saving requirements.' },
        { name: 'Child Corpus Planner', url: 'child-corpus.html', desc: 'Save for key milestones in child developmental ages.' }
      ]
    },
    {
      title: 'Portfolio & Returns',
      desc: 'Examine allocation deviations, net returns, and compound growth.',
      items: [
        { name: 'Net Worth Projection', url: 'net-worth-projection.html', desc: 'Model total assets minus liabilities over time.' },
        { name: 'Asset Allocation', url: 'asset-allocation.html', desc: 'Determine rebalancing rules for equity and debt.' },
        { name: 'CAGR Calculator', url: 'cagr.html', desc: 'Compute annualized CAGR return percentages.' },
        { name: 'XIRR Calculator', url: 'xirr.html', desc: 'Compute internal rates of return on irregular cashflows.' },
        { name: 'Inflation Calculator', url: 'inflation.html', desc: 'Measure real cash purchasing power erosion.' },
        { name: 'Real Return Calculator', url: 'real-return.html', desc: 'Calculate post-tax inflation-adjusted returns.' }
      ]
    },
    {
      title: 'Loans & Debt',
      desc: 'Verify payments and prepayment interest savings on mortgages.',
      items: [
        { name: 'EMI Calculator', url: 'emi.html', desc: 'Equated monthly installment schedules.' },
        { name: 'Loan Prepayment', url: 'loan-prepayment.html', desc: 'Model tenure reductions and interest savings.' },
        { name: 'Emergency Fund', url: 'emergency-fund.html', desc: 'Contingency fund sizing and asset allocations.' },
        { name: 'FI Timeline', url: 'financial-independence.html', desc: 'Project exact year compound growth exceeds expenses.' }
      ]
    }
  ];

  let dashboardContent = '';
  categories.forEach(cat => {
    dashboardContent += `
      <section class="category-section">
        <h2 class="category-title">${cat.title}</h2>
        <p style="color:var(--text-secondary); margin-bottom:1.5rem; margin-top:-0.75rem; font-size:0.95rem;">${cat.desc}</p>
        <div class="dashboard-grid">
    `;
    cat.items.forEach(item => {
      dashboardContent += `
        <a href="calculators/${item.url}" class="calc-card" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
          <div>
            <h4>${item.name}</h4>
            <p>${item.desc}</p>
          </div>
        </a>
      `;
    });
    dashboardContent += `
        </div>
      </section>
    `;
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinPlan India - Blazing Fast Financial Calculators</title>
  <meta name="description" content="Blazing-fast, zero-tracker, offline-first personal finance and mutual fund calculators tailored for Indian retail investors. Model SIP, Step-Up SIP, SWP, CAGR, XIRR, EMI and tax.">
  <meta name="keywords" content="financial calculators india, mutual fund calculator, sip step up, tax calculator, retirement planner india, emergency fund cagr, loan prepayment">
  <meta name="author" content="FinPlan India">
  
  <!-- Open Graph -->
  <meta property="og:title" content="FinPlan India - Blazing Fast Financial Calculators for Indian Investors">
  <meta property="og:description" content="Contingency fund planners, mutual fund step ups, and retirement planning running entirely in-browser. Clean Vercel-like design with no tracking or cookies.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://finplanindia.com/">
  
  <link rel="stylesheet" href="css/style.css">
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "FinPlan India",
      "url": "https://finplanindia.com/",
      "description": "Blazing-fast financial calculators for Indian retail investors"
    }
  </script>
</head>
<body>
  <div class="app-container">
    <header id="global-header"></header>
    
    <div class="main-content">
      <aside id="global-sidebar" class="sidebar"></aside>
      
      <main class="calculator-workspace">
        <div class="calculator-header">
          <h1>Financial Planners & Calculators</h1>
          <p class="calculator-description">Modern, secure, and fast tools for personal wealth management. 100% client-side with zero tracking, cookies, or backend servers.</p>
        </div>
        
        ${dashboardContent}
      </main>
    </div>
    
    <footer id="global-footer"></footer>
  </div>

  <script src="js/shared.js"></script>
</body>
</html>`;
}

fs.writeFileSync(path.join(__dirname, 'index.html'), getDashboardHtml(), 'utf8');
console.log('Generated: index.html');

// -------------------------------------------------------------
// XML SITEMAP & ROBOTS.TXT
// -------------------------------------------------------------

function getSitemap() {
  const urls = [
    'https://finplanindia.com/',
    ...calculators.map(c => `https://finplanindia.com/calculators/${c.filename}`)
  ];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  urls.forEach(url => {
    xml += '  <url>\n';
    xml += `    <loc>${url}</loc>\n`;
    xml += '    <lastmod>2026-06-03</lastmod>\n';
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>' + (url === 'https://finplanindia.com/' ? '1.0' : '0.8') + '</priority>\n';
    xml += '  </url>\n';
  });
  xml += '</urlset>';
  return xml;
}

fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), getSitemap(), 'utf8');
console.log('Generated: sitemap.xml');

const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://finplanindia.com/sitemap.xml
`;
fs.writeFileSync(path.join(__dirname, 'robots.txt'), robotsTxt, 'utf8');
console.log('Generated: robots.txt');
