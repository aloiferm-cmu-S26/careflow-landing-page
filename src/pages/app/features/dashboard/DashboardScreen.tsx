import doneDot from '../../assets/status-done.svg'
import inProgressDot from '../../assets/status-in-progress.svg'
import reviewDot from '../../assets/status-awaiting-review.svg'
import waitingDot from '../../assets/status-waiting.svg'
import { AppShell } from '../../shell/AppShell'
import { STATUS_LABEL } from '../../state/data'
import type { PatientStatus } from '../../state/data'
import { useAppStore, useNavigate } from '../../state/hooks'
import type { Filter } from '../../state/model'
import styles from './DashboardScreen.module.css'

const STATUS_DOT: Record<PatientStatus, string> = {
  waiting: waitingDot,
  'in-progress': inProgressDot,
  'awaiting-review': reviewDot,
  done: doneDot,
}

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'awaiting-review', label: 'Awaiting review' },
  { value: 'done', label: 'Done' },
]

const STATS: { status: PatientStatus; label: string }[] = [
  { status: 'waiting', label: 'Waiting for triage' },
  { status: 'awaiting-review', label: 'Awaiting physician review' },
  { status: 'done', label: 'Charting done' },
]

export function DashboardScreen() {
  const { state, dispatch } = useAppStore()
  const navigate = useNavigate()
  const { patients, filter } = state

  const count = (f: Filter) =>
    f === 'all' ? patients.length : patients.filter((p) => p.status === f).length
  const visible = filter === 'all' ? patients : patients.filter((p) => p.status === filter)
  const filterLabel = FILTERS.find((f) => f.value === filter)?.label

  return (
    <AppShell variant="dashboard">
      <h1 className={styles.title}>My patients</h1>
      <p className={styles.subtitle}>{patients.length} patients assigned to you this shift</p>

      <ul className={styles.stats}>
        <li className={styles.stat}>
          <span className={styles.statValue}>{patients.length}</span>
          <span className={styles.statLabel}>Assigned</span>
        </li>
        {STATS.map((s) => (
          <li key={s.status} className={styles.stat}>
            <span className={styles.statValue}>{count(s.status)}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </li>
        ))}
      </ul>

      <div className={styles.filters} role="group" aria-label="Filter patients by status">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={styles.filter}
            aria-pressed={filter === f.value}
            onClick={() => dispatch({ type: 'setFilter', filter: f.value })}
          >
            {f.label}
            <span className={styles.filterCount}>{count(f.value)}</span>
          </button>
        ))}
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Patient</th>
              <th scope="col">Bed</th>
              <th scope="col">Arrived</th>
              <th scope="col">Reason for visit</th>
              <th scope="col">Status</th>
              <th scope="col">
                <span className={styles.visuallyHidden}>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((p) => (
              <tr key={p.id}>
                <td>
                  <span className={styles.name}>{p.name}</span>
                  <span className={styles.pid}>{p.id}</span>
                </td>
                <td>{p.bed}</td>
                <td>{p.arrived}</td>
                <td>{p.reason}</td>
                <td>
                  <span className={styles.status}>
                    <img src={STATUS_DOT[p.status]} alt="" width={8} height={8} />
                    {STATUS_LABEL[p.status]}
                  </span>
                </td>
                <td className={styles.actionCell}>
                  <button
                    type="button"
                    className={styles.open}
                    aria-label={`Open ${p.name}`}
                    onClick={() => navigate(p.status === 'done' ? 'summary' : 'history', p.id)}
                  >
                    Open
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filter !== 'all' ? (
        <p className={styles.showing}>
          Showing{' '}
          {visible.length === 1 ? `1 of ${patients.length} patients` : `${visible.length} patients`}{' '}
          · filter: {filterLabel}
        </p>
      ) : null}
    </AppShell>
  )
}
