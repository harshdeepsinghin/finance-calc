/**
 * Financial Calculators Engine - core mathematical calculations,
 * SVG charting, CSV/JSON exports, and formatting.
 */

// Register a global ResizeObserver for responsive SVG charts
const chartResizeObserver = new ResizeObserver(entries => {
  requestAnimationFrame(() => {
    for (let entry of entries) {
      const container = entry.target;
      const { width, height } = entry.contentRect;
      if (container.lastWidth === width && container.lastHeight === height) {
        continue;
      }
      container.lastWidth = width;
      container.lastHeight = height;
      
      if (container.chartData) {
        const { type, data, valueKeys, colors, lineLabels, slices } = container.chartData;
        chartResizeObserver.unobserve(container);
        if (type === 'line') {
          FinanceEngine.renderLineChart(container.id, data, valueKeys, colors, lineLabels, false);
        } else if (type === 'donut') {
          FinanceEngine.renderDonutChart(container.id, slices, false);
        }
        chartResizeObserver.observe(container);
      }
    }
  });
});

const FinanceEngine = {
  // 1. Math Helpers
  
  /**
   * Convert annual return to monthly return rate using CAGR method
   */
  getMonthlyRate(annualRatePercentage) {
    return (annualRatePercentage / 100) / 12;
  },

  /**
   * Adjust value for inflation: nominalValue / (1 + inflation)^years
   */
  getRealValue(nominalValue, inflationPercentage, years) {
    const inf = inflationPercentage / 100;
    return nominalValue / Math.pow(1 + inf, years);
  },

  /**
   * Estimate Indian taxation (FY 2024-25 Budget updates)
   * - equity_ltcg: 12.5% tax on gains exceeding 1,25,000
   * - equity_stcg: 20% flat tax on gains
   * - slab: gains * (customRate / 100)
   */
  estimateTax(gains, type, customRate = 30) {
    if (gains <= 0) return { tax: 0, taxableGains: 0 };
    
    if (type === 'equity_ltcg') {
      const taxableGains = Math.max(0, gains - 125000);
      const tax = taxableGains * 0.125;
      return { tax, taxableGains };
    } else if (type === 'equity_stcg') {
      return { tax: gains * 0.20, taxableGains: gains };
    } else if (type === 'slab' || type === 'custom') {
      const rate = parseFloat(customRate) || 0;
      const tax = gains * (rate / 100);
      return { tax, taxableGains: gains };
    }
    
    return { tax: 0, taxableGains: 0 };
  },

  /**
   * Core compounding engine supporting monthly/yearly frequency.
   * Math verified for Indian standards.
   */
  calculateGrowth(principal, monthlyDeposit, years, annualRate, compoundingFreq = 'monthly', annualStepUp = 0) {
    const rate = annualRate / 100;
    let balance = principal;
    let cumulativeInvested = principal;
    const tableRows = [];

    for (let y = 1; y <= years; y++) {
      const currentSIP = monthlyDeposit * Math.pow(1 + annualStepUp / 100, y - 1);
      const yStartBalance = balance;
      let yInvested = 0;

      if (compoundingFreq === 'monthly') {
        const i = rate / 12;
        for (let m = 1; m <= 12; m++) {
          balance = (balance + currentSIP) * (1 + i);
          yInvested += currentSIP;
        }
      } else {
        // Yearly compounding:
        const interestOnStart = balance * rate;
        const interestOnDeposits = currentSIP * rate * 6.5; // sum from t=1 to 12 of (13-t)/12
        balance = balance + (currentSIP * 12) + interestOnStart + interestOnDeposits;
        yInvested = currentSIP * 12;
      }

      cumulativeInvested += yInvested;
      const totalGains = balance - cumulativeInvested;

      tableRows.push({
        year: y,
        monthlySIP: currentSIP,
        invested: cumulativeInvested,
        gains: totalGains,
        corpus: balance
      });
    }

    return tableRows;
  },

  /**
   * SWP growth engine supporting monthly/yearly compounding.
   */
  calculateSWP(principal, monthlyWithdrawal, years, annualRate, compoundingFreq = 'monthly', annualStepUp = 0) {
    const rate = annualRate / 100;
    let balance = principal;
    let totalWithdrawn = 0;
    const tableRows = [];

    for (let y = 1; y <= years; y++) {
      const currentSWP = monthlyWithdrawal * Math.pow(1 + annualStepUp / 100, y - 1);
      let yWithdrawn = 0;

      if (compoundingFreq === 'monthly') {
        const i = rate / 12;
        for (let m = 1; m <= 12; m++) {
          const withdrawal = Math.min(balance, currentSWP);
          balance = balance - withdrawal;
          yWithdrawn += withdrawal;
          balance = balance * (1 + i);
        }
      } else {
        // Yearly compounding:
        const yearStartBalance = balance;
        for (let m = 1; m <= 12; m++) {
          const withdrawal = Math.min(balance, currentSWP);
          balance = balance - withdrawal;
          yWithdrawn += withdrawal;
        }
        // Interest calculated on start balance minus simple interest on withdrawals
        const interest = Math.max(0, yearStartBalance * rate - currentSWP * rate * 6.5);
        balance = balance + interest;
      }

      totalWithdrawn += yWithdrawn;
      
      tableRows.push({
        year: y,
        monthlyWithdrawal: currentSWP,
        withdrawn: totalWithdrawn,
        corpus: balance
      });

      if (balance <= 0) {
        balance = 0;
        break;
      }
    }

    return tableRows;
  },

  // 2. Formatting Helpers
  
  /**
   * Format a number into Indian Rupee format (e.g. ₹12,34,567.89)
   */
  formatINR(value, includeSymbol = true, decimals = 0) {
    if (value === null || value === undefined || isNaN(value)) {
      return includeSymbol ? '₹0' : '0';
    }
    const formatted = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
    return includeSymbol ? '₹' + formatted : formatted;
  },

  /**
   * Smart INR format: shows up to 2 decimal places when fractional part exists,
   * rounded to 2dp. Whole numbers display without decimals.
   * e.g. 12345.678 → ₹12,345.68 | 12345.00 → ₹12,345
   */
  formatINRSmart(value, includeSymbol = true) {
    if (value === null || value === undefined || isNaN(value)) {
      return includeSymbol ? '₹0' : '0';
    }
    const rounded = Math.round(value * 100) / 100;
    const decimals = (rounded % 1 !== 0) ? 2 : 0;
    const formatted = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(rounded);
    return includeSymbol ? '₹' + formatted : formatted;
  },

  /**
   * Format a percentage
   */
  formatPercent(value, decimals = 2) {
    if (isNaN(value)) return '0%';
    return value.toFixed(decimals) + '%';
  },

  /**
   * Convert number to words in the Indian Numbering System
   */
  numberToIndianWords(num) {
    if (num === null || num === undefined || isNaN(num)) return '';
    num = Math.round(num);
    if (num === 0) return 'Zero';
    if (num < 0) return 'Minus ' + this.numberToIndianWords(Math.abs(num));

    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                   'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function convertLessThanOneThousand(n) {
      let str = '';
      if (n >= 100) {
        str += units[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n >= 20) {
        str += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      }
      if (n > 0) {
        str += units[n] + ' ';
      }
      return str.trim();
    }

    let result = '';
    let crores = Math.floor(num / 10000000);
    let remainder = num % 10000000;
    let lakhs = Math.floor(remainder / 100000);
    remainder %= 100000;
    let thousands = Math.floor(remainder / 1000);
    remainder %= 1000;

    if (crores > 0) {
      result += (crores >= 100 ? this.numberToIndianWords(crores) : convertLessThanOneThousand(crores)) + ' Crore ';
    }
    if (lakhs > 0) {
      result += convertLessThanOneThousand(lakhs) + ' Lakh ';
    }
    if (thousands > 0) {
      result += convertLessThanOneThousand(thousands) + ' Thousand ';
    }
    if (remainder > 0) {
      result += convertLessThanOneThousand(remainder) + ' ';
    }

    return result.trim().replace(/\s+/g, ' ');
  },

  /**
   * Return HTML string with color-coded tags for the Indian Numbering System
   */
  getColorCodedINRHtml(text) {
    if (!text || (typeof text !== 'string')) return null;
    const trimmed = text.trim();
    if (!trimmed.includes('₹') && !/^\d/.test(trimmed.replace(/[,\s-]/g, ''))) {
      return null;
    }
    const hasSymbol = trimmed.startsWith('₹') || trimmed.includes('₹');
    const isNegative = trimmed.includes('-');
    let cleanText = trimmed.replace(/[₹\s-]/g, '');

    // Split by decimal
    const parts = cleanText.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];

    // Split integer part by commas
    const groups = integerPart.split(',');
    const len = groups.length;

    const wrappedGroups = groups.map((group, idx) => {
      const posFromRight = len - 1 - idx;
      let className = '';
      if (posFromRight === 0) className = 'color-ones-tens-hundreds';
      else if (posFromRight === 1) className = 'color-thousands';
      else if (posFromRight === 2) className = 'color-lakhs';
      else className = 'color-crores';
      return `<span class="${className}">${group}</span>`;
    });

    let html = '';
    if (isNegative) html += '-';
    if (hasSymbol) html += '<span class="color-currency-symbol">₹</span>';
    html += wrappedGroups.join(',');
    if (decimalPart !== undefined) {
      html += `.<span class="color-decimals">${decimalPart}</span>`;
    }
    return html;
  },

  // 3. XIRR Newton-Raphson Solver
  
  /**
   * Calculate XIRR
   * cashFlows: Array of { date: Date, amount: number }
   * Note: Investments must be negative, returns/final valuation positive.
   */
  calculateXIRR(cashFlows) {
    if (cashFlows.length < 2) return NaN;

    // Sort by date
    const flows = [...cashFlows].sort((a, b) => a.date - b.date);
    const d0 = flows[0].date;

    // Time fractions (years since d0)
    const t = flows.map(f => (f.date - d0) / (365 * 24 * 60 * 60 * 1000));
    const values = flows.map(f => f.amount);

    // Objective function: sum CF_i / (1 + r)^t_i
    const f = (r) => {
      let sum = 0;
      for (let i = 0; i < values.length; i++) {
        sum += values[i] / Math.pow(1 + r, t[i]);
      }
      return sum;
    };

    // First derivative: sum -t_i * CF_i / (1 + r)^(t_i + 1)
    const df = (r) => {
      let sum = 0;
      for (let i = 0; i < values.length; i++) {
        sum += -t[i] * values[i] / Math.pow(1 + r, t[i] + 1);
      }
      return sum;
    };

    // Newton-Raphson loop
    let r = 0.1; // initial guess: 10%
    const maxIterations = 100;
    const precision = 1e-7;

    for (let k = 0; k < maxIterations; k++) {
      const val = f(r);
      const deriv = df(r);
      
      if (Math.abs(deriv) < 1e-12) break; // prevent division by zero
      
      const nextR = r - val / deriv;
      if (Math.abs(nextR - r) < precision) {
        return nextR * 100; // return as percentage
      }
      r = nextR;
    }
    
    return r * 100;
  },

  // 4. State URL Synchronization
  
  /**
   * Parse parameters from URL
   */
  getUrlParams(defaults) {
    const params = new URLSearchParams(window.location.search);
    const result = { ...defaults };
    
    // Load from cache first
    let cachedPrefs = {};
    try {
      const stored = localStorage.getItem('finplan_shared_prefs');
      if (stored) {
        cachedPrefs = JSON.parse(stored);
      }
    } catch (e) {}

    const preferenceMapping = {
      'return_rate': 'pref_return_rate',
      'nominal_return': 'pref_return_rate',
      'pre_return': 'pref_return_rate',
      'post_return': 'pref_return_rate',
      'rate': 'pref_return_rate',
      'years': 'pref_years',
      'tenure': 'pref_years',
      'duration': 'pref_years',
      'years_to_college': 'pref_years',
      'years_to_goal': 'pref_years',
      'years_to_fi': 'pref_years',
      'inflation-rate': 'pref_inflation_rate',
      'inflation_rate': 'pref_inflation_rate',
      'compounding-freq': 'pref_compounding_freq',
      'compounding_freq': 'pref_compounding_freq',
      'tax-type': 'pref_tax_type',
      'tax_type': 'pref_tax_type',
      'custom-tax-rate': 'pref_tax_rate',
      'custom_tax_rate': 'pref_tax_rate',
      'tax_rate': 'pref_tax_rate'
    };

    for (const key in defaults) {
      const prefKey = preferenceMapping[key];
      if (prefKey && cachedPrefs[prefKey] !== undefined && cachedPrefs[prefKey] !== null) {
        const val = cachedPrefs[prefKey];
        if (typeof defaults[key] === 'number') {
          const parsed = parseFloat(val);
          result[key] = isNaN(parsed) ? defaults[key] : parsed;
        } else if (typeof defaults[key] === 'boolean') {
          result[key] = val === true || val === 'true';
        } else {
          result[key] = val;
        }
      }
      
      // URL parameters override cache
      if (params.has(key)) {
        const val = params.get(key);
        if (typeof defaults[key] === 'number') {
          const parsed = parseFloat(val);
          result[key] = isNaN(parsed) ? defaults[key] : parsed;
        } else if (typeof defaults[key] === 'boolean') {
          result[key] = val === 'true';
        } else {
          result[key] = val;
        }
      }
    }
    return result;
  },

  /**
   * Update URL parameters without reloading page
   */
  updateUrlParams(paramsObj) {
    const params = new URLSearchParams();
    
    // Read current cache
    let cachedPrefs = {};
    try {
      const stored = localStorage.getItem('finplan_shared_prefs');
      if (stored) {
        cachedPrefs = JSON.parse(stored);
      }
    } catch (e) {}

    const preferenceMapping = {
      'return_rate': 'pref_return_rate',
      'nominal_return': 'pref_return_rate',
      'pre_return': 'pref_return_rate',
      'post_return': 'pref_return_rate',
      'rate': 'pref_return_rate',
      'years': 'pref_years',
      'tenure': 'pref_years',
      'duration': 'pref_years',
      'years_to_college': 'pref_years',
      'years_to_goal': 'pref_years',
      'years_to_fi': 'pref_years',
      'inflation-rate': 'pref_inflation_rate',
      'inflation_rate': 'pref_inflation_rate',
      'compounding-freq': 'pref_compounding_freq',
      'compounding_freq': 'pref_compounding_freq',
      'tax-type': 'pref_tax_type',
      'tax_type': 'pref_tax_type',
      'custom-tax-rate': 'pref_tax_rate',
      'custom_tax_rate': 'pref_tax_rate',
      'tax_rate': 'pref_tax_rate'
    };

    let cacheChanged = false;

    for (const key in paramsObj) {
      if (paramsObj[key] !== undefined && paramsObj[key] !== null) {
        params.set(key, paramsObj[key]);
        
        const prefKey = preferenceMapping[key];
        if (prefKey) {
          cachedPrefs[prefKey] = paramsObj[key];
          cacheChanged = true;
        }
      }
    }

    if (cacheChanged) {
      try {
        localStorage.setItem('finplan_shared_prefs', JSON.stringify(cachedPrefs));
      } catch (e) {}
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({ path: newUrl }, '', newUrl);
  },

  // 5. SVG Line Chart Generator

  /**
   * Render a responsive SVG line chart with toggleable lines and interactive legend.
   * containerId: string
   * data: Array of objects with label + valueKey fields
   * valueKeys: Array of strings — keys to plot
   * colors: Array of color strings matching valueKeys
   * lineLabels: Optional array of human-readable labels for legend chips
   * observe: bool — whether to attach ResizeObserver
   */
  renderLineChart(containerId, data, valueKeys, colors, lineLabels, observe = true) {
    // Handle old call signature where 5th arg was bool (observe)
    if (typeof lineLabels === 'boolean') {
      observe = lineLabels;
      lineLabels = null;
    }
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    // Store data for ResizeObserver
    container.chartData = { type: 'line', data, valueKeys, colors, lineLabels };
    if (observe) {
      chartResizeObserver.observe(container);
    }
    
    const rect = container.getBoundingClientRect();
    const width = rect.width || 300;
    const height = rect.height || 280;
    container.lastWidth = width;
    container.lastHeight = height;
    
    const padding = { top: 20, right: 30, bottom: 40, left: 70 };
    const chartWidth = Math.max(50, width - padding.left - padding.right);
    const chartHeight = Math.max(50, height - padding.top - padding.bottom);
    
    // Find min/max values
    let minVal = 0;
    let maxVal = 0;
    
    data.forEach(d => {
      valueKeys.forEach(key => {
        const val = d[key];
        if (val > maxVal) maxVal = val;
        if (val < minVal) minVal = val;
      });
    });
    
    // Add 10% buffer to maxVal
    maxVal = maxVal * 1.1 || 100;
    
    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.overflow = 'visible';
    
    // Gradients definitions
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    colors.forEach((color, idx) => {
      const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      grad.setAttribute('id', `grad-${containerId}-${idx}`);
      grad.setAttribute('x1', '0%');
      grad.setAttribute('y1', '0%');
      grad.setAttribute('x2', '0%');
      grad.setAttribute('y2', '100%');
      
      const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop1.setAttribute('offset', '0%');
      stop1.setAttribute('stop-color', color);
      stop1.setAttribute('stop-opacity', '0.25');
      
      const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop2.setAttribute('offset', '100%');
      stop2.setAttribute('stop-color', color);
      stop2.setAttribute('stop-opacity', '0.0');
      
      grad.appendChild(stop1);
      grad.appendChild(stop2);
      defs.appendChild(grad);
    });
    svg.appendChild(defs);
    
    // Coordinate mapping functions
    const getX = (index) => padding.left + (index / (data.length - 1)) * chartWidth;
    const getY = (value) => padding.top + chartHeight - ((value - minVal) / (maxVal - minVal)) * chartHeight;
    
    // Render Y gridlines & labels
    const gridCount = 5;
    for (let i = 0; i <= gridCount; i++) {
      const gridVal = minVal + (maxVal - minVal) * (i / gridCount);
      const y = getY(gridVal);
      
      // Grid line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', padding.left);
      line.setAttribute('y1', y);
      line.setAttribute('x2', width - padding.right);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', 'var(--border-color)');
      line.setAttribute('stroke-width', '1');
      if (i > 0 && i < gridCount) {
        line.setAttribute('stroke-dasharray', '4 4');
      }
      svg.appendChild(line);
      
      // Label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', padding.left - 10);
      text.setAttribute('y', y + 4);
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('font-family', 'var(--font-mono)');
      text.setAttribute('font-size', '10px');
      text.setAttribute('fill', 'var(--text-secondary)');
      
      // Short format for large numbers
      let displayVal = gridVal;
      if (gridVal >= 10000000) {
        displayVal = (gridVal / 10000000).toFixed(1) + ' Cr';
      } else if (gridVal >= 100000) {
        displayVal = (gridVal / 100000).toFixed(1) + ' L';
      } else if (gridVal >= 1000) {
        displayVal = (gridVal / 1000).toFixed(1) + ' K';
      } else {
        displayVal = Math.round(gridVal);
      }
      
      text.textContent = displayVal === 0 ? '0' : '₹' + displayVal;
      svg.appendChild(text);
    }
    
    // Render X labels (show ~5 labels max)
    const labelStep = Math.max(1, Math.floor(data.length / 5));
    data.forEach((d, idx) => {
      if (idx % labelStep === 0 || idx === data.length - 1) {
        const x = getX(idx);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', height - padding.bottom + 20);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-family', 'var(--font-sans)');
        text.setAttribute('font-size', '10px');
        text.setAttribute('fill', 'var(--text-secondary)');
        text.textContent = d.label;
        svg.appendChild(text);
      }
    });
    
    // Build lookup: key → human label
    const defaultLabels = { invested: 'Invested', corpus: 'Corpus', nominal: 'Corpus', real: 'Real Value', gains: 'Net Gains', withdrawn: 'Withdrawn', balance: 'Balance' };
    const labels = lineLabels || valueKeys.map(k => defaultLabels[k] || (k.charAt(0).toUpperCase() + k.slice(1)));

    // Track visibility per series (all visible by default)
    const visible = valueKeys.map(() => true);

    // Per-series SVG group references (area + line + dots)
    const seriesGroups = [];

    // Plot lines & area fills
    valueKeys.forEach((key, keyIdx) => {
      const color = colors[keyIdx];
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('data-series', keyIdx);

      let pathD = '';
      let areaD = `M ${getX(0)} ${getY(0)} `;

      data.forEach((d, idx) => {
        const x = getX(idx);
        const y = getY(d[key]);
        const seg = `${idx === 0 ? 'M' : 'L'} ${x} ${y} `;
        pathD += seg;
        areaD += seg;
      });
      areaD += `L ${getX(data.length - 1)} ${padding.top + chartHeight} L ${getX(0)} ${padding.top + chartHeight} Z`;

      const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      area.setAttribute('d', areaD);
      area.setAttribute('fill', `url(#grad-${containerId}-${keyIdx})`);
      g.appendChild(area);

      const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      linePath.setAttribute('d', pathD);
      linePath.setAttribute('fill', 'none');
      linePath.setAttribute('stroke', color);
      linePath.setAttribute('stroke-width', keyIdx === 1 ? '2.5' : '1.75');
      if (keyIdx === 0) linePath.setAttribute('stroke-dasharray', '3 3');
      g.appendChild(linePath);

      data.forEach((d, idx) => {
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', getX(idx));
        dot.setAttribute('cy', getY(d[key]));
        dot.setAttribute('r', '3');
        dot.setAttribute('fill', color);
        dot.setAttribute('stroke', 'var(--card-bg)');
        dot.setAttribute('stroke-width', '1');
        g.appendChild(dot);
      });

      svg.appendChild(g);
      seriesGroups.push(g);
    });

    // Hover group
    const hoverGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    hoverGroup.setAttribute('visibility', 'hidden');

    const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    vLine.setAttribute('y1', padding.top);
    vLine.setAttribute('y2', padding.top + chartHeight);
    vLine.setAttribute('stroke', 'var(--text-secondary)');
    vLine.setAttribute('stroke-width', '1');
    vLine.setAttribute('stroke-dasharray', '2 2');
    hoverGroup.appendChild(vLine);

    const circles = valueKeys.map((key, keyIdx) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', '5');
      circle.setAttribute('fill', colors[keyIdx]);
      circle.setAttribute('stroke', 'var(--bg-primary)');
      circle.setAttribute('stroke-width', '1.5');
      hoverGroup.appendChild(circle);
      return circle;
    });

    svg.appendChild(hoverGroup);
    container.appendChild(svg);

    // Build interactive legend chips (injected into #chart-legend-container if found)
    const legendEl = container.closest('.chart-card') && container.closest('.chart-card').querySelector('#chart-legend-container');
    if (legendEl) {
      legendEl.innerHTML = '';
      valueKeys.forEach((key, keyIdx) => {
        const chip = document.createElement('div');
        chip.className = 'legend-item legend-chip';
        chip.setAttribute('data-series', keyIdx);
        chip.style.cursor = 'pointer';
        chip.style.transition = 'opacity 0.2s';
        chip.innerHTML = `<span class="legend-color" style="background-color:${colors[keyIdx]};display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:4px;"></span>${labels[keyIdx]}`;
        chip.addEventListener('click', () => {
          visible[keyIdx] = !visible[keyIdx];
          seriesGroups[keyIdx].style.display = visible[keyIdx] ? '' : 'none';
          circles[keyIdx].style.display = visible[keyIdx] ? '' : 'none';
          chip.style.opacity = visible[keyIdx] ? '1' : '0.35';
          chip.style.textDecoration = visible[keyIdx] ? '' : 'line-through';
        });
        legendEl.appendChild(chip);
      });
    }

    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.style.cssText = 'position:absolute;background:var(--card-bg);opacity:0.97;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid var(--border-color);padding:0.6rem 0.9rem;border-radius:10px;font-size:0.8rem;font-family:var(--font-sans);color:var(--text-primary);box-shadow:0 8px 30px rgba(0,0,0,0.08);pointer-events:none;display:none;z-index:10;transition:left 0.04s ease-out,top 0.04s ease-out;';
    container.appendChild(tooltip);

    const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    overlay.setAttribute('x', '0'); overlay.setAttribute('y', '0');
    overlay.setAttribute('width', width); overlay.setAttribute('height', height);
    overlay.setAttribute('fill', 'transparent');
    overlay.style.cursor = 'crosshair';
    svg.appendChild(overlay);

    const onMouseMove = (e) => {
      const containerRect = container.getBoundingClientRect();
      const pt = svg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
      const xPct = (svgP.x - padding.left) / chartWidth;
      let dataIdx = Math.max(0, Math.min(data.length - 1, Math.round(xPct * (data.length - 1))));
      const item = data[dataIdx];
      const targetX = getX(dataIdx);

      vLine.setAttribute('x1', targetX); vLine.setAttribute('x2', targetX);
      valueKeys.forEach((key, ki) => {
        circles[ki].setAttribute('cx', targetX);
        circles[ki].setAttribute('cy', getY(item[key]));
        circles[ki].style.display = visible[ki] ? '' : 'none';
      });
      hoverGroup.setAttribute('visibility', 'visible');

      let html = `<div style="font-weight:600;margin-bottom:0.3rem;">${item.label}</div>`;
      valueKeys.forEach((key, ki) => {
        if (!visible[ki]) return;
        html += `<div style="display:flex;justify-content:space-between;gap:1rem;align-items:center;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${colors[ki]};"></span>
          <span style="color:var(--text-secondary);margin-right:auto;padding-left:4px;">${labels[ki]}:</span>
          <span style="font-family:var(--font-mono);font-weight:600;">${FinanceEngine.formatINRSmart(item[key])}</span>
        </div>`;
      });
      tooltip.innerHTML = html;
      tooltip.style.display = 'block';

      const tooltipRect = tooltip.getBoundingClientRect();
      const scaleX = containerRect.width / width;
      const scaleY = containerRect.height / height;
      let left = (targetX + 15) * scaleX;
      if (left + tooltipRect.width > containerRect.width) left = (targetX - 15) * scaleX - tooltipRect.width;
      let top = getY(item[valueKeys[0]]) * scaleY - tooltipRect.height / 2;
      top = Math.max(padding.top * scaleY, Math.min((height - padding.bottom) * scaleY - tooltipRect.height, top));
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
    };

    const onMouseLeave = () => { hoverGroup.setAttribute('visibility', 'hidden'); tooltip.style.display = 'none'; };
    overlay.addEventListener('mousemove', onMouseMove);
    overlay.addEventListener('mouseleave', onMouseLeave);
  },

  // 6. SVG Donut Chart Generator (e.g. for Asset Allocation)
  
  /**
   * Render a responsive SVG Donut chart
   * containerId: string
   * slices: Array of { label: string, value: number, color: string }
   */
  renderDonutChart(containerId, slices, observe = true) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    container.chartData = { type: 'donut', slices };
    if (observe) {
      chartResizeObserver.observe(container);
    }

    const rect = container.getBoundingClientRect();
    const width = rect.width || 300;
    const height = rect.height || 280;
    container.lastWidth = width;
    container.lastHeight = height;
    const minSize = Math.max(50, Math.min(width, height) - 40);
    const radius = minSize / 2;
    const centerX = width / 2;
    const centerY = height / 2;
    const strokeWidth = 35;
    const innerRadius = Math.max(5, radius - strokeWidth / 2);

    const total = slices.reduce((sum, s) => sum + s.value, 0);
    if (total <= 0) return;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    let accumulatedAngle = -Math.PI / 2; // start from top (12 o'clock)

    slices.forEach((slice) => {
      if (slice.value <= 0) return;
      const angle = (slice.value / total) * 2 * Math.PI;

      // Calculate path endpoints
      const x1 = centerX + innerRadius * Math.cos(accumulatedAngle);
      const y1 = centerY + innerRadius * Math.sin(accumulatedAngle);

      accumulatedAngle += angle;

      const x2 = centerX + innerRadius * Math.cos(accumulatedAngle);
      const y2 = centerY + innerRadius * Math.sin(accumulatedAngle);

      const largeArc = angle > Math.PI ? 1 : 0;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${x1} ${y1} A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${x2} ${y2}`);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', slice.color);
      path.setAttribute('stroke-width', strokeWidth);
      
      // Subtle hover effect
      path.style.transition = 'opacity 0.2s';
      path.style.cursor = 'pointer';
      path.addEventListener('mouseenter', () => path.style.opacity = '0.8');
      path.addEventListener('mouseleave', () => path.style.opacity = '1');

      svg.appendChild(path);
    });

    // Add a center summary card text inside the donut
    const textGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    textGroup.setAttribute('text-anchor', 'middle');
    textGroup.setAttribute('dominant-baseline', 'middle');

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', centerX);
    label.setAttribute('y', centerY - 8);
    label.setAttribute('font-family', 'var(--font-sans)');
    label.setAttribute('font-size', '11px');
    label.setAttribute('fill', 'var(--text-secondary)');
    label.textContent = 'TOTAL';
    textGroup.appendChild(label);

    const val = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    val.setAttribute('x', centerX);
    val.setAttribute('y', centerY + 12);
    val.setAttribute('font-family', 'var(--font-mono)');
    val.setAttribute('font-size', '16px');
    val.setAttribute('font-weight', '700');
    val.setAttribute('fill', 'var(--text-primary)');
    val.textContent = FinanceEngine.formatINR(total);
    textGroup.appendChild(val);

    svg.appendChild(textGroup);
    container.appendChild(svg);
  },

  // 7. CSV/JSON Export Utilities
  
  /**
   * Helper class to construct and export calculator data to CSV & JSON
   */
  exportData(calcName, inputs, results, tableHeaders, tableRows) {
    const today = new Date().toISOString().slice(0, 10);
    const filename = `${calcName}-${today}`;

    // Export formats object
    return {
      exportCSV() {
        let csvContent = '\uFEFF'; // UTF-8 BOM for Excel compatibility
        
        // 1. Inputs Section
        csvContent += 'Parameter,Value\n';
        for (const key in inputs) {
          csvContent += `"${key}",${inputs[key]}\n`;
        }
        csvContent += '\n';

        // 2. Results Section
        csvContent += 'Metric,Value\n';
        for (const key in results) {
          csvContent += `"${key}",${results[key]}\n`;
        }
        csvContent += '\n';

        // 3. Projections Table Section
        if (tableHeaders && tableRows && tableRows.length > 0) {
          csvContent += tableHeaders.join(',') + '\n';
          tableRows.forEach(row => {
            csvContent += row.join(',') + '\n';
          });
        }

        FinanceEngine._triggerDownload(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
      },

      exportJSON() {
        const jsonObject = {
          calculator: calcName,
          exportDate: today,
          inputs: inputs,
          results: results,
          yearlyProjections: tableRows ? tableRows.map(row => {
            const rowObj = {};
            tableHeaders.forEach((header, idx) => {
              rowObj[header] = isNaN(row[idx]) ? row[idx] : parseFloat(row[idx]);
            });
            return rowObj;
          }) : []
        };

        const jsonString = JSON.stringify(jsonObject, null, 2);
        FinanceEngine._triggerDownload(jsonString, `${filename}.json`, 'application/json;charset=utf-8;');
      }
    };
  },

  /**
   * Helper function to trigger browser download
   */
  _triggerDownload(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Copy text table to clipboard
   */
  copyTableToClipboard(headers, rows) {
    let text = headers.join('\t') + '\n';
    rows.forEach(row => {
      text += row.join('\t') + '\n';
    });

    const triggerBtnFeedback = () => {
      const btn = document.getElementById('btn-copy-table');
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = originalText;
          btn.classList.remove('copied');
        }, 1500);
      }
    };
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        FinanceEngine.showToast('Table copied to clipboard!');
        triggerBtnFeedback();
      }).catch(err => {
        console.error('Could not copy table: ', err);
        const success = FinanceEngine._fallbackCopyText(text);
        if (success) triggerBtnFeedback();
      });
    } else {
      const success = FinanceEngine._fallbackCopyText(text);
      if (success) triggerBtnFeedback();
    }
  },

  /**
   * Fallback copy text using standard textarea select & execCommand
   */
  _fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    let successful = false;
    try {
      successful = document.execCommand('copy');
      if (successful) {
        FinanceEngine.showToast('Table copied to clipboard!');
      } else {
        FinanceEngine.showToast('Failed to copy table.');
      }
    } catch (err) {
      console.error('Fallback copy failed: ', err);
      FinanceEngine.showToast('Failed to copy table.');
    }
    document.body.removeChild(textArea);
    return successful;
  },

  /**
   * Show toast alert in UI
   */
  showToast(message) {
    let toast = document.getElementById('toast-alert');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-alert';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }
};
