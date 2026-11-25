/** Fictional patients from the Figma prototype. Nothing here is real data. */

export type PatientStatus = 'waiting' | 'in-progress' | 'awaiting-review' | 'done'

export interface Patient {
  id: string
  name: string
  dob: string
  bed: string
  arrived: string
  reason: string
  status: PatientStatus
}

export const STATUS_LABEL: Record<PatientStatus, string> = {
  waiting: 'Waiting for triage',
  'in-progress': 'In progress',
  'awaiting-review': 'Awaiting physician review',
  done: 'Charting done',
}

/** The patient the whole prototype flow is built around. */
export const ALEX_ID = 'PT-00482'

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: ALEX_ID,
    name: 'Alex Morgan',
    dob: '14 May 1964',
    bed: 'Bed 4',
    arrived: '21:38',
    reason: 'Confusion, unsure of medications',
    status: 'waiting',
  },
  {
    id: 'PT-00479',
    name: 'Mei Tanaka',
    dob: '2 Feb 1988',
    bed: 'Bed 9',
    arrived: '20:47',
    reason: 'Fever and cough',
    status: 'in-progress',
  },
  {
    id: 'PT-00475',
    name: 'Priya Nair',
    dob: '23 Sep 1975',
    bed: 'Bed 2',
    arrived: '20:12',
    reason: 'Chest pain',
    status: 'awaiting-review',
  },
  {
    id: 'PT-00471',
    name: 'Daniel Okafor',
    dob: '8 Jul 1992',
    bed: 'Bed 7',
    arrived: '19:55',
    reason: 'Hand laceration',
    status: 'done',
  },
]

export const NURSE = { name: 'Sarah Lee', role: 'Nurse', initials: 'SL' }
export const SHIFT_LABEL = 'Night shift · 21:40'
