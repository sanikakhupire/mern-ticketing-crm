import { Search, X, RotateCcw, Calendar } from 'lucide-react'
import { useState } from 'react'
import ExportCsvButton from './ExportCsvButton.jsx'

const TicketFilterToolbar = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  category,
  onCategoryChange,
  priority,
  onPriorityChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onResetFilters,
  hideStatus = false,
  showExport = true,
}) => {
  const [showDateFilter, setShowDateFilter] = useState(Boolean(dateFrom || dateTo))

  const isFiltered =
    Boolean(search) ||
    (status && status !== 'All') ||
    (category && category !== 'All') ||
    (priority && priority !== 'All') ||
    Boolean(dateFrom) ||
    Boolean(dateTo)

  return (
    <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tickets by subject or description..."
            className="block w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Dropdown */}
          {!hideStatus && (
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="px-2.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Running">Running</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>
          )}

          {/* Category Dropdown */}
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-2.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Support">Support</option>
            <option value="Bug">Bug</option>
            <option value="Feature Request">Feature Request</option>
            <option value="Billing">Billing</option>
            <option value="Other">Other</option>
          </select>

          {/* Priority Dropdown */}
          <select
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="px-2.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          {/* Date Range Toggle Button */}
          <button
            type="button"
            onClick={() => setShowDateFilter(!showDateFilter)}
            className={`flex items-center gap-1.5 px-2.5 py-2 text-xs rounded-lg border transition cursor-pointer ${
              showDateFilter || dateFrom || dateTo
                ? 'border-indigo-400 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
            title="Filter by date range"
          >
            <Calendar size={14} />
            <span>Dates</span>
          </button>

          {/* Export CSV Button */}
          {showExport && (
            <ExportCsvButton
              size="sm"
              filters={{ search, status, category, priority, dateFrom, dateTo }}
            />
          )}

          {/* Reset Filters Button */}
          {isFiltered && (
            <button
              type="button"
              onClick={() => {
                onResetFilters()
                setShowDateFilter(false)
              }}
              className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Expandable Date Range Picker */}
      {showDateFilter && (
        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
          <span className="font-medium text-slate-500">Date Range:</span>
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-slate-400">From:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-slate-400">To:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default TicketFilterToolbar
