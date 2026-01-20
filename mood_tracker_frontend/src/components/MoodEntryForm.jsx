import React, { useEffect, useMemo, useState } from 'react'

// PUBLIC_INTERFACE
export default function MoodEntryForm({
  dateISO,
  moods,
  initialMoodId,
  initialNote,
  onSave,
  onClear,
}) {
  /** Form for selecting an emoji mood and optionally adding a note for a given date. */
  const [moodId, setMoodId] = useState(initialMoodId || null)
  const [note, setNote] = useState(initialNote || '')
  const [status, setStatus] = useState('idle') // idle | saved

  useEffect(() => {
    setMoodId(initialMoodId || null)
    setNote(initialNote || '')
    setStatus('idle')
  }, [dateISO, initialMoodId, initialNote])

  const canSave = useMemo(() => {
    // Allow saving if a mood is selected; note is optional.
    return Boolean(moodId)
  }, [moodId])

  function handleSubmit(e) {
    e.preventDefault()
    if (!canSave) return

    onSave({ moodId, note })
    setStatus('saved')
    window.setTimeout(() => setStatus('idle'), 1200)
  }

  function handleClear() {
    setMoodId(null)
    setNote('')
    onClear()
    setStatus('idle')
  }

  return (
    <form className="entryForm" onSubmit={handleSubmit}>
      <fieldset className="entryForm__fieldset">
        <legend className="entryForm__legend">How are you feeling?</legend>

        <div className="moodGrid" role="radiogroup" aria-label="Select mood">
          {moods.map((m) => {
            const checked = moodId === m.id
            return (
              <button
                key={m.id}
                type="button"
                className={`moodBtn ${checked ? 'is-selected' : ''}`}
                onClick={() => {
                  setMoodId(m.id)
                  setStatus('idle')
                }}
                role="radio"
                aria-checked={checked}
                aria-label={m.label}
                title={m.label}
              >
                <span className="moodBtn__emoji" aria-hidden="true">
                  {m.emoji}
                </span>
                <span className="moodBtn__label">{m.label}</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="entryForm__row">
        <label className="label" htmlFor="note">
          Note (optional)
        </label>
        <textarea
          id="note"
          className="textarea"
          placeholder="Anything you want to remember about today…"
          value={note}
          onChange={(e) => {
            setNote(e.target.value)
            setStatus('idle')
          }}
          rows={4}
        />
      </div>

      <div className="entryForm__actions">
        <button type="submit" className="primaryBtn" disabled={!canSave}>
          Save
        </button>
        <button type="button" className="ghostBtn" onClick={handleClear}>
          Clear day
        </button>

        <div className="entryForm__status" aria-live="polite">
          {status === 'saved' ? <span className="successText">Saved</span> : <span>&nbsp;</span>}
        </div>
      </div>
    </form>
  )
}
