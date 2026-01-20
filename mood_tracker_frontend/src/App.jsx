import React, { useEffect, useMemo, useState } from 'react'
import { loadEntries, saveEntries } from './lib/storage.js'
import {
  addDays,
  formatDateISO,
  getMonthGrid,
  getStartOfWeek,
  isSameDayISO,
  parseISODate,
  toISODateString,
} from './lib/date.js'
import { MOODS, getMoodById } from './lib/moods.js'
import MoodEntryForm from './components/MoodEntryForm.jsx'
import WeeklyChart from './components/WeeklyChart.jsx'
import CalendarMonth from './components/CalendarMonth.jsx'

const TODAY_ISO = toISODateString(new Date())

// PUBLIC_INTERFACE
export default function App() {
  /** Root application component for the mood tracker UI. */
  const [entries, setEntries] = useState(() => loadEntries())
  const [selectedDateISO, setSelectedDateISO] = useState(TODAY_ISO)

  // Persist to localStorage on every change.
  useEffect(() => {
    saveEntries(entries)
  }, [entries])

  const selectedEntry = entries[selectedDateISO] || null

  const weekStart = useMemo(() => {
    return formatDateISO(getStartOfWeek(parseISODate(selectedDateISO)))
  }, [selectedDateISO])

  const weeklyData = useMemo(() => {
    const start = parseISODate(weekStart)
    const days = []
    for (let i = 0; i < 7; i += 1) {
      const d = addDays(start, i)
      const iso = formatDateISO(d)
      const entry = entries[iso]
      days.push({
        dateISO: iso,
        label: d.toLocaleDateString(undefined, { weekday: 'short' }),
        moodId: entry?.moodId || null,
        moodScore: entry?.moodId ? getMoodById(entry.moodId)?.score ?? null : null,
      })
    }
    return days
  }, [entries, weekStart])

  const monthGrid = useMemo(() => {
    const base = parseISODate(selectedDateISO)
    return getMonthGrid(base)
  }, [selectedDateISO])

  function upsertEntry(dateISO, next) {
    setEntries((prev) => {
      const updated = { ...prev }
      if (!next || !next.moodId) {
        // If user clears mood, remove the entry entirely (keep storage tidy).
        delete updated[dateISO]
      } else {
        updated[dateISO] = {
          dateISO,
          moodId: next.moodId,
          note: (next.note || '').trim(),
          updatedAt: new Date().toISOString(),
        }
      }
      return updated
    })
  }

  function clearEntry(dateISO) {
    setEntries((prev) => {
      const updated = { ...prev }
      delete updated[dateISO]
      return updated
    })
  }

  const selectedDate = parseISODate(selectedDateISO)
  const monthLabel = selectedDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  function goMonth(deltaMonths) {
    const d = new Date(selectedDate)
    d.setDate(1)
    d.setMonth(d.getMonth() + deltaMonths)
    // Keep same "selected day" if possible.
    const desiredDay = selectedDate.getDate()
    const candidate = new Date(d)
    candidate.setDate(Math.min(desiredDay, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()))
    setSelectedDateISO(toISODateString(candidate))
  }

  return (
    <div className="appShell">
      <header className="topBar">
        <div className="topBar__inner">
          <div className="brand">
            <div className="brand__mark" aria-hidden="true">
              🙂
            </div>
            <div className="brand__text">
              <div className="brand__title">Mood Tracker</div>
              <div className="brand__subtitle">Emoji mood + notes • saved locally</div>
            </div>
          </div>

          <div className="topBar__actions">
            <button
              type="button"
              className="ghostBtn"
              onClick={() => setSelectedDateISO(TODAY_ISO)}
              aria-label="Jump to today"
            >
              Today
            </button>
          </div>
        </div>
      </header>

      <main className="mainGrid">
        <section className="card card--padded" aria-label="Mood entry">
          <div className="cardHeader">
            <div>
              <h2 className="cardTitle">Log mood</h2>
              <p className="cardSub">
                Date:{' '}
                <span className="mono">
                  {parseISODate(selectedDateISO).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </p>
            </div>
            {selectedEntry?.moodId ? (
              <div className="pill" title="Current mood">
                <span className="pill__emoji" aria-hidden="true">
                  {getMoodById(selectedEntry.moodId)?.emoji}
                </span>
                <span className="pill__label">{getMoodById(selectedEntry.moodId)?.label}</span>
              </div>
            ) : (
              <div className="pill pill--muted">No entry yet</div>
            )}
          </div>

          <MoodEntryForm
            dateISO={selectedDateISO}
            moods={MOODS}
            initialMoodId={selectedEntry?.moodId || null}
            initialNote={selectedEntry?.note || ''}
            onSave={(next) => upsertEntry(selectedDateISO, next)}
            onClear={() => clearEntry(selectedDateISO)}
          />
        </section>

        <section className="card card--padded" aria-label="Weekly mood chart">
          <div className="cardHeader">
            <div>
              <h2 className="cardTitle">This week</h2>
              <p className="cardSub">
                Week of <span className="mono">{parseISODate(weekStart).toLocaleDateString()}</span>
              </p>
            </div>
          </div>
          <WeeklyChart data={weeklyData} moods={MOODS} />
        </section>

        <section className="card card--padded card--span2" aria-label="Calendar view">
          <div className="calendarHeader">
            <div>
              <h2 className="cardTitle">Calendar</h2>
              <p className="cardSub">Pick a day to view/edit your entry.</p>
            </div>
            <div className="calendarHeader__actions" role="group" aria-label="Change month">
              <button type="button" className="ghostBtn" onClick={() => goMonth(-1)}>
                ← Prev
              </button>
              <div className="calendarHeader__label" aria-live="polite">
                {monthLabel}
              </div>
              <button type="button" className="ghostBtn" onClick={() => goMonth(1)}>
                Next →
              </button>
            </div>
          </div>

          <CalendarMonth
            grid={monthGrid}
            selectedDateISO={selectedDateISO}
            todayISO={TODAY_ISO}
            entries={entries}
            onSelectDate={(iso) => setSelectedDateISO(iso)}
            isSelected={(iso) => isSameDayISO(iso, selectedDateISO)}
          />
        </section>
      </main>

      <footer className="footer">
        <div className="footer__inner">
          <span className="muted">
            Data is stored locally in your browser (
            <span className="mono">localStorage</span>).
          </span>
        </div>
      </footer>
    </div>
  )
}
