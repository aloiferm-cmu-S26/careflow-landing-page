import { useEffect, useId, useState } from 'react'
import { AppShell } from '../../shell/AppShell'
import { ALEX_ID } from '../../state/data'
import { useAppStore, useNavigate } from '../../state/hooks'
import warningAmber from './assets/warning-amber.svg'
import warningRed from './assets/warning-red.svg'
import styles from './SummaryScreen.module.css'

const VISIT_ROWS: { label: string; value: string }[] = [
  {
    label: 'Symptoms (Confirmed)',
    value: 'Patient appears confused on arrival. Unable to recall current medications.',
  },
  {
    label: 'Findings (Confirmed)',
    value:
      'Medication history retrieved from two sources. Possible interaction flagged for review.',
  },
  {
    label: 'Plan (Confirmed)',
    value: 'Medication concern shared with the care team. Awaiting physician review.',
  },
  {
    label: 'Medication decision',
    value: 'Ketorolac 30 mg IV not given: interaction with warfarin. Ordered by Dr. Patel, 21:52.',
  },
  {
    label: 'Treatment plan',
    value: 'Acetaminophen 1 g by mouth. Ordered by Dr. Patel, added 21:53.',
  },
]

interface Warning {
  icon: string
  text: string
}

interface HistoryItem {
  name: string
  meta: string
  warning?: Warning
}

const MEDICATIONS: HistoryItem[] = [
  { name: 'Metformin 500 mg', meta: 'Retail pharmacy · updated 28 Oct 2026' },
  {
    name: 'Warfarin 5 mg',
    meta: 'Other hospital · updated 27 Oct 2026',
    warning: {
      icon: warningAmber,
      text: 'Bleeding risk. Interaction flagged with ketorolac. Ketorolac was not given.',
    },
  },
  { name: 'Lisinopril 10 mg', meta: 'Retail pharmacy · updated 26 Oct 2026' },
]

/** Allergies the external records know about. Anything else came from this visit. */
const KNOWN_ALLERGIES: Record<string, HistoryItem> = {
  Penicillin: {
    name: 'Penicillin',
    meta: 'Other hospital · updated 27 Oct 2026',
    warning: {
      icon: warningRed,
      text: 'Allergy recorded by Other hospital (27 Oct 2026). Avoid penicillin-class antibiotics.',
    },
  },
}

const DIAGNOSES: HistoryItem[] = [
  { name: 'Atrial fibrillation', meta: 'Other hospital · updated 24 Oct 2026' },
  { name: 'Type 2 diabetes', meta: 'Other hospital · updated 20 Oct 2026' },
]

function allergyItem(name: string): HistoryItem {
  return (
    KNOWN_ALLERGIES[name] ?? {
      name,
      meta: 'Recorded this visit',
      warning: { icon: warningRed, text: `Allergy recorded this visit. Avoid ${name}.` },
    }
  )
}

const records = (n: number) => `${n} ${n === 1 ? 'record' : 'records'}`

export function SummaryScreen() {
  const { state, dispatch } = useAppStore()
  const navigate = useNavigate()
  const patientId = state.route.patientId ?? ALEX_ID
  const patient = state.patients.find((p) => p.id === patientId)

  // Fall back to the Figma content until Patient History has saved allergies.
  const allergyNames = state.alex.allergies.length > 0 ? state.alex.allergies : ['Penicillin']
  const allergies = allergyNames.map(allergyItem)

  const columns: { title: string; items: HistoryItem[] }[] = [
    { title: `Medications (${records(MEDICATIONS.length)})`, items: MEDICATIONS },
    { title: `Allergies (${records(allergies.length)})`, items: allergies },
    { title: `Past diagnoses (${records(DIAGNOSES.length)})`, items: DIAGNOSES },
  ]

  // Which warning popover is open, keyed by item name.
  const [openWarning, setOpenWarning] = useState<string | null>(null)
  const idPrefix = useId()

  useEffect(() => {
    if (!openWarning) return
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element | null
      if (!target?.closest('[data-warning-trigger]')) setOpenWarning(null)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenWarning(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [openWarning])

  const finish = () => {
    dispatch({ type: 'setPatientStatus', id: patientId, status: 'done' })
    dispatch({ type: 'setFilter', filter: 'done' })
    navigate('dashboard')
  }

  return (
    <AppShell variant="patient">
      <h1 className={styles.title}>Patient Visit Summary</h1>
      <p className={styles.subtitle}>
        Everything for {patient?.name ?? 'Alex Morgan'} in one place
      </p>

      <section className={styles.card} aria-labelledby={`${idPrefix}-visit`}>
        <header className={styles.cardHeader}>
          <h2 className={styles.cardTitle} id={`${idPrefix}-visit`}>
            Today&apos;s visit
          </h2>
          <span className={styles.cardMeta}>Today</span>
        </header>
        <dl className={styles.visitList}>
          {VISIT_ROWS.map((row) => (
            <div key={row.label} className={styles.visitRow}>
              <dt className={styles.visitLabel}>{row.label}</dt>
              <dd className={styles.visitValue}>{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        className={`${styles.card} ${styles.historyCard}`}
        aria-labelledby={`${idPrefix}-history`}
      >
        <header className={styles.cardHeader}>
          <h2 className={styles.cardTitle} id={`${idPrefix}-history`}>
            Patient history
          </h2>
          <span className={styles.cardMeta}>From external records</span>
        </header>
        <div className={styles.historyGrid}>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className={styles.columnTitle}>{col.title}</h3>
              <ul className={styles.itemList}>
                {col.items.map((item) => {
                  const popoverId = `${idPrefix}-${item.name.replace(/\W+/g, '-')}`
                  const isOpen = openWarning === item.name
                  return (
                    <li key={item.name} className={styles.item}>
                      <span className={styles.itemName}>
                        {item.name}
                        {item.warning ? (
                          <span className={styles.warningAnchor}>
                            <button
                              type="button"
                              className={styles.warningButton}
                              aria-label={`Warning for ${item.name}`}
                              aria-expanded={isOpen}
                              aria-controls={popoverId}
                              data-warning-trigger
                              onClick={() => setOpenWarning(isOpen ? null : item.name)}
                            >
                              <img src={item.warning.icon} alt="" width={14} height={14} />
                            </button>
                            {isOpen ? (
                              <span id={popoverId} role="status" className={styles.popover}>
                                {item.warning.text}
                              </span>
                            ) : null}
                          </span>
                        ) : null}
                      </span>
                      <span className={styles.itemMeta}>{item.meta}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={finish}>
          Back to my patients
        </button>
      </div>
    </AppShell>
  )
}
