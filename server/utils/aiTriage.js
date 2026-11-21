/**
 * AI Triage Utility
 * Performs NLP keyword, sentiment, and semantic pattern analysis
 * to predict ticket category, priority level, and customer sentiment.
 */

const CATEGORY_RULES = {
  Bug: {
    weight: 1.0,
    patterns: [
      /\b(bug|bugs|glitch|error|errors|exception|crash|crashes|crashed|crashing)\b/i,
      /\b(failed|failure|broken|not working|doesn'?t work|won'?t work|blank screen)\b/i,
      /\b(500|404|502|503|403|null pointer|undefined|stack trace|timeout|freeze)\b/i,
      /\b(regression|reproduce|reproduced|unexpected behavior|infinite loop)\b/i,
    ],
  },
  Billing: {
    weight: 1.2,
    patterns: [
      /\b(billing|invoice|invoices|refund|refunds|charge|charges|charged)\b/i,
      /\b(payment|payments|credit card|debit card|stripe|paypal|receipt)\b/i,
      /\b(subscription|subscriptions|pricing|plan|upgrade|downgrade|cancel subscription)\b/i,
      /\b(overcharged|double charge|money back|renewal|transaction)\b/i,
    ],
  },
  'Feature Request': {
    weight: 0.9,
    patterns: [
      /\b(feature|features|feature request|enhancement|suggestion|suggest)\b/i,
      /\b(would love|can you add|could you add|it would be great|please consider)\b/i,
      /\b(add support for|integrate with|new option|roadmap|wishlist)\b/i,
      /\b(improve|improvement|improvements|customize|customization)\b/i,
    ],
  },
  Support: {
    weight: 0.8,
    patterns: [
      /\b(how to|how do i|how can i|help|assistance|guide|tutorial)\b/i,
      /\b(question|inquiry|setup|configuration|configure|install|onboarding)\b/i,
      /\b(where can i find|documentation|docs|clarification|explain)\b/i,
    ],
  },
}

const PRIORITY_RULES = {
  High: {
    patterns: [
      /\b(urgent|urgently|emergency|critical|blocker|blocking|showstopper)\b/i,
      /\b(production down|system down|server down|outage|major outage)\b/i,
      /\b(security|vulnerability|breach|data loss|data leaked|compromised)\b/i,
      /\b(immediately|asap|cannot login|all users affected|loss of revenue)\b/i,
      /!{2,}/, // multiple exclamation points
    ],
  },
  Medium: {
    patterns: [
      /\b(important|intermittent|slow|performance|delay|delayed)\b/i,
      /\b(wrong|incorrect|discrepancy|failing sometimes|partial)\b/i,
      /\b(needs attention|soon|problem|difficulty|annoying)\b/i,
    ],
  },
  Low: {
    patterns: [
      /\b(minor|cosmetic|typo|spelling|color|trivial|when you can)\b/i,
      /\b(no rush|low priority|just wondering|curious|general question)\b/i,
      /\b(nice to have|future release|suggestion)\b/i,
    ],
  },
}

const SENTIMENT_RULES = {
  Frustrated: [
    /\b(angry|furious|unacceptable|terrible|horrible|worst|ridiculous)\b/i,
    /\b(wasted hours|still waiting|no response|disappointed|disaster)\b/i,
    /\b(broken again|fed up|lawsuit|cancelling|useless|joke)\b/i,
  ],
  Positive: [
    /\b(thank you|thanks|great|awesome|appreciate|wonderful|kudos|love)\b/i,
    /\b(helpful|fantastic|excellent|keep up the good work)\b/i,
  ],
}

/**
 * Analyzes ticket subject and description to extract AI triage insights.
 * @param {string} subject
 * @param {string} description
 * @returns {object} { category, priority, confidence, sentiment, keySignals, summary }
 */
export const analyzeTicketTriage = (subject = '', description = '') => {
  const combinedText = `${subject} ${description}`.trim()
  const keySignals = new Set()

  // 1. Analyze Category
  let detectedCategory = 'Support'
  let maxCategoryScore = 0

  for (const [category, { weight, patterns }] of Object.entries(CATEGORY_RULES)) {
    let matches = 0
    for (const pattern of patterns) {
      const match = combinedText.match(pattern)
      if (match) {
        matches++
        keySignals.add(match[0].toLowerCase())
      }
    }
    const score = matches * weight
    if (score > maxCategoryScore) {
      maxCategoryScore = score
      detectedCategory = category
    }
  }

  // 2. Analyze Priority
  let detectedPriority = 'Low'
  let highHits = 0
  let mediumHits = 0

  for (const pattern of PRIORITY_RULES.High.patterns) {
    const match = combinedText.match(pattern)
    if (match) {
      highHits++
      keySignals.add(match[0].toLowerCase())
    }
  }

  for (const pattern of PRIORITY_RULES.Medium.patterns) {
    const match = combinedText.match(pattern)
    if (match) {
      mediumHits++
      keySignals.add(match[0].toLowerCase())
    }
  }

  if (highHits > 0) {
    detectedPriority = 'High'
  } else if (mediumHits > 0 || detectedCategory === 'Bug' || detectedCategory === 'Billing') {
    detectedPriority = 'Medium'
  } else {
    detectedPriority = 'Low'
  }

  // 3. Analyze Sentiment
  let detectedSentiment = 'Neutral'
  for (const pattern of SENTIMENT_RULES.Frustrated) {
    if (pattern.test(combinedText)) {
      detectedSentiment = 'Frustrated'
      break
    }
  }
  if (detectedSentiment === 'Neutral') {
    for (const pattern of SENTIMENT_RULES.Positive) {
      if (pattern.test(combinedText)) {
        detectedSentiment = 'Positive'
        break
      }
    }
  }

  // If customer is frustrated and it's a bug or billing, bump priority to at least Medium
  if (detectedSentiment === 'Frustrated' && detectedPriority === 'Low') {
    detectedPriority = 'Medium'
  }

  // Calculate confidence score (between 0.60 and 0.96)
  const signalCount = keySignals.size
  const confidence = Math.min(0.96, Math.max(0.6, 0.6 + signalCount * 0.08))

  // Generate summary
  let summary = `${detectedPriority} priority ${detectedCategory.toLowerCase()}`
  if (detectedSentiment === 'Frustrated') {
    summary += ' with detected customer urgency/frustration'
  }

  return {
    category: detectedCategory,
    priority: detectedPriority,
    confidence: Number(confidence.toFixed(2)),
    sentiment: detectedSentiment,
    keySignals: Array.from(keySignals).slice(0, 5),
    summary,
  }
}
