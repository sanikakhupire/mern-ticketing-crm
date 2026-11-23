import http from 'http'

/**
 * Lightweight, in-process request helper for testing Express apps without network sockets.
 */
export const request = (app) => ({
  get: (url, headers = {}) => executeRequest(app, 'GET', url, null, headers),
  post: (url, body = null, headers = {}) => executeRequest(app, 'POST', url, body, headers),
  patch: (url, body = null, headers = {}) => executeRequest(app, 'PATCH', url, body, headers),
  delete: (url, headers = {}) => executeRequest(app, 'DELETE', url, null, headers),
  options: (url, headers = {}) => executeRequest(app, 'OPTIONS', url, null, headers),
})

const executeRequest = (app, method, url, body = null, headers = {}) => {
  return new Promise((resolve) => {
    const req = new http.IncomingMessage()
    req.method = method
    req.url = url
    req.headers = { ...headers }

    if (body) {
      const payload = typeof body === 'string' ? body : JSON.stringify(body)
      req.headers['content-type'] = req.headers['content-type'] || 'application/json'
      req.headers['content-length'] = Buffer.byteLength(payload)
      req.push(payload)
      req.push(null)
    } else {
      req.push(null)
    }

    const res = new http.ServerResponse(req)
    let responseBody = ''
    res.write = (chunk) => {
      responseBody += chunk
      return true
    }
    res.end = (chunk) => {
      if (chunk) responseBody += chunk
      let parsedJson = null
      try {
        parsedJson = JSON.parse(responseBody)
      } catch {
        // Not JSON
      }
      resolve({
        status: res.statusCode,
        statusCode: res.statusCode,
        body: parsedJson !== null ? parsedJson : responseBody,
        headers: res.getHeaders(),
      })
    }

    app.handle(req, res)
  })
}
