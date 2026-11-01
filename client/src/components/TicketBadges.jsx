export const StatusBadge = ({ status }) => {
  const styles = {
    Open: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    Running: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    'On Hold': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  }

  const dotColors = {
    Open: 'bg-amber-500',
    Running: 'bg-blue-500',
    'On Hold': 'bg-purple-500',
    Completed: 'bg-emerald-500',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
        styles[status] || 'bg-slate-100 text-slate-700 border-slate-200'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[status] || 'bg-slate-400'}`} />
      {status}
    </span>
  )
}

export const PriorityBadge = ({ priority }) => {
  const styles = {
    Low: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    High: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
        styles[priority] || 'bg-slate-100 text-slate-700 border-slate-200'
      }`}
    >
      {priority}
    </span>
  )
}

export const CategoryBadge = ({ category }) => {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
      {category}
    </span>
  )
}
