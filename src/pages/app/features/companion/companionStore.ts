import { useSyncExternalStore } from 'react'
import { ANSWERS, matchAnswer } from './companionContent'
import type { AnswerId } from './companionContent'

/**
 * The Companion conversation lives in a small module store, not in the panel
 * component, because every screen renders its own AppShell. Navigating
 * between screens remounts the panel, and the nurse should still see the same
 * conversation. It resets on page reload, like the rest of the prototype.
 */

export interface Exchange {
  id: number
  question: string
  answer: AnswerId
  /** False while the typing indicator shows. */
  revealed: boolean
}

export type CompanionView = 'prompts' | 'conversation' | 'source'

export interface CompanionLocalState {
  exchanges: Exchange[]
  view: CompanionView
  /** Exchange whose source is open in the source view. */
  sourceOf: number | null
  draft: string
}

const TYPING_MS = 600

const initial: CompanionLocalState = {
  exchanges: [],
  view: 'prompts',
  sourceOf: null,
  draft: '',
}

let state = initial
let nextId = 1
const timers = new Set<ReturnType<typeof setTimeout>>()
const listeners = new Set<() => void>()

function set(patch: Partial<CompanionLocalState>) {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  )
}

function reveal(id: number) {
  set({ exchanges: state.exchanges.map((e) => (e.id === id ? { ...e, revealed: true } : e)) })
}

export const companionActions = {
  setDraft: (draft: string) => set({ draft }),

  ask(question: string) {
    const text = question.trim()
    if (!text) return
    const last = state.exchanges.at(-1)
    const answer = matchAnswer(text, last ? ANSWERS[last.answer].topic : undefined)
    const id = nextId++
    const instant = prefersReducedMotion()
    set({
      exchanges: [...state.exchanges, { id, question: text, answer, revealed: instant }],
      view: 'conversation',
      sourceOf: null,
      draft: '',
    })
    if (!instant) {
      const t = setTimeout(() => {
        timers.delete(t)
        reveal(id)
      }, TYPING_MS)
      timers.add(t)
    }
  },

  showPrompts: () => set({ view: 'prompts', sourceOf: null }),
  showSource: (exchangeId: number) => set({ view: 'source', sourceOf: exchangeId }),
  backToConversation: () => set({ view: 'conversation', sourceOf: null }),
}

/** For tests. */
export function resetCompanionStore() {
  timers.forEach(clearTimeout)
  timers.clear()
  nextId = 1
  state = initial
  listeners.forEach((l) => l())
}

export function useCompanionStore(): CompanionLocalState {
  return useSyncExternalStore(subscribe, () => state)
}
