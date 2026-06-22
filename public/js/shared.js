// Note: The previous HTMLInputElement.prototype.value monkey-patch has been removed.
// It caused unexpected side effects and performance overhead across all inputs.
// Decimal typing is handled by comparing parsed values in syncUI() instead.


document.addEventListener('DOMContentLoaded', () => {
  // Initialize Theme
  initTheme();

  // Bind Header Action Listeners (Theme toggle & Preferences)
  const toggleBtn = document.querySelector('.theme-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleTheme);
  }
  const prefBtn = document.querySelector('.preferences-btn');
  if (prefBtn) {
    prefBtn.addEventListener('click', openPreferences);
  }
  updateThemeIcon();

  // Setup Right Actions Menu Toggle for Mobile
  const menuToggle = document.getElementById('header-menu-toggle');
  const actionsWrapper = document.getElementById('header-actions-wrapper');
  if (menuToggle && actionsWrapper) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      actionsWrapper.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!actionsWrapper.contains(e.target) && e.target !== menuToggle) {
        actionsWrapper.classList.remove('open');
      }
    });
  }

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

  // Initialize Onboarding Popup & Level Translation
  initFinanceLevelSystem();

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

  // Dynamically update document tags for SEO if query parameters are present
  updateDynamicSeoTags();
});

// --- Dynamic SEO Tag Updater ---

function updateDynamicSeoTags() {
  const params = new URLSearchParams(window.location.search);
  if (params.size > 0) {
    const h1 = document.querySelector('.calculator-header h1');
    if (!h1) return;
    const calculatorName = h1.textContent.trim();
    
    // Find amount, rate, years from aliases or exact keys
    const amountKeys = ['monthly_sip', 'monthly', 'amount', 'amt', 'principal', 'lump', 'target_corpus', 'corpus', 'initial_corpus', 'starting_sip'];
    const rateKeys = ['return_rate', 'rate', 'interest', 'return', 'r'];
    const yearsKeys = ['years', 'duration', 'tenure', 'time', 'y'];
    
    let amount = null;
    let rate = null;
    let years = null;
    
    for (const k of amountKeys) {
      if (params.has(k)) {
        amount = parseFloat(params.get(k));
        break;
      }
    }
    for (const k of rateKeys) {
      if (params.has(k)) {
        rate = parseFloat(params.get(k));
        break;
      }
    }
    for (const k of yearsKeys) {
      if (params.has(k)) {
        years = parseFloat(params.get(k));
        break;
      }
    }
    
    if (amount !== null && rate !== null && years !== null && !isNaN(amount) && !isNaN(rate) && !isNaN(years)) {
      // Format values for SEO snippet
      const formattedAmount = '₹' + amount.toLocaleString('en-IN');
      const formattedRate = rate + '%';
      const formattedYears = years + (years === 1 ? ' Year' : ' Years');
      
      let titleText = '';
      let descText = '';
      
      if (calculatorName.toLowerCase().includes('sip')) {
        titleText = `SIP Calculator: Invest ${formattedAmount}/month for ${formattedYears} at ${formattedRate} | MoneyInFuture`;
        descText = `Calculated results for investing ${formattedAmount} per month for ${formattedYears} at ${formattedRate} expected return rate. Find total investment, returns, and future compounding corpus.`;
      } else if (calculatorName.toLowerCase().includes('lump sum') || calculatorName.toLowerCase().includes('lumpsum')) {
        titleText = `Lump Sum Calculator: Invest ${formattedAmount} for ${formattedYears} at ${formattedRate} | MoneyInFuture`;
        descText = `Calculated results for investing a lump sum of ${formattedAmount} for ${formattedYears} at ${formattedRate} CAGR return rate. See your projected returns and final wealth.`;
      } else {
        titleText = `${calculatorName}: ${formattedAmount} for ${formattedYears} at ${formattedRate} | MoneyInFuture`;
        descText = `Calculate ${calculatorName} with ${formattedAmount} investment/corpus over ${formattedYears} at ${formattedRate} annual return rate. See full projections.`;
      }
      
      // Update Title
      document.title = titleText;
      
      // Update Meta description
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', descText);
      
      // Update OG & Twitter Meta Tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', titleText);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', descText);
      
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) twitterTitle.setAttribute('content', titleText);
      const twitterDesc = document.querySelector('meta[name="twitter:description"]');
      if (twitterDesc) twitterDesc.setAttribute('content', descText);

      // Update Canonical Link dynamically so Google indexes the parameters
      const canonicalLink = document.querySelector('link[rel="canonical"]');
      if (canonicalLink) {
        canonicalLink.setAttribute('href', window.location.href);
      }
    }
  }
}

// --- Finance Level (Simple | Investor | Professional) Glossary & Translation System ---

