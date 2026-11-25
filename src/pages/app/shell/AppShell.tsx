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
 * The frame every screen sits in: top bar, dark workspace rail, main content,
 * the floating "Ask Companion" button and the Companion side panel.
 */
export function AppShell({ variant, children, aside }: AppShellProps) {
  const { state, dispatch } = useAppStore()

  return (
    <div className={styles.shell}>
      <TopBar variant={variant} />
      <Rail variant={variant} />
      <main className={styles.main} id="main">
        {children}
      </main>
      {aside ? <aside className={styles.aside}>{aside}</aside> : null}

      {state.companion === 'closed' ? (
        <button
          type="button"
          data-companion-opener
          className={styles.askCompanion}
          onClick={() => dispatch({ type: 'setCompanion', companion: 'open' })}
        >
          <img src={chatIcon} alt="" width={20} height={20} />
          Ask Companion
        </button>
      ) : null}

      <CompanionPanel />
    </div>
  )
}
