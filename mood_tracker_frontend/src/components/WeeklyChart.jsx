import React, { useMemo } from 'react'

// PUBLIC_INTERFACE
export default function WeeklyChart({ data, moods }) {
  /** Displays a simple weekly bar chart of mood scores (1-5) with emoji labels. */
  const moodById = useMemo(() => {
    const map = new Map()
    moods.forEach((m) => map.set(m.id, m))
    return map
  }, [moods])

  const maxScore = 5

  return (
    <div className="weeklyChart">
      <div className="weeklyChart__grid" role="list" aria-label="Weekly mood bars">
        {data.map((d) => {
          const mood = d.moodId ? moodById.get(d.moodId) : null
          const score = mood?.score ?? null
          const heightPct = score ? Math.round((score / maxScore) * 100) : 8

          return (
            <div key={d.dateISO} className="weeklyChart__item" role="listitem">
              <div className="weeklyChart__barWrap" aria-label={`${d.label}: ${mood?.label || 'No entry'}`}>
                <div
                  className={`weeklyChart__bar ${score ? 'has-value' : 'is-empty'}`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <div className="weeklyChart__meta">
                <div className="weeklyChart__day">{d.label}</div>
                <div className="weeklyChart__emoji" aria-hidden="true">
                  {mood ? mood.emoji : '–'}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="weeklyChart__legend" aria-label="Mood scale legend">
        <div className="legendRow">
          {moods.map((m) => (
            <div key={m.id} className="legendPill" title={`${m.label} (score ${m.score})`}>
              <span aria-hidden="true">{m.emoji}</span>
              <span className="legendPill__text">{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