const FinanceTerminologies = {
  "principal": {
    "id": "principal",
    "tiers": {
      "professional": {
        "label": "Principal",
        "definition": "The initial capital sum invested or borrowed, on which interest or compound returns are calculated."
      },
      "investor": {
        "label": "Investment Amount",
        "definition": "The total amount of money you invest at the start of a plan."
      },
      "simple": {
        "label": "Starting Money",
        "definition": "The initial cash you start with when beginning your investment."
      }
    }
  },
  "periodic_investment": {
    "id": "periodic_investment",
    "tiers": {
      "professional": {
        "label": "Periodic Investment",
        "definition": "The fixed capital contributions made regularly at structured intervals (e.g. monthly)."
      },
      "investor": {
        "label": "SIP Amount",
        "definition": "Systematic Investment Plan amount—the fixed sum you auto-invest monthly in mutual funds."
      },
      "simple": {
        "label": "Money Added Every Month",
        "definition": "The regular cash you add to your savings account or investment every month."
      }
    }
  },
  "time_horizon": {
    "id": "time_horizon",
    "tiers": {
      "professional": {
        "label": "Time Horizon",
        "definition": "The prospective duration of time an investor intends to hold an investment before redeeming it."
      },
      "investor": {
        "label": "Investment Period",
        "definition": "The total time (in months or years) that you plan to keep your money invested."
      },
      "simple": {
        "label": "How Long You Will Invest",
        "definition": "The total number of years you plan to leave your money to grow."
      }
    }
  },
  "annual_increment": {
    "id": "annual_increment",
    "tiers": {
      "professional": {
        "label": "Annual Increment",
        "definition": "The rate at which the periodic investment amount is escalated on an annual basis."
      },
      "investor": {
        "label": "Step-Up SIP Rate",
        "definition": "The percentage by which you increase your monthly investment contributions each year."
      },
      "simple": {
        "label": "Yearly Increase",
        "definition": "The percentage by which you will bump up your monthly savings once a year."
      }
    }
  },
  "compounding_frequency": {
    "id": "compounding_frequency",
    "tiers": {
      "professional": {
        "label": "Compounding Frequency",
        "definition": "The mathematical rate at which accumulated interest is credited back to compute subsequent interest."
      },
      "investor": {
        "label": "Compounding Frequency",
        "definition": "How often the interest you earn is added back to your principal (e.g., monthly vs. yearly)."
      },
      "simple": null
    }
  },
  "future_value": {
    "id": "future_value",
    "tiers": {
      "professional": {
        "label": "Future Value",
        "definition": "The nominal projected value of an asset or cash flow at a specific future date based on compounding."
      },
      "investor": {
        "label": "Final Corpus / Expected Corpus",
        "definition": "The total accumulated wealth you expect to have in your portfolio at the end of your investment term."
      },
      "simple": {
        "label": "Final Amount",
        "definition": "The total sum of money you will end up with at the end of your timeframe."
      }
    }
  },
  "total_wealth_gained": {
    "id": "total_wealth_gained",
    "tiers": {
      "professional": {
        "label": "Total Wealth Gained",
        "definition": "The aggregate nominal capital appreciation generated by the investment above the total principal paid."
      },
      "investor": {
        "label": "Total Returns",
        "definition": "The total profit or interest earned on top of the money you originally invested."
      },
      "simple": {
        "label": "Total Profit",
        "definition": "The extra money you made purely from investment growth (final amount minus what you put in)."
      }
    }
  },
  "capital_gains": {
    "id": "capital_gains",
    "tiers": {
      "professional": {
        "label": "Capital Gains",
        "definition": "The taxable profit realized from the redemption or sale of a capital asset or mutual fund units."
      },
      "investor": {
        "label": "Profit on Investment",
        "definition": "The raw gains generated by your mutual funds before applicable taxes or exit charges."
      },
      "simple": null
    }
  },
  "systematic_withdrawal": {
    "id": "systematic_withdrawal",
    "tiers": {
      "professional": {
        "label": "Systematic Withdrawal (SWP)",
        "definition": "A scheduled payout plan that systematically redeems fixed mutual fund units to provide regular cashflow."
      },
      "investor": {
        "label": "SWP Amount",
        "definition": "The fixed monthly cash payout you set to withdraw from your accumulated mutual fund corpus."
      },
      "simple": {
        "label": "Regular Monthly Income",
        "definition": "The cash amount you plan to withdraw each month to live on or spend."
      }
    }
  },
  "withdrawal_frequency": {
    "id": "withdrawal_frequency",
    "tiers": {
      "professional": {
        "label": "Withdrawal Frequency",
        "definition": "The structural periodicity at which redemptions are processed for systematic withdrawals."
      },
      "investor": {
        "label": "Payout Frequency",
        "definition": "How frequently your systematic withdrawal payouts are paid out (e.g. monthly)."
      },
      "simple": null
    }
  },
  "expected_return": {
    "id": "expected_return",
    "tiers": {
      "professional": {
        "label": "Expected Return",
        "definition": "The anticipated rate of investment growth, used as the discount rate for cash flow projections."
      },
      "investor": {
        "label": "Expected Return",
        "definition": "The annual percentage growth rate you expect your mutual funds or investments to generate."
      },
      "simple": {
        "label": "Expected Growth Rate",
        "definition": "The annual percentage rate at which you expect your savings to grow."
      }
    }
  },
  "cagr": {
    "id": "cagr",
    "tiers": {
      "professional": {
        "label": "Compound Annual Growth Rate (CAGR)",
        "definition": "The geometric progression rate that models investment returns assuming annual compounding over time."
      },
      "investor": {
        "label": "Annual Return (CAGR)",
        "definition": "The average yearly return rate of your investment, accounting for year-on-year compounding growth."
      },
      "simple": {
        "label": "Average Yearly Growth",
        "definition": "The average annual growth rate of your money, including the compounding interest effect."
      }
    }
  },
  "xirr": {
    "id": "xirr",
    "tiers": {
      "professional": {
        "label": "Extended Internal Rate of Return (XIRR)",
        "definition": "The annualized internal rate of return for a series of irregular, date-specific cash flows."
      },
      "investor": {
        "label": "SIP Return (XIRR)",
        "definition": "The true annual return on your SIP, taking into account that monthly deposits were made at different times."
      },
      "simple": {
        "label": "Actual Annual Growth",
        "definition": "The true yearly growth rate of your money, considering you added it month by month instead of all at once."
      }
    }
  },
  "absolute_return": {
    "id": "absolute_return",
    "tiers": {
      "professional": {
        "label": "Absolute Return",
        "definition": "The straightforward point-to-point percentage gain or loss on an asset, irrespective of time elapsed."
      },
      "investor": {
        "label": "Point-to-Point Return",
        "definition": "The total percentage change in your investment value from the starting date to the ending date."
      },
      "simple": null
    }
  },
  "real_rate": {
    "id": "real_rate",
    "tiers": {
      "professional": {
        "label": "Real Rate of Return",
        "definition": "The nominal rate of return adjusted to strip out the effects of inflation, reflecting purchasing power gains."
      },
      "investor": {
        "label": "Inflation-Adjusted Return",
        "definition": "The actual return rate of your investment after subtracting the rate of inflation."
      },
      "simple": null
    }
  },
  "inflation_rate": {
    "id": "inflation_rate",
    "tiers": {
      "professional": {
        "label": "Expected Inflation Rate",
        "definition": "The annualized rate of increase in consumer prices, which erodes the purchasing power of cash."
      },
      "investor": {
        "label": "Inflation Rate",
        "definition": "The yearly rate at which costs and prices rise, causing money to lose its buying power over time."
      },
      "simple": null
    }
  },
  "ter": {
    "id": "ter",
    "tiers": {
      "professional": {
        "label": "Total Expense Ratio (TER)",
        "definition": "The total percentage of mutual fund assets deducted annually for management, administration, and marketing."
      },
      "investor": {
        "label": "Expense Ratio / Fund Fees",
        "definition": "The annual percentage fee charged by the mutual fund company to manage and run the fund."
      },
      "simple": null
    }
  },
  "tax_liability": {
    "id": "tax_liability",
    "tiers": {
      "professional": {
        "label": "Capital Gains Tax Liability",
        "definition": "The estimated statutory tax obligation due to local authorities upon redeeming appreciated investment gains."
      },
      "investor": {
        "label": "Applicable Taxes",
        "definition": "The estimated government taxes you will owe on your mutual fund gains upon withdrawal."
      },
      "simple": null
    }
  },
  "volatility": {
    "id": "volatility",
    "tiers": {
      "professional": {
        "label": "Portfolio Volatility",
        "definition": "A statistical metric (standard deviation) reflecting the frequency and magnitude of portfolio price fluctuations."
      },
      "investor": {
        "label": "Risk Level / Volatility",
        "definition": "How sharply your investment value is expected to bounce up and down over time."
      },
      "simple": null
    }
  },
  "max_drawdown": {
    "id": "max_drawdown",
    "tiers": {
      "professional": {
        "label": "Maximum Drawdown",
        "definition": "The largest historical peak-to-trough drop in a portfolio's value, preceding a new recovery peak."
      },
      "investor": {
        "label": "Max Fall from Peak",
        "definition": "The maximum temporary drop your investment could experience from its highest value to its lowest point."
      },
      "simple": null
    }
  },
  "sequence_risk": {
    "id": "sequence_risk",
    "tiers": {
      "professional": {
        "label": "Sequence of Returns Risk",
        "definition": "The risk that early market drawdowns during the distribution phase deplete capital reserves prematurely."
      },
      "investor": {
        "label": "Market Timing Risk",
        "definition": "The risk that a stock market dip right at the start of your retirement could permanently shrink your savings."
      },
      "simple": null
    }
  },
  "sharpe_ratio": {
    "id": "sharpe_ratio",
    "tiers": {
      "professional": {
        "label": "Sharpe Ratio",
        "definition": "A risk-adjusted performance metric indicating the average excess return per unit of volatility."
      },
      "investor": {
        "label": "Risk-Adjusted Return",
        "definition": "A score assessing if your investment growth is high enough to justify the risks and swings taken."
      },
      "simple": null
    }
  },
  "real_future_value": {
    "id": "real_future_value",
    "tiers": {
      "professional": {
        "label": "Real Future Value",
        "definition": "The inflation-adjusted future value of your corpus, representing its purchasing power in today's currency."
      },
      "investor": {
        "label": "Inflation-Adjusted Corpus",
        "definition": "The final value of your investment adjusted to reflect the impact of inflation."
      },
      "simple": null
    }
  },
  "post_tax_future_value": {
    "id": "post_tax_future_value",
    "tiers": {
      "professional": {
        "label": "Post-Tax Future Value",
        "definition": "The final projected future value of your corpus after estimating and deducting capital gains taxes."
      },
      "investor": {
        "label": "Post-Tax Corpus",
        "definition": "The expected final value of your investment after estimating applicable taxes."
      },
      "simple": null
    }
  },
  "total_invested": {
    "id": "total_invested",
    "tiers": {
      "professional": {
        "label": "Total Principal Invested",
        "definition": "The aggregate sum of all periodic or one-time capital contributions made over the investment term."
      },
      "investor": {
        "label": "Invested Amount",
        "definition": "The total amount of money you have contributed to the investment plan."
      },
      "simple": {
        "label": "Total Money Put In",
        "definition": "The total sum of all the cash you added over the entire time."
      }
    }
  },
  "total_withdrawals": {
    "id": "total_withdrawals",
    "tiers": {
      "professional": {
        "label": "Total Systematic Withdrawals",
        "definition": "The aggregate value of all systematic payouts redeemed from the capital base over the duration."
      },
      "investor": {
        "label": "Total Withdrawals",
        "definition": "The total sum of all monthly cash payouts you received from your investment."
      },
      "simple": {
        "label": "Total Money Taken Out",
        "definition": "The total amount of cash you withdrew and spent over the entire time."
      }
    }
  }
};

