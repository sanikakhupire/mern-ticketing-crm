import { describe, it } from 'node:test'
import assert from 'node:assert'
import { analyzeTicketTriage } from '../utils/aiTriage.js'

describe('AI Ticket Triage Utility', () => {
  it('correctly classifies a Bug inquiry with high urgency', () => {
    const subject = 'Critical production crash on checkout'
    const description = 'Users are seeing a 500 internal server error and blank screen. System is down!'

    const result = analyzeTicketTriage(subject, description)

    assert.strictEqual(result.category, 'Bug')
    assert.strictEqual(result.priority, 'High')
    assert.strictEqual(result.sentiment, 'Neutral')
    assert(result.confidence > 0.7, 'Confidence should be high for clear bug keywords')
    assert(result.keySignals.length > 0, 'Should extract key signal tags')
  })

  it('correctly classifies a Billing inquiry with Frustrated sentiment', () => {
    const subject = 'Double charged for monthly subscription'
    const description = 'I was billed twice on my credit card. This is completely unacceptable and ridiculous!'

    const result = analyzeTicketTriage(subject, description)

    assert.strictEqual(result.category, 'Billing')
    assert.strictEqual(result.priority, 'Medium')
    assert.strictEqual(result.sentiment, 'Frustrated')
    assert(result.keySignals.includes('billing') || result.keySignals.includes('subscription') || result.keySignals.includes('credit card'))
  })

  it('correctly classifies a Feature Request with Low priority and Positive sentiment', () => {
    const subject = 'Suggestion for dark mode toggle'
    const description = 'It would be great to have an auto-scheduling feature. Love the app so far, thank you!'

    const result = analyzeTicketTriage(subject, description)

    assert.strictEqual(result.category, 'Feature Request')
    assert.strictEqual(result.priority, 'Low')
    assert.strictEqual(result.sentiment, 'Positive')
  })

  it('correctly falls back to Support category for generic queries', () => {
    const subject = 'Need assistance with setup'
    const description = 'Where can I find the documentation or guide on how to configure my profile settings?'

    const result = analyzeTicketTriage(subject, description)

    assert.strictEqual(result.category, 'Support')
    assert.strictEqual(result.priority, 'Low')
    assert.strictEqual(result.sentiment, 'Neutral')
  })

  it('handles empty strings gracefully with fallback defaults', () => {
    const result = analyzeTicketTriage('', '')

    assert.strictEqual(result.category, 'Support')
    assert.strictEqual(result.priority, 'Low')
    assert.strictEqual(result.sentiment, 'Neutral')
    assert.strictEqual(result.confidence, 0.6)
  })
})
