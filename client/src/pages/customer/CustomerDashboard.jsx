import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import {
  Plus,
  Ticket,
  Image as ImageIcon,
  X,
  Upload,
  Calendar,
  User,
  History,
  MessageSquare,
  Sparkles,
  Loader2,
} from 'lucide-react'
import api from '../../services/api.js'
import Navbar from '../../components/Navbar.jsx'
import { StatusBadge, PriorityBadge, CategoryBadge, SlaBadge } from '../../components/TicketBadges.jsx'
import ImageModal from '../../components/ImageModal.jsx'
import TicketAuditHistoryModal from '../../components/TicketAuditHistoryModal.jsx'
import TicketChatModal from '../../components/TicketChatModal.jsx'
import TicketFilterToolbar from '../../components/TicketFilterToolbar.jsx'
import Pagination from '../../components/Pagination.jsx'
import AiTriageBadge from '../../components/AiTriageBadge.jsx'
import { ticketSchema } from '../../utils/validators.js'

const CustomerDashboard = () => {
  const [tickets, setTickets] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [viewImage, setViewImage] = useState(null)
  const [auditTicket, setAuditTicket] = useState(null)
  const [chatTicket, setChatTicket] = useState(null)

  // Filters
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [category, setCategory] = useState('All')
  const [priority, setPriority] = useState('All')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const [triagePrediction, setTriagePrediction] = useState(null)
  const [triageLoading, setTriageLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      subject: '',
      description: '',
      category: 'Support',
      priority: 'Low',
    },
  })

  const handleAutoTriage = async () => {
    const s = watch('subject') || ''
    const d = watch('description') || ''
    if (!s.trim() && !d.trim()) {
      toast.error('Please enter a subject or description first for AI triage')
      return
    }
    try {
      setTriageLoading(true)
      const { data } = await api.post('/tickets/ai/triage', { subject: s, description: d })
      setTriagePrediction(data)
      setValue('category', data.category)
      setValue('priority', data.priority)
      toast.success(`AI suggested: ${data.category} • ${data.priority} Priority`)
    } catch {
      toast.error('Failed to analyze ticket with AI')
    } finally {
      setTriageLoading(false)
    }
  }

  const fetchMyTickets = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        page,
        limit,
        search: search.trim() || undefined,
        status: status !== 'All' ? status : undefined,
        category: category !== 'All' ? category : undefined,
        priority: priority !== 'All' ? priority : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      }

      const { data } = await api.get('/tickets/my', { params })
      setTickets(data.tickets || [])
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, pages: 1 })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch tickets')
    } finally {
      setLoading(false)
    }
  }, [page, limit, search, status, category, priority, dateFrom, dateTo])

  useEffect(() => {
    fetchMyTickets()
  }, [fetchMyTickets])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, and WebP images are allowed')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size cannot exceed 5MB')
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
  }

  const onSubmit = async (values) => {
    try {
      setSubmitting(true)
      const formData = new FormData()
      formData.append('subject', values.subject)
      formData.append('description', values.description)
      formData.append('category', values.category)
      formData.append('priority', values.priority)

      if (selectedFile) {
        formData.append('image', selectedFile)
      }

      const { data } = await api.post('/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      toast.success('Ticket created successfully!')
      setTickets((prev) => [data, ...prev])
      reset()
      removeFile()
      setTriagePrediction(null)
      setModalOpen(false)
      fetchMyTickets()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create ticket')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResetFilters = () => {
    setSearch('')
    setStatus('All')
    setCategory('All')
    setPriority('All')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Title and Create Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Customer Support Portal
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Search your inquiries, track progress in real time, or file a new issue.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm shadow-indigo-500/20 transition cursor-pointer self-start sm:self-auto"
          >
            <Plus size={18} />
            <span>Create New Ticket</span>
          </button>
        </div>

        {/* Tickets List Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
          {/* Filters Toolbar */}
          <TicketFilterToolbar
            search={search}
            onSearchChange={(v) => {
              setSearch(v)
              setPage(1)
            }}
            status={status}
            onStatusChange={(v) => {
              setStatus(v)
              setPage(1)
            }}
            category={category}
            onCategoryChange={(v) => {
              setCategory(v)
              setPage(1)
            }}
            priority={priority}
            onPriorityChange={(v) => {
              setPriority(v)
              setPage(1)
            }}
            dateFrom={dateFrom}
            onDateFromChange={(v) => {
              setDateFrom(v)
              setPage(1)
            }}
            dateTo={dateTo}
            onDateToChange={(v) => {
              setDateTo(v)
              setPage(1)
            }}
            onResetFilters={handleResetFilters}
          />

          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex flex-col gap-3 p-4 border border-slate-100 rounded-lg">
                  <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <Ticket size={24} />
              </div>
              <h3 className="text-base font-medium text-slate-800 dark:text-slate-200">No support tickets found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                No tickets match your query. Click "Create New Ticket" to file a new inquiry.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {tickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="p-5 sm:p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={ticket.status} />
                      <PriorityBadge priority={ticket.priority} />
                      <CategoryBadge category={ticket.category} />
                      <SlaBadge ticket={ticket} />
                    </div>

                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                      {ticket.subject}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {ticket.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={14} />
                        {ticket.assignedTo ? (
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            Assigned to {ticket.assignedTo.name}
                          </span>
                        ) : (
                          <span className="italic text-slate-400">Awaiting assignment</span>
                        )}
                      </span>
                    </div>

                    {/* AI Triage Badge */}
                    <AiTriageBadge triage={ticket.aiTriage} />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
                    {ticket.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setViewImage(ticket.imageUrl)}
                        className="group relative flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition cursor-pointer"
                      >
                        <ImageIcon size={15} className="text-indigo-600" />
                        <span>View Attachment</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setAuditTicket(ticket)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition cursor-pointer"
                      title="View ticket audit history"
                    >
                      <History size={14} className="text-indigo-600" />
                      <span>History</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setChatTicket(ticket)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition cursor-pointer"
                      title="Open ticket discussion chat"
                    >
                      <MessageSquare size={14} className="text-indigo-600" />
                      <span>Chat</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <Pagination
            pagination={pagination}
            onPageChange={(p) => setPage(p)}
            onLimitChange={(l) => {
              setLimit(l)
              setPage(1)
            }}
          />
        </div>
      </main>

      {/* Create Ticket Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create New Ticket</h2>
                <p className="text-xs text-slate-500 mt-0.5">Please provide details regarding your inquiry</p>
              </div>
              <button
                onClick={() => {
                  setModalOpen(false)
                  removeFile()
                  setTriagePrediction(null)
                  reset()
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-5">
              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  {...register('subject')}
                  placeholder="e.g. Cannot access billing statements"
                  className={`block w-full px-3.5 py-2 sm:text-sm rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.subject ? 'border-rose-300' : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
                {errors.subject && (
                  <p className="mt-1 text-xs text-rose-500">{errors.subject.message}</p>
                )}
              </div>

              {/* Category & Priority grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    {...register('category')}
                    className="block w-full px-3 py-2 sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Support">Support</option>
                    <option value="Bug">Bug</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Billing">Billing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Priority
                  </label>
                  <select
                    {...register('priority')}
                    className="block w-full px-3 py-2 sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Description *
                </label>
                <textarea
                  rows={4}
                  {...register('description')}
                  placeholder="Provide complete steps, error messages, or context..."
                  className={`block w-full px-3.5 py-2 sm:text-sm rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.description ? 'border-rose-300' : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-rose-500">{errors.description.message}</p>
                )}
              </div>

              {/* AI Smart Triage Assistant */}
              <div className="p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900 dark:text-indigo-300">
                    <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
                    <span>AI Smart Triage</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoTriage}
                    disabled={triageLoading}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition cursor-pointer shadow-2xs"
                  >
                    {triageLoading ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} />
                        <span>Auto-Detect with AI</span>
                      </>
                    )}
                  </button>
                </div>

                {triagePrediction ? (
                  <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1 pt-1 border-t border-indigo-100 dark:border-indigo-900/40">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>Suggested: <strong>{triagePrediction.category}</strong></span>
                      <span>•</span>
                      <span>Priority: <strong>{triagePrediction.priority}</strong></span>
                      <span>•</span>
                      <span>Sentiment: <strong className={triagePrediction.sentiment === 'Frustrated' ? 'text-rose-600' : 'text-slate-600'}>{triagePrediction.sentiment}</strong></span>
                    </div>
                    {triagePrediction.keySignals && triagePrediction.keySignals.length > 0 && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Keywords: {triagePrediction.keySignals.map((s) => `#${s}`).join(', ')}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Fill in your subject and description above, then click Auto-Detect to automatically determine the right category and urgency.
                  </p>
                )}
              </div>

              {/* Image Upload Area */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Screenshot Attachment (Optional, max 5MB)
                </label>

                {previewUrl ? (
                  <div className="relative border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-12 h-12 object-cover rounded border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                          {selectedFile?.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {Math.round((selectedFile?.size || 0) / 1024)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-800/40">
                    <Upload size={22} className="text-slate-400 mb-1" />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Click to upload screenshot
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, or WebP up to 5MB</span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false)
                    removeFile()
                    setTriagePrediction(null)
                    reset()
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {submitting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>Submit Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Full Size Modal */}
      <ImageModal imageUrl={viewImage} onClose={() => setViewImage(null)} />
      <TicketAuditHistoryModal ticket={auditTicket} onClose={() => setAuditTicket(null)} />
      <TicketChatModal ticket={chatTicket} onClose={() => setChatTicket(null)} />
    </div>
  )
}

export default CustomerDashboard