const termIdMapping = {
  // Inputs
  'monthly_sip': 'periodic_investment',
  'starting_sip': 'periodic_investment',
  'monthly_withdrawal': 'systematic_withdrawal',
  'principal': 'principal',
  'initial_corpus': 'principal',
  'target_corpus': 'future_value',
  'return_rate': 'expected_return',
  'years': 'time_horizon',
  'duration': 'time_horizon',
  'tenure': 'time_horizon',
  'years_to_goal': 'time_horizon',
  'years_to_fi': 'time_horizon',
  'step_up_pct': 'annual_increment',
  'annual_step_up': 'annual_increment',
  'compounding-freq': 'compounding_frequency',
  'compounding_freq': 'compounding_frequency',
  'inflation-rate': 'inflation_rate',
  'inflation_rate': 'inflation_rate',
  
  // Results / Outputs
  'total-invested': 'total_invested',
  'total-gains': 'total_wealth_gained',
  'total-corpus': 'future_value',
  'remaining-corpus': 'future_value',
  'required-sip': 'periodic_investment',
  'required-lump': 'principal',
  'adjusted-corpus': 'real_future_value',
  'post-tax-corpus': 'post_tax_future_value',
  'final-gains': 'total_wealth_gained',
  'total-withdrawn': 'total_withdrawals',
  'estimated-gains': 'total_wealth_gained',
  'gains-portion': 'total_wealth_gained',
  'required-corpus': 'principal',
  
  // Table headers matching text (clean values)
  'monthly sip': 'periodic_investment',
  'returns': 'total_wealth_gained',
  'interest earned': 'total_wealth_gained',
  'gains': 'total_wealth_gained',
  'corpus': 'future_value',
  'ending balance': 'future_value',
  'real corpus': 'real_future_value',
  'real value': 'real_future_value',
  'taxable gains': 'capital_gains',
  'estimated tax': 'tax_liability',
  'post-tax corpus': 'post_tax_future_value'
};

