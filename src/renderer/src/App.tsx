import { Navigation } from './Routes'
import { AuthProvider } from './hooks/useAuth'
import { ThemeProvider } from 'styled-components'
import GlobalStyle from './theme/GlobalStyles'
import { ConfigProvider } from 'antd'
import pt_BR from 'antd/es/locale/pt_BR'
import dayjs from 'dayjs'
import ptBR from 'dayjs/locale/pt-br'
import { useTheme } from './hooks/useTheme'
import { BillProvider } from './hooks/useBills'
import { CashierProvider } from './hooks/useCashiers'
import { UpdaterModal } from './updateModal'

dayjs.locale(ptBR)

function App(): React.JSX.Element {
  const { selectedTheme, selectedAlgorithm } = useTheme()
  const isElectron = !!window.electron
  if (isElectron) {
    const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
    ipcHandle()
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          ...selectedTheme.token
        },
        algorithm: selectedAlgorithm
      }}
      locale={pt_BR}
    >
      <ThemeProvider theme={selectedTheme}>
        <GlobalStyle />
        <UpdaterModal />
        <AuthProvider>
          <CashierProvider>
            <BillProvider>
              <Navigation />
            </BillProvider>
          </CashierProvider>
        </AuthProvider>
      </ThemeProvider>
    </ConfigProvider>
  )
}

export default App
