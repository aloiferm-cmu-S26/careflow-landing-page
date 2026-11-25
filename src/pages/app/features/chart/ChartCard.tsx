import { useEffect, useRef, useState } from 'react'
import confirmedIcon from './assets/confirmed-check.svg'
import warningIcon from './assets/warning-amber.svg'
import { NURSE } from '../../state/data'
import { TRANSCRIPT, describeChange, formatClock } from './chartFlow'
import type { CardScript, CardState } from './chartFlow'
import styles from './ChartCard.module.css'

interface ChartCardProps {
  script: CardScript
  card: CardState
  editing: boolean
  /** Confirmed cards offer Edit once nothing else is waiting on the nurse. */
  canEditConfirmed: boolean
  onConfirm: () => void
  onEdit: () => void
  onCancel: () => void
  onSave: (text: string) => void
}

export function ChartCard({
  script,
  card,
  editing,
  canEditConfirmed,
  onConfirm,
  onEdit,
  onCancel,
  onSave,
}: ChartCardProps) {
  const { title } = script
  const confirmed = card.status === 'confirmed'
  const state = editing ? 'editing' : card.status

  return (
    <li className={styles.card} data-state={state}>
      <h3 className={styles.head}>
        {title}
        {editing ? <span className={styles.editingTag}>Editing</span> : null}
        {!editing && card.status === 'draft' ? (
          <span className={styles.draftTag}>Draft</span>
        ) : null}
        {!editing && confirmed ? (
          <span className={styles.confirmedTag}>
            <img src={confirmedIcon} alt="" width={14} height={14} />
            Confirmed
          </span>
        ) : null}
      </h3>

      {card.status === 'hidden' ? <p className={styles.empty}>–</p> : null}

      {editing ? (
        <Editor
          title={title}
          text={card.text}
          confirmed={confirmed}
          onCancel={onCancel}
          onSave={onSave}
        />
      ) : null}

      {!editing && card.status !== 'hidden' ? (
        <>
          <p className={styles.text}>{card.text}</p>
          <p className={styles.meta}>
            {confirmed
              ? `${card.edited ? 'Edited and confirmed' : 'Confirmed'} by ${NURSE.name} · ${script.confirmedAt}`
              : `Transcript ${formatClock(TRANSCRIPT[script.fromLine]?.at ?? 0)} · ${script.origin}`}
          </p>
          {card.status === 'draft' && script.check ? (
            <p className={styles.check}>
              <img src={warningIcon} alt="" width={14} height={14} />
              {script.check}
            </p>
          ) : null}
        </>
      ) : null}

      {!editing && card.status === 'draft' ? (
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={onConfirm}>
            Confirm
          </button>
          <button type="button" className={styles.secondary} onClick={onEdit}>
            Edit
          </button>
        </div>
      ) : null}

      {!editing && confirmed && canEditConfirmed ? (
        <div className={styles.actionsConfirmed}>
          <button
            type="button"
            className={styles.secondary}
            aria-label={`Edit ${title}`}
            onClick={onEdit}
          >
            Edit
          </button>
        </div>
      ) : null}
    </li>
  )
}

interface EditorProps {
  title: string
  text: string
  confirmed: boolean
  onCancel: () => void
  onSave: (text: string) => void
}

function Editor({ title, text, confirmed, onCancel, onSave }: EditorProps) {
  const [value, setValue] = useState(text)
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.focus()
    el.setSelectionRange(el.value.length, el.value.length)
  }, [])

  const change = describeChange(text, value)
  const hint = change ?? `Edit the ${confirmed ? 'confirmed' : 'draft'} ${title} card.`

  return (
    <>
      <textarea
        ref={ref}
        className={styles.editor}
        value={value}
        rows={1}
        aria-label={`${title} text`}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onCancel()
        }}
      />
      <div className={styles.editFooter}>
        <p className={styles.hint} aria-live="polite">
          {hint}
        </p>
        <div className={styles.editActions}>
          <button type="button" className={styles.secondary} onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.primary}
            disabled={!value.trim()}
            onClick={() => onSave(value)}
          >
            Save
          </button>
        </div>
      </div>
    </>
  )
}
