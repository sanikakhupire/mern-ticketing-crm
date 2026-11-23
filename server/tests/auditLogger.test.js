import { describe, it, before } from 'node:test'
import assert from 'node:assert'
import mongoose from 'mongoose'
import { recordAuditLog } from '../utils/auditLogger.js'

describe('Audit Logger Utility', () => {
  before(() => {
    mongoose.set('bufferTimeoutMS', 50)
  })

  it('safely handles missing DB connection without throwing uncaught errors', async () => {
    const result = await recordAuditLog({
      ticketId: '000000000000000000000000',
      action: 'CREATED',
      performedByName: 'Test User',
      performedByRole: 'customer',
      note: 'Test log entry',
    })

    assert.strictEqual(result, null)
  })
})