let preservedLevelSettings = {};

function initFinanceLevelSystem() {
  let level = localStorage.getItem('moneyinfuture_finance_level');
  const onboardingCompleted = localStorage.getItem('moneyinfuture_onboarding_completed') === 'true';
  
  if (!level) {
    level = 'simple';
    localStorage.setItem('moneyinfuture_finance_level', 'simple');
  }
  
  window.currentFinanceLevel = level;
  
  setupOnboardingPopup(onboardingCompleted);
  setupHeaderLevelToggle();
  
  applyDefaultsAndVisibility(level);
  translateUI(level);
  setupFloatingTooltips();
}

function setupOnboardingPopup(completed) {
  const overlay = document.getElementById('onboarding-overlay');
  if (!overlay) return;
  
  if (!completed) {
    overlay.style.display = 'flex';
    document.body.classList.add('modal-open');
  }
  
  const closeBtn = document.getElementById('onboarding-close-btn');
  const optButtons = document.querySelectorAll('.onboarding-btn-opt');
  const infoLink = overlay.querySelector('.onboarding-info-link a');
  
  const completeOnboarding = (levelVal) => {
    localStorage.setItem('moneyinfuture_onboarding_completed', 'true');
    setFinanceLevel(levelVal);
    overlay.classList.add('fade-out');
    setTimeout(() => {
      overlay.style.display = 'none';
      document.body.classList.remove('modal-open');
    }, 300);
  };
  
  if (closeBtn) {
    closeBtn.addEventListener('click', () => completeOnboarding('simple'));
  }
  if (infoLink) {
    infoLink.addEventListener('click', () => completeOnboarding('simple'));
  }
  optButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedLevel = btn.getAttribute('data-level') || 'simple';
      completeOnboarding(selectedLevel);
    });
  });
}

