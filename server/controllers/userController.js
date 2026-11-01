import User from '../models/User.js'

// @desc   Get all employees (for ticket assignment dropdown)
// @route  GET /api/users/employees
// @access Private (admin)
export const getEmployees = async (req, res, next) => {
  try {
    const employees = await User.find({ role: 'employee' })
      .select('-password -refreshToken')
      .sort({ name: 1 })

    res.status(200).json(employees)
  } catch (error) {
    next(error)
  }
}

// @desc   Admin creates employee or admin account
// @route  POST /api/users
// @access Private (admin)
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required' })
    }

    const allowedRoles = ['employee', 'admin']
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Role must be either employee or admin' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' })
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
    })

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    })
  } catch (error) {
    next(error)
  }
}

// @desc   Get all users (with optional role filter)
// @route  GET /api/users
// @access Private (admin)
export const getAllUsers = async (req, res, next) => {
  try {
    const filter = {}
    if (req.query.role) {
      filter.role = req.query.role
    }

    const users = await User.find(filter)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })

    res.status(200).json(users)
  } catch (error) {
    next(error)
  }
}

// @desc   Delete a user
// @route  DELETE /api/users/:id
// @access Private (admin)
export const deleteUser = async (req, res, next) => {
  try {
    if (String(req.user._id) === String(req.params.id)) {
      return res.status(400).json({ message: 'Admin cannot delete their own account' })
    }

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    await User.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: 'User deleted successfully' })
  } catch (error) {
    next(error)
  }
}
