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
