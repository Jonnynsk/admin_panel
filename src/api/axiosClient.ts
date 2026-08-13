import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from './tokens'

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://rest-test.machineheads.ru'

const REFRESH_URL = '/auth/token-refresh'

export interface AuthTokens {
  access_token: string
  refresh_token: string
  access_expired_at?: number
  refresh_expired_at?: number
}

export class SilentAuthError extends Error {
  readonly isSilentAuthError = true as const

  constructor(message = 'Session expired') {
    super(message)
    this.name = 'SilentAuthError'
  }
}

export const isSilentAuthError = (error: unknown): error is SilentAuthError =>
  error instanceof SilentAuthError ||
  (typeof error === 'object' &&
    error !== null &&
    (error as SilentAuthError).isSilentAuthError === true)

type QueueItem = {
  resolve: () => void
  reject: (error: unknown) => void
}

type UnauthorizedHandler = () => void

export interface RetryConfig extends AxiosRequestConfig {
  _retry?: boolean
  _bodyFactory?: () => unknown
}

let isRefreshing = false
let failedQueue: QueueItem[] = []
let refreshAbortController: AbortController | null = null

let onUnauthorized: UnauthorizedHandler = () => {
  window.location.assign('/login')
}

export const setUnauthorizedHandler = (handler: UnauthorizedHandler): void => {
  onUnauthorized = handler
}

const processQueue = (error: unknown | null): void => {
  failedQueue.forEach((item) => {
    if (error) {
      item.reject(error)
    } else {
      item.resolve()
    }
  })
  failedQueue = []
}

const isAbortError = (error: unknown): boolean => {
  if (axios.isCancel?.(error)) {
    return true
  }
  if (axios.isAxiosError(error) && error.code === 'ERR_CANCELED') {
    return true
  }
  return error instanceof DOMException && error.name === 'AbortError'
}

const cloneFormData = (source: FormData): FormData => {
  const next = new FormData()
  source.forEach((value, key) => {
    next.append(key, value)
  })
  return next
}

const withRetryBody = (config: RetryConfig): RetryConfig => {
  const next: RetryConfig = { ...config, _retry: true }

  if (typeof config._bodyFactory === 'function') {
    next.data = config._bodyFactory()
    return next
  }

  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    next.data = cloneFormData(config.data)
  }

  return next
}

const forceLogout = (): SilentAuthError => {
  const silent = new SilentAuthError()

  refreshAbortController?.abort()
  refreshAbortController = null

  clearTokens()
  processQueue(silent)
  isRefreshing = false
  onUnauthorized()
  return silent
}

export const isRefreshAuthFailure = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) {
    return false
  }
  const status = error.response?.status
  return status === 400 || status === 401 || status === 403
}

const refreshClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: 'application/json',
  },
})

export const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    throw new SilentAuthError('No refresh_token')
  }

  refreshAbortController?.abort()
  refreshAbortController = new AbortController()
  const { signal } = refreshAbortController

  try {
    const body = new FormData()
    body.append('refresh_token', refreshToken)

    const { data } = await refreshClient.post<AuthTokens>(REFRESH_URL, body, {
      signal,
    })

    if (signal.aborted) {
      throw new SilentAuthError('Refresh aborted')
    }

    if (!data?.access_token || !data?.refresh_token) {
      throw new Error('Invalid refresh response')
    }

    setTokens(data.access_token, data.refresh_token, {
      accessExpiredAt: data.access_expired_at,
      refreshExpiredAt: data.refresh_expired_at,
    })

    return data.access_token
  } finally {
    refreshAbortController = null
  }
}

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: 'application/json',
  },
})

axiosClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken()

  if (accessToken) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig | undefined
    const status = error.response?.status

    if (!originalRequest || status !== 401) {
      return Promise.reject(error)
    }

    if (originalRequest._retry) {
      return Promise.reject(forceLogout())
    }

    if (!getRefreshToken()) {
      return Promise.reject(forceLogout())
    }

    if (isRefreshing) {
      return new Promise<void>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then(() => axiosClient(withRetryBody(originalRequest)))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      await refreshAccessToken()
      processQueue(null)
      return axiosClient(withRetryBody(originalRequest))
    } catch (refreshError) {
      if (isAbortError(refreshError) || isSilentAuthError(refreshError)) {
        return Promise.reject(
          isSilentAuthError(refreshError)
            ? refreshError
            : new SilentAuthError(),
        )
      }

      if (isRefreshAuthFailure(refreshError)) {
        return Promise.reject(forceLogout())
      }

      processQueue(refreshError)
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default axiosClient
