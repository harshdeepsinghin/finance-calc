// src/data/popularCombinations.js

// Permutations used to programmatically generate sitemap URLs
const sipAmounts = [300, 500, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 7500, 10000, 15000, 20000, 25000, 50000];
const sipYears = [3, 5, 7, 10, 12, 15, 20, 25, 30];
const sipRates = [10, 12, 14, 15, 18, 20];

const lumpAmounts = [10000, 25000, 50000, 100000, 200000, 500000, 1000000, 2000000, 5000000];
const lumpYears = [3, 5, 10, 15, 20, 25, 30];
const lumpRates = [10, 12, 14, 15, 18];

const stepUpStarting = [1000, 2000, 5000, 10000, 20000];
const stepUpPcts = [5, 10];
const stepUpYears = [5, 10, 15, 20, 25, 30];
const stepUpRates = [12, 15];

const swpCorpus = [1000000, 2500000, 5000000, 10000000];
const swpWithdrawals = [5000, 10000, 25000, 50000, 75000];
const swpYears = [10, 15, 20, 25, 30];
const swpRates = [7, 8, 9, 10];

/**
 * Generate full sitemap URLs (absolute paths with query parameters)
 */
export function generateSitemapUrls(siteUrl) {
  const urls = [];

  // 1. SIP Calculator Combinations
  for (const amt of sipAmounts) {
    for (const yr of sipYears) {
      for (const rt of sipRates) {
        urls.push(`${siteUrl}/calculators/sip?monthly=${amt}&years=${yr}&rate=${rt}`);
      }
    }
  }

  // 2. Lump Sum Calculator Combinations
  for (const amt of lumpAmounts) {
    for (const yr of lumpYears) {
      for (const rt of lumpRates) {
        urls.push(`${siteUrl}/calculators/lump-sum?principal=${amt}&years=${yr}&rate=${rt}`);
      }
    }
  }

  // 3. Step-Up SIP Combinations
  for (const start of stepUpStarting) {
    for (const pct of stepUpPcts) {
      for (const yr of stepUpYears) {
        for (const rt of stepUpRates) {
          urls.push(`${siteUrl}/calculators/step-up-sip?starting_sip=${start}&step_up_pct=${pct}&years=${yr}&rate=${rt}`);
        }
      }
    }
  }

  // 4. SWP Combinations
  for (const corp of swpCorpus) {
    for (const wtd of swpWithdrawals) {
      for (const yr of swpYears) {
        for (const rt of swpRates) {
          // Only generate valid combos (where annual withdrawal is less than corpus)
          if (wtd * 12 < corp) {
            urls.push(`${siteUrl}/calculators/swp?initial_corpus=${corp}&monthly_withdrawal=${wtd}&years=${yr}&rate=${rt}`);
          }
        }
      }
    }
  }

  return urls;
}

/**
 * Helper to format Indian currency numbers into human readable words (e.g. 1 Lakh, 10 Lakhs, 1 Crore)
 */
function formatAmountText(num) {
  if (num >= 10000000) {
    const cr = num / 10000000;
    return `${cr} Crore${cr > 1 ? 's' : ''}`;
  }
  if (num >= 100000) {
    const lk = num / 100000;
    return `${lk} Lakh${lk > 1 ? 's' : ''}`;
  }
  return '₹' + num.toLocaleString('en-IN');
}

/**
 * Get a curated, high-quality subset of common queries to show on the HTML index page (prevents spammy layout)
 */
