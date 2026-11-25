import { useCallback, useEffect, useRef, useState } from 'react'
import checkGreen from '../../assets/check.svg'
import { AppShell } from '../../shell/AppShell'
import { ALEX_ID } from '../../state/data'
import { useAppStore } from '../../state/hooks'
import bannerCheck from './assets/banner-check.svg'
import checkboxCheck from './assets/checkbox-check.svg'
import phoneIcon from './assets/phone.svg'
import warningAmber from './assets/warning-amber.svg'
import warningRed from './assets/warning-red.svg'
import { ALL_RECORD_IDS, CATEGORIES, RECORDS, SAVED_AT, SYNCED_AT, recordCount } from './records'
import type { HistoryRecord } from './records'
import styles from './HistoryScreen.module.css'

/**
 * Frames 03 to 06 of the Figma file are states of this one screen:
 * share (tap to share) -> received (records listed, all selected) ->
 * review (modal over the list) -> saved (records in the chart).
 */
type Step = 'share' | 'received' | 'review' | 'saved'

const WARNING_ICON = { allergy: warningRed, interaction: warningAmber }

export function HistoryScreen() {
  const { state, dispatch } = useAppStore()
  const { alex } = state

  const [step, setStep] = useState<Step>(() => {
    if (alex.historySaved) return 'saved'
    if (alex.identityConfirmed) return 'received'
    return 'share'
  })
  const [selected, setSelected] = useState<string[]>(ALL_RECORD_IDS)
  const addButtonRef = useRef<HTMLButtonElement>(null)

  const selectedRecords = RECORDS.filter((r) => selected.includes(r.id))
  const openCompanion = () => dispatch({ type: 'setCompanion', companion: 'open' })

  const simulateTap = () => {
    dispatch({ type: 'updateAlex', patch: { identityConfirmed: true } })
    setStep('received')
  }

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const closeReview = useCallback(() => {
    setStep('received')
    // Give focus back to the button that opened the modal once it re-renders.
    requestAnimationFrame(() => addButtonRef.current?.focus())
  }, [])

  const save = () => {
    const allergies = selectedRecords.filter((r) => r.category === 'Allergies').map((r) => r.name)
    dispatch({
      type: 'updateAlex',
      patch: {
        historySaved: true,
        allergies: [...new Set([...alex.allergies, ...allergies])],
      },
    })
    dispatch({ type: 'setPatientStatus', id: ALEX_ID, status: 'in-progress' })
    setStep('saved')
  }

  // Reopening a saved history starts with every record selected, so all show as in chart.
  const inChart = (id: string) => selected.includes(id)

  if (step === 'share') {
    return (
      <AppShell variant="patient">
        <h1 className={styles.title}>Patient History</h1>
        <p className={styles.subtitle}>No verified history yet</p>

        <section className={styles.empty} aria-labelledby="history-share-title">
          <span className={styles.emptyIcon}>
            <img src={phoneIcon} alt="" width={28} height={28} />
          </span>
          <h2 id="history-share-title" className={styles.emptyTitle}>
            Ask Alex to tap their phone on this tablet
          </h2>
          <p className={styles.emptyText}>
            CareFlow pulls verified medications, allergies and diagnoses from the patient&apos;s
            pharmacy and other hospitals. Nothing is saved to the chart until you review it.
          </p>
          <button type="button" className={styles.primary} onClick={simulateTap}>
            Simulate phone tap
          </button>
          <p className={styles.emptyNote}>Prototype only: this button stands in for the NFC tap.</p>
        </section>
      </AppShell>
    )
  }

  const reviewing = step === 'review'

  return (
    <AppShell variant="patient">
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Patient History</h1>
          <p className={styles.subtitle}>Last synced today at {SYNCED_AT}</p>
        </div>
        {step !== 'saved' ? (
          <button
            ref={addButtonRef}
            type="button"
            className={`${styles.primary} ${styles.addButton}`}
            disabled={selected.length === 0}
            onClick={() => setStep('review')}
          >
            {reviewing ? 'Add all to chart' : 'Add to chart'}
          </button>
        ) : null}
      </div>

      {step === 'saved' ? (
        <div className={`${styles.banner} ${styles.bannerWithAction}`} role="status">
          <img src={bannerCheck} alt="" width={16} height={16} />
          <p className={styles.bannerText}>
            {recordCount(selected.length)} saved to Alex&apos;s chart at {SAVED_AT}.
          </p>
          <button
            type="button"
            className={`${styles.primary} ${styles.chatButton}`}
            onClick={openCompanion}
          >
            Start chat
          </button>
        </div>
      ) : (
        <div className={styles.banner} role="status">
          <img src={bannerCheck} alt="" width={16} height={16} />
          <p className={styles.bannerText}>
            6 verified records received from 2 sources (Retail pharmacy, Other hospital). Nothing is
            in the chart yet.
          </p>
        </div>
      )}

      {CATEGORIES.map((category) => {
        const records = RECORDS.filter((r) => r.category === category)
        const headingId = `history-${category.replace(/\s/g, '-').toLowerCase()}`
        return (
          <section key={category} className={styles.section} aria-labelledby={headingId}>
            <h2 className={styles.sectionHeader}>
              <span id={headingId}>{category}</span>
              <span className={styles.sectionCount}>{recordCount(records.length)}</span>
            </h2>
            <ul className={styles.rows}>
              {records.map((r) => (
                <li key={r.id} className={styles.row}>
                  <RecordName record={r} />
                  <span className={styles.meta}>{r.source}</span>
                  <span className={styles.metaEnd}>
                    <span className={styles.meta}>Updated {r.updated}</span>
                    {step === 'received' ? (
                      <RecordCheckbox
                        label={`Select ${r.name}`}
                        checked={selected.includes(r.id)}
                        onChange={() => toggle(r.id)}
                      />
                    ) : null}
                    {reviewing ? <span className={styles.notInChart}>Not in chart yet</span> : null}
                    {step === 'saved' ? (
                      inChart(r.id) ? (
                        <span className={styles.inChart}>
                          <img src={checkGreen} alt="" width={16} height={16} />
                          In chart
                        </span>
                      ) : (
                        <span className={styles.notInChart}>Not in chart yet</span>
                      )
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )
      })}

      {step !== 'saved' ? (
        <div className={styles.footer}>
          <button
            type="button"
            className={`${styles.secondary} ${styles.chatButton}`}
            onClick={openCompanion}
          >
            Start chat
          </button>
        </div>
      ) : null}

      {reviewing ? (
        <ReviewModal
          records={selectedRecords}
          selected={selected}
          onToggle={toggle}
          onBack={closeReview}
          onSave={save}
        />
      ) : null}
    </AppShell>
  )
}

function RecordName({ record }: { record: HistoryRecord }) {
  return (
    <span className={styles.name}>
      {record.name}
      {record.warning ? (
        <img
          src={WARNING_ICON[record.warning]}
          alt={record.warning === 'allergy' ? 'Allergy' : 'Interaction risk'}
          width={14}
          height={14}
        />
      ) : null}
    </span>
  )
}

/** "CareFlow / Record checkbox" (163:2445): 24px hit area, 16px square. */
function RecordCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <span className={styles.checkbox}>
      <input type="checkbox" aria-label={label} checked={checked} onChange={onChange} />
      {checked ? <img src={checkboxCheck} alt="" width={16} height={16} /> : null}
    </span>
  )
}

function ReviewModal({
  records,
  selected,
  onToggle,
  onBack,
  onSave,
}: {
  records: HistoryRecord[]
  selected: string[]
  onToggle: (id: string) => void
  onBack: () => void
  onSave: () => void
}) {
  const dialogRef = useRef<HTMLDivElement>(null)
  // Keep the rows that were selected when the modal opened, so unticking one
  // here leaves it in place (unticked) instead of making it disappear.
  const [rows] = useState(records)
  const chosen = rows.filter((r) => selected.includes(r.id))
  const allergy = chosen.find((r) => r.warning === 'allergy')
  const interaction = chosen.find((r) => r.warning === 'interaction')

  useEffect(() => {
    dialogRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onBack])

  return (
    <div className={styles.scrim}>
      <div
        ref={dialogRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-review-title"
        tabIndex={-1}
      >
        <h2 id="history-review-title" className={styles.modalTitle}>
          Review before saving
        </h2>
        <p className={styles.modalText}>
          These {recordCount(chosen.length)} will be added to Alex Morgan&apos;s chart.
        </p>

        <ul className={styles.modalRows}>
          {rows.map((r) => (
            <li key={r.id} className={styles.modalRow}>
              <RecordCheckbox
                label={`Include ${r.name}`}
                checked={selected.includes(r.id)}
                onChange={() => onToggle(r.id)}
              />
              <span className={styles.modalName}>{r.name}</span>
              <span className={styles.modalMeta}>{r.category}</span>
              <span className={`${styles.modalMeta} ${styles.modalSource}`}>{r.source}</span>
            </li>
          ))}
        </ul>

        {allergy || interaction ? (
          <ul className={styles.safety}>
            {allergy ? (
              <li>
                <img src={warningRed} alt="" width={14} height={14} />
                <span>
                  <b>Allergy</b>: {allergy.name}. This allergy will be shown on the patient bar.
                </span>
              </li>
            ) : null}
            {interaction ? (
              <li>
                <img src={warningAmber} alt="" width={14} height={14} />
                <span>{interaction.name} will be used for interaction checks.</span>
              </li>
            ) : null}
          </ul>
        ) : null}

        <div className={styles.modalActions}>
          <button type="button" className={styles.secondary} onClick={onBack}>
            Back
          </button>
          <button
            type="button"
            className={styles.primary}
            disabled={chosen.length === 0}
            onClick={onSave}
          >
            Save to chart
          </button>
        </div>
      </div>
    </div>
  )
}
