import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Ticket,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Calendar,
  User,
  UserPlus,
} from 'lucide-react'
import api from '../../services/api.js'
import Navbar from '../../components/Navbar.jsx'
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/TicketBadges.jsx'
import ImageModal from '../../components/ImageModal.jsx'

const AdminDashboard = () => {
  const [tickets, setTickets] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [assigningId, setAssigningId] = useState(null)
  const [viewImage, setViewImage] = useState(null)
  const [activeTab, setActiveTab] = useState('All')

  const fetchData = async () => {
    try {
      setLoading(true)
      const [ticketsRes, employeesRes] = await Promise.all([
        api.get('/tickets'),
        api.get('/users/employees'),
      ])
      setTickets(ticketsRes.data)
      setEmployees(employeesRes.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAssign = async (ticketId, employeeId) => {
    if (!employeeId) return

    try {
      setAssigningId(ticketId)
      const { data } = await api.patch(`/tickets/${ticketId}/assign`, { employeeId })
      setTickets((prev) =>
        prev.map((ticket) => (ticket._id === ticketId ? data : ticket))
      )
      toast.success('Ticket successfully assigned!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign ticket')
    } finally {
      setAssigningId(null)
    }
  }

  const filteredTickets =
    activeTab === 'All'
      ? tickets
      : tickets.filter((t) => t.status === activeTab)

  const totalTickets = tickets.length
  const openCount = tickets.filter((t) => t.status === 'Open').length
  const runningCount = tickets.filter((t) => t.status === 'Running').length
  const completedCount = tickets.filter((t) => t.status === 'Completed').length

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Admin Helpdesk Overview
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Global ticket management, staff dispatching, and system monitoring.
            </p>
          </div>

          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium text-sm transition cursor-pointer self-start sm:self-auto shadow-xs"
          >
            <Users size={16} className="text-indigo-600" />
            <span>Manage Staff & Users</span>
          </Link>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Total Inquiries</span>
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-lg">
                <Ticket size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{totalTickets}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Unassigned / Open</span>
              <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-lg">
                <AlertCircle size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{openCount}</p>
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
              <span className="text-sm font-medium text-slate-500">Completed</span>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-lg">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{completedCount}</p>
          </div>
        </div>

        {/* Tickets Management Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Status Tabs */}
          <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 overflow-x-auto">
            <div className="flex items-center gap-2 shrink-0">
              {['All', 'Open', 'Running', 'On Hold', 'Completed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    activeTab === tab
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-500">{filteredTickets.length} tickets shown</span>
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
                <Ticket size={24} />
              </div>
              <h3 className="text-base font-medium text-slate-800 dark:text-slate-200">No tickets found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                No tickets match the selected status filter.
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
                        <span>Customer: {ticket.customer?.name} ({ticket.customer?.email})</span>
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

                    {/* Employee Assignment Dropdown */}
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-slate-500 whitespace-nowrap">
                        Assignee:
                      </label>
                      <select
                        disabled={assigningId === ticket._id}
                        value={ticket.assignedTo?._id || ''}
                        onChange={(e) => handleAssign(ticket._id, e.target.value)}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
                      >
                        <option value="">-- Unassigned --</option>
                        {employees.map((emp) => (
                          <option key={emp._id} value={emp._id}>
                            {emp.name} ({emp.email})
                          </option>
                        ))}
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

export default AdminDashboard
