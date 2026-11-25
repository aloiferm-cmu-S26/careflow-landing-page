import allergyIcon from '../assets/allergy-warning.svg'
import checkIcon from '../assets/check.svg'
import logoIcon from '../assets/logo-cross.svg'
import { ALEX_ID, SHIFT_LABEL } from '../state/data'
import { useAppStore } from '../state/hooks'
import { Notifications } from './Notifications'
import type { ShellVariant } from './AppShell'
import styles from './TopBar.module.css'

export function TopBar({ variant }: { variant: ShellVariant }) {
  const { state } = useAppStore()
  const patientId = state.route.patientId ?? ALEX_ID
  const patient = state.patients.find((p) => p.id === patientId)

  return (
    <header className={styles.bar}>
      <div className={styles.brand}>
        <span className={styles.logo}>
          <img src={logoIcon} alt="" width={16} height={16} />
        </span>
        <span className={variant === 'dashboard' ? styles.brandName : styles.brandRecord}>
          {variant === 'dashboard' ? 'CareFlow' : 'Patient record'}
        </span>
      </div>

      {variant === 'dashboard' || !patient ? (
        <div className={styles.titleBlock}>
          <p className={styles.title}>Emergency department</p>
          <p className={styles.sub}>{SHIFT_LABEL}</p>
        </div>
      ) : (
        <>
          <div className={styles.titleBlock}>
            <p className={styles.title}>{patient.name}</p>
            <p className={styles.sub}>DOB {patient.dob}</p>
          </div>
          <div className={styles.idBlock}>
            <p className={styles.patientId}>Patient ID {patient.id}</p>
            <p className={styles.sub}>Emergency department</p>
          </div>
          {state.alex.allergies.map((a) => (
            <span key={a} className={styles.allergy}>
              <img src={allergyIcon} alt="" width={14} height={14} />
              Allergy: {a}
            </span>
          ))}
          <p className={styles.identity}>
            {state.alex.identityConfirmed ? (
              <>
                <img src={checkIcon} alt="" width={16} height={16} />
                Identity confirmed
              </>
            ) : (
              <>
                <span className={styles.pendingDot} aria-hidden="true" />
                Identity not confirmed
              </>
            )}
          </p>
        </>
      )}

      <Notifications />
    </header>
  )
}
