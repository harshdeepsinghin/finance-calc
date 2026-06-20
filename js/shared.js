// Note: The previous HTMLInputElement.prototype.value monkey-patch has been removed.
// It caused unexpected side effects and performance overhead across all inputs.
// Decimal typing is handled by comparing parsed values in syncUI() instead.


document.addEventListener('DOMContentLoaded', () => {
  // Initialize Theme
  initTheme();

  // Inject Global Components
  injectHeader();
  injectSidebar();
  injectFooter();

  // Setup Settings Collapsible Toggles
  setupSettingsToggles();

  // Highlight Active Link in Sidebar
  highlightActiveLink();

  // Setup Sidebar Collapsible
  setupSidebarToggle();

  // Setup Draggable Labels (Infinite Rollers)
  setupDraggableLabels();

  // Setup Step Increment/Decrement Buttons
  setupStepperButtons();

  // Setup Search Modal
  setupSearch();

  // Initialize Preferences & UI
  initPreferences();

  // Setup MutationObserver and input listeners for words and color-coding
  setupMetricWordsObserver();

  // Setup Screenshot Button Injection
  injectScreenshotButton();

  // Setup Dynamic Inflation Injections
  injectInflationSetting();

  // Setup Global Input Limits (max 100/35 years)
  setupGlobalInputLimits();

  // Setup Click to Copy results
  setupMetricValueCopy();

  // Load MathJax only on pages that actually contain TeX math delimiters
  maybeLoadMathJax();

  // Setup range sliders
  setupGlobalSliders();
});

// --- Theme Management ---

function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);

  // Update button icons
  updateThemeIcon();
}

function updateThemeIcon() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const btns = document.querySelectorAll('.theme-toggle-btn');

  const sunIcon = `<svg viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-12.37c-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41zm-12.37 12.37c-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41z"/></svg>`;
  const moonIcon = `<svg viewBox="0 0 24 24"><path d="M9.37 5.51c-.18-.64-.93-.86-1.43-.44-1.97 1.67-3.22 4.14-3.22 6.93 0 4.97 4.03 9 9 9 2.79 0 5.26-1.25 6.93-3.22.42-.5.2-1.25-.44-1.43-4.9-.73-8.87-4.7-9.6-9.6z"/></svg>`;

  btns.forEach(btn => {
    btn.innerHTML = currentTheme === 'dark' ? sunIcon : moonIcon;
  });
}

// --- Injection Functions ---

function injectHeader() {
  const headerContainer = document.getElementById('global-header');
  if (!headerContainer) return;

  const isCalcPage = window.location.pathname.includes('/calculators/');
  const homePath = isCalcPage ? '../index.html' : 'index.html';

  headerContainer.innerHTML = `
    <div class="logo-section" style="display: flex; align-items: center; gap: 0.75rem;">
    <button class="sidebar-toggle-btn" id="sidebar-toggle" aria-label="Toggle sidebar" style="margin-right: 0.25rem;">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <rect x="3" y="6" width="18" height="1.5" rx="0.75"/>
          <rect x="3" y="11.25" width="12" height="1.5" rx="0.75"/>
          <rect x="3" y="16.5" width="15" height="1.5" rx="0.75"/>
        </svg>
      </button>
      <a href="${homePath}" style="display: flex; align-items: center; gap: 0.75rem; color: var(--text-primary);">
        <svg class="logo-icon" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
        </svg>
        <span class="logo-text">MoneyInFuture</span>
      </a>
    </div>
    <div class="header-actions" style="display: flex; align-items: center; gap: 0.5rem;">
      <button class="preferences-btn" id="preferences-btn" aria-label="Preferences">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
        </svg>
      </button>
      <button class="search-toggle-btn" id="search-btn" aria-label="Search calculator">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
      </button>
      <button class="theme-toggle-btn" aria-label="Toggle theme"></button>
    </div>
  `;

  updateThemeIcon();

  const toggleBtn = headerContainer.querySelector('.theme-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleTheme);
  }

  // Preferences btn click
  const prefBtn = headerContainer.querySelector('.preferences-btn');
  if (prefBtn) {
    prefBtn.addEventListener('click', openPreferences);
  }
}

function injectSidebar() {
  const sidebarContainer = document.getElementById('global-sidebar');
  if (!sidebarContainer) return;

  const isCalcPage = window.location.pathname.includes('/calculators/');
  const pathPrefix = isCalcPage ? '' : 'calculators/';

  const categories = [
    {
      title: 'SIP & Mutual Funds',
      items: [
        { name: 'SIP Calculator', url: 'sip.html' },
        { name: 'Step-Up SIP', url: 'step-up-sip.html' },
        { name: 'Reverse SIP', url: 'reverse-sip.html' },
        { name: 'Lump Sum', url: 'lump-sum.html' },
        { name: 'Reverse Lump Sum', url: 'reverse-lump-sum.html' }
      ]
    },
    {
      title: 'SWP & Retirement',
      items: [
        { name: 'SWP Calculator', url: 'swp.html' },
        { name: 'Reverse SWP', url: 'reverse-swp.html' },
        { name: 'Step-Up SWP', url: 'step-up-swp.html' },
        { name: 'Retirement Planner', url: 'retirement.html' },
        { name: 'FIRE Calculator', url: 'fire.html' }
      ]
    },
    {
      title: 'Planners & Goals',
      items: [
        { name: 'Goal Planner', url: 'goal.html' },
        { name: 'Education Planner', url: 'education-planner.html' },
        { name: 'Marriage Planner', url: 'marriage-planner.html' },
        { name: 'House Down Payment', url: 'house-down-payment.html' },
        { name: 'Child Corpus Planner', url: 'child-corpus.html' }
      ]
    },
    {
      title: 'Portfolio & Returns',
      items: [
        { name: 'Net Worth Projection', url: 'net-worth-projection.html' },
        { name: 'Asset Allocation', url: 'asset-allocation.html' },
        { name: 'CAGR Calculator', url: 'cagr.html' },
        { name: 'XIRR Calculator', url: 'xirr.html' },
        { name: 'Inflation Calculator', url: 'inflation.html' },
        { name: 'Real Return Calculator', url: 'real-return.html' }
      ]
    },
    {
      title: 'Loans & Debt',
      items: [
        { name: 'EMI Calculator', url: 'emi.html' },
        { name: 'Loan Prepayment', url: 'loan-prepayment.html' },
        { name: 'Emergency Fund', url: 'emergency-fund.html' },
        { name: 'FI Timeline', url: 'financial-independence.html' }
      ]
    }
  ];

  let sidebarHtml = '';
  categories.forEach(cat => {
    sidebarHtml += `
      <h3>${cat.title}</h3>
      <ul class="nav-list">
    `;
    cat.items.forEach(item => {
      sidebarHtml += `
        <li class="nav-item">
          <a href="${pathPrefix}${item.url}" class="nav-link" data-filename="${item.url}">${item.name}</a>
        </li>
      `;
    });
    sidebarHtml += `</ul>`;
  });

  sidebarContainer.innerHTML = sidebarHtml;
}

function injectFooter() {
  const footerContainer = document.getElementById('global-footer');
  if (!footerContainer) return;

  const isCalcPage = window.location.pathname.includes('/calculators/');
  const rootPath = isCalcPage ? '../' : '';

  footerContainer.innerHTML = `
    <div class="footer-links" style="display:flex;flex-wrap:wrap;gap:0.5rem 1.5rem;margin-bottom:0.75rem;font-size:0.82rem;">
      <a href="${rootPath}about.html" style="color:var(--text-secondary);text-decoration:none;">About</a>
      <a href="${rootPath}privacy-policy.html" style="color:var(--text-secondary);text-decoration:none;">Privacy Policy</a>
      <a href="${rootPath}terms.html" style="color:var(--text-secondary);text-decoration:none;">Terms of Use</a>
      <a href="${rootPath}disclaimer.html" style="color:var(--text-secondary);text-decoration:none;">Disclaimer</a>
      <a href="${rootPath}contact.html" style="color:var(--text-secondary);text-decoration:none;">Contact</a>
    </div>
    <p>&copy; ${new Date().getFullYear()} MoneyInFuture. Made for Indian Investors. Blazing fast, lightweight, and offline-first.</p>
    <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">
      Calculations are for illustrative purposes only and based on assumed CAGR returns. <strong>This is not financial, tax, or investment advice.</strong> All calculators run completely in your browser — no data leaves your device.
    </p>
  `;
}

