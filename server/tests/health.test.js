import { describe, it } from 'node:test'
import assert from 'node:assert'
import app from '../app.js'
import { request } from './testHelper.js'

describe('Server Health and Core Middleware Integration', () => {
  const req = request(app)

  it('GET /api/health returns 200 with ok status', async () => {
    const res = await req.get('/api/health')
    assert.strictEqual(res.status, 200)
    assert.strictEqual(res.body.status, 'ok')
    assert.strictEqual(res.body.message, 'Server is running')
  })

  it('GET /api/unknown-route returns 404 Not Found from error middleware', async () => {
    const res = await req.get('/api/unknown-route')
    assert.strictEqual(res.status, 404)
    assert(typeof res.body === 'object')
    assert(res.body.message.includes('Not Found - /api/unknown-route'))
  })

  it('OPTIONS /api/health returns CORS preflight headers', async () => {
    const res = await req.options('/api/health', {
      origin: 'http://localhost:5173',
      'access-control-request-method': 'GET',
    })

    assert.strictEqual(res.status, 204)
    assert.strictEqual(res.headers['access-control-allow-origin'], 'http://localhost:5173')
  })
})
