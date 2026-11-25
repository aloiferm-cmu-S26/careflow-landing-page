import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { initialState } from '../../state/model'
import { AppStoreProvider } from '../../state/store'
import { HistoryScreen } from './HistoryScreen'

const renderScreen = (initial = initialState) =>
  render(
    <AppStoreProvider initial={initial}>
      <HistoryScreen />
    </AppStoreProvider>,
  )

describe('HistoryScreen', () => {
  it('goes from phone tap to review to saved, and updates the patient header', async () => {
    const user = userEvent.setup()
    renderScreen()

    expect(screen.getByText('Identity not confirmed')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Simulate phone tap' }))

    expect(screen.getByText('Identity confirmed')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Select Penicillin' })).toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Add to chart' }))
    const dialog = screen.getByRole('dialog', { name: 'Review before saving' })
    expect(within(dialog).getByText(/These 6 records will be added/)).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Save to chart' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText("6 records saved to Alex's chart at 21:43.")).toBeInTheDocument()
    expect(screen.getAllByText('In chart')).toHaveLength(6)
    expect(screen.getByText('Allergy: Penicillin')).toBeInTheDocument()
  })

  it('saves only the selected records and closes the modal with Back', async () => {
    const user = userEvent.setup()
    renderScreen()
    await user.click(screen.getByRole('button', { name: 'Simulate phone tap' }))
    await user.click(screen.getByRole('checkbox', { name: 'Select Penicillin' }))

    await user.click(screen.getByRole('button', { name: 'Add to chart' }))
    expect(screen.getByText(/These 5 records will be added/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Add to chart' }))
    await user.click(screen.getByRole('button', { name: 'Save to chart' }))
    expect(screen.getAllByText('In chart')).toHaveLength(5)
    expect(screen.queryByText('Allergy: Penicillin')).not.toBeInTheDocument()
  })

  it('opens straight on the saved state when history is already saved', () => {
    renderScreen({
      ...initialState,
      alex: {
        ...initialState.alex,
        identityConfirmed: true,
        historySaved: true,
        allergies: ['Penicillin'],
      },
    })
    expect(screen.getByText("6 records saved to Alex's chart at 21:43.")).toBeInTheDocument()
  })
})