export function getCuratedIndexScenarios() {
  return {
    sip: [
      { url: '/calculators/sip?monthly=300&years=3&rate=14', text: 'If I invest ₹300 per month for 3 years at 14% returns' },
      { url: '/calculators/sip?monthly=500&years=5&rate=12', text: 'If I invest ₹500 per month for 5 years at 12% returns' },
      { url: '/calculators/sip?monthly=1000&years=5&rate=12', text: 'If I invest ₹1,000 per month for 5 years at 12% returns' },
      { url: '/calculators/sip?monthly=1000&years=10&rate=15', text: 'If I invest ₹1,000 per month for 10 years at 15% returns' },
      { url: '/calculators/sip?monthly=2000&years=10&rate=12', text: 'If I invest ₹2,000 per month for 10 years at 12% returns' },
      { url: '/calculators/sip?monthly=5000&years=15&rate=12', text: 'If I invest ₹5,000 per month for 15 years at 12% returns' },
      { url: '/calculators/sip?monthly=5000&years=20&rate=15', text: 'If I invest ₹5,000 per month for 20 years at 15% returns' },
      { url: '/calculators/sip?monthly=10000&years=15&rate=12', text: 'If I invest ₹10,000 per month for 15 years at 12% returns' },
      { url: '/calculators/sip?monthly=10000&years=25&rate=15', text: 'If I invest ₹10,000 per month for 25 years at 15% returns' },
      { url: '/calculators/sip?monthly=20000&years=20&rate=12', text: 'If I invest ₹20,000 per month for 20 years at 12% returns' },
      { url: '/calculators/sip?monthly=25000&years=25&rate=14', text: 'If I invest ₹25,000 per month for 25 years at 14% returns' },
      { url: '/calculators/sip?monthly=50000&years=20&rate=12', text: 'If I invest ₹50,000 per month for 20 years at 12% returns' }
    ],
    lumpSum: [
      { url: '/calculators/lump-sum?principal=10000&years=5&rate=12', text: 'If I invest ₹10,000 lump sum for 5 years at 12% returns' },
      { url: '/calculators/lump-sum?principal=50000&years=10&rate=12', text: 'If I invest ₹50,000 lump sum for 10 years at 12% returns' },
      { url: '/calculators/lump-sum?principal=100000&years=10&rate=12', text: 'If I invest ₹1 Lakh lump sum for 10 years at 12% returns' },
      { url: '/calculators/lump-sum?principal=100000&years=15&rate=15', text: 'If I invest ₹1 Lakh lump sum for 15 years at 15% returns' },
      { url: '/calculators/lump-sum?principal=500000&years=10&rate=12', text: 'If I invest ₹5 Lakhs lump sum for 10 years at 12% returns' },
      { url: '/calculators/lump-sum?principal=500000&years=15&rate=15', text: 'If I invest ₹5 Lakhs lump sum for 15 years at 15% returns' },
      { url: '/calculators/lump-sum?principal=1000000&years=15&rate=15', text: 'If I invest ₹10 Lakhs lump sum for 15 years at 15% returns' },
      { url: '/calculators/lump-sum?principal=1000000&years=20&rate=12', text: 'If I invest ₹10 Lakhs lump sum for 20 years at 12% returns' },
      { url: '/calculators/lump-sum?principal=5000000&years=15&rate=15', text: 'If I invest ₹50 Lakhs lump sum for 15 years at 15% returns' }
    ],
    stepUp: [
      { url: '/calculators/step-up-sip?starting_sip=5000&step_up_pct=10&years=10&rate=12', text: 'Start ₹5,000 SIP with 10% annual increase for 10 years at 12%' },
      { url: '/calculators/step-up-sip?starting_sip=10000&step_up_pct=10&years=15&rate=12', text: 'Start ₹10,000 SIP with 10% annual increase for 15 years at 12%' },
      { url: '/calculators/step-up-sip?starting_sip=10000&step_up_pct=5&years=20&rate=12', text: 'Start ₹10,000 SIP with 5% annual increase for 20 years at 12%' },
      { url: '/calculators/step-up-sip?starting_sip=20000&step_up_pct=10&years=15&rate=15', text: 'Start ₹20,000 SIP with 10% annual increase for 15 years at 15%' }
    ],
    swp: [
      { url: '/calculators/swp?initial_corpus=2500000&monthly_withdrawal=15000&years=15&rate=8', text: 'Withdraw ₹15,000/mo from ₹25 Lakhs corpus over 15 years' },
      { url: '/calculators/swp?initial_corpus=5000000&monthly_withdrawal=30000&years=20&rate=8', text: 'Withdraw ₹30,000/mo from ₹50 Lakhs corpus over 20 years' },
      { url: '/calculators/swp?initial_corpus=10000000&monthly_withdrawal=50000&years=25&rate=9', text: 'Withdraw ₹50,000/mo from ₹1 Crore corpus over 25 years' }
    ]
  };
}
