import backIcon from '../assets/nav-back.svg'
import chartIcon from '../assets/nav-chart.svg'
import historyIcon from '../assets/nav-history.svg'
import medicationIcon from '../assets/nav-medication.svg'
import menuIcon from '../assets/nav-menu.svg'
import { NURSE } from '../state/data'
import { useAppStore, useNavigate } from '../state/hooks'
import type { Screen } from '../state/model'
import type { ShellVariant } from './AppShell'
import styles from './Rail.module.css'

/** `short` is the label in the phone tab bar, where space is tight. */
const PATIENT_NAV: { screen: Screen; label: string; short: string; icon: string }[] = [
  { screen: 'history', label: 'Patient History', short: 'History', icon: historyIcon },
  { screen: 'medication', label: 'Medication Review', short: 'Medication', icon: medicationIcon },
  { screen: 'chart', label: 'Live Chart', short: 'Live Chart', icon: chartIcon },
]

export function Rail({ variant }: { variant: ShellVariant }) {
  const { state } = useAppStore()
  const navigate = useNavigate()
  const current = state.route.screen

  return (
    <nav className={styles.rail} aria-label="Workspace" data-variant={variant}>
      <p className={styles.heading}>Workspace</p>
      <ul className={styles.list}>
        <li>
          <button
            type="button"
            className={styles.item}
            aria-current={variant === 'dashboard' ? 'page' : undefined}
            onClick={() => navigate('dashboard')}
          >
            <img
              src={variant === 'dashboard' ? menuIcon : backIcon}
              alt=""
              width={16}
              height={16}
            />
            <span className={styles.label}>My patients</span>
            <span className={styles.short} aria-hidden="true">
              Patients
            </span>
          </button>
        </li>
        {variant === 'patient'
          ? PATIENT_NAV.map((item) => (
              <li key={item.screen}>
                <button
                  type="button"
                  className={styles.item}
                  aria-current={current === item.screen ? 'page' : undefined}
                  onClick={() => navigate(item.screen, state.route.patientId)}
                >
                  <img src={item.icon} alt="" width={16} height={16} />
                  <span className={styles.label}>{item.label}</span>
                  <span className={styles.short} aria-hidden="true">
                    {item.short}
                  </span>
                </button>
              </li>
            ))
          : null}
      </ul>

      <div className={styles.user}>
        <span className={styles.avatar} aria-hidden="true">
          {NURSE.initials}
        </span>
        <span className={styles.userName}>
          {NURSE.name} · {NURSE.role}
        </span>
      </div>
    </nav>
  )
}
