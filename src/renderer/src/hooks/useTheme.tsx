import { createContext, type ReactNode, useCallback, useContext, useState } from 'react'
import { darkTheme, lightTheme } from '../theme'
import { theme } from 'antd'

interface ThemeProviderProps {
  children: ReactNode
}

interface ThemeContextData {
  themeMode: 'light' | 'dark'
  toggleTheme: () => void
  selectedTheme: typeof lightTheme | typeof darkTheme
  selectedAlgorithm: typeof theme.defaultAlgorithm | typeof theme.darkAlgorithm
}

// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData)

const getTheme = (
  themeMode: 'light' | 'dark'
): {
  token: typeof lightTheme | typeof darkTheme
  algorithm: typeof theme.defaultAlgorithm | typeof theme.darkAlgorithm
} => {
  return themeMode === 'light'
    ? {
        token: lightTheme,
        algorithm: theme.defaultAlgorithm
      }
    : {
        token: darkTheme,
        algorithm: theme.darkAlgorithm
      }
}

export function ThemeProvider({ children }: Readonly<ThemeProviderProps>): React.ReactNode {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme-mobcounts') as 'light' | 'dark') || 'light'
  )

  const toggleTheme = useCallback(() => {
    setThemeMode((state) => (state === 'light' ? 'dark' : 'light'))
    localStorage.setItem('theme-mobcounts', themeMode === 'light' ? 'dark' : 'light')
  }, [themeMode])

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        toggleTheme,
        selectedTheme: getTheme(themeMode).token,
        selectedAlgorithm: getTheme(themeMode).algorithm
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeContextData {
  const context = useContext(ThemeContext)
  return context
}
