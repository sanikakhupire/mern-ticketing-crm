import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import connectDB from './config/db.js'
import User from './models/User.js'
import Ticket from './models/Ticket.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '.env') })

const seedDatabase = async () => {
  try {
    await connectDB()
    console.log('🌱 Connected to MongoDB, seeding initial demo accounts...')

    // 1. Create or update Demo Admin
    let admin = await User.findOne({ email: 'admin@example.com' })
    if (!admin) {
      admin = await User.create({
        name: 'Sarah Admin',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
      })
      console.log('✅ Created Demo Admin: admin@example.com')
    } else {
      console.log('ℹ️  Demo Admin already exists: admin@example.com')
    }

    // 2. Create or update Demo Employee (Support Agent)
    let agent = await User.findOne({ email: 'agent@example.com' })
    if (!agent) {
      agent = await User.create({
        name: 'David Support',
        email: 'agent@example.com',
        password: 'password123',
        role: 'employee',
      })
      console.log('✅ Created Demo Agent: agent@example.com')
    } else {
      console.log('ℹ️  Demo Agent already exists: agent@example.com')
    }

    // 3. Create or update Demo Customer
    let customer = await User.findOne({ email: 'customer@example.com' })
    if (!customer) {
      customer = await User.create({
        name: 'Emma Customer',
        email: 'customer@example.com',
        password: 'password123',
        role: 'customer',
      })
      console.log('✅ Created Demo Customer: customer@example.com')
    } else {
      console.log('ℹ️  Demo Customer already exists: customer@example.com')
    }

    // 4. Seed sample tickets if empty
    const ticketCount = await Ticket.countDocuments()
    if (ticketCount === 0) {
      await Ticket.create([
        {
          subject: 'Cannot access payment invoices in dashboard',
          description: 'When clicking on billing statements, receiving a 500 internal server error. Please assist urgently.',
          category: 'Billing',
          priority: 'High',
          status: 'Open',
          customer: customer._id,
          assignedTo: agent._id,
        },
        {
          subject: 'Feature suggestion: Automatic export to CSV',
          description: 'Would love an option to export weekly ticket analytics directly to spreadsheet format.',
          category: 'Feature Request',
          priority: 'Low',
          status: 'Completed',
          customer: customer._id,
          assignedTo: agent._id,
        },
        {
          subject: 'Broken button on notification settings',
          description: 'The toggle button for email alerts does not stay checked after reloading the page.',
          category: 'Bug',
          priority: 'Medium',
          status: 'Running',
          customer: customer._id,
          assignedTo: agent._id,
        },
      ])
      console.log('✅ Created 3 sample tickets for demonstration.')
    }

    console.log('\n🎉 Database seeding completed successfully!')
    console.log('--------------------------------------------------')
    console.log('Admin:    admin@example.com    / password123')
    console.log('Employee: agent@example.com    / password123')
    console.log('Customer: customer@example.com / password123')
    console.log('--------------------------------------------------\n')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

seedDatabase()
