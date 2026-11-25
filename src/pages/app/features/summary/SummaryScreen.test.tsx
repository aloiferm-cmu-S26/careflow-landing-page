import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ALEX_ID } from '../../state/data'
import { useAppStore } from '../../state/hooks'
import { initialState } from '../../state/model'
import type { AppState } from '../../state/model'
import { AppStoreProvider } from '../../state/store'
import { SummaryScreen } from './SummaryScreen'

function Probe() {
  const { state } = useAppStore()
  const alex = state.patients.find((p) => p.id === ALEX_ID)
  return (
    <output data-testid="probe">
      {state.route.screen}|{state.filter}|{alex?.status}
    </output>
  )
}

function renderSummary(initial: AppState = initialState) {
  window.history.replaceState(null, '', `#/patients/${ALEX_ID}/summary`)
  return render(
    <AppStoreProvider initial={initial}>
      <SummaryScreen />
      <Probe />
    </AppStoreProvider>,
  )
}

describe('SummaryScreen', () => {
  it('opens and closes the medication and allergy warnings', async () => {
    const user = userEvent.setup()
    renderSummary()

    await user.click(screen.getByRole('button', { name: 'Warning for Warfarin 5 mg' }))
    expect(
      screen.getByText(/Bleeding risk\. Interaction flagged with ketorolac/),
    ).toBeInTheDocument()

    // Tapping the other warning swaps the popover.
    await user.click(screen.getByRole('button', { name: 'Warning for Penicillin' }))
    expect(screen.queryByText(/Bleeding risk/)).not.toBeInTheDocument()
    expect(screen.getByText(/Avoid penicillin-class antibiotics/)).toBeInTheDocument()

    // Tapping outside closes it.
    await user.click(screen.getByText('Patient Visit Summary'))
    expect(screen.queryByText(/Avoid penicillin-class antibiotics/)).not.toBeInTheDocument()
  })

  it('lists allergies from the chart when history has saved them', () => {
    renderSummary({
      ...initialState,
      alex: { ...initialState.alex, allergies: ['Penicillin', 'Latex'] },
    })
    expect(screen.getByText('Allergies (2 records)')).toBeInTheDocument()
    expect(screen.getByText('Latex')).toBeInTheDocument()
  })

  it('finishes the visit and returns to the dashboard filtered to Done', async () => {
    const user = userEvent.setup()
    renderSummary()
    await user.click(screen.getByRole('button', { name: 'Back to my patients' }))
    expect(screen.getByTestId('probe')).toHaveTextContent('dashboard|done|done')
  })
})