function setupHeaderLevelToggle() {
  const toggleContainer = document.getElementById('header-level-toggle');
  if (!toggleContainer) return;
  
  const buttons = toggleContainer.querySelectorAll('.level-pill-btn');
  
  const syncButtons = (activeLevel) => {
    buttons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-level') === activeLevel);
    });
  };
  
  syncButtons(window.currentFinanceLevel);
  
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const level = btn.getAttribute('data-level');
      setFinanceLevel(level);
      syncButtons(level);
    });
  });

  // Right-click on the level toggle → tiny "About Finance Levels" popup
  let levelContextMenu = null;
  // Named refs so we can tear down stale listeners before each new open
  let _dismissClick = null;
  let _dismissCtx   = null;
  let _dismissKey   = null;
  let _dismissScr   = null;

  function removeLevelContextMenu() {
    if (levelContextMenu) {
      levelContextMenu.remove();
      levelContextMenu = null;
    }
    if (_dismissClick) {
      document.removeEventListener('click',      _dismissClick);
      document.removeEventListener('contextmenu', _dismissCtx);
      document.removeEventListener('keydown',    _dismissKey);
      window.removeEventListener('scroll',       _dismissScr);
      _dismissClick = _dismissCtx = _dismissKey = _dismissScr = null;
    }
  }

  toggleContainer.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();        // don't bubble so old document listener can't fire
    removeLevelContextMenu();   // clean up menu + all stale listeners

    const menu = document.createElement('div');
    menu.className = 'level-context-menu';
    menu.innerHTML = `
      <a href="/finance-levels.html">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="flex-shrink:0;opacity:0.7">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
        About Finance Levels
      </a>
    `;

    // Position near cursor, nudge inside viewport
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let x = e.clientX;
    let y = e.clientY;
    document.body.appendChild(menu);
    const mw = menu.offsetWidth;
    const mh = menu.offsetHeight;
    if (x + mw > vw - 8) x = vw - mw - 8;
    if (y + mh > vh - 8) y = vh - mh - 8;
    menu.style.left = x + 'px';
    menu.style.top  = y + 'px';
    levelContextMenu = menu;

    // Attach dismiss handlers (deferred so this very event doesn't trigger them)
    _dismissClick = () => removeLevelContextMenu();
    _dismissCtx   = (ev) => {
      // Only dismiss if right-clicking outside the toggle
      if (!ev.target.closest('#header-level-toggle')) removeLevelContextMenu();
    };
    _dismissKey   = (ev) => { if (ev.key === 'Escape') removeLevelContextMenu(); };
    _dismissScr   = () => removeLevelContextMenu();
    setTimeout(() => {
      document.addEventListener('click',      _dismissClick);
      document.addEventListener('contextmenu', _dismissCtx);
      document.addEventListener('keydown',    _dismissKey);
      window.addEventListener('scroll',       _dismissScr, { passive: true });
    }, 0);
  });
}

function setFinanceLevel(level) {
  window.currentFinanceLevel = level;
  localStorage.setItem('moneyinfuture_finance_level', level);
  
  const toggleContainer = document.getElementById('header-level-toggle');
  if (toggleContainer) {
    const buttons = toggleContainer.querySelectorAll('.level-pill-btn');
    buttons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-level') === level);
    });
  }

  // Set level-specific preferences
  if (level === 'simple') {
    setPreference('showSliders', true);
    setPreference('showInflation', false);
    setPreference('showTaxation', false);
  } else {
    setPreference('showSliders', false);
    setPreference('showInflation', true);
    setPreference('showTaxation', true);
  }
  
  applyDefaultsAndVisibility(level);
  translateUI(level);
  triggerCalculatorRecalculate();
}

function applyDefaultsAndVisibility(level) {
  const isSimple = level === 'simple';
  const showTaxation = getPreference('showTaxation');
  
  // Compounding Freq
  const compoundingInput = document.getElementById('compounding-freq');
  if (compoundingInput) {
    if (isSimple) {
      preservedLevelSettings['compounding-freq'] = compoundingInput.value;
      compoundingInput.value = 'yearly';
      const mBtn = document.getElementById('freq-monthly-btn');
      const yBtn = document.getElementById('freq-yearly-btn');
      if (mBtn && yBtn) {
        mBtn.classList.remove('toggle-btn-active');
        yBtn.classList.add('toggle-btn-active');
      }
    } else if (preservedLevelSettings['compounding-freq']) {
      compoundingInput.value = preservedLevelSettings['compounding-freq'];
      const mBtn = document.getElementById('freq-monthly-btn');
      const yBtn = document.getElementById('freq-yearly-btn');
      if (mBtn && yBtn) {
        mBtn.classList.toggle('toggle-btn-active', compoundingInput.value === 'monthly');
        yBtn.classList.toggle('toggle-btn-active', compoundingInput.value === 'yearly');
      }
    }
  }
  
  // Tax Type
  const taxTypeSelect = document.getElementById('tax-type');
  if (taxTypeSelect) {
    if (isSimple && !showTaxation) {
      preservedLevelSettings['tax-type'] = taxTypeSelect.value;
      taxTypeSelect.value = 'none';
    } else if (!isSimple && preservedLevelSettings['tax-type']) {
      taxTypeSelect.value = preservedLevelSettings['tax-type'];
    }
  }
}

// ─── Shared helper: build the set of term keys that should be hidden ───────────
// Preferences are the FINAL authority:
//   • Inflation keys → hidden whenever showInflation = false, visible when true
//     (regardless of whether the current level has a null tier for them)
//   • Tax keys       → same with showTaxation
//   • All other keys → hidden only when tiers[level] === null
function buildHiddenTermKeys(level) {
  const showInflation = getPreference('showInflation');
  const showTaxation  = getPreference('showTaxation');

  const inflationKeys = new Set(['real_future_value', 'inflation_rate', 'real_rate']);
  const taxKeys       = new Set(['post_tax_future_value', 'tax_liability', 'capital_gains']);

  const hidden = [];
  for (const key in FinanceTerminologies) {
    if (inflationKeys.has(key)) {
      if (!showInflation) hidden.push(key);
    } else if (taxKeys.has(key)) {
      if (!showTaxation) hidden.push(key);
    } else {
      if (FinanceTerminologies[key].tiers[level] === null) hidden.push(key);
    }
  }
  return hidden;
}

