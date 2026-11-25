/**
 * Canned Companion content, copied from the Figma frames O1 to O9. The
 * prototype has no real AI: questions are matched to these answers by keyword.
 * All drug and patient facts are illustrative and fictional.
 */

export type SourceId =
  'warfarin' | 'metformin' | 'lisinopril' | 'ketorolac' | 'acetaminophen' | 'allergy' | 'history'

export interface SourceDetail {
  title: string
  type: 'Drug Reference' | 'Patient History'
  /** Drug references show a publisher and an (inactive) official link. */
  publisher?: string
  body: string[]
}

export type AnswerId =
  | 'warfarin'
  | 'warfarinSideEffects'
  | 'warfarinKetorolac'
  | 'metformin'
  | 'metforminSideEffects'
  | 'lisinopril'
  | 'ketorolac'
  | 'acetaminophen'
  | 'allergies'
  | 'history'
  | 'boundaries'
  | 'uncertain'

export interface CannedAnswer {
  text: string
  /** Label under the answer, for example "Source: Patient history · 6 verified records". */
  sourceLabel?: string
  source?: SourceId
  /** Topic a follow-up like "What are its side effects?" refers to. */
  topic?: Topic
}

export type Topic = 'warfarin' | 'metformin' | 'lisinopril' | 'ketorolac' | 'acetaminophen'

export const SOURCE_DISCLAIMER = [
  'Illustrative source information for UC-7.',
  'Fictional patient data; not a live clinical source.',
]

const FDA = 'U.S. FDA (illustrative)'

export const SOURCES: Record<SourceId, SourceDetail> = {
  warfarin: {
    title: 'Warfarin · bleeding precautions',
    type: 'Drug Reference',
    publisher: FDA,
    body: [
      'Warfarin raises bleeding risk. Ketorolac is contraindicated in patients at high risk of bleeding, so check with the physician first.',
    ],
  },
  metformin: {
    title: 'Metformin · common side effects',
    type: 'Drug Reference',
    publisher: FDA,
    body: [
      'Common side effects include nausea, diarrhea and stomach discomfort. This excerpt is illustrative and does not replace a full drug reference.',
    ],
  },
  lisinopril: {
    title: 'Lisinopril - common side effects',
    type: 'Drug Reference',
    publisher: FDA,
    body: [
      'Lisinopril lowers blood pressure. Common side effects include dry cough, dizziness and headache. Seek help for swelling of the face or lips.',
    ],
  },
  ketorolac: {
    title: 'Ketorolac - common side effects',
    type: 'Drug Reference',
    publisher: FDA,
    body: [
      'Ketorolac is a pain medication for short-term use. It can increase bleeding risk and may affect the stomach and kidneys. Common side effects include stomach pain, nausea and headache.',
    ],
  },
  acetaminophen: {
    title: 'Acetaminophen - common side effects',
    type: 'Drug Reference',
    publisher: FDA,
    body: [
      'Acetaminophen is used for pain and fever. Side effects are uncommon at normal doses, but too much can harm the liver, so do not exceed the ordered dose.',
    ],
  },
  allergy: {
    title: 'Alex · allergy record',
    type: 'Patient History',
    body: [
      'Penicillin allergy, recorded by Other hospital on 27 Oct 2026. Avoid penicillin-class antibiotics.',
    ],
  },
  history: {
    title: 'Alex · verified history summary',
    type: 'Patient History',
    body: [
      'Atrial fibrillation and type 2 diabetes. Takes warfarin 5 mg, metformin 500 mg and lisinopril 10 mg. Allergic to penicillin.',
      'Source context: 6 verified records.',
    ],
  },
}

