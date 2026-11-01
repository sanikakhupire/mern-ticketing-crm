import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import toast from 'react-hot-toast'
import {
  TrendingUp,
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  Users,
  RefreshCw,
} from 'lucide-react'
import api from '../../services/api.js'
import Navbar from '../../components/Navbar.jsx'

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const res = await api.get('/analytics')
      setData(res.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const categoryColors = {
    Support: '#6366f1',
    Bug: '#ef4444',
    'Feature Request': '#8b5cf6',
    Billing: '#10b981',
    Other: '#64748b',
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <TrendingUp className="text-indigo-600" size={26} />
              <span>Helpdesk Analytics & Reporting</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Performance metrics, status breakdown, category demand, and workload insights.
            </p>
          </div>

          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition cursor-pointer self-start sm:self-auto shadow-xs disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Metrics</span>
          </button>
        </div>

        {loading || !data ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse p-4" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse" />
              <div className="h-80 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse" />
            </div>
          </div>
        ) : (
          <>
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-semibold uppercase">Total</span>
                  <Ticket size={16} className="text-indigo-600" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
                  {data.summary.total}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-semibold uppercase">Open</span>
                  <AlertCircle size={16} className="text-amber-500" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
                  {data.summary.open}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-semibold uppercase">Running</span>
                  <Clock size={16} className="text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
                  {data.summary.running}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-semibold uppercase">On Hold</span>
                  <PauseCircle size={16} className="text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
                  {data.summary.onHold}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-semibold uppercase">Completed</span>
                  <CheckCircle2 size={16} className="text-emerald-500" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
                  {data.summary.completed}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-semibold uppercase">Resolution</span>
                  <TrendingUp size={16} className="text-emerald-600" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
                  {data.summary.resolutionRate}%
                </p>
              </div>
            </div>

            {/* Charts Row 1: Status Distribution & Category Demand */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Status Pie Chart */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  Ticket Status Distribution
                </h3>
                <p className="text-xs text-slate-500 mb-6">Proportion of tickets by current workflow stage</p>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.byStatus}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                      >
                        {data.byStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Bar Chart */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  Tickets by Category
                </h3>
                <p className="text-xs text-slate-500 mb-6">Distribution across inquiry classifications</p>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.byCategory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Charts Row 2: 6-Month Volume Trend & Staff Workload */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Trend Area Chart */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  6-Month Ticket Volume Trend
                </h3>
                <p className="text-xs text-slate-500 mb-6">Inbound creation volume vs resolved tickets</p>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="created"
                        name="Created"
                        stroke="#6366f1"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCreated)"
                      />
                      <Area
                        type="monotone"
                        dataKey="completed"
                        name="Resolved"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCompleted)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Staff Workload Table */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Employee Workload Distribution
                  </h3>
                  <Users size={18} className="text-slate-400" />
                </div>
                <p className="text-xs text-slate-500 mb-4">Current active vs resolved tickets per agent</p>

                <div className="flex-1 overflow-y-auto max-h-72">
                  {data.employeeWorkload.length === 0 ? (
                    <div className="h-full flex items-center justify-center p-8 text-center text-slate-400 text-xs">
                      No tickets assigned to staff members yet
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {data.employeeWorkload.map((emp) => (
                        <div key={emp._id} className="py-3 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold text-slate-900 dark:text-white">
                              {emp.name}
                            </p>
                            <p className="text-[11px] text-slate-500">{emp.email}</p>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-semibold text-[11px]">
                              {emp.active} Active
                            </span>
                            <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold text-[11px]">
                              {emp.completed} Resolved
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default AnalyticsDashboard
