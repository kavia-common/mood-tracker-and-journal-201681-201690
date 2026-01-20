import React from 'react'
import { getMoodEmoji } from '../lib/moods.js'

// PUBLIC_INTERFACE
export default function CalendarMonth({
  grid,
  selectedDateISO,
  todayISO,
  entries,
  onSelectDate,
}) {
  /** Month view calendar grid; shows an emoji marker for dates with an entry. */
  const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="calendar">
      <div className="calendar__weekdays" role="row" aria-label="Weekdays">
        {weekdayLabels.map((w) => (
          <div key={w} className="calendar__weekday" role="columnheader">
            {w}
          </div>
        ))}
      </div>

      <div className="calendar__grid" role="grid" aria-label="Month days">
        {grid.map((cell) => {
          const isToday = cell.dateISO === todayISO
          const isSelected = cell.dateISO === selectedDateISO
          const entry = entries[cell.dateISO]
          const emoji = entry?.moodId ? getMoodEmoji(entry.moodId) : null

          return (
            <button
              key={cell.dateISO}
              type="button"
              className={[
                'dayCell',
                cell.isInCurrentMonth ? '' : 'is-outside',
                isToday ? 'is-today' : '',
                isSelected ? 'is-selected' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onSelectDate(cell.dateISO)}
              role="gridcell"
              aria-selected={isSelected}
              aria-label={`${cell.ariaLabel}${entry?.moodId ? `, mood ${entry.moodId}` : ''}`}
            >
              <div className="dayCell__top">
                <span className="dayCell__num">{cell.dayNumber}</span>
                <span className="dayCell__emoji" aria-hidden="true">
                  {emoji || ''}
                </span>
              </div>
              {entry?.note ? <div className="dayCell__noteDot" aria-hidden="true" /> : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
