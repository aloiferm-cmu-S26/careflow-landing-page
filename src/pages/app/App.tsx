import { ChartScreen } from './features/chart/ChartScreen'
import { DashboardScreen } from './features/dashboard/DashboardScreen'
import { HistoryScreen } from './features/history/HistoryScreen'
import { MedicationScreen } from './features/medication/MedicationScreen'
import { SummaryScreen } from './features/summary/SummaryScreen'
import { useAppStore } from './state/hooks'
import { AppStoreProvider } from './state/store'

export function App() {
  return (
    <AppStoreProvider>
      <CurrentScreen />
    </AppStoreProvider>
  )
}

function CurrentScreen() {
  const { state } = useAppStore()
  switch (state.route.screen) {
    case 'dashboard':
      return <DashboardScreen />
    case 'history':
      return <HistoryScreen />
    case 'medication':
      return <MedicationScreen />
    case 'chart':
      return <ChartScreen />
    case 'summary':
      return <SummaryScreen />
  }
}
