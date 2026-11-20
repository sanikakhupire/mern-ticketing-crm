import { useState, useEffect, useRef } from 'react'
import {
  X,
  Send,
  Loader2,
  MessageSquare,
  User,
  Shield,
  Headphones,
  CheckCircle2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api.js'
import { useSocket } from '../context/SocketContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { StatusBadge, PriorityBadge } from './TicketBadges.jsx'

export default function TicketChatModal({ ticket, onClose }) {
  const { user } = useAuth()
  const { socket } = useSocket()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [inputText, setInputText] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  // Fetch existing messages
  useEffect(() => {
    if (!ticket?._id) return
    let isMounted = true

    const fetchMessages = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await api.get(`/tickets/${ticket._id}/messages`)
        if (isMounted) {
          setMessages(data)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to load conversation history.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchMessages()
    return () => {
      isMounted = false
    }
  }, [ticket?._id])

  // Join ticket room and listen for real-time messages
  useEffect(() => {
    if (!socket || !ticket?._id) return

    socket.emit('join_ticket', ticket._id)

    const handleNewMessage = (newMsg) => {
      const msgTicketId = newMsg.ticket?._id || newMsg.ticket
      if (String(msgTicketId) === String(ticket._id)) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === newMsg._id)) return prev
          return [...prev, newMsg]
        })
      }
    }

    socket.on('ticket:message', handleNewMessage)

    return () => {
      socket.emit('leave_ticket', ticket._id)
      socket.off('ticket:message', handleNewMessage)
    }
  }, [socket, ticket?._id])

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Send new message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault()
    if (!inputText.trim() || sending) return

    const content = inputText.trim()
    setInputText('')
    setSending(true)

    try {
      const { data } = await api.post(`/tickets/${ticket._id}/messages`, {
        message: content,
      })
      setMessages((prev) => {
        if (prev.some((m) => m._id === data._id)) return prev
        return [...prev, data]
      })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message')
      setInputText(content) // Restore user text
    } finally {
      setSending(false)
    }
  }

  // Handle Enter keypress (Shift+Enter for newline)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!ticket) return null

  const formatRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield size={12} className="text-purple-600 dark:text-purple-400" />
      case 'employee':
        return <Headphones size={12} className="text-blue-600 dark:text-blue-400" />
      case 'customer':
      default:
        return <User size={12} className="text-emerald-600 dark:text-emerald-400" />
    }
  }

  const formatRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Admin'
      case 'employee':
        return 'Support Agent'
      case 'customer':
      default:
        return 'Customer'
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full h-[88vh] max-h-[700px] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 shrink-0">
              <MessageSquare size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white truncate max-w-[280px] sm:max-w-md">
                  {ticket.subject}
                </h3>
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                Customer: <span className="font-medium text-slate-700 dark:text-slate-300">{ticket.customer?.name || 'Customer'}</span>
                {ticket.assignedTo?.name && (
                  <span className="ml-2">
                    • Assigned: <span className="font-medium text-slate-700 dark:text-slate-300">{ticket.assignedTo.name}</span>
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Message Thread Body */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/40 dark:bg-slate-950/40">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-slate-400">
              <Loader2 size={24} className="animate-spin text-indigo-600 mb-2" />
              <p className="text-xs font-medium">Loading conversation...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-rose-500 text-center px-4">
              <p className="text-xs sm:text-sm font-medium">{error}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center text-slate-400">
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center mb-3">
                <MessageSquare size={22} />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No discussion messages yet
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                Send a message below to start communicating in real time about this ticket.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = String(msg.sender?._id || msg.sender) === String(user?._id)
              const senderRole = msg.senderRole || msg.sender?.role || 'customer'
              const senderName = isMe ? 'You' : msg.sender?.name || 'User'
              const formattedTime = new Date(msg.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })

              return (
                <div
                  key={msg._id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  {/* Sender Header */}
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {senderName}
                    </span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {formatRoleIcon(senderRole)}
                      {formatRoleLabel(senderRole)}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">{formattedTime}</span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs whitespace-pre-wrap break-words ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-xs'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
        >
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
            rows={1}
            disabled={loading}
            className="flex-1 resize-none py-2 px-3.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 max-h-28 overflow-y-auto"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs shrink-0"
          >
            {sending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <Send size={15} />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
