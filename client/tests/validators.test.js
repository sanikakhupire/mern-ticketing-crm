import { describe, it } from 'node:test'
import assert from 'node:assert'
import { ticketSchema, newUserSchema } from '../src/utils/validators.js'

describe('Client Form Validation Schemas', () => {
  describe('ticketSchema', () => {
    it('validates a correct ticket submission', () => {
      const validData = {
        subject: 'Cannot access payment gateway',
        description: 'Receiving a timeout error when trying to submit credit card details.',
        category: 'Billing',
        priority: 'High',
      }

      const result = ticketSchema.safeParse(validData)
      assert.strictEqual(result.success, true)
    })

    it('rejects subjects with fewer than 5 characters', () => {
      const invalidData = {
        subject: 'Bug',
        description: 'This is a sufficiently long description for testing purposes.',
        category: 'Bug',
        priority: 'Low',
      }

      const result = ticketSchema.safeParse(invalidData)
      assert.strictEqual(result.success, false)
      assert.strictEqual(result.error.issues[0].message, 'Subject must be at least 5 characters')
    })

    it('rejects descriptions with fewer than 10 characters', () => {
      const invalidData = {
        subject: 'Valid Subject',
        description: 'Too short',
        category: 'Support',
        priority: 'Medium',
      }

      const result = ticketSchema.safeParse(invalidData)
      assert.strictEqual(result.success, false)
      assert.strictEqual(result.error.issues[0].message, 'Description must be at least 10 characters')
    })

    it('rejects invalid category and priority enums', () => {
      const invalidData = {
        subject: 'Valid Subject',
        description: 'Valid long description for this inquiry.',
        category: 'InvalidCategory',
        priority: 'Critical',
      }

      const result = ticketSchema.safeParse(invalidData)
      assert.strictEqual(result.success, false)
    })
  })

  describe('newUserSchema', () => {
    it('validates a correct employee user payload', () => {
      const validUser = {
        name: 'Alex Johnson',
        email: 'alex@example.com',
        password: 'securePassword123',
        role: 'employee',
      }

      const result = newUserSchema.safeParse(validUser)
      assert.strictEqual(result.success, true)
    })

    it('rejects invalid emails and short passwords', () => {
      const invalidUser = {
        name: 'A',
        email: 'not-an-email',
        password: '123',
        role: 'employee',
      }

      const result = newUserSchema.safeParse(invalidUser)
      assert.strictEqual(result.success, false)
      assert.strictEqual(result.error.issues.length >= 3, true)
    })
  })
})