// --- Layout Helpers ---

function setupSettingsToggles() {
  // Handle horizontal settings bar compounding toggle buttons
  const monthlyBtn = document.getElementById('freq-monthly-btn');
  const yearlyBtn = document.getElementById('freq-yearly-btn');
  const freqInput = document.getElementById('compounding-freq');

  if (monthlyBtn && yearlyBtn) {
    const updateButtons = (freq) => {
      monthlyBtn.classList.toggle('toggle-btn-active', freq === 'monthly');
      yearlyBtn.classList.toggle('toggle-btn-active', freq === 'yearly');
    };

    const syncFreqButtons = (freq) => {
      updateButtons(freq);
      if (freqInput) {
        freqInput.value = freq;
        freqInput.dispatchEvent(new Event('input', { bubbles: true }));
        freqInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };

    // Use both mousedown and touchend to ensure immediate state on mobile
    const handleBtnActivate = (btn, freq, e) => {
      e.preventDefault();
      // Immediately force visual state - important for iOS/Android
      monthlyBtn.classList.remove('toggle-btn-active');
      yearlyBtn.classList.remove('toggle-btn-active');
      btn.classList.add('toggle-btn-active');
      syncFreqButtons(freq);
    };

    monthlyBtn.addEventListener('click', (e) => handleBtnActivate(monthlyBtn, 'monthly', e));
    yearlyBtn.addEventListener('click', (e) => handleBtnActivate(yearlyBtn, 'yearly', e));
    monthlyBtn.addEventListener('touchend', (e) => handleBtnActivate(monthlyBtn, 'monthly', e), { passive: false });
    yearlyBtn.addEventListener('touchend', (e) => handleBtnActivate(yearlyBtn, 'yearly', e), { passive: false });

    // Synchronize initial visual button state from compounding-freq input value on load
    if (freqInput) {
      updateButtons(freqInput.value || 'monthly');

      // Listen to inputs/change on the compounding-freq element to keep UI buttons in sync
      freqInput.addEventListener('input', (e) => updateButtons(e.target.value));
      freqInput.addEventListener('change', (e) => updateButtons(e.target.value));
    }
  }

  // Keep old collapsible toggle handler for any remaining .settings-toggle elements
  document.body.addEventListener('click', (e) => {
    const toggle = e.target.closest('.settings-toggle');
    if (!toggle) return;
    toggle.classList.toggle('expanded');
    const content = toggle.nextElementSibling;
    if (content && content.classList.contains('settings-content')) {
      content.classList.toggle('expanded');
    }
  });
}

function highlightActiveLink() {
  const path = window.location.pathname;
  const filename = path.split('/').pop();
  if (!filename) return;

  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => {
    if (link.getAttribute('data-filename') === filename) {
      link.classList.add('active');
    }
  });
}

function setupSidebarToggle() {
  const appContainer = document.querySelector('.app-container');
  if (!appContainer) return;

  // Create backdrop if not already there
  let backdrop = document.querySelector('.sidebar-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    appContainer.appendChild(backdrop);
  }

  // Retrieve saved sidebar state for desktop
  const savedState = localStorage.getItem('sidebar-collapsed');
  if (savedState === 'true' && window.innerWidth > 1100) {
    appContainer.classList.add('sidebar-collapsed');
  }

  const toggleBtn = document.getElementById('sidebar-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (window.innerWidth <= 1100) {
        appContainer.classList.toggle('sidebar-open');
      } else {
        appContainer.classList.toggle('sidebar-collapsed');
        localStorage.setItem('sidebar-collapsed', appContainer.classList.contains('sidebar-collapsed'));
      }
    });
  }

  backdrop.addEventListener('click', () => {
    appContainer.classList.remove('sidebar-open');
  });
}

function setupDraggableLabels() {
  document.body.addEventListener('mousedown', startDrag);
  document.body.addEventListener('touchstart', startDrag, { passive: false });

  function startDrag(e) {
    const label = e.target.closest('.draggable-label');
    if (!label) return;

    const inputId = label.getAttribute('for');
    if (!inputId) return;
    const input = document.getElementById(inputId);
    if (!input) return;

    // Only prevent default on label click to prevent text selection and scroll interference
    e.preventDefault();

    const isTouch = e.type === 'touchstart';
    const startX = isTouch ? e.touches[0].clientX : e.clientX;
    const startVal = parseFloat(input.value) || 0;

    // Determine dynamic step size based on value magnitude if not specified
    let step = 1;
    if (input.hasAttribute('step')) {
      step = parseFloat(input.getAttribute('step')) || 1;
    } else {
      if (startVal > 500000) step = 10000;
      else if (startVal > 50000) step = 1000;
      else if (startVal > 5000) step = 100;
      else if (startVal > 500) step = 10;
      else if (startVal > 50) step = 1;
      else step = 0.1;
    }

    const min = input.hasAttribute('min') ? parseFloat(input.getAttribute('min')) : 0;
    const max = input.hasAttribute('max') ? parseFloat(input.getAttribute('max')) : Infinity;

    function onMove(moveEvent) {
      const currentX = isTouch ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const deltaX = currentX - startX;

      // Speed multiplier: drag 1px = 0.5 * step units
      let newVal = startVal + (deltaX * step * 0.5);

      // Enforce bounds
      newVal = Math.max(min, newVal);
      if (max !== Infinity) {
        newVal = Math.min(max, newVal);
      }

      // Round to precision matching step
      const stepDecimals = (step.toString().split('.')[1] || '').length;
      input.value = newVal.toFixed(stepDecimals);

      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function onEnd() {
      if (isTouch) {
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('touchend', onEnd);
      } else {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onEnd);
      }
    }

    if (isTouch) {
      window.addEventListener('touchmove', onMove, { passive: true });
      window.addEventListener('touchend', onEnd);
    } else {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onEnd);
    }
  }
}