function translateUI(level) {
  const hiddenTermKeys = buildHiddenTermKeys(level);

  // ── Translate Input Labels ───────────────────────────────────────────────────
  document.querySelectorAll('label[for]').forEach(labelEl => {
    const forId   = labelEl.getAttribute('for');
    const termKey = termIdMapping[forId];
    if (!termKey) return;
    const termData = FinanceTerminologies[termKey];
    if (!termData) return;
    const tierData = termData.tiers[level];
    if (tierData) {
      labelEl.textContent = tierData.label;
      labelEl.classList.add('term-hoverable');
      labelEl.setAttribute('data-term-id', termKey);
    }
  });

  // ── Translate Result Card Labels ─────────────────────────────────────────────
  document.querySelectorAll('.metric-card').forEach(card => {
    const valueEl = card.querySelector('.metric-value');
    if (!valueEl) return;
    const termKey = termIdMapping[valueEl.id];
    if (!termKey) return;
    const termData = FinanceTerminologies[termKey];
    if (!termData) return;
    const tierData = termData.tiers[level];
    const labelEl  = card.querySelector('.metric-label');
    if (labelEl && tierData) {
      labelEl.textContent = tierData.label;
      labelEl.classList.add('term-hoverable');
      labelEl.setAttribute('data-term-id', termKey);
    }
  });

  // ── Hide / Show input groups ──────────────────────────────────────────────────
  document.querySelectorAll('.input-group').forEach(group => {
    const input   = group.querySelector('input, select');
    if (!input) return;
    const termKey = termIdMapping[input.id];
    group.style.display = (termKey && hiddenTermKeys.includes(termKey)) ? 'none' : '';
  });

  // ── Hide / Show metric cards ──────────────────────────────────────────────────
  // preference is king: if a term is in hiddenTermKeys it MUST be hidden,
  // if it is NOT in hiddenTermKeys it MUST be shown (respecting tax-type dropdown)
  document.querySelectorAll('.metric-card').forEach(card => {
    const valueEl = card.querySelector('.metric-value');
    if (!valueEl) return;
    const termKey = termIdMapping[valueEl.id];
    if (termKey && hiddenTermKeys.includes(termKey)) {
      // Hard-hide: overwrite any prior inline style
      card.style.setProperty('display', 'none', 'important');
    } else {
      // Show — but respect the conditional-tax visibility rule
      const isTax   = card.getAttribute('data-conditional') === 'tax';
      const taxType = document.getElementById('tax-type');
      if (isTax && taxType && taxType.value === 'none') {
        card.style.display = 'none';
      } else {
        card.style.removeProperty('display');
      }
    }
  });

  // ── Hide / Show settings-bar items ───────────────────────────────────────────
  const showInflation = getPreference('showInflation');
  const showTaxation  = getPreference('showTaxation');
  document.querySelectorAll('.settings-bar-item').forEach(item => {
    if (item.querySelector('#compounding-freq') || item.querySelector('#freq-monthly-btn')) {
      item.style.display = hiddenTermKeys.includes('compounding_frequency') ? 'none' : '';
    }
    if (item.querySelector('#inflation-rate') || item.id === 'inflation-rate-group') {
      item.style.display = showInflation ? '' : 'none';
    }
    if (item.querySelector('#tax-type')) {
      item.style.display = showTaxation ? '' : 'none';
    }
    if (item.id === 'custom-tax-group') {
      // Only show custom-tax-group if both taxation is enabled AND the dropdown is slab/custom
      const taxType = document.getElementById('tax-type');
      item.style.display = (showTaxation && taxType && (taxType.value === 'custom' || taxType.value === 'slab'))
        ? 'block' : 'none';
    }
  });

  // ── Hide settings-bar container when all its items are hidden ─────────────────
  document.querySelectorAll('.settings-bar').forEach(bar => {
    const items      = Array.from(bar.querySelectorAll('.settings-bar-item'));
    const allHidden  = items.length > 0 && items.every(item => item.style.display === 'none');
    bar.style.display = allHidden ? 'none' : '';
  });

  // ── Hide / Show dynamic inflation injections ──────────────────────────────────
  document.querySelectorAll('.dynamic-inflation-setting, .dynamic-inflation-card').forEach(el => {
    el.style.display = showInflation ? '' : 'none';
  });

  // ── Show / hide range sliders based on preference ─────────────────────────────
  const showSliders = getPreference('showSliders');
  document.querySelectorAll('.slider-wrapper').forEach(slider => {
    slider.style.display = showSliders ? '' : 'none';
  });

  // ── Translate HTML chart legend items ─────────────────────────────────────────
  translateChartLegend(level, hiddenTermKeys);

  // ── Translate and toggle table columns ────────────────────────────────────────
  translateTableHeadersAndColumns();
}

// Translate the visible HTML legend items inside #chart-legend-container
function translateChartLegend(level, hiddenTermKeys) {
  const container = document.getElementById('chart-legend-container');
  if (!container) return;

  container.querySelectorAll('.legend-item').forEach(item => {
    // Resolve term key: use stored data-term-id first, then match by text
    let termKey = item.getAttribute('data-term-id');
    if (!termKey) {
      // Collect current text content (skip child <span> elements)
      let rawText = '';
      item.childNodes.forEach(n => {
        if (n.nodeType === Node.TEXT_NODE) rawText += n.textContent;
      });
      const cleanText = rawText.trim().toLowerCase();

      // Try termIdMapping first
      termKey = termIdMapping[cleanText] || null;

      // Fallback: scan all tier labels
      if (!termKey) {
        for (const k in FinanceTerminologies) {
          const tiers = FinanceTerminologies[k].tiers;
          for (const t in tiers) {
            if (tiers[t] && tiers[t].label.toLowerCase() === cleanText) {
              termKey = k;
              break;
            }
          }
          if (termKey) break;
        }
      }

      if (termKey) item.setAttribute('data-term-id', termKey);
    }

    if (!termKey) return;

    // Hide legend item if the term is hidden at this level/preference combo
    if (hiddenTermKeys && hiddenTermKeys.includes(termKey)) {
      item.style.display = 'none';
      return;
    }
    item.style.display = '';

    // Translate label text
    const tierData = FinanceTerminologies[termKey]?.tiers[level];
    if (!tierData) return;

    // Replace only the text node(s), preserving inner <span class="legend-color">
    item.childNodes.forEach(n => {
      if (n.nodeType === Node.TEXT_NODE && n.textContent.trim()) {
        n.textContent = tierData.label;
      }
    });
  });
}

