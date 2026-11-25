import { useEffect, useId, useRef } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { useAppStore } from '../../state/hooks'
import type { CompanionState } from '../../state/model'
import chatIcon from './assets/companion-chat.svg'
import closeIcon from './assets/close.svg'
import externalLinkIcon from './assets/external-link.svg'
import { ANSWERS, SOURCES, SOURCE_DISCLAIMER, SUGGESTED_PROMPTS } from './companionContent'
import { companionActions, useCompanionStore } from './companionStore'
import type { Exchange } from './companionStore'
import styles from './CompanionPanel.module.css'

/**
 * Companion state seen on the last commit. Module level because each screen
 * remounts the panel; this keeps focus from jumping into the panel on every
 * navigation while it stays open.
 */
let lastSeen: CompanionState = 'closed'

/** The shell's "Ask Companion" button, to hand focus back on close. */
function findOpener(): HTMLElement | null {
  const tagged = document.querySelector<HTMLElement>('[data-companion-opener]')
  if (tagged) return tagged
  return (
    Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find((b) =>
      /^\s*(Ask )?Companion\s*$/.test(b.textContent ?? ''),
    ) ?? null
  )
}

/**
 * Nurse Companion: a non-modal side panel with scripted clinical answers
 * (Figma O1 to O9) and a minimized mint button (frame "Minimize the Companion").
 */
