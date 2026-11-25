import { useState } from 'react'
import bellIcon from '../assets/bell.svg'
import { useAppStore } from '../state/hooks'
import styles from './Notifications.module.css'

/**
 * Bell button in the top bar. Unread notifications show a dot; opening the
 * list and tapping one takes the nurse to the screen it is about.
 */
export function Notifications() {
  const { state, dispatch } = useAppStore()
  const [open, setOpen] = useState(false)
  const unread = state.notifications.filter((n) => !n.read).length

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.bell}
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <img src={bellIcon} alt="" width={20} height={20} />
        {unread ? (
          <span className={styles.dot} aria-hidden="true">
            {unread}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className={styles.menu} role="menu">
          {state.notifications.length === 0 ? (
            <p className={styles.empty}>No notifications</p>
          ) : (
            state.notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                role="menuitem"
                className={styles.item}
                onClick={() => {
                  dispatch({ type: 'readNotification', id: n.id })
                  dispatch({ type: 'navigate', route: n.route })
                  setOpen(false)
                }}
              >
                <span className={styles.itemTitle}>{n.title}</span>
                <span className={styles.itemBody}>{n.body}</span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  )
}
