import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api.js'

export default function ExportCsvButton({
  filters = {},
  className = '',
  buttonText = 'Export CSV',
  size = 'md',
}) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    try {
      setExporting(true)

      // Clean filter params to omit 'All' or empty values
      const params = {}
      if (filters.search && filters.search.trim()) {
        params.search = filters.search.trim()
      }
      if (filters.status && filters.status !== 'All') {
        params.status = filters.status
      }
      if (filters.category && filters.category !== 'All') {
        params.category = filters.category
      }
      if (filters.priority && filters.priority !== 'All') {
        params.priority = filters.priority
      }
      if (filters.dateFrom) {
        params.dateFrom = filters.dateFrom
      }
      if (filters.dateTo) {
        params.dateTo = filters.dateTo
      }

      const response = await api.get('/tickets/export/csv', {
        params,
        responseType: 'blob',
      })

      // Extract filename from header or fallback
      let filename = `tickets-export-${new Date().toISOString().slice(0, 10)}.csv`
      const disposition = response.headers['content-disposition']
      if (disposition && disposition.indexOf('filename=') !== -1) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition)
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '')
        }
      }

      // Create download anchor and trigger save
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Tickets CSV exported successfully!')
    } catch (err) {
      console.error('Export error:', err)
      toast.error('Failed to export tickets CSV')
    } finally {
      setExporting(false)
    }
  }

  const basePadding = size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-xs sm:text-sm'

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={exporting}
      title="Download filtered tickets as CSV"
      className={`inline-flex items-center gap-2 rounded-lg font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${basePadding} ${className}`}
    >
      {exporting ? (
        <>
          <Loader2 size={15} className="animate-spin text-emerald-600 dark:text-emerald-400" />
          <span>Exporting...</span>
        </>
      ) : (
        <>
          <Download size={15} className="text-emerald-600 dark:text-emerald-400" />
          <span>{buttonText}</span>
        </>
      )}
    </button>
  )
}
