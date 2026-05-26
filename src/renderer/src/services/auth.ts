import dayjs from 'dayjs'

export const KEY = 'chefchefe'
const TOKEN_KEY = `${KEY}@token`
export const isAuthenticated: () => boolean = () => localStorage.getItem(TOKEN_KEY) !== null
export const getToken: () => string | null = () => localStorage.getItem(TOKEN_KEY)

export const setLogin: (token: string) => void = (token) => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const logout: () => void = () => {
  localStorage.removeItem(TOKEN_KEY)
  setConfig('terminal-saved-code', null)
  window.api.reloadApp()
}

export const setConfig: (key: string, value: string | null) => void = (key, value) => {
  const configs = JSON.parse(localStorage.getItem(`${KEY}@configs`) || '{}')
  configs[key] = value
  localStorage.setItem(`${KEY}@configs`, JSON.stringify(configs))
}

export const getConfig: (key: string) => string | null = (key) => {
  const configs = JSON.parse(localStorage.getItem(`${KEY}@configs`) || '{}')
  return configs[key] || null
}

export const setCache: (key: string, value: unknown, expiresInSeconds?: number) => void = (
  key,
  value,
  expiresInSeconds
) => {
  const keyName = `${KEY}@cache:${key}`
  const cacheData = {
    value,
    expiresAt: expiresInSeconds ? dayjs().add(expiresInSeconds, 'second').toISOString() : null
  }
  localStorage.setItem(keyName, JSON.stringify(cacheData))
}

export const getCache: (key: string) => unknown | null = (key) => {
  const keyName = `${KEY}@cache:${key}`
  const cacheDataString = localStorage.getItem(keyName)
  if (!cacheDataString) return null

  try {
    const cacheData = JSON.parse(cacheDataString)
    if (cacheData.expiresAt && dayjs().isAfter(dayjs(cacheData.expiresAt))) {
      localStorage.removeItem(keyName)
      return null
    }
    return cacheData.value
  } catch {
    localStorage.removeItem(keyName)
    return null
  }
}

export const clearCache: (key: string) => void = (key) => {
  const keyName = `${KEY}@cache:${key}`
  localStorage.removeItem(keyName)
}
