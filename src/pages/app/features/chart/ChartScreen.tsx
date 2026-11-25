import { useCallback, useEffect, useReducer, useRef } from 'react'
import checkIcon from '../../assets/check.svg'
import { AppShell } from '../../shell/AppShell'
import { ALEX_ID } from '../../state/data'
import { useAppStore, useNavigate } from '../../state/hooks'
import { ChartCard } from './ChartCard'
import {
  CARDS,
  SAVED_AT,
  allConfirmed,
  chartReducer,
  countLabel,
  highlightedLine,
  initialChart,
  savedChart,
  visibleLines,
} from './chartFlow'
import { Conversation } from './Conversation'
import { ReviewDialog } from './ReviewDialog'
import styles from './ChartScreen.module.css'

/** One second of visit time per tick, sped up so the prototype plays in a few seconds. */
const TICK_MS = 120

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Live Chart (Figma frames 07 to 14): listen to the visit, then confirm or fix
 * each draft card, review, and save to the chart.
 */
export function ChartScreen() {
  const { state: app, dispatch: appDispatch } = useAppStore()
  const navigate = useNavigate()
  const [chart, dispatch] = useReducer(chartReducer, app.alex.chartSaved, (saved) =>
    saved ? savedChart : initialChart,
  )
  const reviewRef = useRef<HTMLButtonElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const justSaved = useRef(false)

  const patientId = app.route.patientId ?? ALEX_ID
  const patientName = app.patients.find((p) => p.id === patientId)?.name ?? 'Alex Morgan'
  const firstName = patientName.split(' ')[0]

  useEffect(() => {
    if (chart.phase !== 'listening') return
    const id = window.setInterval(
      () => dispatch({ type: 'tick' }),
      prefersReducedMotion() ? 1000 : TICK_MS,
    )
    return () => window.clearInterval(id)
  }, [chart.phase])

  const closeReview = useCallback(() => {
    dispatch({ type: 'review', open: false })
    reviewRef.current?.focus()
  }, [])

  const save = () => {
    justSaved.current = true
    dispatch({ type: 'save' })
    appDispatch({ type: 'updateAlex', patch: { chartSaved: true } })
  }

  useEffect(() => {
    if (!chart.saved || !justSaved.current) return
    justSaved.current = false
    nextRef.current?.focus()
  }, [chart.saved])

  const ready = allConfirmed(chart) && !chart.editing
  const canSave = ready && !chart.saved

  return (
    <AppShell
      variant="patient"
      aside={
        <Conversation
          phase={chart.phase}
          clock={chart.clock}
          lines={visibleLines(chart)}
          highlight={highlightedLine(chart)}
          onStart={() => dispatch({ type: 'start', reducedMotion: prefersReducedMotion() })}
          onEnd={() => dispatch({ type: 'endVisit' })}
        />
      }
    >
      <h1 className={styles.title}>Live Chart Canvas</h1>
      <div className={styles.subRow}>
        <p className={styles.subtitle}>Review spoken findings, one card at a time.</p>
        <p className={styles.count} aria-live="polite">
          {countLabel(chart)}
        </p>
      </div>

      <ol className={styles.cards}>
        {CARDS.map((script) => (
          <ChartCard
            key={script.id}
            script={script}
            card={chart.cards[script.id]}
            editing={chart.editing === script.id}
            canEditConfirmed={ready}
            onConfirm={() => dispatch({ type: 'confirm', id: script.id })}
            onEdit={() => dispatch({ type: 'edit', id: script.id })}
            onCancel={() => dispatch({ type: 'cancelEdit' })}
            onSave={(text) => dispatch({ type: 'saveEdit', id: script.id, text })}
          />
        ))}
      </ol>

      {chart.saved ? (
        <div className={styles.saved} role="status">
          <p className={styles.savedText}>
            <img src={checkIcon} alt="" width={16} height={16} />
            Saved to {firstName}&apos;s chart at {SAVED_AT}
          </p>
          <button
            ref={nextRef}
            type="button"
            className={styles.primary}
            onClick={() => navigate('medication', patientId)}
          >
            Go to Medication Review
          </button>
        </div>
      ) : (
        <div className={styles.footer}>
          <p className={styles.hint}>Review draft cards before saving to the patient chart.</p>
          <button
            ref={reviewRef}
            type="button"
            className={styles.primary}
            disabled={!canSave}
            onClick={() => dispatch({ type: 'review', open: true })}
          >
            Review and Save
          </button>
        </div>
      )}

      {chart.reviewing ? (
        <ReviewDialog
          patientName={patientName}
          cards={chart.cards}
          onBack={closeReview}
          onSave={save}
        />
      ) : null}
    </AppShell>
  )
}
