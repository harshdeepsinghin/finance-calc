// Intercept value updates on active number inputs to allow decimal typing without resetting values or moving cursors
(function() {
  const originalValueDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
  Object.defineProperty(HTMLInputElement.prototype, 'value', {
    get() {
      return originalValueDescriptor.get.call(this);
    },
    set(val) {
      if (document.activeElement === this && this.type === 'number') {
        if (typeof val === 'number' && isNaN(val)) {
          return;
        }
        const currentNum = parseFloat(this.value);
        const newNum = parseFloat(val);
        if (!isNaN(currentNum) && !isNaN(newNum) && currentNum === newNum) {
          return;
        }
      }
      originalValueDescriptor.set.call(this, val);
    }
  });
})();

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
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
        </svg>
      </button>
      <a href="${homePath}" style="display: flex; align-items: center; gap: 0.75rem; color: var(--text-primary);">
        <svg class="logo-icon" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
        </svg>
        <span class="logo-text">FinPlan India</span>
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
  
  footerContainer.innerHTML = `
    <p>&copy; ${new Date().getFullYear()} FinPlan India. Made for Indian Investors. Blazing fast, lightweight, and offline-first.</p>
    <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">
      Calculations are for illustrative purposes and based on CAGR returns. All calculators run completely in your browser. No data leaves your device.
    </p>
  `;
}

// --- Layout Helpers ---

function setupSettingsToggles() {
  // Handle horizontal settings bar compounding toggle buttons
  const monthlyBtn = document.getElementById('freq-monthly-btn');
  const yearlyBtn = document.getElementById('freq-yearly-btn');
  if (monthlyBtn && yearlyBtn) {
    const syncFreqButtons = (freq) => {
      monthlyBtn.classList.toggle('toggle-btn-active', freq === 'monthly');
      yearlyBtn.classList.toggle('toggle-btn-active', freq === 'yearly');
      const freqInput = document.getElementById('compounding-freq');
      if (freqInput) {
        freqInput.value = freq;
        freqInput.dispatchEvent(new Event('input', { bubbles: true }));
        freqInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };
    monthlyBtn.addEventListener('click', () => syncFreqButtons('monthly'));
    yearlyBtn.addEventListener('click', () => syncFreqButtons('yearly'));
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

function setupStepperButtons() {
  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('.step-btn');
    if (!btn) return;
    
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
    if (btn.textContent.trim() === '+') {
      newVal += step;
    } else if (btn.textContent.trim() === '-') {
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
  showInflation: true,
  showTaxation: true,
  globalInflationRate: 6.0
};

function getPreference(key) {
  try {
    const prefs = JSON.parse(localStorage.getItem('finplan_user_prefs')) || {};
    return prefs[key] !== undefined ? prefs[key] : defaultPreferences[key];
  } catch (e) {
    return defaultPreferences[key];
  }
}

function setPreference(key, value) {
  try {
    const prefs = JSON.parse(localStorage.getItem('finplan_user_prefs')) || {};
    prefs[key] = value;
    localStorage.setItem('finplan_user_prefs', JSON.stringify(prefs));
    applyPreferences();
  } catch (e) {}
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
              <span class="pref-title">Indian Number Color Coding</span>
              <span class="pref-desc">Color-code digits by place value (Lakhs, Thousands, etc.) for readability</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="pref-color-coding">
              <span class="slider-switch"></span>
            </label>
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

  // Apply initial preferences
  applyPreferences();
}

function openPreferences() {
  const modal = document.getElementById('preferences-modal');
  if (modal) {
    const toggleMapping = {
      'pref-show-words': 'showWords',
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
  const observer = new MutationObserver((mutations) => {
    let metricChanged = false;
    let tableChanged = false;

    mutations.forEach((mutation) => {
      const target = mutation.target.closest ? mutation.target.closest('.metric-value') : mutation.target.parentElement?.closest('.metric-value');
      if (target) {
        metricChanged = true;
        updateMetricWords(target);
        updateMetricColorCoding(target);
      }

      const isTable = mutation.target.closest ? mutation.target.closest('#projections-table') : mutation.target.parentElement?.closest('#projections-table');
      if (isTable) {
        tableChanged = true;
      }
    });

    if (tableChanged) {
      colorCodeTableCells();
    }
    
    if (metricChanged) {
      adjustForInflation();
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

function loadHtml2Canvas(callback) {
  if (window.html2canvas) {
    if (callback) callback();
    return;
  }
  const isCalcPage = window.location.pathname.includes('/calculators/');
  const prefix = isCalcPage ? '../' : '';
  const script = document.createElement('script');
  script.src = `${prefix}js/html2canvas.min.js`;
  script.onload = () => {
    if (callback) callback();
  };
  document.head.appendChild(script);
}

function injectScreenshotButton() {
  const header = document.querySelector('.calculator-header');
  if (!header) return;

  if (document.getElementById('header-screenshot-btn')) return;

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

  const btn = document.createElement('button');
  btn.className = 'btn btn-secondary screenshot-btn';
  btn.id = 'header-screenshot-btn';
  btn.style.marginTop = '0.5rem';
  btn.style.flexShrink = '0';
  btn.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="margin-right: 0.4rem; vertical-align: middle;">
      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
    </svg>
    Screenshot
  `;

  header.appendChild(btn);

  btn.addEventListener('click', () => {
    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Capturing...';

    loadHtml2Canvas(() => {
      const target = document.querySelector('.calculator-workspace');
      btn.style.display = 'none';
      
      const toolbars = document.querySelectorAll('.action-toolbar');
      toolbars.forEach(tb => tb.style.display = 'none');

      html2canvas(target, {
        useCORS: true,
        logging: false,
        scale: 2,
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim()
      }).then(canvas => {
        btn.style.display = '';
        toolbars.forEach(tb => {
          tb.style.display = getPreference('showTable') ? '' : 'none';
        });
        btn.disabled = false;
        btn.innerHTML = originalText;

        handleScreenshotShare(canvas);
      }).catch(err => {
        btn.style.display = '';
        toolbars.forEach(tb => {
          tb.style.display = getPreference('showTable') ? '' : 'none';
        });
        btn.disabled = false;
        btn.innerHTML = originalText;
        console.error('Screenshot capture failed:', err);
      });
    });
  });
}

function handleScreenshotShare(canvas) {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile && navigator.share && navigator.canShare) {
    canvas.toBlob((blob) => {
      if (!blob) {
        downloadCanvas(canvas);
        return;
      }
      const file = new File([blob], 'calculation.png', { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        navigator.share({
          files: [file],
          title: 'Calculator Calculation',
          text: 'Check out my calculation from FinPlan India'
        }).catch(err => {
          downloadCanvas(canvas);
        });
      } else {
        downloadCanvas(canvas);
      }
    }, 'image/png');
  } else {
    downloadCanvas(canvas);
  }
}

function downloadCanvas(canvas) {
  const link = document.createElement('a');
  link.download = `${document.title.split(' | ')[0].replace(/\s+/g, '_')}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
