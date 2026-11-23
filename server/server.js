import http from 'http'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import app from './app.js'
import connectDB from './config/db.js'
import { initSocket } from './config/socket.js'
import { startSlaCron } from './utils/slaCron.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '.env') })

// Connect to MongoDB
connectDB()

// Start background SLA monitoring and auto-escalation cron worker
startSlaCron()

const server = http.createServer(app)

// Initialize Socket.io attached to HTTP server
initSocket(server)

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
