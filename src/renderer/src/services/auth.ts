export const KEY = 'chefchefe'
const TOKEN_KEY = `${KEY}@token`
export const isAuthenticated: () => boolean = () => localStorage.getItem(TOKEN_KEY) !== null
export const getToken: () => string | null = () => localStorage.getItem(TOKEN_KEY)

export const setLogin: (token: string, restaurant_token: string) => void = (
  token,
  restaurant_token
) => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(`${KEY}@restaurant_token`, restaurant_token)
}

export const getRestaurantToken: () => string | null = () =>
  localStorage.getItem(`${KEY}@restaurant_token`)

export const logout: () => void = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(`${KEY}@restaurant_id`)
  window.location.reload()
}