function showLimitTooltip(btn, isPlus, limit) {
  const wrapper = btn.closest('.input-wrapper');
  if (!wrapper) return;

  let existing = wrapper.querySelector('.limit-tooltip');
  if (existing) {
    existing.remove();
  }

  const tooltip = document.createElement('span');
  tooltip.className = 'limit-tooltip';
  
  let limitText = limit;
  if (limit >= 1000) {
    limitText = typeof FinanceEngine !== 'undefined' ? FinanceEngine.formatINRSmart(limit) : limit.toLocaleString('en-IN');
  }
  
  tooltip.textContent = isPlus 
    ? `Max safe limit of ${limitText} reached. Type manually to enter more.` 
    : `Min safe limit of ${limitText} reached. Type manually to enter less.`;

  tooltip.style.position = 'absolute';
  tooltip.style.left = '50%';
  tooltip.style.transform = 'translateX(-50%) translateY(-100%)';
  tooltip.style.top = '-8px';
  tooltip.style.background = 'var(--text-primary)';
  tooltip.style.color = 'var(--bg-primary)';
  tooltip.style.fontSize = '0.75rem';
  tooltip.style.padding = '0.3rem 0.6rem';
  tooltip.style.borderRadius = '4px';
  tooltip.style.pointerEvents = 'none';
  tooltip.style.zIndex = '100';
  tooltip.style.whiteSpace = 'nowrap';
  tooltip.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
  tooltip.style.opacity = '0';
  tooltip.style.transition = 'opacity 0.2s, transform 0.2s';

  const computedStyle = window.getComputedStyle(wrapper);
  if (computedStyle.position === 'static') {
    wrapper.style.position = 'relative';
  }
  wrapper.appendChild(tooltip);

  requestAnimationFrame(() => {
    tooltip.style.opacity = '1';
    tooltip.style.transform = 'translateX(-50%) translateY(-110%)';
  });

  setTimeout(() => {
    tooltip.style.opacity = '0';
    tooltip.style.transform = 'translateX(-50%) translateY(-100%)';
    setTimeout(() => {
      if (tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
    }, 200);
  }, 3500);
}

function setupStepperButtons() {
  let intervalId = null;
  let timeoutId = null;

  function stopStepping() {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function stepValue(btn) {
    const wrapper = btn.closest('.input-wrapper');
    if (!wrapper) return;

    const input = wrapper.querySelector('input[type="number"]');
    if (!input) return;

    const startVal = parseFloat(input.value) || 0;
    let step = 1;
    if (input.hasAttribute('step')) {
      step = parseFloat(input.getAttribute('step')) || 1;
    } else {
      if (startVal > 500000) step = 10000;
      else if (startVal > 50000) step = 1000;
      else if (startVal > 5000) step = 100;
      else if (startVal > 500) step = 10;
      else if (startVal > 50) step = 1;
      else step = 0.1;
    }

    const min = input.hasAttribute('min') ? parseFloat(input.getAttribute('min')) : 0;
    const max = input.hasAttribute('max') ? parseFloat(input.getAttribute('max')) : Infinity;

    let newVal = startVal;
    const isPlus = btn.textContent.trim() === '+';
    if (isPlus) {
      if (startVal >= max) {
        showLimitTooltip(btn, true, max);
        stopStepping();
        return;
      }
      newVal += step;
    } else {
      if (startVal <= min) {
        showLimitTooltip(btn, false, min);
        stopStepping();
        return;
      }
      newVal -= step;
    }

    newVal = Math.max(min, newVal);
    if (max !== Infinity) {
      newVal = Math.min(max, newVal);
    }

    const stepDecimals = (step.toString().split('.')[1] || '').length;
    input.value = newVal.toFixed(stepDecimals);

    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function startStepping(btn) {
    stopStepping();
    stepValue(btn);
    // After 400ms, start stepping rapidly every 80ms
    timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        stepValue(btn);
      }, 80);
    }, 400);
  }

  document.body.addEventListener('mousedown', (e) => {
    const btn = e.target.closest('.step-btn');
    if (!btn || e.button !== 0) return;
    if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
    startStepping(btn);
  });

  document.body.addEventListener('touchstart', (e) => {
    const btn = e.target.closest('.step-btn');
    if (!btn) return;
    startStepping(btn);
  }, { passive: true });

  window.addEventListener('mouseup', stopStepping);
  window.addEventListener('mouseleave', stopStepping);
  window.addEventListener('touchend', stopStepping);
  window.addEventListener('touchcancel', stopStepping);

  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('.step-btn');
    if (btn) {
      e.preventDefault();
    }
  });
}

function setupGlobalInputLimits() {
  document.body.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' && e.target.type === 'number') {
      const id = e.target.id;
      if (['years', 'duration', 'tenure', 'years_to_goal', 'years_to_fi', 'years_to_college', 'years_to_marriage'].includes(id)) {
        let maxVal = 100;
        if (id === 'tenure') {
          maxVal = 35; // Cap loan tenure at 35 years
        }
        const val = parseFloat(e.target.value);
        if (val > maxVal) {
          e.target.value = maxVal;
          e.target.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    }
  });
}

function setupMetricValueCopy() {
  document.body.addEventListener('click', (e) => {
    const valEl = e.target.closest('.metric-value');
    if (!valEl) return;

    const textToCopy = valEl.textContent.trim();
    if (!textToCopy || textToCopy === '-') return;

    navigator.clipboard.writeText(textToCopy).then(() => {
      let tooltip = valEl.querySelector('.copy-tooltip');
      if (!tooltip) {
        tooltip = document.createElement('span');
        tooltip.className = 'copy-tooltip';
        tooltip.textContent = 'Copied!';
        tooltip.style.position = 'absolute';
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translateX(-50%) translateY(-100%)';
        tooltip.style.top = '-8px';
        tooltip.style.background = 'var(--text-primary)';
        tooltip.style.color = 'var(--bg-primary)';
        tooltip.style.fontSize = '0.7rem';
        tooltip.style.padding = '0.2rem 0.5rem';
        tooltip.style.borderRadius = '4px';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.zIndex = '100';
        tooltip.style.opacity = '0';
        tooltip.style.transition = 'opacity 0.2s, transform 0.2s';

        const computedStyle = window.getComputedStyle(valEl);
        if (computedStyle.position === 'static') {
          valEl.style.position = 'relative';
        }
        valEl.appendChild(tooltip);
      }

      requestAnimationFrame(() => {
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'translateX(-50%) translateY(-120%)';
      });

      setTimeout(() => {
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateX(-50%) translateY(-100%)';
        setTimeout(() => tooltip.remove(), 200);
      }, 1000);
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  });
}

function setupSearch() {
  const isCalcPage = window.location.pathname.includes('/calculators/');
  const pathPrefix = isCalcPage ? '' : 'calculators/';

  // Define calculators flat list
  const allCalcs = [
    { name: 'SIP Calculator', url: 'sip.html', desc: 'Accumulation via systematic monthly mutual fund investments.' },
    { name: 'Step-Up SIP', url: 'step-up-sip.html', desc: 'SIP planning with annual percentage contribution increases.' },
    { name: 'Reverse SIP', url: 'reverse-sip.html', desc: 'Calculate the monthly SIP needed to reach a target corpus.' },
    { name: 'Lump Sum', url: 'lump-sum.html', desc: 'Model compound returns on one-time lump sum investments.' },
    { name: 'Reverse Lump Sum', url: 'reverse-lump-sum.html', desc: 'Determine the initial lump sum investment needed for a target.' },
    { name: 'SWP Calculator', url: 'swp.html', desc: 'Calculate systematic monthly withdrawals from a capital base.' },
    { name: 'Reverse SWP', url: 'reverse-swp.html', desc: 'Find the capital needed to sustain a desired monthly withdrawal.' },
    { name: 'Step-Up SWP', url: 'step-up-swp.html', desc: 'Systematic monthly withdrawals that increase annually with inflation.' },
    { name: 'Retirement Planner', url: 'retirement.html', desc: 'Plan your retirement corpus, savings needed, and inflation adjustment.' },
    { name: 'FIRE Calculator', url: 'fire.html', desc: 'Model your Financial Independence, Retire Early corpus and timeframe.' },
    { name: 'Goal Planner', url: 'goal.html', desc: 'Plan savings needed to reach a specific financial goal.' },
    { name: 'Education Planner', url: 'education-planner.html', desc: 'Calculate the future cost of higher education and savings needed.' },
    { name: 'Marriage Planner', url: 'marriage-planner.html', desc: 'Estimate future wedding expenses and monthly savings required.' },
    { name: 'House Down Payment', url: 'house-down-payment.html', desc: 'Plan monthly savings needed for a house down payment.' },
    { name: 'Child Corpus Planner', url: 'child-corpus.html', desc: 'Build a corpus for your child\'s future goals and milestones.' },
    { name: 'Net Worth Projection', url: 'net-worth-projection.html', desc: 'Project your future net worth based on current assets and savings.' },
    { name: 'Asset Allocation', url: 'asset-allocation.html', desc: 'Determine ideal asset mix and rebalancing needs.' },
    { name: 'CAGR Calculator', url: 'cagr.html', desc: 'Calculate Compounded Annual Growth Rate of investments.' },
    { name: 'XIRR Calculator', url: 'xirr.html', desc: 'Compute Internal Rate of Return for irregular cashflows.' },
    { name: 'Inflation Calculator', url: 'inflation.html', desc: 'Measure the impact of inflation on purchasing power over time.' },
    { name: 'Real Return Calculator', url: 'real-return.html', desc: 'Calculate post-inflation net real returns of investments.' },
    { name: 'EMI Calculator', url: 'emi.html', desc: 'Calculate monthly loan installments, interest, and schedule.' },
    { name: 'Loan Prepayment', url: 'loan-prepayment.html', desc: 'Model the interest savings and tenure reduction from prepayments.' },
    { name: 'Emergency Fund', url: 'emergency-fund.html', desc: 'Calculate emergency corpus based on monthly expenses.' },
    { name: 'FI Timeline', url: 'financial-independence.html', desc: 'Estimate when you will reach financial independence.' }
  ];

  // Create search modal elements
  if (document.getElementById('search-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'search-modal';
  modal.className = 'search-modal-overlay';
  modal.style.display = 'none';
  modal.innerHTML = `
    <div class="search-modal-content">
      <div class="search-modal-header">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <input type="text" id="search-input" placeholder="Search calculators..." autocomplete="off">
        <button id="search-close-btn" aria-label="Close search">&times;</button>
      </div>
      <div class="search-results" id="search-results-list"></div>
    </div>
  `;
  document.body.appendChild(modal);

  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('search-input');
  const searchClose = document.getElementById('search-close-btn');
  const resultsList = document.getElementById('search-results-list');

  function openSearch() {
    modal.style.display = 'flex';
    searchInput.value = '';
    searchInput.focus();
    renderResults('');
  }

  function closeSearch() {
    modal.style.display = 'none';
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', openSearch);
  }
  if (searchClose) {
    searchClose.addEventListener('click', closeSearch);
  }

  // Close on click backdrop
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeSearch();
  });

  // Hotkeys Cmd+K / Ctrl+K
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openSearch();
    }
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      closeSearch();
    }
  });

  // Render search results
  function renderResults(query) {
    resultsList.innerHTML = '';
    const q = query.toLowerCase().trim();
    const filtered = allCalcs.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.desc.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      resultsList.innerHTML = `<div class="search-no-results">No calculators found for "${query}"</div>`;
      return;
    }

    filtered.forEach((calc, idx) => {
      const item = document.createElement('a');
      item.href = pathPrefix + calc.url;
      item.className = 'search-result-item';
      if (idx === 0) item.classList.add('selected');
      item.innerHTML = `
        <h4>${calc.name}</h4>
        <p>${calc.desc}</p>
      `;
      resultsList.appendChild(item);
    });
  }

  searchInput.addEventListener('input', (e) => {
    renderResults(e.target.value);
  });

  // Keyboard navigation inside results
  searchInput.addEventListener('keydown', (e) => {
    const items = resultsList.querySelectorAll('.search-result-item');
    if (!items.length) return;

    let selectedIdx = -1;
    items.forEach((item, idx) => {
      if (item.classList.contains('selected')) {
        selectedIdx = idx;
      }
    });

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (selectedIdx !== -1) items[selectedIdx].classList.remove('selected');
      const nextIdx = (selectedIdx + 1) % items.length;
      items[nextIdx].classList.add('selected');
      items[nextIdx].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (selectedIdx !== -1) items[selectedIdx].classList.remove('selected');
      const prevIdx = (selectedIdx - 1 + items.length) % items.length;
      items[prevIdx].classList.add('selected');
      items[prevIdx].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = resultsList.querySelector('.search-result-item.selected');
      if (selected) {
        selected.click();
      }
    }
  });
}