function translateTableHeadersAndColumns() {
  const table = document.getElementById('projections-table');
  if (!table) return;

  const level          = window.currentFinanceLevel || 'simple';
  const hiddenTermKeys = buildHiddenTermKeys(level);  // use unified helper

  const headers = Array.from(table.querySelectorAll('thead th'));
  const rows    = Array.from(table.querySelectorAll('tbody tr'));

  // Reset all first
  headers.forEach(th => th.style.display = '');
  rows.forEach(row => Array.from(row.children).forEach(td => td.style.display = ''));

  headers.forEach((th, index) => {
    // Resolve term key: data-term-id → termIdMapping → tier-label scan
    let termKey = th.getAttribute('data-term-id');
    if (!termKey) {
      const cleanText = th.textContent.trim().toLowerCase()
        .replace(/\s*\([\u20B9₹%]\)/g, '')
        .replace(/\s*\(years\)/gi, '')
        .replace(/\s*\(cagr\s*%\)/gi, '')
        .trim();

      termKey = termIdMapping[cleanText] || null;
      if (!termKey) {
        for (const k in FinanceTerminologies) {
          const tiers = FinanceTerminologies[k].tiers;
          if (
            (tiers.professional && tiers.professional.label.toLowerCase() === cleanText) ||
            (tiers.investor     && tiers.investor.label.toLowerCase()     === cleanText) ||
            (tiers.simple       && tiers.simple.label && tiers.simple.label.toLowerCase() === cleanText)
          ) { termKey = k; break; }
        }
      }
    }

    if (!termKey) return;

    th.setAttribute('data-term-id', termKey);  // cache for next call
    const termData = FinanceTerminologies[termKey];
    if (!termData) return;

    if (hiddenTermKeys.includes(termKey)) {
      th.style.display = 'none';
      rows.forEach(row => { const td = row.children[index]; if (td) td.style.display = 'none'; });
    } else {
      const tierData = termData.tiers[level];
      if (tierData) {
        th.textContent = tierData.label;
        th.classList.add('term-hoverable');
        th.setAttribute('data-term-id', termKey);
      }
    }
  });
}

function setupFloatingTooltips() {
  const tooltipBox = document.getElementById('finance-tooltip');
  if (!tooltipBox) return;
  
  const defEl = tooltipBox.querySelector('.tooltip-definition');
  const dividerEl = tooltipBox.querySelector('.tooltip-divider');
  const synonymsListEl = tooltipBox.querySelector('.tooltip-synonyms-list');
  
  let activeElement = null;
  
  const showTooltip = (el, e) => {
    const termId = el.getAttribute('data-term-id');
    if (!termId || !FinanceTerminologies[termId]) return;
    
    activeElement = el;
    const term = FinanceTerminologies[termId];
    const level = window.currentFinanceLevel || 'simple';
    const tierData = term.tiers[level];
    if (!tierData) return;
    
    if (defEl) defEl.textContent = tierData.definition;
    
    const synonyms = [];
    for (const lvl in term.tiers) {
      if (term.tiers[lvl] && term.tiers[lvl].label) {
        const label = term.tiers[lvl].label;
        if (!synonyms.includes(label)) {
          synonyms.push(label);
        }
      }
    }
    
    if (synonyms.length > 0) {
      if (dividerEl) dividerEl.style.display = 'block';
      if (synonymsListEl) {
        synonymsListEl.style.display = 'block';
        synonymsListEl.textContent = synonyms.join(' / ');
      }
    } else {
      if (dividerEl) dividerEl.style.display = 'none';
      if (synonymsListEl) synonymsListEl.style.display = 'none';
    }
    
    const rect = el.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    tooltipBox.style.display = 'block';
    const tooltipHeight = tooltipBox.offsetHeight;
    const tooltipWidth = tooltipBox.offsetWidth;
    
    let top = rect.top + scrollY - tooltipHeight - 12;
    let left = rect.left + scrollX + (rect.width - tooltipWidth) / 2;
    
    if (top < scrollY + 10) {
      top = rect.bottom + scrollY + 12;
      tooltipBox.classList.add('tooltip-bottom');
      tooltipBox.classList.remove('tooltip-top');
    } else {
      tooltipBox.classList.add('tooltip-top');
      tooltipBox.classList.remove('tooltip-bottom');
    }
    
    if (left < 10) left = 10;
    if (left + tooltipWidth > window.innerWidth - 10) {
      left = window.innerWidth - tooltipWidth - 10;
    }
    
    tooltipBox.style.top = top + 'px';
    tooltipBox.style.left = left + 'px';
    
    tooltipBox.style.opacity = '1';
    tooltipBox.style.pointerEvents = 'auto';
  };
  
  const hideTooltip = () => {
    activeElement = null;
    tooltipBox.style.opacity = '0';
    tooltipBox.style.pointerEvents = 'none';
  };
  
  document.body.addEventListener('mouseenter', (e) => {
    const hoverable = e.target.closest('.term-hoverable');
    if (hoverable) {
      showTooltip(hoverable, e);
    }
  }, { capture: true, passive: true });
  
  document.body.addEventListener('mouseleave', (e) => {
    const hoverable = e.target.closest('.term-hoverable');
    if (hoverable) {
      hideTooltip();
    }
  }, { capture: true, passive: true });
  
  document.body.addEventListener('touchstart', (e) => {
    const hoverable = e.target.closest('.term-hoverable');
    if (hoverable) {
      if (activeElement === hoverable) {
        hideTooltip();
      } else {
        showTooltip(hoverable, e);
      }
      e.stopPropagation();
    } else {
      hideTooltip();
    }
  }, { passive: false });
}

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

