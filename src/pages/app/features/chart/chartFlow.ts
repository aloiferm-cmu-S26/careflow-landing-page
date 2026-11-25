/**
 * Script and state for the Live Chart screen (Figma frames 07 to 14).
 * The visit, the transcript and the draft cards are fictional prototype data.
 */

export interface TranscriptLine {
  speaker: string
  /** Seconds into the visit. The line appears once the visit clock passes it. */
  at: number
  text: string
}

export const TRANSCRIPT: TranscriptLine[] = [
  { speaker: 'Sarah · Nurse', at: 2, text: "Alex, can you tell me how you're feeling?" },
  {
    speaker: 'Alex · Patient',
    at: 8,
    text: "I feel confused. I can't remember which medications I take.",
  },
  {
    speaker: 'Sarah · Nurse',
    at: 23,
    text: "I'll check the records from your pharmacy and the other hospital.",
  },
  {
    speaker: 'Sarah · Nurse',
    at: 36,
    text: 'The records show a possible medication interaction to review.',
  },
  { speaker: 'Alex · Patient', at: 49, text: 'Okay. Please check with the team.' },
  {
    speaker: 'Sarah · Nurse',
    at: 66,
    text: "I've shared it with the care team. We're waiting for physician review.",
  },
]

/** Clock value at which every line has been heard. */
export const LAST_LINE_AT = Math.max(...TRANSCRIPT.map((l) => l.at))

export type CardId = 'symptoms' | 'findings' | 'plan'

export interface CardScript {
  id: CardId
  title: string
  /** What CareFlow drafts from the conversation. */
  draft: string
  /** Index into TRANSCRIPT of the line the card came from. */
  fromLine: number
  origin: string
  confirmedAt: string
  /** Shown under a draft CareFlow may have misheard. */
  check?: string
}

const SYMPTOMS: CardScript = {
  id: 'symptoms',
  title: 'Symptoms',
  draft: 'Patient appears confused on arrival. Unable to recall current medications.',
  fromLine: 1,
  origin: 'From spoken symptoms · 21:44',
  confirmedAt: '21:44',
}

const FINDINGS: CardScript = {
  id: 'findings',
  title: 'Findings',
  // Misheard on purpose: Sarah named two sources, the nurse fixes it with Edit.
  draft: 'Medication history retrieved from one source. Possible interaction flagged for review.',
  fromLine: 2,
  origin: 'From spoken findings · 21:45',
  confirmedAt: '21:45',
  check: 'Check the transcript: Sarah said the pharmacy and the other hospital.',
}

const PLAN: CardScript = {
  id: 'plan',
  title: 'Plan',
  draft: 'Medication concern shared with the care team. Awaiting physician review.',
  fromLine: 5,
  origin: 'From spoken plan · 21:45',
  confirmedAt: '21:46',
}

export const CARDS: CardScript[] = [SYMPTOMS, FINDINGS, PLAN]

export const SAVED_AT = '21:46'

export function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * Describes an edit in words, for example: Changed "one source" to "two sources".
 * Trims the words both versions share at the start and end.
 */
export function describeChange(before: string, after: string): string | null {
  const a = before.trim().split(/\s+/)
  const b = after.trim().split(/\s+/)
  if (a.join(' ') === b.join(' ')) return null
  let start = 0
  while (start < a.length && start < b.length && a[start] === b[start]) start++
  let end = 0
  while (
    end < a.length - start &&
    end < b.length - start &&
    a[a.length - 1 - end] === b[b.length - 1 - end]
  ) {
    end++
  }
  let removed = a.slice(start, a.length - end).join(' ')
  let added = b.slice(start, b.length - end).join(' ')
  // Leave out punctuation both versions share, as in "source." and "sources.".
  const mark = /[.,;:!?]$/.exec(removed)?.[0]
  if (mark && added.endsWith(mark)) {
    removed = removed.slice(0, -1)
    added = added.slice(0, -1)
  }
  if (!removed) return `Added "${added}"`
  if (!added) return `Removed "${removed}"`
  return `Changed "${removed}" to "${added}"`
}

/* State */

export type Phase = 'idle' | 'listening' | 'ended'
export type CardStatus = 'hidden' | 'draft' | 'confirmed'

export interface CardState {
  status: CardStatus
  text: string
  edited: boolean
}

export interface ChartState {
  phase: Phase
  /** Seconds into the visit. */
  clock: number
  cards: Record<CardId, CardState>
  editing: CardId | null
  reviewing: boolean
  saved: boolean
}

