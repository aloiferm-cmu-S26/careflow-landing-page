import { useEffect, useState } from 'react'
import checkGreen from '../../assets/check.svg'
import dotPending from '../../assets/status-awaiting-review.svg'
import dotUnread from '../../assets/status-waiting.svg'
import { AppShell } from '../../shell/AppShell'
import { ALEX_ID } from '../../state/data'
import { useAppStore, useNavigate } from '../../state/hooks'
import checkTeal from './assets/check-teal.svg'
import dotNotGiven from './assets/dot-not-given.svg'
import dotNotSent from './assets/dot-not-sent.svg'
import infoIcon from './assets/info.svg'
import loadingDot from './assets/loading-dot.svg'
import warningLarge from './assets/warning-large.svg'
import warningMedium from './assets/warning-medium.svg'
import warningSmall from './assets/warning-small.svg'
import { PHYSICIAN_REPLY, usePhysicianReply } from './usePhysicianReply'
import styles from './MedicationScreen.module.css'

/** How long the automatic medication check "runs" before the result shows. */
export const CHECK_DELAY = 1800

/**
 * The six Figma frames (15 to 20) are steps of this one screen:
 * checking -> flagged -> sent -> replied (toast) -> decision -> added.
 */
type Step = 'checking' | 'flagged' | 'sent' | 'replied' | 'decision' | 'added'

const CURRENT_MEDS = [
  { name: 'Metformin 500 mg', source: 'Retail pharmacy', flagged: false },
  { name: 'Warfarin 5 mg', source: 'Other hospital', flagged: true },
  { name: 'Lisinopril 10 mg', source: 'Retail pharmacy', flagged: false },
]

const PROPOSED_STATUS: Partial<Record<Step, { dot: string; label: string }>> = {
  flagged: { dot: dotNotSent, label: 'Not sent yet' },
  sent: { dot: dotPending, label: 'Pending physician review' },
  replied: { dot: dotPending, label: 'Pending physician review' },
  decision: { dot: dotNotGiven, label: 'Not approved by physician' },
  added: { dot: dotNotGiven, label: 'Not given · interaction with warfarin' },
}