export function CompanionPanel() {
  const { state, dispatch } = useAppStore()
  const companion = state.companion
  const local = useCompanionStore()
  const titleId = useId()
  const inputId = useId()

  const panelRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const reopenRef = useRef<HTMLButtonElement>(null)
  /** Selector (inside the panel) to focus after the next render. */
  const focusNext = useRef<string | null>(null)

  const setCompanion = (value: CompanionState) =>
    dispatch({ type: 'setCompanion', companion: value })

  // Focus: into the panel on open, onto the reopen button on minimize, and back
  // to the shell button on close.
  useEffect(() => {
    const prev = lastSeen
    lastSeen = companion
    if (prev === companion) return
    if (companion === 'open') panelRef.current?.focus()
    else if (companion === 'minimized') reopenRef.current?.focus()
    else findOpener()?.focus()
  }, [companion])

  useEffect(() => {
    if (companion !== 'open') return
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented)
        dispatch({ type: 'setCompanion', companion: 'closed' })
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [companion, dispatch])

  // Keep the newest message in view.
  const lastExchange = local.exchanges.at(-1)
  useEffect(() => {
    if (local.view !== 'conversation') return
    const body = bodyRef.current
    if (body) body.scrollTop = body.scrollHeight
  }, [local.view, local.exchanges.length, lastExchange?.revealed])

  useEffect(() => {
    if (!focusNext.current) return
    panelRef.current?.querySelector<HTMLElement>(focusNext.current)?.focus()
    focusNext.current = null
  })

  // Grow the question box with its text (Figma O5: 44px empty, taller with two lines).
  useEffect(() => {
    const input = inputRef.current
    if (!input) return
    input.style.height = 'auto'
    input.style.height = `${input.scrollHeight}px`
  }, [local.draft, local.view, companion])

  if (companion === 'closed') return null

  if (companion === 'minimized') {
    return (
      <button
        ref={reopenRef}
        type="button"
        className={styles.reopen}
        aria-label="Reopen Nurse Companion"
        onClick={() => setCompanion('open')}
      >
        <img src={chatIcon} alt="" width={16} height={16} />
      </button>
    )
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    companionActions.ask(local.draft)
  }

  const onInputKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      companionActions.ask(local.draft)
    }
  }

  const sourceExchange = local.exchanges.find((x) => x.id === local.sourceOf)
  const sourceId = sourceExchange ? ANSWERS[sourceExchange.answer].source : undefined
  const source = sourceId ? SOURCES[sourceId] : undefined
  const pending = lastExchange && !lastExchange.revealed

  return (
    <div
      ref={panelRef}
      className={styles.panel}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      tabIndex={-1}
    >
      <header className={styles.header}>
        <span className={styles.badge}>
          <img src={chatIcon} alt="" width={16} height={16} />
        </span>
        <h2 id={titleId} className={styles.title}>
          Nurse Companion
        </h2>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="Minimize Companion"
          onClick={() => setCompanion('minimized')}
        >
          <span className={styles.minus} aria-hidden="true">
            −
          </span>
        </button>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="Close Companion"
          onClick={() => setCompanion('closed')}
        >
          <img src={closeIcon} alt="" width={16} height={16} />
        </button>
      </header>

      <div ref={bodyRef} className={styles.body}>
        {local.view === 'prompts' ? (
          <section aria-labelledby={`${titleId}-ask`}>
            <h3 id={`${titleId}-ask`} className={styles.askTitle}>
              Ask a clinical question
            </h3>
            <p className={styles.askLead}>
              Answers use Alex&apos;s verified history and cite a source.
            </p>
            <p className={styles.suggestedLabel} id={`${titleId}-suggested`}>
              Suggested for this patient
            </p>
            <ul className={styles.prompts} aria-labelledby={`${titleId}-suggested`}>
              {SUGGESTED_PROMPTS.map((prompt) => (
                <li key={prompt}>
                  <button
                    type="button"
                    className={styles.prompt}
                    data-focus="prompt"
                    onClick={() => companionActions.ask(prompt)}
                  >
                    {prompt}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {local.view === 'conversation' ? (
          <div className={styles.thread}>
            <ol className={styles.messages} aria-label="Conversation" aria-live="polite">
              {local.exchanges.map((x) => (
                <ExchangeItem
                  key={x.id}
                  exchange={x}
                  onViewSource={() => {
                    focusNext.current = '[data-focus="back"]'
                    companionActions.showSource(x.id)
                  }}
                />
              ))}
            </ol>
            {!pending ? (
              <button
                type="button"
                className={styles.secondary}
                onClick={() => {
                  focusNext.current = '[data-focus="prompt"]'
                  companionActions.showPrompts()
                }}
              >
                Ask another question
              </button>
            ) : null}
          </div>
        ) : null}

        {local.view === 'source' ? (
          <div className={styles.sourceView}>
            <button
              type="button"
              className={styles.secondary}
              data-focus="back"
              onClick={() => {
                focusNext.current = `[data-source-for="${local.sourceOf}"]`
                companionActions.backToConversation()
              }}
            >
              Back to conversation
            </button>
            {source ? (
              <article className={styles.sourceCard} aria-labelledby={`${titleId}-source`}>
                <h3 id={`${titleId}-source`} className={styles.sourceTitle}>
                  {source.title}
                </h3>
                <p className={styles.sourceMeta}>Source type: {source.type}</p>
                {source.publisher ? (
                  <>
                    <p className={styles.sourceMetaTight}>Publisher: {source.publisher}</p>
                    {/* Placeholder in Figma: there is no real reference to open yet. */}
                    <button type="button" className={styles.refLink} aria-disabled="true">
                      Open official reference
                      <img src={externalLinkIcon} alt="" width={12} height={12} />
                      <span className={styles.visuallyHidden}> (placeholder)</span>
                    </button>
                  </>
                ) : null}
                <div className={source.publisher ? styles.sourceBodyAfterLink : styles.sourceBody}>
                  {source.body.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
                <p className={styles.disclaimer}>
                  {SOURCE_DISCLAIMER[0]}
                  <br />
                  {SOURCE_DISCLAIMER[1]}
                </p>
              </article>
            ) : null}
          </div>
        ) : null}
      </div>

      <footer className={styles.footer}>
        {local.view !== 'source' ? (
          <form className={styles.inputBox} onSubmit={submit}>
            <label htmlFor={inputId} className={styles.visuallyHidden}>
              Ask a question
            </label>
            <textarea
              ref={inputRef}
              id={inputId}
              className={styles.input}
              rows={1}
              placeholder="Ask a question…"
              value={local.draft}
              onChange={(e) => companionActions.setDraft(e.target.value)}
              onKeyDown={onInputKey}
            />
            {local.draft.trim() ? (
              <button type="submit" className={styles.send}>
                Send
              </button>
            ) : null}
          </form>
        ) : null}
        <p className={styles.note}>Answers include sources for review.</p>
      </footer>
    </div>
  )
}

function ExchangeItem({
  exchange,
  onViewSource,
}: {
  exchange: Exchange
  onViewSource: () => void
}) {
  const answer = ANSWERS[exchange.answer]
  return (
    <li className={styles.exchange}>
      <p className={styles.question}>
        <span className={styles.visuallyHidden}>You asked: </span>
        {exchange.question}
      </p>
      {exchange.revealed ? (
        <div className={styles.answer}>
          <p className={styles.answerText}>{answer.text}</p>
          {answer.source ? (
            <div className={styles.answerSource}>
              <span>{answer.sourceLabel}</span>
              <button
                type="button"
                className={styles.viewSource}
                data-source-for={exchange.id}
                onClick={onViewSource}
              >
                View source
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className={styles.typing} role="status" aria-label="Companion is answering">
          <span />
          <span />
          <span />
        </div>
      )}
    </li>
  )
}