const hiddenCards = (): Record<CardId, CardState> => ({
  symptoms: { status: 'hidden', text: SYMPTOMS.draft, edited: false },
  findings: { status: 'hidden', text: FINDINGS.draft, edited: false },
  plan: { status: 'hidden', text: PLAN.draft, edited: false },
})

export const initialChart: ChartState = {
  phase: 'idle',
  clock: 0,
  cards: hiddenCards(),
  editing: null,
  reviewing: false,
  saved: false,
}

/** What the screen looks like once the chart is saved (frame 14). */
export const savedChart: ChartState = {
  phase: 'ended',
  clock: 84,
  cards: {
    symptoms: { status: 'confirmed', text: SYMPTOMS.draft, edited: false },
    findings: {
      status: 'confirmed',
      text: 'Medication history retrieved from two sources. Possible interaction flagged for review.',
      edited: true,
    },
    plan: { status: 'confirmed', text: PLAN.draft, edited: false },
  },
  editing: null,
  reviewing: false,
  saved: true,
}

export type ChartAction =
  | { type: 'start'; reducedMotion: boolean }
  | { type: 'tick' }
  | { type: 'endVisit' }
  | { type: 'confirm'; id: CardId }
  | { type: 'edit'; id: CardId }
  | { type: 'cancelEdit' }
  | { type: 'saveEdit'; id: CardId; text: string }
  | { type: 'review'; open: boolean }
  | { type: 'save' }

/** Shows the next hidden card as a draft, one at a time. */
function revealNext(cards: Record<CardId, CardState>): Record<CardId, CardState> {
  const next = CARDS.find((c) => cards[c.id].status === 'hidden')
  return next ? { ...cards, [next.id]: { ...cards[next.id], status: 'draft' } } : cards
}

export function chartReducer(state: ChartState, action: ChartAction): ChartState {
  switch (action.type) {
    case 'start':
      // Reduced motion: the whole transcript shows at once.
      return { ...state, phase: 'listening', clock: action.reducedMotion ? LAST_LINE_AT + 1 : 0 }
    case 'tick':
      return state.phase === 'listening' ? { ...state, clock: state.clock + 1 } : state
    case 'endVisit':
      return {
        ...state,
        phase: 'ended',
        clock: Math.max(state.clock, LAST_LINE_AT + 1),
        cards: revealNext(state.cards),
      }
    case 'confirm': {
      const cards: Record<CardId, CardState> = {
        ...state.cards,
        [action.id]: { ...state.cards[action.id], status: 'confirmed' },
      }
      return { ...state, cards: revealNext(cards) }
    }
    case 'edit':
      return { ...state, editing: action.id }
    case 'cancelEdit':
      return { ...state, editing: null }
    case 'saveEdit': {
      const card = state.cards[action.id]
      const text = action.text.trim() || card.text
      const changed = text !== card.text
      // Saving an edit confirms the card. A change after saving needs a new save.
      const cards: Record<CardId, CardState> = {
        ...state.cards,
        [action.id]: { status: 'confirmed', text, edited: card.edited || changed },
      }
      return {
        ...state,
        editing: null,
        cards: card.status === 'draft' ? revealNext(cards) : cards,
        saved: state.saved && !changed,
      }
    }
    case 'review':
      return { ...state, reviewing: action.open }
    case 'save':
      return { ...state, reviewing: false, saved: true }
  }
}

export function visibleLines(state: ChartState): TranscriptLine[] {
  if (state.phase === 'idle') return []
  return TRANSCRIPT.filter((l) => l.at <= state.clock)
}

/** Index of the transcript line to highlight, or -1. */
export function highlightedLine(state: ChartState): number {
  if (state.phase === 'listening') return visibleLines(state).length - 1
  const active = CARDS.find(
    (c) => state.editing === c.id || (!state.editing && state.cards[c.id].status === 'draft'),
  )
  return active ? active.fromLine : -1
}

export function countLabel(state: ChartState): string {
  const all = CARDS.map((c) => state.cards[c.id])
  const confirmed = all.filter((c) => c.status === 'confirmed').length
  if (state.saved) return `${confirmed} saved`
  if (state.editing && state.cards[state.editing].status === 'confirmed') {
    return `${confirmed - 1} confirmed · 1 editing`
  }
  const drafts = all.filter((c) => c.status === 'draft').length
  return `${confirmed} confirmed · ${drafts} ${drafts === 1 ? 'draft' : 'drafts'}`
}

export function allConfirmed(state: ChartState): boolean {
  return CARDS.every((c) => state.cards[c.id].status === 'confirmed')
}
