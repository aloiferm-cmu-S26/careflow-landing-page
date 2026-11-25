import micIcon from './assets/mic.svg'
import { formatClock } from './chartFlow'
import type { Phase, TranscriptLine } from './chartFlow'
import styles from './Conversation.module.css'

interface ConversationProps {
  phase: Phase
  clock: number
  lines: TranscriptLine[]
  highlight: number
  onStart: () => void
  onEnd: () => void
}

/** Right-hand column: the live transcript and the listening capsule. */
export function Conversation({
  phase,
  clock,
  lines,
  highlight,
  onStart,
  onEnd,
}: ConversationProps) {
  return (
    <div className={styles.column}>
      <h2 className={styles.title}>Conversation</h2>
      <p className={styles.sub}>Sarah Lee · Nurse / Alex · Patient</p>

      {phase === 'idle' ? (
        <p className={styles.empty}>The conversation appears here once you start listening.</p>
      ) : (
        <ol className={styles.lines} aria-live="polite" aria-label="Transcript">
          {lines.map((line, i) => (
            <li key={line.at} className={styles.line} data-highlight={i === highlight}>
              <p className={styles.lineHead}>
                <span className={styles.speaker}>{line.speaker}</span>
                <span className={styles.time}>{formatClock(line.at)}</span>
              </p>
              <p className={styles.text}>{line.text}</p>
            </li>
          ))}
        </ol>
      )}

      <div className={styles.dock}>
        {phase === 'idle' ? (
          <button type="button" className={styles.start} onClick={onStart}>
            <img src={micIcon} alt="" width={18} height={18} />
            Start listening
          </button>
        ) : null}

        {phase === 'listening' ? (
          <div className={styles.listeningRow}>
            <p className={styles.listening}>
              <span className={styles.pause} aria-hidden="true">
                <span />
                <span />
              </span>
              Listening ...
              <span className={styles.clock}>
                <span className={styles.visuallyHidden}>Visit time </span>
                {formatClock(clock)}
              </span>
            </p>
            <button type="button" className={styles.end} onClick={onEnd}>
              End visit
            </button>
          </div>
        ) : null}

        {phase === 'ended' ? (
          <p className={styles.ended}>Visit ended · {formatClock(clock)}</p>
        ) : null}
      </div>
    </div>
  )
}