// --- Injection Functions (Layout components compiled statically via Astro) ---

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
  const showGraph = getPreference('showGraph');
  document.querySelectorAll('.chart-card').forEach(card => {
    card.style.display = showGraph ? '' : 'none';
  });

  // Table
  const showTable = getPreference('showTable');
  document.querySelectorAll('.table-card, .action-toolbar').forEach(card => {
    card.style.display = showTable ? '' : 'none';
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
              <input type="checkbox" id="pref-show-words" aria-label="Show Value in Words">
              <span class="slider-switch"></span>
            </label>
          </div>

          <div class="pref-item">
            <div class="pref-info">
              <span class="pref-title">Show Input Range Sliders</span>
              <span class="pref-desc">Display the interactive drag sliders below each number input</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="pref-show-sliders" aria-label="Show Input Range Sliders">
              <span class="slider-switch"></span>
            </label>
          </div>

          <div class="pref-item">
            <div class="pref-info">
              <span class="pref-title">Indian Number Color Coding</span>
              <span class="pref-desc">Color-code digits by place value (Lakhs, Thousands, etc.) for readability</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="pref-color-coding" aria-label="Indian Number Color Coding">
              <span class="slider-switch"></span>
            </label>
          </div>

          <div class="pref-item" style="align-items: center;">
            <div class="pref-info">
              <span class="pref-title">Result Decimal Places</span>
              <span class="pref-desc">Number of decimal places to show in summary results (0, 1, or 2)</span>
            </div>
            <select id="pref-decimal-places" aria-label="Result Decimal Places" style="width: auto; padding: 0.35rem 0.75rem; border-radius: 6px; border: 1px solid var(--border-color); background: var(--input-bg); color: var(--text-primary); font-size: 0.85rem; font-weight: 500; cursor: pointer; outline: none;">
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
              <input type="checkbox" id="pref-show-graph" aria-label="Show Visual Projection Graph">
              <span class="slider-switch"></span>
            </label>
          </div>

          <div class="pref-item">
            <div class="pref-info">
              <span class="pref-title">Show Yearly Breakdown Table</span>
              <span class="pref-desc">Display the detailed yearly cash flow and tax breakdown tables</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="pref-show-table" aria-label="Show Yearly Breakdown Table">
              <span class="slider-switch"></span>
            </label>
          </div>

          <div class="pref-item">
            <div class="pref-info">
              <span class="pref-title">Inflation Adjusted Values</span>
              <span class="pref-desc">Calculate and display inflation-adjusted real purchasing power</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="pref-show-inflation" aria-label="Inflation Adjusted Values">
              <span class="slider-switch"></span>
            </label>
          </div>

          <div class="pref-item">
            <div class="pref-info">
              <span class="pref-title">Taxation Estimations</span>
              <span class="pref-desc">Estimate LTCG, STCG, or slab rate taxes for gains</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="pref-show-taxation" aria-label="Taxation Estimations">
              <span class="slider-switch"></span>
            </label>
          </div>
        </div>
        
        <div style="margin-top: 1.5rem; text-align: center; border-top: 1px solid var(--border-color); padding-top: 1rem;">
          <button id="pref-reset-btn" class="onboarding-btn-opt" style="background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.2s; width: auto; display: inline-block;" type="button">Reset Preferences</button>
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
        translateUI(window.currentFinanceLevel || 'simple');
        triggerCalculatorRecalculate();
      });
    }
  }

  const decimalSelect = document.getElementById('pref-decimal-places');
  if (decimalSelect) {
    decimalSelect.value = getPreference('decimalPlaces');
    decimalSelect.addEventListener('change', (e) => {
      setPreference('decimalPlaces', parseInt(e.target.value) || 0);
      translateUI(window.currentFinanceLevel || 'simple');
      triggerCalculatorRecalculate();
    });
  }

  // Bind reset button
  const resetBtn = document.getElementById('pref-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      localStorage.removeItem('moneyinfuture_user_prefs');
      localStorage.removeItem('moneyinfuture_finance_level');
      localStorage.removeItem('moneyinfuture_onboarding_completed');
      window.location.reload();
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
          translateTableHeadersAndColumns();
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
  translateTableHeadersAndColumns();
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
      <input type="number" id="inflation-rate" aria-label="Inflation rate percentage" min="0" max="15" step="0.1" value="${prefRate}" style="padding:0.4rem 0.5rem;font-size:0.9rem;">
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