// --- Preferences, Word Conversions, Color Coding, & Screenshots System ---

const defaultPreferences = {
  showWords: true,
  colorCoding: true,
  showGraph: true,
  showTable: true,
  showSliders: true,
  showInflation: true,
  showTaxation: true,
  globalInflationRate: 6.0,
  decimalPlaces: 0
};

function getPreference(key) {
  try {
    const prefs = JSON.parse(localStorage.getItem('moneyinfuture_user_prefs')) || {};
    return prefs[key] !== undefined ? prefs[key] : defaultPreferences[key];
  } catch (e) {
    return defaultPreferences[key];
  }
}

function setPreference(key, value) {
  try {
    const prefs = JSON.parse(localStorage.getItem('moneyinfuture_user_prefs')) || {};
    prefs[key] = value;
    localStorage.setItem('moneyinfuture_user_prefs', JSON.stringify(prefs));
    applyPreferences();
  } catch (e) { }
}

function applyPreferences() {
  // Graph
  const chartCards = document.querySelectorAll('.chart-card');
  const showGraph = getPreference('showGraph');
  chartCards.forEach(card => {
    card.style.display = showGraph ? '' : 'none';
  });

  // Table
  const tableCards = document.querySelectorAll('.table-card, .action-toolbar');
  const showTable = getPreference('showTable');
  tableCards.forEach(card => {
    card.style.display = showTable ? '' : 'none';
  });

  // Inflation Adjusted values:
  const showInflation = getPreference('showInflation');
  document.querySelectorAll('.metric-card').forEach(card => {
    const label = card.querySelector('.metric-label')?.textContent.toLowerCase() || '';
    if (label.includes('real') || label.includes('adjusted') || label.includes('inflation')) {
      card.style.display = showInflation ? '' : 'none';
    }
  });
  document.querySelectorAll('.settings-bar-item').forEach(item => {
    const label = item.querySelector('.settings-bar-label')?.textContent.toLowerCase() || '';
    if (label.includes('inflation')) {
      item.style.display = showInflation ? '' : 'none';
    }
  });
  document.querySelectorAll('.dynamic-inflation-setting').forEach(el => {
    el.style.display = showInflation ? '' : 'none';
  });

  // Taxation:
  const showTaxation = getPreference('showTaxation');
  document.querySelectorAll('.metric-card').forEach(card => {
    const label = card.querySelector('.metric-label')?.textContent.toLowerCase() || '';
    const isTax = label.includes('tax') || card.getAttribute('data-conditional') === 'tax';
    if (isTax) {
      if (!showTaxation) {
        card.style.setProperty('display', 'none', 'important');
      } else {
        const taxTypeEl = document.getElementById('tax-type');
        if (taxTypeEl && taxTypeEl.value === 'none') {
          card.style.display = 'none';
        } else {
          card.style.removeProperty('display');
        }
      }
    }
  });
  document.querySelectorAll('.settings-bar-item').forEach(item => {
    const label = item.querySelector('.settings-bar-label')?.textContent.toLowerCase() || '';
    if (label.includes('tax') || item.id === 'custom-tax-group') {
      item.style.display = showTaxation ? '' : 'none';
    }
  });

  // Sliders
  const showSliders = getPreference('showSliders');
  document.querySelectorAll('.slider-wrapper').forEach(wrapper => {
    wrapper.style.display = showSliders ? '' : 'none';
  });

  // Re-trigger metric words and color coding
  document.querySelectorAll('.metric-value').forEach(el => {
    updateMetricWords(el);
    updateMetricColorCoding(el);
  });
  colorCodeTableCells();

  // Re-trigger input words
  document.querySelectorAll('input[type="number"]').forEach(input => {
    updateInputWords(input);
  });

  // Re-trigger calculation to update results formatting with preference decimal places
  const firstInput = document.querySelector('.inputs-card input[type="number"], .inputs-card select');
  if (firstInput) {
    firstInput.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

function initPreferences() {
  if (document.getElementById('preferences-modal')) return;

  // Inject preferences modal HTML
  const modal = document.createElement('div');
  modal.id = 'preferences-modal';
  modal.className = 'preferences-modal-overlay';
  modal.style.display = 'none';
  modal.innerHTML = `
    <div class="preferences-modal-content">
      <div class="preferences-modal-header">
        <h2>Preferences</h2>
        <button id="preferences-close-btn" aria-label="Close preferences">&times;</button>
      </div>
      <div class="preferences-modal-body">
        <div class="pref-group">
          <h3>Display Settings</h3>
          
          <div class="pref-item">
            <div class="pref-info">
              <span class="pref-title">Show Value in Words</span>
              <span class="pref-desc">Display the amount in words (e.g. One Lakh) below numeric values</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="pref-show-words">
              <span class="slider-switch"></span>
            </label>
          </div>

          <div class="pref-item">
            <div class="pref-info">
              <span class="pref-title">Show Input Range Sliders</span>
              <span class="pref-desc">Display the interactive drag sliders below each number input</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="pref-show-sliders">
              <span class="slider-switch"></span>
            </label>
          </div>

          <div class="pref-item">
            <div class="pref-info">
              <span class="pref-title">Indian Number Color Coding</span>
              <span class="pref-desc">Color-code digits by place value (Lakhs, Thousands, etc.) for readability</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="pref-color-coding">
              <span class="slider-switch"></span>
            </label>
          </div>

          <div class="pref-item" style="align-items: center;">
            <div class="pref-info">
              <span class="pref-title">Result Decimal Places</span>
              <span class="pref-desc">Number of decimal places to show in summary results (0, 1, or 2)</span>
            </div>
            <select id="pref-decimal-places" style="width: auto; padding: 0.35rem 0.75rem; border-radius: 6px; border: 1px solid var(--border-color); background: var(--input-bg); color: var(--text-primary); font-size: 0.85rem; font-weight: 500; cursor: pointer; outline: none;">
              <option value="0">0 (Integer)</option>
              <option value="1">1 Decimal Place</option>
              <option value="2">2 Decimal Places</option>
            </select>
          </div>
        </div>

        <div class="pref-group">
          <h3>Calculator Features</h3>

          <div class="pref-item">
            <div class="pref-info">
              <span class="pref-title">Show Visual Projection Graph</span>
              <span class="pref-desc">Render the interactive SVG projection charts</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="pref-show-graph">
              <span class="slider-switch"></span>
            </label>
          </div>

          <div class="pref-item">
            <div class="pref-info">
              <span class="pref-title">Show Yearly Breakdown Table</span>
              <span class="pref-desc">Display the detailed yearly cash flow and tax breakdown tables</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="pref-show-table">
              <span class="slider-switch"></span>
            </label>
          </div>

          <div class="pref-item">
            <div class="pref-info">
              <span class="pref-title">Inflation Adjusted Values</span>
              <span class="pref-desc">Calculate and display inflation-adjusted real purchasing power</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="pref-show-inflation">
              <span class="slider-switch"></span>
            </label>
          </div>

          <div class="pref-item">
            <div class="pref-info">
              <span class="pref-title">Taxation Estimations</span>
              <span class="pref-desc">Estimate LTCG, STCG, or slab rate taxes for gains</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="pref-show-taxation">
              <span class="slider-switch"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const closeBtn = document.getElementById('preferences-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closePreferences);
  }

  // Close on click backdrop
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closePreferences();
  });

  // Esc key close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      closePreferences();
    }
  });

  // Initialize toggle states
  const toggleMapping = {
    'pref-show-words': 'showWords',
    'pref-show-sliders': 'showSliders',
    'pref-color-coding': 'colorCoding',
    'pref-show-graph': 'showGraph',
    'pref-show-table': 'showTable',
    'pref-show-inflation': 'showInflation',
    'pref-show-taxation': 'showTaxation'
  };

  for (const id in toggleMapping) {
    const checkbox = document.getElementById(id);
    if (checkbox) {
      checkbox.checked = getPreference(toggleMapping[id]);
      checkbox.addEventListener('change', (e) => {
        setPreference(toggleMapping[id], e.target.checked);
      });
    }
  }

  const decimalSelect = document.getElementById('pref-decimal-places');
  if (decimalSelect) {
    decimalSelect.value = getPreference('decimalPlaces');
    decimalSelect.addEventListener('change', (e) => {
      setPreference('decimalPlaces', parseInt(e.target.value) || 0);
    });
  }

  // Apply initial preferences
  applyPreferences();
}

function openPreferences() {
  const modal = document.getElementById('preferences-modal');
  if (modal) {
    const toggleMapping = {
      'pref-show-words': 'showWords',
      'pref-show-sliders': 'showSliders',
      'pref-color-coding': 'colorCoding',
      'pref-show-graph': 'showGraph',
      'pref-show-table': 'showTable',
      'pref-show-inflation': 'showInflation',
      'pref-show-taxation': 'showTaxation'
    };
    for (const id in toggleMapping) {
      const checkbox = document.getElementById(id);
      if (checkbox) checkbox.checked = getPreference(toggleMapping[id]);
    }
    const decimalSelect = document.getElementById('pref-decimal-places');
    if (decimalSelect) decimalSelect.value = getPreference('decimalPlaces');
    modal.style.display = 'flex';
  }
}

function closePreferences() {
  const modal = document.getElementById('preferences-modal');
  if (modal) modal.style.display = 'none';
}

function updateInputWords(input) {
  const existing = input.closest('.input-group')?.querySelector('.input-words');
  if (!getPreference('showWords')) {
    if (existing) existing.remove();
    return;
  }
  const wrapper = input.closest('.input-wrapper');
  if (!wrapper) return;
  const hasRupeePrefix = !!wrapper.querySelector('.input-prefix');
  if (!hasRupeePrefix) return;

  const val = parseFloat(input.value);
  const words = (isNaN(val) || val <= 0) ? '' : FinanceEngine.numberToIndianWords(val);

  let wordsEl = input.closest('.input-group').querySelector('.input-words');
  if (!wordsEl) {
    wordsEl = document.createElement('div');
    wordsEl.className = 'input-words';
    wordsEl.style.fontSize = '0.75rem';
    wordsEl.style.color = 'var(--text-secondary)';
    wordsEl.style.marginTop = '0.25rem';
    wordsEl.style.paddingLeft = '0.25rem';
    input.closest('.input-group').appendChild(wordsEl);
  }
  wordsEl.textContent = words ? words : '';
}

function updateMetricWords(el) {
  const existing = el.parentElement.querySelector('.metric-words');
  if (!getPreference('showWords')) {
    if (existing) existing.remove();
    return;
  }

  const text = el.textContent.trim();
  if (!text || text === '-') {
    if (existing) existing.textContent = '';
    return;
  }

  const val = parseFloat(text.replace(/[₹,\s]/g, ''));
  const words = (isNaN(val) || val <= 0) ? '' : FinanceEngine.numberToIndianWords(val);

  let wordsEl = el.parentElement.querySelector('.metric-words');
  if (!wordsEl) {
    wordsEl = document.createElement('span');
    wordsEl.className = 'metric-words';
    wordsEl.style.fontSize = '0.75rem';
    wordsEl.style.color = 'var(--text-secondary)';
    wordsEl.style.marginTop = '0.25rem';
    wordsEl.style.display = 'block';
    el.parentElement.appendChild(wordsEl);
  }
  wordsEl.textContent = words ? words : '';
}

function updateMetricColorCoding(el) {
  const hasSpans = el.querySelector('span');
  if (hasSpans && getPreference('colorCoding')) {
    return;
  }

  if (!getPreference('colorCoding')) {
    if (hasSpans) {
      el.textContent = el.textContent; // strips HTML
    }
    return;
  }

  const rawText = el.textContent.trim();
  if (!rawText || rawText === '-') return;

  const html = FinanceEngine.getColorCodedINRHtml(rawText);
  if (html) {
    el.innerHTML = html;
  }
}

function colorCodeTableCells() {
  const cells = document.querySelectorAll('#projections-table tbody td');
  cells.forEach(cell => {
    const hasSpans = cell.querySelector('span');
    if (!getPreference('colorCoding')) {
      if (hasSpans) {
        cell.textContent = cell.textContent; // strips HTML
      }
      return;
    }

    if (hasSpans) return;

    const text = cell.textContent.trim();
    if (text && text.includes(',') && !isNaN(parseFloat(text.replace(/[₹,\s]/g, '')))) {
      const html = FinanceEngine.getColorCodedINRHtml(text);
      if (html) {
        cell.innerHTML = html;
      }
    }
  });
}

function setupMetricWordsObserver() {
  // Debounce flags to prevent cascading DOM updates (main perf fix)
  let metricRafId = null;
  let tableRafId = null;
  const pendingMetrics = new Set();

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const target = mutation.target.closest ? mutation.target.closest('.metric-value') : mutation.target.parentElement?.closest('.metric-value');
      if (target) {
        pendingMetrics.add(target);
      }

      const isTable = mutation.target.closest ? mutation.target.closest('#projections-table') : mutation.target.parentElement?.closest('#projections-table');
      if (isTable && !tableRafId) {
        tableRafId = requestAnimationFrame(() => {
          tableRafId = null;
          colorCodeTableCells();
          setupTablePagination();
        });
      }
    });

    // Batch metric updates in next animation frame
    if (pendingMetrics.size > 0 && !metricRafId) {
      metricRafId = requestAnimationFrame(() => {
        metricRafId = null;
        pendingMetrics.forEach(target => {
          updateMetricWords(target);
          updateMetricColorCoding(target);
        });
        pendingMetrics.clear();
        adjustForInflation();
      });
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });

  // Initial runs
  document.querySelectorAll('.metric-value').forEach(el => {
    updateMetricWords(el);
    updateMetricColorCoding(el);
  });
  colorCodeTableCells();
  setupTablePagination();
  adjustForInflation();

  // Input listeners
  document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' && e.target.type === 'number') {
      updateInputWords(e.target);
    }
  });

  document.querySelectorAll('input[type="number"]').forEach(input => {
    updateInputWords(input);
  });
}

function adjustForInflation() {
  if (!getPreference('showInflation')) {
    document.querySelectorAll('.dynamic-inflation-card').forEach(el => el.style.display = 'none');
    return;
  }

  let inflationRate = 6.0;
  const inflationInput = document.getElementById('inflation-rate') || document.getElementById('inflation_rate');
  if (inflationInput) {
    inflationRate = parseFloat(inflationInput.value) || 6.0;
  } else {
    inflationRate = getPreference('globalInflationRate') || 6.0;
  }

  let years = 1;
  const yearsInput = document.getElementById('years') || document.getElementById('duration') || document.getElementById('tenure') || document.getElementById('years_to_goal') || document.getElementById('years_to_fi');
  if (yearsInput) {
    years = parseFloat(yearsInput.value) || 1;
  }

  // 1. CAGR / XIRR
  const cagrEl = document.getElementById('cagr-result') || document.getElementById('xirr-result') || document.getElementById('cagr');
  if (cagrEl) {
    const cagrVal = parseFloat(cagrEl.textContent.replace(/[%]/g, ''));
    if (!isNaN(cagrVal)) {
      const realCAGR = ((1 + cagrVal / 100) / (1 + inflationRate / 100) - 1) * 100;
      updateDynamicMetric(cagrEl, 'Real Rate (Inflation Adjusted)', realCAGR.toFixed(2) + '%');
    }
  }

  // 2. EMI / Loan Prepayment
  const emiEl = document.getElementById('total-payment');
  if (emiEl) {
    const totalPaymentVal = parseFloat(emiEl.textContent.replace(/[₹,\s]/g, ''));
    if (!isNaN(totalPaymentVal)) {
      const monthlyPayment = totalPaymentVal / (years * 12);
      let realTotal = 0;
      const monthlyInf = Math.pow(1 + inflationRate / 100, 1 / 12) - 1;
      for (let m = 1; m <= years * 12; m++) {
        realTotal += monthlyPayment / Math.pow(1 + monthlyInf, m);
      }
      updateDynamicMetric(emiEl, 'Real Cost (Today\'s Value)', FinanceEngine.formatINRSmart(realTotal));
    }
  }

  // 3. Generic corpus outputs
  const corpusEl = document.getElementById('total-corpus') || document.getElementById('target_corpus_display') || document.getElementById('emergency-corpus') || document.getElementById('required-corpus');
  if (corpusEl && !document.getElementById('adjusted-corpus')) {
    const corpusVal = parseFloat(corpusEl.textContent.replace(/[₹,\s]/g, ''));
    if (!isNaN(corpusVal)) {
      const realCorpus = corpusVal / Math.pow(1 + inflationRate / 100, years);
      updateDynamicMetric(corpusEl, 'Real Value (Today\'s Purchasing Power)', FinanceEngine.formatINRSmart(realCorpus));
    }
  }
}

function updateDynamicMetric(parentEl, label, valueText) {
  const card = parentEl.closest('.metric-card');
  if (!card) return;

  const parentGrid = card.parentElement;
  if (!parentGrid) return;

  let dynamicCard = parentGrid.querySelector(`.dynamic-inflation-card[data-source="${parentEl.id}"]`);
  if (!dynamicCard) {
    dynamicCard = document.createElement('div');
    dynamicCard.className = 'metric-card dynamic-inflation-card';
    dynamicCard.setAttribute('data-source', parentEl.id);
    dynamicCard.innerHTML = `
      <span class="metric-label">${label}</span>
      <span class="metric-value">-</span>
    `;
    card.after(dynamicCard);
  }

  dynamicCard.style.display = getPreference('showInflation') ? '' : 'none';
  const valEl = dynamicCard.querySelector('.metric-value');
  valEl.textContent = valueText;

  updateMetricWords(valEl);
  updateMetricColorCoding(valEl);
}

function injectInflationSetting() {
  const settingsBar = document.querySelector('.settings-bar');
  if (!settingsBar) return;

  const hasInflation = !!settingsBar.querySelector('input[id*="inflation"]');
  if (hasInflation) return;

  const item = document.createElement('div');
  item.className = 'settings-bar-item dynamic-inflation-setting';
  const prefRate = getPreference('globalInflationRate') || 6.0;

  item.innerHTML = `
    <span class="settings-bar-label">Inflation</span>
    <div class="input-wrapper" style="width:120px;">
      <input type="number" id="inflation-rate" min="0" max="15" step="0.1" value="${prefRate}" style="padding:0.4rem 0.5rem;font-size:0.9rem;">
      <span class="input-suffix">%</span>
    </div>
  `;

  const taxItem = Array.from(settingsBar.children).find(el => el.textContent.toLowerCase().includes('tax'));
  if (taxItem) {
    settingsBar.insertBefore(item, taxItem);
  } else {
    settingsBar.appendChild(item);
  }

  const input = item.querySelector('input');
  input.addEventListener('input', (e) => {
    setPreference('globalInflationRate', parseFloat(e.target.value) || 6.0);
    triggerCalculatorRecalculate();
  });

  item.style.display = getPreference('showInflation') ? '' : 'none';
}

function triggerCalculatorRecalculate() {
  const yearsInput = document.getElementById('years') || document.getElementById('duration') || document.getElementById('tenure') || document.getElementById('target_corpus') || document.getElementById('years_to_goal') || document.getElementById('years_to_fi');
  if (yearsInput) {
    yearsInput.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

let scriptsLoaded = false;
let scriptsLoading = false;
let scriptLoadingCallbacks = [];

function loadScreenshotScripts(callback) {
  if (scriptsLoaded || (window.html2canvas && window.jspdf)) {
    if (callback) callback();
    return;
  }

  if (callback) {
    scriptLoadingCallbacks.push(callback);
  }

  if (scriptsLoading) {
    return;
  }

  scriptsLoading = true;

  let loadedCount = 0;
  function onScriptLoaded() {
    loadedCount++;
    if (loadedCount === 2) {
      scriptsLoaded = true;
      scriptsLoading = false;
      scriptLoadingCallbacks.forEach(cb => cb());
      scriptLoadingCallbacks = [];
    }
  }

  const isCalcPage = window.location.pathname.includes('/calculators/');
  const prefix = isCalcPage ? '../' : '';

  if (window.html2canvas) {
    loadedCount++;
  } else {
    let s1 = document.querySelector(`script[src*="html2canvas.min.js"]`);
    if (!s1) {
      s1 = document.createElement('script');
      s1.src = `${prefix}js/html2canvas.min.js`;
      s1.async = true;
      s1.onload = onScriptLoaded;
      document.head.appendChild(s1);
    } else {
      s1.addEventListener('load', onScriptLoaded);
    }
  }

  if (window.jspdf) {
    loadedCount++;
  } else {
    let s2 = document.querySelector(`script[src*="jspdf.umd.min.js"]`);
    if (!s2) {
      s2 = document.createElement('script');
      s2.src = `${prefix}js/jspdf.umd.min.js`;
      s2.async = true;
      s2.onload = onScriptLoaded;
      document.head.appendChild(s2);
    } else {
      s2.addEventListener('load', onScriptLoaded);
    }
  }

  if (loadedCount === 2) {
    scriptsLoaded = true;
    scriptsLoading = false;
    scriptLoadingCallbacks.forEach(cb => cb());
    scriptLoadingCallbacks = [];
  }
}

let isGeneratingScreenshot = false;

function injectScreenshotButton() {
  const isCalcPage = window.location.pathname.includes('/calculators/');
  if (!isCalcPage) return;

  const header = document.querySelector('.calculator-header');
  if (!header) return;

  if (document.getElementById('header-share-btn')) return;

  const title = header.querySelector('h1');
  const desc = header.querySelector('p');

  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'flex-start';
  header.style.gap = '1.5rem';

  const textContainer = document.createElement('div');
  if (title) textContainer.appendChild(title.cloneNode(true));
  if (desc) textContainer.appendChild(desc.cloneNode(true));

  header.innerHTML = '';
  header.appendChild(textContainer);

  // Wrapper for button and dropdown popup
  const wrapper = document.createElement('div');
  wrapper.className = 'share-btn-wrapper';
  wrapper.style.marginTop = '0.5rem';
  wrapper.style.flexShrink = '0';

  const btn = document.createElement('button');
  btn.className = 'btn btn-secondary share-btn';
  btn.id = 'header-share-btn';
  btn.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="margin-right: 0.4rem; vertical-align: middle;">
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/>
    </svg>
    Share
  `;

  const dropdown = document.createElement('div');
  dropdown.className = 'share-dropdown-menu';
  dropdown.innerHTML = `
    <button class="share-dropdown-item" data-type="pdf">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V8H10c.83 0 1.5.67 1.5 1.5zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V8h2.5c.83 0 1.5.67 1.5 1.5v2zm4-2.5H19v1h1.5V11H19v2h-1.5V8h3v1.5zm-8 1.5h1v-2h-1v2z"/></svg>
      Export PDF
    </button>
    <button class="share-dropdown-item" data-type="png">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
      Export PNG
    </button>
    <button class="share-dropdown-item" data-type="link">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
      Share Link
    </button>
  `;

  wrapper.appendChild(btn);
  wrapper.appendChild(dropdown);
  header.appendChild(wrapper);

  // Toggle dropdown popup
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('show');
  });

  // Close dropdown popup when clicking elsewhere
  document.addEventListener('click', () => {
    dropdown.classList.remove('show');
  });

  // Actions click bindings
  dropdown.querySelectorAll('.share-dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.remove('show');
      const shareType = item.getAttribute('data-type');

      if (shareType === 'link') {
        handleLinkShare();
        return;
      }

      if (isGeneratingScreenshot) return;
      isGeneratingScreenshot = true;

      btn.disabled = true;
      const originalText = btn.innerHTML;
      btn.innerHTML = shareType === 'pdf' ? 'Generating PDF...' : 'Generating PNG...';

      loadScreenshotScripts(() => {
        const target = document.querySelector('.calculator-workspace');
        if (!target) {
          btn.disabled = false;
          btn.innerHTML = originalText;
          isGeneratingScreenshot = false;
          return;
        }

        // Create force-desktop overrides style tag
        const style = document.createElement('style');
        style.id = 'force-desktop-styles';
        style.innerHTML = `
          .force-desktop-target {
            padding: 2.5rem !important;
            max-width: 1200px !important;
            width: 1200px !important;
          }
          .force-desktop-target .calculator-top-section {
            grid-template-columns: 380px minmax(0, 1fr) !important;
            gap: 2.5rem !important;
          }
          .force-desktop-target .settings-bar {
            flex-direction: row !important;
            align-items: center !important;
            gap: 0.75rem 2rem !important;
          }
          .force-desktop-target .settings-bar-item {
            width: auto !important;
          }
          .force-desktop-target .settings-bar-item .input-wrapper {
            width: inherit !important;
            max-width: none !important;
          }
          .force-desktop-target .summary-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important;
            gap: 1.25rem !important;
          }
          .force-desktop-target .metric-card {
            padding: 1.5rem !important;
            min-height: 110px !important;
          }
          .force-desktop-target .metric-label {
            font-size: 0.85rem !important;
            margin-bottom: 0.5rem !important;
          }
          .force-desktop-target .metric-value {
            font-size: 1.5rem !important;
          }
          .force-desktop-target .metric-words {
            font-size: 0.75rem !important;
          }
          .force-desktop-target .metric-sub {
            font-size: 0.75rem !important;
          }
          .force-desktop-target .chart-svg-container {
            height: 350px !important;
            width: 100% !important;
          }
          .force-desktop-target .chart-header {
            flex-direction: row !important;
            align-items: center !important;
            gap: inherit !important;
          }
          .force-desktop-target .chart-legend {
            gap: 1rem !important;
          }
          .force-desktop-target .action-toolbar {
            justify-content: flex-end !important;
            gap: 1rem !important;
          }
          .force-desktop-target .action-toolbar .btn {
            flex: none !important;
            width: auto !important;
            font-size: 0.9rem !important;
            padding: 0.6rem 1.2rem !important;
          }
          .force-desktop-target .table-card {
            padding: 1.5rem !important;
          }
          .force-desktop-target table {
            font-size: 0.88rem !important;
          }
          .force-desktop-target table th, .force-desktop-target table td {
            padding: 0.75rem 1rem !important;
          }
        `;
        document.head.appendChild(style);

        // --- Temporarily expand table to ALL rows before cloning ---
        const originalTable = target.querySelector('#projections-table');
        let savedPaginationState = null;
        if (originalTable && originalTable.paginationState) {
          // Save current state
          savedPaginationState = { ...originalTable.paginationState };
          // Force-show all rows
          const tbody = originalTable.querySelector('tbody');
          if (tbody) {
            tbody.querySelectorAll('tr').forEach(row => { row.style.display = ''; });
          }
          // Hide pagination controls from live DOM temporarily
          const liveControls = originalTable.closest('.table-card')?.querySelector('.table-pagination-controls');
          if (liveControls) liveControls.style.visibility = 'hidden';
        }

        // Clone target (captures the expanded table)
        const clone = target.cloneNode(true);
        clone.classList.add('force-desktop-target');

        // Restore original table pagination immediately after cloning
        if (originalTable && savedPaginationState) {
          originalTable.paginationState = savedPaginationState;
          applyTablePagination(originalTable);
          const liveControls = originalTable.closest('.table-card')?.querySelector('.table-pagination-controls');
          if (liveControls) liveControls.style.visibility = '';
        }

        // Hide pagination controls in the clone (not needed in screenshot)
        clone.querySelectorAll('.table-pagination-controls').forEach(el => el.style.display = 'none');

        // Create off-screen container styled at 1200px width
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '-9999px';
        container.style.width = '1200px';
        container.style.background = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim();
        container.setAttribute('data-theme', document.documentElement.getAttribute('data-theme') || 'light');

        container.appendChild(clone);
        document.body.appendChild(container);

        // Re-render SVG charts inside clone at desktop resolution
        const originalContainers = target.querySelectorAll('.chart-svg-container');
        const clonedContainers = clone.querySelectorAll('.chart-svg-container');
        originalContainers.forEach((orig, idx) => {
          const cloned = clonedContainers[idx];
          if (orig && cloned && orig.chartData) {
            cloned.chartData = orig.chartData;
            const tempId = 'cloned-chart-container-' + idx + '-' + Date.now();
            cloned.id = tempId;
            const { type, data, valueKeys, colors, lineLabels, slices } = cloned.chartData;
            if (type === 'line') {
              FinanceEngine.renderLineChart(tempId, data, valueKeys, colors, lineLabels, false);
            } else if (type === 'donut') {
              FinanceEngine.renderDonutChart(tempId, slices, false);
            }
          }
        });

        // Hide share button and bottom actions bar in clone
        const cloneShareBtn = clone.querySelector('.share-btn-wrapper');
        if (cloneShareBtn) cloneShareBtn.style.display = 'none';

        const cloneToolbars = clone.querySelectorAll('.action-toolbar');
        cloneToolbars.forEach(tb => tb.style.display = 'none');

        // Wait a brief moment for layouts to settle
        setTimeout(() => {
          html2canvas(clone, {
            useCORS: true,
            logging: false,
            scale: 2,
            backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim()
          }).then(canvas => {
            // Cleanup
            document.body.removeChild(container);
            document.head.removeChild(style);

            // Restore original button
            btn.disabled = false;
            btn.innerHTML = originalText;
            isGeneratingScreenshot = false;

            const baseFilename = `${document.title.split(' | ')[0].replace(/\s+/g, '_')}`;

            if (shareType === 'pdf') {
              // Generate jsPDF
              const imgData = canvas.toDataURL('image/png');
              const { jsPDF } = window.jspdf;
              const pdf = new jsPDF('p', 'mm', 'a4');
              const pdfWidth = 210;
              const pdfHeight = 297;
              const imgWidth = pdfWidth;
              const imgHeight = (canvas.height * pdfWidth) / canvas.width;
              let heightLeft = imgHeight;
              let position = 0;

              pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
              heightLeft -= pdfHeight;

              while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
              }

              const filename = `${baseFilename}.pdf`;
              const blob = pdf.output('blob');
              handleFileShare(blob, filename, 'application/pdf');
            } else {
              // Generate PNG image
              canvas.toBlob((blob) => {
                if (!blob) {
                  FinanceEngine.showToast('Failed to generate PNG');
                  return;
                }
                const filename = `${baseFilename}.png`;
                handleFileShare(blob, filename, 'image/png');
              }, 'image/png');
            }

          }).catch(err => {
            document.body.removeChild(container);
            document.head.removeChild(style);
            btn.disabled = false;
            btn.innerHTML = originalText;
            isGeneratingScreenshot = false;
            console.error('Share generation failed:', err);
            FinanceEngine.showToast('Failed to share calculation');
          });
        }, 100);
      });
    });
  });
}

