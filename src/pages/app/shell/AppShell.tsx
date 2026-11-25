import type { ReactNode } from 'react'
import chatIcon from '../assets/chat.svg'
import { CompanionPanel } from '../features/companion/CompanionPanel'
import { useAppStore } from '../state/hooks'
import { Rail } from './Rail'
import { TopBar } from './TopBar'
import styles from './AppShell.module.css'

export type ShellVariant = 'dashboard' | 'patient'

interface AppShellProps {
  variant: ShellVariant
  children: ReactNode
  /** Optional right-hand column, like the Live Chart conversation. */
  aside?: ReactNode
}

/**
 * The frame every screen sits in: top bar, workspace rail, main content, the
 * floating "Ask Companion" button and the Companion side panel.
 *
 * Responsive (breakpoints in app.css): wide screens show the full rail and an
 * aside column; medium screens use an icon rail and stack the aside under the
 * main content; narrow screens move the rail to a bottom tab bar.
 */
export function AppShell({ variant, children, aside }: AppShellProps) {
  const { state, dispatch } = useAppStore()

  return (
    <div className={styles.shell} data-variant={variant}>
      <TopBar variant={variant} />
      <Rail variant={variant} />
      <div className={aside ? `${styles.content} ${styles.withAside}` : styles.content}>
        <main className={styles.main} id="main">
          {children}
        </main>
        {aside ? <aside className={styles.aside}>{aside}</aside> : null}
      </div>

      {state.companion === 'closed' ? (
        <button
          type="button"
          data-companion-opener
          className={styles.askCompanion}
          onClick={() => dispatch({ type: 'setCompanion', companion: 'open' })}
        >
          <img src={chatIcon} alt="" width={20} height={20} />
          <span className={styles.askLabel}>Ask Companion</span>
        </button>
      ) : null}

      <CompanionPanel />
    </div>
  )
}
