import Cookies from 'js-cookie'

export const ACCESS_TOKEN_KEY = 'access_token'
export const REFRESH_TOKEN_KEY = 'refresh_token'

const REFRESH_FALLBACK_DAYS = 30
const UNIX_ABS_THRESHOLD = 1_000_000_000

export interface TokenExpiry {
  accessExpiredAt?: number
  refreshExpiredAt?: number
}

type CookieAttrs = {
  path?: string
  sameSite?: 'strict' | 'lax' | 'none'
  secure?: boolean
  expires?: number | Date
}

const baseCookieAttrs = (): CookieAttrs => ({
  path: '/',
  sameSite: 'strict',
  secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
})

export const toExpires = (
  value?: number,
  fallbackDays?: number,
): number | undefined => {
  if (value && value > 0) {
    const ttlSeconds =
      value >= UNIX_ABS_THRESHOLD
        ? value - Math.floor(Date.now() / 1000)
        : value

    if (ttlSeconds <= 0) {
      return undefined
    }

    return ttlSeconds / 86400
  }

  return fallbackDays
}

export const getAccessToken = (): string | undefined =>
  Cookies.get(ACCESS_TOKEN_KEY)

export const getRefreshToken = (): string | undefined =>
  Cookies.get(REFRESH_TOKEN_KEY)

export const setTokens = (
  accessToken: string,
  refreshToken: string,
  expiry: TokenExpiry = {},
): void => {
  const base = baseCookieAttrs()

  Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
    ...base,
    expires: toExpires(expiry.accessExpiredAt),
  })

  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
    ...base,
    expires: toExpires(expiry.refreshExpiredAt, REFRESH_FALLBACK_DAYS),
  })
}

export const clearTokens = (): void => {
  const base = baseCookieAttrs()
  Cookies.remove(ACCESS_TOKEN_KEY, base)
  Cookies.remove(REFRESH_TOKEN_KEY, base)
}