function handleLinkShare() {
  const url = window.location.href;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isMobile && navigator.share) {
    navigator.share({
      title: document.title,
      text: 'Check out my calculation on MoneyInFuture:',
      url: url
    }).catch(err => {
      console.log('Share link cancelled or failed', err);
    });
  } else {
    // Copy link to clipboard on desktop
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        FinanceEngine.showToast('Calculation link copied to clipboard!');
      }).catch(() => {
        fallbackCopyText(url);
      });
    } else {
      fallbackCopyText(url);
    }
  }
}

function fallbackCopyText(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    const successful = document.execCommand('copy');
    if (successful) {
      FinanceEngine.showToast('Calculation link copied to clipboard!');
    } else {
      FinanceEngine.showToast('Failed to copy link.');
    }
  } catch (err) {
    FinanceEngine.showToast('Failed to copy link.');
  }
  document.body.removeChild(textArea);
}

function handleFileShare(blob, filename, mimeType) {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile && navigator.share && navigator.canShare) {
    const file = new File([blob], filename, { type: mimeType });
    if (navigator.canShare({ files: [file] })) {
      navigator.share({
        files: [file],
        title: 'Calculator Calculation',
        text: 'Check out my calculation from MoneyInFuture'
      }).catch(err => {
        console.log('Share file cancelled', err);
        triggerFileDownload(blob, filename);
      });
    } else {
      triggerFileDownload(blob, filename);
    }
  } else {
    triggerFileDownload(blob, filename);
  }
}

function triggerFileDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- Table Pagination System ---

function setupTablePagination() {
  const table = document.getElementById('projections-table');
  if (!table) return;

  const card = table.closest('.table-card');
  if (!card) return;

  // Ensure the table-title is outside the scroll wrapper
  // Structure: .table-card > .table-title, .table-scroll-wrapper > table, .table-pagination-controls

  // Dynamically wrap table inside a scroll wrapper
  let wrapper = table.parentElement;
  if (!wrapper.classList.contains('table-scroll-wrapper')) {
    wrapper = document.createElement('div');
    wrapper.className = 'table-scroll-wrapper';
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  }

  // Render controls placeholder if not present, and place it AFTER the wrapper (outside scroll)
  let controls = card.querySelector('.table-pagination-controls');
  if (!controls) {
    controls = document.createElement('div');
    controls.className = 'table-pagination-controls';
    // Insert AFTER the scroll wrapper so it's outside horizontal scroll
    card.appendChild(controls);
  }

  // Initialize state if not present
  if (!table.paginationState) {
    table.paginationState = {
      currentPage: 1,
      pageSize: 10
    };
  }

  renderPaginationControls(table, controls);
  applyTablePagination(table);
}

function renderPaginationControls(table, controlsEl) {
  const state = table.paginationState;
  const tbody = table.querySelector('tbody');
  const totalRows = tbody ? tbody.querySelectorAll('tr').length : 0;
  const pageSize = state.pageSize === 'all' ? totalRows : parseInt(state.pageSize, 10);
  const totalPages = Math.ceil(totalRows / pageSize) || 1;

  if (state.currentPage > totalPages) {
    state.currentPage = totalPages;
  }

  controlsEl.innerHTML = `
    <div class="pagination-left">
      <span class="pagination-label">Rows per page:</span>
      <div class="page-size-toggle">
        <button class="size-btn ${state.pageSize === 10 ? 'active' : ''}" data-size="10">10</button>
        <button class="size-btn ${state.pageSize === 50 ? 'active' : ''}" data-size="50">50</button>
        <button class="size-btn ${state.pageSize === 'all' ? 'active' : ''}" data-size="all">All</button>
      </div>
    </div>
    <div class="pagination-right">
      <button class="page-nav-btn prev-btn" ${state.currentPage === 1 ? 'disabled' : ''} aria-label="Previous page">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
      </button>
      <span class="page-info">Page ${state.currentPage} of ${totalPages}</span>
      <button class="page-nav-btn next-btn" ${state.currentPage === totalPages ? 'disabled' : ''} aria-label="Next page">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
        </svg>
      </button>
    </div>
  `;

  // Bind events
  controlsEl.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sizeAttr = btn.getAttribute('data-size');
      state.pageSize = sizeAttr === 'all' ? 'all' : parseInt(sizeAttr, 10);
      state.currentPage = 1;
      applyTablePagination(table);
      renderPaginationControls(table, controlsEl);
    });
  });

  controlsEl.querySelector('.prev-btn').addEventListener('click', () => {
    if (state.currentPage > 1) {
      state.currentPage--;
      applyTablePagination(table);
      renderPaginationControls(table, controlsEl);
    }
  });

  controlsEl.querySelector('.next-btn').addEventListener('click', () => {
    if (state.currentPage < totalPages) {
      state.currentPage++;
      applyTablePagination(table);
      renderPaginationControls(table, controlsEl);
    }
  });
}

