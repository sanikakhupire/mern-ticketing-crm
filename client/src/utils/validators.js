import { z } from 'zod'

export const ticketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['Support', 'Bug', 'Feature Request', 'Billing', 'Other']),
  priority: z.enum(['Low', 'Medium', 'High']),
})

export const newUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['employee', 'admin']),
})
