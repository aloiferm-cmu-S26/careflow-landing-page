import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useAppStore } from '../../state/hooks'
import { initialState } from '../../state/model'
import type { AppState } from '../../state/model'
import { AppStoreProvider } from '../../state/store'
import { ChartScreen } from './ChartScreen'
import { describeChange } from './chartFlow'

function ScreenProbe() {
  const { state } = useAppStore()
  return (
    <output data-testid="probe">
      {state.route.screen}:{String(state.alex.chartSaved)}
    </output>
  )
}

function renderChart(initial: AppState = initialState) {
  window.location.hash = '#/patients/PT-00482/chart'
  return render(
    <AppStoreProvider initial={initial}>
      <ChartScreen />
      <ScreenProbe />
    </AppStoreProvider>,
  )
}

const card = (title: string) => {
  const item = screen.getByRole('heading', { name: new RegExp(`^${title}`) }).closest('li')
  if (!item) throw new Error(`No card for ${title}`)
  return within(item)
}

describe('ChartScreen', () => {
  beforeEach(() => {
    // Reduced motion shows the whole transcript at once, so no timers are needed.
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('reduce'),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
  })
  afterEach(() => vi.unstubAllGlobals())

  it('listens, fixes the misheard finding, reviews and saves', async () => {
    const user = userEvent.setup()
    renderChart()

    expect(screen.getByText('0 confirmed · 0 drafts')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Review and Save' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Start listening' }))
    expect(screen.getByText('Okay. Please check with the team.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'End visit' }))
    expect(screen.getByText(/Visit ended/)).toBeInTheDocument()
    expect(screen.getByText('0 confirmed · 1 draft')).toBeInTheDocument()

    await user.click(card('Symptoms').getByRole('button', { name: 'Confirm' }))
    expect(screen.getByText('1 confirmed · 1 draft')).toBeInTheDocument()
    expect(screen.getByText(/Check the transcript/)).toBeInTheDocument()

    await user.click(card('Findings').getByRole('button', { name: 'Edit' }))
    const box = screen.getByRole('textbox', { name: 'Findings text' })
    await user.clear(box)
    await user.type(
      box,
      'Medication history retrieved from two sources. Possible interaction flagged for review.',
    )
    expect(screen.getByText('Changed "one source" to "two sources"')).toBeInTheDocument()
    await user.click(card('Findings').getByRole('button', { name: 'Save' }))
    expect(screen.getByText('Edited and confirmed by Sarah Lee · 21:45')).toBeInTheDocument()

    await user.click(card('Plan').getByRole('button', { name: 'Confirm' }))
    expect(screen.getByText('3 confirmed · 0 drafts')).toBeInTheDocument()

    // Re-open a confirmed card (12b), then back out.
    await user.click(screen.getByRole('button', { name: 'Edit Symptoms' }))
    expect(screen.getByText('2 confirmed · 1 editing')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Review and Save' })).toBeDisabled()
    await user.click(card('Symptoms').getByRole('button', { name: 'Cancel' }))

    await user.click(screen.getByRole('button', { name: 'Review and Save' }))
    const dialog = screen.getByRole('dialog', { name: 'Review before saving' })
    expect(within(dialog).getByText('Edited and confirmed 21:45')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Save to chart' }))

    expect(screen.getByText("Saved to Alex's chart at 21:46")).toBeInTheDocument()
    expect(screen.getByText('3 saved')).toBeInTheDocument()
    expect(screen.getByTestId('probe')).toHaveTextContent('chart:true')

    await user.click(screen.getByRole('button', { name: 'Go to Medication Review' }))
    expect(screen.getByTestId('probe')).toHaveTextContent('medication:true')
  })

  it('opens on the saved state when the chart was already saved', () => {
    renderChart({ ...initialState, alex: { ...initialState.alex, chartSaved: true } })
    expect(screen.getByText('3 saved')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go to Medication Review' })).toBeInTheDocument()
  })

  it('describes a word change', () => {
    expect(describeChange('from one source.', 'from two sources.')).toBe(
      'Changed "one source" to "two sources"',
    )
    expect(describeChange('same', 'same')).toBeNull()
  })
})
