import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  Ticket,
  Clock,
  CheckCircle2,
  PauseCircle,
  AlertCircle,
  Image as ImageIcon,
  Calendar,
  User,
  ChevronDown,
} from 'lucide-react'
import api from '../../services/api.js'
import Navbar from '../../components/Navbar.jsx'
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/TicketBadges.jsx'
import ImageModal from '../../components/ImageModal.jsx'

const EmployeeDashboard = () => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [viewImage, setViewImage] = useState(null)
  const [activeTab, setActiveTab] = useState('All')

  const fetchAssignedTickets = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/tickets/assigned')
      setTickets(data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load assigned tickets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssignedTickets()
  }, [])

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      setUpdatingId(ticketId)
      const { data } = await api.patch(`/tickets/${ticketId}/status`, { status: newStatus })
      setTickets((prev) =>
        prev.map((ticket) => (ticket._id === ticketId ? data : ticket))
      )
      toast.success(`Ticket status updated to ${newStatus}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update ticket status')
    } finally {
      setUpdatingId(null)
    }
  }

  // Filter tabs
  const filteredTickets =
    activeTab === 'All'
      ? tickets
      : tickets.filter((t) => t.status === activeTab)

  const totalAssigned = tickets.length
  const runningCount = tickets.filter((t) => t.status === 'Running').length
  const onHoldCount = tickets.filter((t) => t.status === 'On Hold').length
  const completedCount = tickets.filter((t) => t.status === 'Completed').length

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Employee Workspace
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your assigned support queue and update resolution statuses.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Total Assigned</span>
              <div className="p-2 bg-sky-50 dark:bg-sky-950/40 text-sky-600 rounded-lg">
                <Ticket size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{totalAssigned}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">In Progress</span>
              <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-lg">
                <Clock size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{runningCount}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">On Hold</span>
              <div className="p-2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 rounded-lg">
                <PauseCircle size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{onHoldCount}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Completed</span>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-lg">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{completedCount}</p>
          </div>
        </div>

        {/* Tabs & Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Status Tabs */}
          <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
            {['All', 'Open', 'Running', 'On Hold', 'Completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer shrink-0 ${
                  activeTab === tab
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex flex-col gap-3 p-4 border border-slate-100 rounded-lg">
                  <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-base font-medium text-slate-800 dark:text-slate-200">No tickets found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                No tickets currently match the selected status filter.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="p-5 sm:p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={ticket.status} />
                      <PriorityBadge priority={ticket.priority} />
                      <CategoryBadge category={ticket.category} />
                    </div>

                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                      {ticket.subject}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {ticket.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <User size={14} />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          Customer: {ticket.customer?.name} ({ticket.customer?.email})
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
                    {ticket.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setViewImage(ticket.imageUrl)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition cursor-pointer"
                      >
                        <ImageIcon size={15} className="text-indigo-600" />
                        <span>Attachment</span>
                      </button>
                    )}

                    {/* Status Changer Dropdown */}
                    <div className="relative">
                      <select
                        disabled={updatingId === ticket._id}
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
                      >
                        <option value="Open">Status: Open</option>
                        <option value="Running">Status: Running</option>
                        <option value="On Hold">Status: On Hold</option>
                        <option value="Completed">Status: Completed</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <ImageModal imageUrl={viewImage} onClose={() => setViewImage(null)} />
    </div>
  )
}

export default EmployeeDashboard
