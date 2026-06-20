// src/data/formulas.js

export const formulas = {
  'sip.html': {
    desc: 'The Systematic Investment Plan (SIP) calculator uses the monthly equivalent interest rate of the expected annual return to model growth.',
    code: 'i = (1 + Return Rate / 100) ^ (1 / 12) - 1\nFuture Value = Monthly SIP * [((1 + i) ^ Months - 1) / i] * (1 + i)',
    assumptions: [
      'Monthly deposits are made at the beginning of each monthly interval (annuity-due).',
      'Compounding is calculated monthly using the CAGR-equivalent rate.',
      'The expected return rate is steady and constant throughout the period.',
      'Taxation and inflation are calculated steadily on the final accumulated corpus.',
      'Tax rules are estimated based on regulations last reviewed in June 2026.'
    ]
  },
  'step-up-sip.html': {
    desc: 'Step-Up SIP simulates the growth of an investment where the monthly deposit increases by a fixed percentage annually.',
    code: 'Investment (Year y) = Monthly SIP * (1 + Step-up % / 100) ^ (y - 1)\nFuture Value = Compounded monthly using the annual step-up increment.',
    assumptions: [
      'The step-up increment is applied exactly once at the beginning of each new year.',
      'Compounding is calculated monthly using the equivalent CAGR rate.',
      'Rate of return remains constant over the duration.',
      'All contributions are made at the beginning of each month.',
      'Tax rules are estimated based on regulations last reviewed in June 2026.'
    ]
  },
  'reverse-sip.html': {
    desc: 'Calculates the monthly Systematic Investment Plan (SIP) required to accumulate a target corpus.',
    code: 'i = (1 + Return Rate / 100) ^ (1 / 12) - 1\nMonthly SIP Required = Target Corpus / ([((1 + i) ^ Months - 1) / i] * (1 + i))',
    assumptions: [
      'Contributions are made at the start of each month.',
      'Expected annual return rate is constant.',
      'Target corpus is in nominal terms.'
    ]
  },
  'lump-sum.html': {
    desc: 'Calculates the compound growth of a one-time initial lump sum investment.',
    code: 'Future Value = Principal * (1 + Return Rate / 100) ^ Years',
    assumptions: [
      'No additional deposits or withdrawals are made during the term.',
      'Compounding occurs annually at a constant growth rate.',
      'Inflation and taxation (if enabled) are applied steadily to the final value.',
      'Tax rules are estimated based on regulations last reviewed in June 2026.'
    ]
  },
  'reverse-lump-sum.html': {
    desc: 'Calculates the initial present value investment needed to grow to a target future corpus.',
    code: 'Required Principal = Target Corpus / (1 + Return Rate / 100) ^ Years',
    assumptions: [
      'Growth is compounded annually at a constant rate.',
      'No interim transactions or withdrawals occur.'
    ]
  },
  'swp.html': {
    desc: 'A Systematic Withdrawal Plan (SWP) allows you to withdraw a fixed amount regularly from an accumulated corpus.',
    code: 'i = (1 + Return Rate / 100) ^ (1 / 12) - 1\nBalance after withdrawal = (Current Balance - Monthly Withdrawal) * (1 + i)',
    assumptions: [
      'Withdrawals are executed at the beginning of each month (annuity-due).',
      'Interest is applied to the remaining balance after the monthly withdrawal.',
      'The return rate is steady and withdrawals remain level.'
    ]
  },
  'reverse-swp.html': {
    desc: 'Finds the initial corpus required to support a specific monthly SWP withdrawal schedule.',
    code: 'i = (1 + Return Rate / 100) ^ (1 / 12) - 1\nRequired Corpus = Monthly Withdrawal * [ (1 - (1 + i) ^ -Months) / i ] * (1 + i)',
    assumptions: [
      'Level monthly withdrawals are made at the start of each month.',
      'Conservative withdrawal-before-interest sequence is maintained.',
      'Return rate is constant over the withdrawal duration.'
    ]
  },
  'step-up-swp.html': {
    desc: 'Simulates an SWP where the withdrawal amount increases annually by a step-up rate to combat inflation.',
    code: 'Withdrawal (Year y) = Initial Withdrawal * (1 + Step-up % / 100) ^ (y - 1)\nRemaining corpus simulated using monthly loops with annual withdrawal increases.',
    assumptions: [
      'The withdrawal amount increases once at the start of each new year.',
      'Withdrawals are executed at the beginning of each month.',
      'Pre-defined return rate is constant.'
    ]
  },
  'retirement.html': {
    desc: 'Estimates the retirement corpus required to sustain lifestyle expenses and the SIP needed to reach that goal.',
    code: 'Inflated Monthly Expense = Current Expense * (1 + Inflation / 100) ^ Years to Retire\nRetirement Corpus Required = Inflated Annual Expense * ((1 - (1 + r)^-n) / r) * (1 + r)\n(where r is the post-retirement real rate of return)',
    assumptions: [
      'Post-retirement expenses increase annually with inflation.',
      'Annual returns before and after retirement are constant.',
      'Life expectancy is accurate, and the retirement corpus is fully depleted at that age.'
    ]
  },
  'fire.html': {
    desc: 'Calculates the target corpus and years to reach Financial Independence / Retire Early (FIRE).',
    code: 'FIRE Corpus = Annual Expenses * (100 / Safe Withdrawal Rate)',
    assumptions: [
      'Uses the Safe Withdrawal Rate (SWR, e.g. 4%) to size the portfolio.',
      'Annual expenses are adjusted for inflation.',
      'No other post-retirement active income is assumed.'
    ]
  },
  'goal.html': {
    desc: 'Goal planner calculates the SIP or Lump sum required to meet a specific future financial target.',
    code: 'Required SIP = Future Value / (SIP Compounding Factor)\nRequired Lump Sum = Future Value / (1 + Return Rate / 100) ^ Years',
    assumptions: [
      'Returns compound monthly for SIP and annually for Lump Sum.',
      'Consistent monthly savings are maintained.',
      'Target goal is in nominal terms.'
    ]
  },
  'education-planner.html': {
    desc: 'Estimates future college costs adjusted for inflation and calculates the monthly savings required.',
    code: 'Future Cost = Current Cost * (1 + Inflation / 100) ^ Years\nRequired SIP = Future Cost / (SIP Compounding Factor)',
    assumptions: [
      'Education costs inflate at a specific rate (typically higher than CPI).',
      'Growth rates compound monthly.',
      'Level monthly contributions are made.'
    ]
  },
  'marriage-planner.html': {
    desc: 'Estimates future wedding expenses adjusted for inflation and computes the SIP required to meet the goal.',
    code: 'Future Cost = Current Cost * (1 + Inflation / 100) ^ Years\nRequired SIP = Future Cost / (SIP Compounding Factor)',
    assumptions: [
      'Inflation is constant over the period.',
      'Level monthly savings are maintained at the start of each month.'
    ]
  },
  'house-down-payment.html': {
    desc: 'Estimates the required down payment for a future home purchase and calculates the monthly savings rate.',
    code: 'Future House Cost = Current Cost * (1 + Property Inflation / 100) ^ Years\nTarget Down Payment = Future House Cost * (Down Payment % / 100)\nRequired SIP = Target Down Payment / (SIP Compounding Factor)',
    assumptions: [
      'Property values rise steadily with property-specific inflation.',
      'Down payment percentage remains constant.',
      'Level monthly savings are made.'
    ]
  },
  'child-corpus.html': {
    desc: 'Models the growth of a child\'s future support fund (for education, marriage, or starting a business) and required contributions.',
    code: 'Future Goal = Current Cost * (1 + Inflation / 100) ^ Years\nRequired SIP = Future Goal / (SIP Compounding Factor)',
    assumptions: [
      'Long-term compounding growth compounds monthly.',
      'Level monthly contributions are maintained.'
    ]
  },
  'net-worth-projection.html': {
    desc: 'Projects the expansion of your net worth based on current assets, savings rate, asset growth, and liability reduction.',
    code: 'Net Worth = Total Projected Assets - Total Projected Liabilities',
    assumptions: [
      'Asset growth rates are constant.',
      'Standard liability repayment schedules are maintained.',
      'No unexpected large asset sales or liability additions occur.'
    ]
  },
  'asset-allocation.html': {
    desc: 'Suggests a portfolio rebalancing strategy to align your assets with a target allocation.',
    code: 'Target Value = Total Portfolio Value * Target % / 100\nRebalance Amount = Current Value - Target Value',
    assumptions: [
      'Transaction costs, exit loads, and capital gains taxes are excluded.',
      'Execution of rebalancing trades is immediate.'
    ]
  },
  'cagr.html': {
    desc: 'Calculates the Compound Annual Growth Rate (CAGR) between an initial and final value.',
    code: 'CAGR = (Final Value / Initial Value) ^ (1 / Years) - 1',
    assumptions: [
      'Annual compounding is assumed.',
      'No cash flows occur between the initial and final dates.'
    ]
  },
  'xirr.html': {
    desc: 'Computes the Internal Rate of Return (IRR) for irregular cash flows using numerical methods.',
    code: 'Solves for r where: Sum [ Cash Flow_t / (1 + r) ^ ((d_t - d_0) / 365) ] = 0',
    assumptions: [
      'Uses actual/365 day count convention.',
      'Cash flows occur exactly on the specified dates.',
      'Newton-Raphson with bisection fallback is used to find the root.'
    ]
  },
  'inflation.html': {
    desc: 'Calculates how inflation erodes purchasing power or increases the nominal cost of items over time.',
    code: 'Future Cost = Current Price * (1 + Inflation / 100) ^ Years\nPurchasing Power = Current Money / (1 + Inflation / 100) ^ Years',
    assumptions: [
      'Inflation rate remains flat across all years.',
      'No interest or growth is earned on the money.'
    ]
  },
  'real-return.html': {
    desc: 'Computes the actual return of an investment after stripping out the impact of inflation and taxes.',
    code: 'Post-Tax Return = Nominal Return * (1 - Tax Rate / 100)\nReal Return = (1 + Post-Tax Return / 100) / (1 + Inflation / 100) - 1',
    assumptions: [
      'Fisher equation is used for real return.',
      'Tax rate is applied flatly to the nominal rate.'
    ]
  },
  'emi.html': {
    desc: 'Equated Monthly Installment (EMI) for reducing-balance loans.',
    code: 'Monthly Rate (r) = Annual Rate / 12 / 100\nEMI = [P * r * (1 + r) ^ Months] / [(1 + r) ^ Months - 1]',
    assumptions: [
      'Interest rate remains fixed during the loan tenure.',
      'Payments are made at the end of each month.',
      'No prepayments or penalty fees are included.'
    ]
  },
  'loan-prepayment.html': {
    desc: 'Simulates how extra payments accelerate loan payoff and save interest.',
    code: 'Interest (Month m) = Outstanding Principal * (Annual Rate / 12 / 100)\nPrincipal Paid = EMI + Prepayment - Interest',
    assumptions: [
      'Prepayments are applied immediately to reduce the outstanding principal.',
      'No prepayment penalties or service fees.'
    ]
  },
  'emergency-fund.html': {
    desc: 'Sizer for a liquid contingency fund to cover unexpected expenses.',
    code: 'Target Emergency Fund = Monthly Expenses * Coverage Months',
    assumptions: [
      'Funds are held in highly liquid, low-risk accounts (savings, liquid funds).',
      'Monthly expenses include all mandatory living costs.'
    ]
  },
  'financial-independence.html': {
    desc: 'Timeline calculator showing years remaining to reach financial independence.',
    code: 'Target Corpus = Annual Expenses * (100 / SWR)\nProjects when net worth compounds to reach this target.',
    assumptions: [
      'Annual savings and expenses increase with inflation.',
      'Safe Withdrawal Rate (SWR) is constant.'
    ]
  }
};