export const ANSWERS: Record<AnswerId, CannedAnswer> = {
  warfarin: {
    text: 'Warfarin raises bleeding risk. Ketorolac is contraindicated in patients at high risk of bleeding, so check with the physician first. Common side effects include bruising and bleeding.',
    sourceLabel: 'Source: FDA drug label · Warfarin (illustrative)',
    source: 'warfarin',
    topic: 'warfarin',
  },
  warfarinSideEffects: {
    text: 'Common side effects include bruising and bleeding. More serious bleeding symptoms require prompt clinical attention.',
    topic: 'warfarin',
  },
  warfarinKetorolac: {
    text: 'Both medications can increase the risk of bleeding. Using them together raises that risk, so the physician should review before ketorolac is given.',
    sourceLabel: 'Source: FDA · Drug interaction reference (illustrative)',
    source: 'warfarin',
    topic: 'ketorolac',
  },
  metformin: {
    text: 'Metformin lowers blood sugar in type 2 diabetes. Common side effects include nausea, diarrhea and stomach discomfort.',
    sourceLabel: 'Source: FDA drug label · Metformin (illustrative)',
    source: 'metformin',
    topic: 'metformin',
  },
  metforminSideEffects: {
    text: 'Common side effects of metformin include nausea, diarrhea and stomach discomfort. Check the drug reference for full safety information.',
    sourceLabel: 'Source: Illustrative drug reference',
    source: 'metformin',
    topic: 'metformin',
  },
  lisinopril: {
    text: 'Lisinopril lowers blood pressure. Common side effects include dry cough, dizziness and headache. Seek help for swelling of the face or lips.',
    sourceLabel: 'Source: FDA drug label · Lisinopril (illustrative)',
    source: 'lisinopril',
    topic: 'lisinopril',
  },
  ketorolac: {
    text: 'Ketorolac is a pain medication for short-term use. It can increase bleeding risk and may affect the stomach and kidneys. Common side effects include stomach pain, nausea and headache.',
    sourceLabel: 'Source: FDA drug label · Ketorolac (illustrative)',
    source: 'ketorolac',
    topic: 'ketorolac',
  },
  acetaminophen: {
    text: 'Acetaminophen is used for pain and fever. Side effects are uncommon at normal doses, but too much can harm the liver, so do not exceed the ordered dose.',
    sourceLabel: 'Source: FDA drug label · Acetaminophen (illustrative)',
    source: 'acetaminophen',
    topic: 'acetaminophen',
  },
  allergies: {
    text: 'Yes. Penicillin allergy, recorded by Other hospital on 27 Oct 2026. Avoid penicillin-class antibiotics.',
    sourceLabel: 'Source: Patient history · Other hospital',
    source: 'allergy',
  },
  history: {
    text: 'Atrial fibrillation and type 2 diabetes. Takes warfarin 5 mg, metformin 500 mg and lisinopril 10 mg. Allergic to penicillin.',
    sourceLabel: 'Source: Patient history · 6 verified records',
    source: 'history',
  },
  boundaries: {
    text: 'I can provide general information about warfarin, but I cannot make treatment decisions. Please consult the responsible clinician and follow the appropriate clinical protocol. Final clinical judgment remains with the healthcare professional.',
  },
  uncertain: {
    text: "I'm unable to verify the current hospital-specific protocol from the available sources. Please check your hospital's official guidelines or confirm with the appropriate clinical team.",
  },
}

/** Follow-ups about the previous topic ("What are its common side effects?"). */
const SIDE_EFFECTS_ANSWER: Record<Topic, AnswerId> = {
  warfarin: 'warfarinSideEffects',
  metformin: 'metforminSideEffects',
  lisinopril: 'lisinopril',
  ketorolac: 'ketorolac',
  acetaminophen: 'acetaminophen',
}

export const SUGGESTED_PROMPTS = [
  'What should I know about warfarin?',
  'Does Alex have any allergies?',
  "Summarise Alex's history",
]

const has = (q: string, ...words: string[]) => words.some((w) => q.includes(w))

/**
 * Picks the closest canned answer. `previousTopic` lets short follow-ups such
 * as "What are its common side effects?" answer about the last drug discussed.
 */
export function matchAnswer(question: string, previousTopic?: Topic): AnswerId {
  const q = question.toLowerCase()

  if (
    /\bdos(e|es|age|ing)\b/.test(q) ||
    /\bshould i (give|stop|start|hold|increase|decrease|administer|change)\b/.test(q)
  )
    return 'boundaries'

  const sideEffects = has(q, 'side effect', 'side-effect', 'adverse')

  if (q.includes('warfarin') && q.includes('ketorolac')) return 'warfarinKetorolac'
  if (q.includes('warfarin')) return sideEffects ? 'warfarinSideEffects' : 'warfarin'
  if (q.includes('metformin')) return sideEffects ? 'metforminSideEffects' : 'metformin'
  if (q.includes('lisinopril')) return 'lisinopril'
  if (q.includes('ketorolac') || q.includes('toradol')) return 'ketorolac'
  if (has(q, 'acetaminophen', 'paracetamol', 'tylenol')) return 'acetaminophen'
  if (has(q, 'allerg')) return 'allergies'
  if (has(q, 'history', 'summar', 'background', 'conditions')) return 'history'

  if (previousTopic && sideEffects) return SIDE_EFFECTS_ANSWER[previousTopic]

  return 'uncertain'
}
