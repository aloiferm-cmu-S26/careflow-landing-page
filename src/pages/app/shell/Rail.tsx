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

const PATIENT_NAV: { screen: Screen; label: string; icon: string }[] = [
  { screen: 'history', label: 'Patient History', icon: historyIcon },
  { screen: 'medication', label: 'Medication Review', icon: medicationIcon },
  { screen: 'chart', label: 'Live Chart', icon: chartIcon },
]

export function Rail({ variant }: { variant: ShellVariant }) {
  const { state } = useAppStore()
  const navigate = useNavigate()
  const current = state.route.screen

  return (
    <nav className={styles.rail} aria-label="Workspace">
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
            My patients
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
                  {item.label}
                </button>
              </li>
            ))
          : null}
      </ul>

      <div className={styles.user}>
        <span className={styles.avatar} aria-hidden="true">
          {NURSE.initials}
        </span>
        {NURSE.name} · {NURSE.role}
      </div>
    </nav>
  )
}
