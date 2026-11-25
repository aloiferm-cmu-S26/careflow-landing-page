import { useEffect, useRef } from 'react'
import { CARDS } from './chartFlow'
import type { CardId, CardState } from './chartFlow'
import styles from './ReviewDialog.module.css'

const COUNT_WORD = ['No', 'One', 'Two', 'Three', 'Four', 'Five']

interface ReviewDialogProps {
  patientName: string
  cards: Record<CardId, CardState>
  onBack: () => void
  onSave: () => void
}

/** Frame 13: a last look at every confirmed card before it reaches the chart. */
export function ReviewDialog({ patientName, cards, onBack, onSave }: ReviewDialogProps) {
  const backRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    backRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack()
      // Keep Tab inside the dialog.
      if (e.key === 'Tab' && dialogRef.current) {
        const buttons = dialogRef.current.querySelectorAll('button')
        const first = buttons[0]
        const last = buttons[buttons.length - 1]
        if (!first || !last) return
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onBack])

  return (
    <div className={styles.backdrop}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chart-review-title"
        aria-describedby="chart-review-sub"
      >
        <h2 id="chart-review-title" className={styles.title}>
          Review before saving
        </h2>
        <p id="chart-review-sub" className={styles.sub}>
          {`${COUNT_WORD[CARDS.length] ?? CARDS.length} confirmed cards will be saved to ${patientName}'s chart.`}
        </p>

        <dl className={styles.rows}>
          {CARDS.map((c) => (
            <div key={c.id} className={styles.row}>
              <dt className={styles.label}>{c.title}</dt>
              <dd className={styles.status}>
                {cards[c.id].edited ? 'Edited and confirmed' : 'Confirmed'} {c.confirmedAt}
              </dd>
              <dd className={styles.text}>{cards[c.id].text}</dd>
            </div>
          ))}
        </dl>

        <div className={styles.actions}>
          <button ref={backRef} type="button" className={styles.secondary} onClick={onBack}>
            Back
          </button>
          <button type="button" className={styles.primary} onClick={onSave}>
            Save to chart
          </button>
        </div>
      </div>
    </div>
  )
}
