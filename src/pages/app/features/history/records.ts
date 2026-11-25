/** Verified records the patient shares by tapping their phone. Fictional data. */

export type RecordCategory = 'Medications' | 'Allergies' | 'Past diagnoses'
export type RecordWarning = 'allergy' | 'interaction'

export interface HistoryRecord {
  id: string
  name: string
  category: RecordCategory
  source: string
  updated: string
  /** Red triangle for allergies, amber for drugs used in interaction checks. */
  warning?: RecordWarning
}

export const CATEGORIES: RecordCategory[] = ['Medications', 'Allergies', 'Past diagnoses']

export const RECORDS: HistoryRecord[] = [
  {
    id: 'metformin',
    name: 'Metformin 500 mg',
    category: 'Medications',
    source: 'Retail pharmacy',
    updated: '28 Oct 2026',
  },
  {
    id: 'warfarin',
    name: 'Warfarin 5 mg',
    category: 'Medications',
    source: 'Other hospital',
    updated: '27 Oct 2026',
    warning: 'interaction',
  },
  {
    id: 'lisinopril',
    name: 'Lisinopril 10 mg',
    category: 'Medications',
    source: 'Retail pharmacy',
    updated: '26 Oct 2026',
  },
  {
    id: 'penicillin',
    name: 'Penicillin',
    category: 'Allergies',
    source: 'Other hospital',
    updated: '27 Oct 2026',
    warning: 'allergy',
  },
  {
    id: 'afib',
    name: 'Atrial fibrillation',
    category: 'Past diagnoses',
    source: 'Other hospital',
    updated: '24 Oct 2026',
  },
  {
    id: 't2d',
    name: 'Type 2 diabetes',
    category: 'Past diagnoses',
    source: 'Other hospital',
    updated: '20 Oct 2026',
  },
]

export const ALL_RECORD_IDS = RECORDS.map((r) => r.id)

export const SYNCED_AT = '21:42'
export const SAVED_AT = '21:43'

export function recordCount(n: number) {
  return n === 1 ? '1 record' : `${n} records`
}
