import Notification from '../models/Notification.js'

// @desc   Get current user's notifications
// @route  GET /api/notifications
// @access Private
export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name email role')
      .populate('ticket', 'subject status priority')
      .sort({ createdAt: -1 })
      .limit(30)

    res.status(200).json(notifications)
  } catch (error) {
    next(error)
  }
}

// @desc   Get current user's unread notification count
// @route  GET /api/notifications/unread-count
// @access Private
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    })

    res.status(200).json({ unreadCount: count })
  } catch (error) {
    next(error)
  }
}

// @desc   Mark a single notification as read
// @route  PATCH /api/notifications/:id/read
// @access Private
export const markNotificationAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id)

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    if (String(notification.recipient) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this notification' })
    }

    notification.read = true
    await notification.save()

    res.status(200).json(notification)
  } catch (error) {
    next(error)
  }
}

// @desc   Mark all of current user's notifications as read
// @route  PATCH /api/notifications/read-all
// @access Private
export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { $set: { read: true } }
    )

    res.status(200).json({ message: 'All notifications marked as read' })
  } catch (error) {
    next(error)
  }
}
