import { useEffect, useState } from 'react'
import {
  X,
  History,
  FilePlus,
  ArrowRightCircle,
  UserCheck,
  AlertTriangle,
  Flame,
  Clock,
  ArrowRight,
  ShieldAlert,
  Loader2,
  MessageSquare,
} from 'lucide-react'
import api from '../services/api'

const getActionDetails = (action) => {
  switch (action) {
    case 'CREATED':
      return {
        label: 'Ticket Created',
        icon: FilePlus,
        bgColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
        borderColor: 'border-emerald-200 dark:border-emerald-800',
      }
    case 'STATUS_UPDATED':
      return {
        label: 'Status Updated',
        icon: ArrowRightCircle,
        bgColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400',
        borderColor: 'border-blue-200 dark:border-blue-800',
      }
    case 'ASSIGNED':
      return {
        label: 'Staff Assigned',
        icon: UserCheck,
        bgColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400',
        borderColor: 'border-purple-200 dark:border-purple-800',
      }
    case 'ESCALATED':
      return {
        label: 'SLA Auto-Escalation',
        icon: Flame,
        bgColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400',
        borderColor: 'border-rose-200 dark:border-rose-800',
      }
    case 'PRIORITY_UPDATED':
      return {
        label: 'Priority Changed',
        icon: AlertTriangle,
        bgColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
        borderColor: 'border-amber-200 dark:border-amber-800',
      }
    case 'COMMENT_ADDED':
      return {
        label: 'Message Sent',
        icon: MessageSquare,
        bgColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400',
        borderColor: 'border-indigo-200 dark:border-indigo-800',
      }
    default:
      return {
        label: 'Ticket Updated',
        icon: Clock,
        bgColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        borderColor: 'border-slate-200 dark:border-slate-700',
      }
  }
}

const formatRoleBadge = (role) => {
  switch (role) {
    case 'admin':
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800'
    case 'employee':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
    case 'customer':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
    case 'system':
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
  }
}

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return ''
  const diffMs = Date.now() - new Date(timestamp).getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  if (diffSecs < 60) return 'Just now'
  const diffMins = Math.floor(diffSecs / 60)
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return `${diffDays}d ago`
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function TicketAuditHistoryModal({ ticket, onClose }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!ticket?._id) return

    let isMounted = true
    const fetchLogs = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await api.get(`/tickets/${ticket._id}/audit-logs`)
        if (isMounted) {
          setLogs(data)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to load ticket audit history.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchLogs()
    return () => {
      isMounted = false
    }
  }, [ticket?._id])

  if (!ticket) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <History size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Audit History</span>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  #{ticket._id.slice(-6)}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 max-w-md">
                {ticket.subject}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close audit log modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-5 pr-1 space-y-4">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Loader2 size={24} className="animate-spin text-indigo-600" />
              <p className="text-xs">Loading ticket audit events...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Clock size={28} className="mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                No audit entries recorded yet
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Ticket activities and status changes will be recorded here automatically.
              </p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.75 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {logs.map((log) => {
                const actionMeta = getActionDetails(log.action)
                const IconComponent = actionMeta.icon
                const actorName = log.performedBy?.name || log.performedByName || 'System'
                const actorRole = log.performedBy?.role || log.performedByRole || 'system'

                return (
                  <div key={log._id} className="relative group">
                    {/* Event Node Icon */}
                    <div
                      className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border shadow-xs ${actionMeta.bgColor} ${actionMeta.borderColor}`}
                    >
                      <IconComponent size={12} />
                    </div>

                    {/* Event Card */}
                    <div className="bg-slate-50/70 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-900 dark:text-white">
                            {actionMeta.label}
                          </span>
                          <span
                            className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${formatRoleBadge(
                              actorRole
                            )}`}
                          >
                            {actorRole}
                          </span>
                        </div>

                        <span
                          title={new Date(log.createdAt).toLocaleString()}
                          className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium cursor-help"
                        >
                          {formatRelativeTime(log.createdAt)}
                        </span>
                      </div>

                      {/* Performed by & Note */}
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        <span className="text-slate-400 dark:text-slate-500">Performed by: </span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{actorName}</span>
                        {log.note && log.note !== actionMeta.label && (
                          <span className="text-slate-500 dark:text-slate-400 italic ml-1">
                            — {log.note}
                          </span>
                        )}
                      </p>

                      {/* Changes Diffs */}
                      {log.changes && log.changes.length > 0 && (
                        <div className="pt-1.5 border-t border-slate-200/80 dark:border-slate-700/60 space-y-1">
                          {log.changes.map((change, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 flex-wrap"
                            >
                              <span className="font-semibold capitalize text-slate-500 dark:text-slate-400">
                                {change.field}:
                              </span>
                              {change.oldValue !== null && change.oldValue !== undefined && (
                                <>
                                  <span className="line-through text-slate-400 dark:text-slate-500">
                                    {String(change.oldValue)}
                                  </span>
                                  <ArrowRight size={11} className="text-slate-400" />
                                </>
                              )}
                              <span className="font-medium text-slate-900 dark:text-white px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                {String(change.newValue ?? 'None')}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