function applyTablePagination(table) {
  const state = table.paginationState;
  if (!state) return;

  const tbody = table.querySelector('tbody');
  if (!tbody) return;

  const rows = Array.from(tbody.querySelectorAll('tr'));
  const totalRows = rows.length;
  const pageSize = state.pageSize === 'all' ? totalRows : parseInt(state.pageSize, 10);

  const startIdx = (state.currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;

  rows.forEach((row, idx) => {
    if (idx >= startIdx && idx < endIdx) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

// --- Dynamic MathJax Loader ---

/**
 * Only load MathJax when the page actually contains TeX math delimiters.
 * This avoids loading a large CDN script on 24/25 calculator pages that
 * have no math rendering needs.
 */
function maybeLoadMathJax() {
  const body = document.body;
  if (!body) return;
  const text = body.textContent || '';
  const hasTex = text.includes('$$') ||
    text.includes('\\(') ||
    text.includes('\\[') ||
    body.innerHTML.includes('\\begin{');
  if (!hasTex) return;
  loadMathJax();
}

function loadMathJax() {
  if (window.MathJax) {
    if (typeof window.MathJax.typeset === 'function') {
      window.MathJax.typeset();
    }
    return;
  }

  window.MathJax = {
    tex: {
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      displayMath: [['$$', '$$'], ['\\[', '\\]']],
      processEscapes: true
    },
    options: {
      skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
    }
  };

  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
  script.async = true;
  script.onload = () => {
    if (window.MathJax && typeof window.MathJax.typeset === 'function') {
      window.MathJax.typeset();
    }
  };
  document.head.appendChild(script);
}

// --- Range Slider Synchronization ---

function setupGlobalSliders() {
  // Sync all range sliders to their number input values on load
  const rangeSliders = document.querySelectorAll('input[type="range"]');
  rangeSliders.forEach(slider => {
    const numInputId = slider.id.replace('-slider', '');
    const numInput = document.getElementById(numInputId);
    if (numInput) {
      slider.value = numInput.value;
    }
  });

  // Listen for slider inputs to update number inputs and vice versa
  document.body.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' && e.target.type === 'range' && e.target.id.endsWith('-slider')) {
      const numInputId = e.target.id.replace('-slider', '');
      const numInput = document.getElementById(numInputId);
      if (numInput) {
        numInput.value = e.target.value;
        // Trigger both input and change events so the calculator recalculates
        numInput.dispatchEvent(new Event('input', { bubbles: true }));
        numInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } else if (e.target.tagName === 'INPUT' && e.target.type === 'number') {
      const slider = document.getElementById(e.target.id + '-slider');
      if (slider) {
        slider.value = e.target.value;
      }
    }
  });
}

