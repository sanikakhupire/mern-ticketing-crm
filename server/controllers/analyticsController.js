import Ticket from '../models/Ticket.js'
import User from '../models/User.js'

// @desc   Get comprehensive analytics for admin dashboard
// @route  GET /api/analytics
// @access Private (admin)
export const getAnalytics = async (req, res, next) => {
  try {
    // 1. Status count metrics
    const statusCounts = await Ticket.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ])

    const statusMap = {
      Open: 0,
      Running: 0,
      'On Hold': 0,
      Completed: 0,
    }

    statusCounts.forEach((item) => {
      if (item._id && statusMap.hasOwnProperty(item._id)) {
        statusMap[item._id] = item.count
      }
    })

    const totalTickets = await Ticket.countDocuments()

    // 2. Breakdown by Category
    const categoryCounts = await Ticket.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ])

    const allCategories = ['Support', 'Bug', 'Feature Request', 'Billing', 'Other']
    const byCategory = allCategories.map((cat) => {
      const match = categoryCounts.find((c) => c._id === cat)
      return {
        category: cat,
        count: match ? match.count : 0,
      }
    })

    // 3. Breakdown by Priority
    const priorityCounts = await Ticket.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ])

    const byPriority = ['Low', 'Medium', 'High'].map((p) => {
      const match = priorityCounts.find((item) => item._id === p)
      return {
        priority: p,
        count: match ? match.count : 0,
      }
    })

    // 4. Monthly Trend (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    sixMonthsAgo.setDate(1)
    sixMonthsAgo.setHours(0, 0, 0, 0)

    const monthlyAggregation = await Ticket.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] },
          },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
    ])

    // Format last 6 months timeline
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlyTrend = []

    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const year = d.getFullYear()
      const month = d.getMonth() + 1
      const label = `${monthNames[d.getMonth()]} ${String(year).slice(-2)}`

      const found = monthlyAggregation.find(
        (m) => m._id.year === year && m._id.month === month
      )

      monthlyTrend.push({
        month: label,
        created: found ? found.total : 0,
        completed: found ? found.completed : 0,
      })
    }

    // 5. Staff workload distribution
    const employeeWorkloadRaw = await Ticket.aggregate([
      {
        $match: {
          assignedTo: { $ne: null },
        },
      },
      {
        $group: {
          _id: '$assignedTo',
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: [{ $in: ['$status', ['Running', 'On Hold', 'Open']] }, 1, 0],
            },
          },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'employee',
        },
      },
      { $unwind: '$employee' },
      {
        $project: {
          _id: 1,
          name: '$employee.name',
          email: '$employee.email',
          total: 1,
          active: 1,
          completed: 1,
        },
      },
      { $sort: { active: -1 } },
    ])

    const resolutionRate =
      totalTickets > 0 ? Math.round((statusMap.Completed / totalTickets) * 100) : 0

    res.status(200).json({
      summary: {
        total: totalTickets,
        open: statusMap.Open,
        running: statusMap.Running,
        onHold: statusMap['On Hold'],
        completed: statusMap.Completed,
        resolutionRate,
      },
      byStatus: [
        { name: 'Open', value: statusMap.Open, color: '#f59e0b' },
        { name: 'Running', value: statusMap.Running, color: '#3b82f6' },
        { name: 'On Hold', value: statusMap['On Hold'], color: '#a855f7' },
        { name: 'Completed', value: statusMap.Completed, color: '#10b981' },
      ],
      byCategory,
      byPriority,
      monthlyTrend,
      employeeWorkload: employeeWorkloadRaw,
    })
  } catch (error) {
    next(error)
  }
}