export function MedicationScreen() {
  const { state, dispatch } = useAppStore()
  const navigate = useNavigate()
  const [checked, setChecked] = useState(false)
  const medication = state.alex.medication
  const replyRead = state.notifications.find((n) => n.id === PHYSICIAN_REPLY.id)?.read ?? false

  usePhysicianReply()

  useEffect(() => {
    if (medication !== 'none' || checked) return
    const timer = window.setTimeout(() => setChecked(true), CHECK_DELAY)
    return () => window.clearTimeout(timer)
  }, [medication, checked])

  // Progress lives in global state so leaving and coming back keeps the step.
  const step: Step =
    medication === 'added'
      ? 'added'
      : medication === 'replied'
        ? replyRead
          ? 'decision'
          : 'replied'
        : medication === 'sent'
          ? 'sent'
          : checked
            ? 'flagged'
            : 'checking'

  const openCompanion = () => dispatch({ type: 'setCompanion', companion: 'open' })

  const sendToCareTeam = () => {
    dispatch({ type: 'updateAlex', patch: { medication: 'sent' } })
    dispatch({ type: 'setPatientStatus', id: ALEX_ID, status: 'awaiting-review' })
  }

  const viewReply = () => dispatch({ type: 'readNotification', id: PHYSICIAN_REPLY.id })

  const addToPlan = () => {
    dispatch({ type: 'updateAlex', patch: { medication: 'added' } })
    dispatch({ type: 'setPatientStatus', id: ALEX_ID, status: 'in-progress' })
  }

  const status = PROPOSED_STATUS[step]
  const declined = step === 'decision' || step === 'added'

  return (
    <AppShell variant="patient">
      <h1 className={styles.title}>Medication Review</h1>
      <p className={styles.subtitle}>Review patient history alongside the proposed medication.</p>

      <div className={styles.result} aria-live="polite">
        {step === 'checking' ? (
          <p className={styles.checking}>
            <span className={styles.loadingDots} aria-hidden="true">
              <img src={loadingDot} alt="" width={4} height={4} />
              <img src={loadingDot} alt="" width={4} height={4} />
              <img src={loadingDot} alt="" width={4} height={4} />
            </span>
            Checking Ketorolac 30 mg IV against Alex&apos;s 6 verified history records...
          </p>
        ) : null}

        {step === 'flagged' || step === 'sent' || step === 'replied' ? (
          <section
            className={`${styles.card} ${styles.interaction}`}
            aria-labelledby="interaction-title"
          >
            <div className={styles.cardBody}>
              <h2 id="interaction-title" className={styles.interactionTitle}>
                {/* Frame 16 uses a 24px icon, frames 17 and 18 a 16px one. */}
                {step === 'flagged' ? (
                  <img
                    className={styles.iconLarge}
                    src={warningLarge}
                    alt=""
                    width={24}
                    height={24}
                  />
                ) : (
                  <img src={warningMedium} alt="" width={16} height={16} />
                )}
                Possible drug interaction, review needed
              </h2>
              <p className={styles.pair}>Warfarin + Ketorolac</p>
              <p className={styles.explain}>
                Both medications increase the risk of bleeding when used together. Review with the
                care team.{' '}
                <button type="button" className={styles.textLink} onClick={openCompanion}>
                  Why is this a concern?
                </button>
              </p>
              <p className={styles.source}>
                Source: FDA · Drug interaction reference (illustrative)
                <button type="button" className={styles.textLink} onClick={openCompanion}>
                  View source
                </button>
              </p>
            </div>
            <div className={styles.cardAction}>
              {step === 'flagged' ? (
                <button type="button" className={styles.primary} onClick={sendToCareTeam}>
                  Send to care team
                </button>
              ) : (
                <p className={styles.done}>
                  <img src={checkGreen} alt="" width={16} height={16} />
                  Sent to care team
                </p>
              )}
            </div>
          </section>
        ) : null}

        {declined ? (
          <>
            {step === 'added' ? (
              <p className={styles.banner} role="status">
                <img src={checkTeal} alt="" width={16} height={16} />
                Treatment plan updated at 21:53
              </p>
            ) : null}
            <section
              className={`${styles.card} ${styles.decision}`}
              aria-labelledby="decision-title"
            >
              <div className={styles.cardBody}>
                <h2 id="decision-title" className={styles.decisionTitle}>
                  <img src={checkTeal} alt="" width={16} height={16} />
                  Physician decision
                </h2>
                <p className={styles.decisionMeta}>Dr. Patel · 21:52</p>
                <p className={styles.decisionText}>
                  Do not give ketorolac with warfarin. Give acetaminophen 1 g by mouth instead.
                </p>
              </div>
              <div className={styles.cardAction}>
                {step === 'decision' ? (
                  <button type="button" className={styles.primary} onClick={addToPlan}>
                    Add to treatment plan
                  </button>
                ) : (
                  <p className={`${styles.done} ${styles.doneTight}`}>
                    <img src={checkGreen} alt="" width={16} height={16} />
                    Added to treatment plan
                  </p>
                )}
              </div>
            </section>
          </>
        ) : null}
      </div>

      <div className={styles.columns}>
        <section className={styles.card} aria-labelledby="current-title">
          <h2 id="current-title" className={styles.cardTitle}>
            Current medications
          </h2>
          <ul className={styles.meds}>
            {CURRENT_MEDS.map((med) => (
              <li key={med.name} className={styles.med}>
                <span className={styles.medName}>
                  {/* Frames 16 to 20 set the flagged drug in medium weight. */}
                  <span
                    className={med.flagged && step !== 'checking' ? styles.medFlagged : undefined}
                  >
                    {med.name}
                  </span>
                  {med.flagged ? (
                    <img
                      className={styles.medWarning}
                      src={warningSmall}
                      alt="Interaction warning"
                      width={14}
                      height={14}
                    />
                  ) : null}
                  <InfoButton label={`About ${med.name}`} onClick={openCompanion} />
                </span>
                <span className={styles.medSource}>{med.source}</span>
              </li>
            ))}
          </ul>
          <p className={styles.historyLabel}>Relevant history</p>
          <p className={styles.historyValue}>1 allergy entry · 2 past diagnoses</p>
        </section>

        <section className={`${styles.card} ${styles.proposed}`} aria-labelledby="proposed-title">
          <h2 id="proposed-title" className={styles.cardTitle}>
            Proposed medication
          </h2>
          <div className={styles.field}>
            {declined ? <s>Ketorolac 30 mg IV</s> : <span>Ketorolac 30 mg IV</span>}
            <InfoButton label="About Ketorolac 30 mg IV" onClick={openCompanion} />
          </div>
          {status ? (
            <>
              <p className={styles.status}>
                <img src={status.dot} alt="" width={8} height={8} />
                {status.label}
              </p>
              <hr className={styles.hairline} />
              <p className={styles.compare}>Compare with the current medication list.</p>
            </>
          ) : (
            <>
              <p className={styles.prefilled}>Prefilled from Dr. Patel&apos;s order · 21:47</p>
              <p className={`${styles.compare} ${styles.compareBottom}`}>
                Compare with the current medication list.
              </p>
            </>
          )}
        </section>
      </div>

      {step === 'added' ? (
        <section className={`${styles.card} ${styles.plan}`} aria-labelledby="plan-title">
          <h2 id="plan-title" className={styles.cardTitle}>
            Treatment plan
          </h2>
          <div className={styles.planItem}>
            <img src={checkGreen} alt="" width={16} height={16} />
            <div className={styles.planText}>
              <p className={styles.planName}>
                Acetaminophen 1 g by mouth
                <InfoButton label="About Acetaminophen 1 g by mouth" onClick={openCompanion} />
              </p>
              <p className={styles.planNote}>Ketorolac not given: interaction with warfarin</p>
            </div>
            <p className={styles.planMeta}>Ordered by Dr. Patel · added 21:53</p>
          </div>
        </section>
      ) : null}

      <div className={styles.footer}>
        <p className={styles.note}>Care team makes the treatment decision.</p>
        {step === 'added' ? (
          <div className={styles.footerActions}>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => navigate('dashboard')}
            >
              Back to my patients
            </button>
            <button type="button" className={styles.primary} onClick={() => navigate('summary')}>
              View visit summary
            </button>
          </div>
        ) : null}
      </div>

      {step === 'replied' ? (
        <div className={styles.toast} role="status" aria-label="New notification">
          <img className={styles.toastDot} src={dotUnread} alt="" width={8} height={8} />
          <div className={styles.toastBody}>
            <p className={styles.toastHead}>
              <span className={styles.toastTitle}>{PHYSICIAN_REPLY.title}</span>
              <span className={styles.toastTime}>21:52</span>
            </p>
            <p className={styles.toastText}>{PHYSICIAN_REPLY.body}</p>
            <button
              type="button"
              className={`${styles.primary} ${styles.toastButton}`}
              onClick={viewReply}
            >
              View
            </button>
          </div>
        </div>
      ) : null}
    </AppShell>
  )
}

function InfoButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className={styles.info} aria-label={label} onClick={onClick}>
      <img src={infoIcon} alt="" width={16} height={16} />
    </button>
  )
}
