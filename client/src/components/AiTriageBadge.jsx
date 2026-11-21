import { Sparkles, Frown, Meh, Smile } from 'lucide-react'

export default function AiTriageBadge({ triage }) {
  if (!triage || (!triage.category && !triage.sentiment && (!triage.keySignals || triage.keySignals.length === 0))) {
    return null
  }

  const getSentimentDetails = (sentiment) => {
    switch (sentiment) {
      case 'Frustrated':
        return {
          icon: Frown,
          className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
          label: 'Frustrated',
        }
      case 'Positive':
        return {
          icon: Smile,
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
          label: 'Positive',
        }
      case 'Neutral':
      default:
        return {
          icon: Meh,
          className: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
          label: 'Neutral',
        }
    }
  }

  const sentimentDetails = getSentimentDetails(triage.sentiment)
  const SentimentIcon = sentimentDetails.icon

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1">
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800">
        <Sparkles size={11} className="text-indigo-600 dark:text-indigo-400" />
        <span>AI: {triage.priority || 'Analyzed'}</span>
      </span>

      {triage.sentiment && (
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border font-medium ${sentimentDetails.className}`}
          title={`Detected customer sentiment: ${triage.sentiment}`}
        >
          <SentimentIcon size={11} />
          <span>{sentimentDetails.label}</span>
        </span>
      )}

      {triage.keySignals && triage.keySignals.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          {triage.keySignals.slice(0, 3).map((signal, idx) => (
            <span
              key={idx}
              className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-mono border border-slate-200 dark:border-slate-700"
            >
              #{signal}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
