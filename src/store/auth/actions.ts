import { CrudMeta } from '../crud/types'

export const APP_INIT = 'auth/APP_INIT' as const

export const AUTH_BOOTSTRAP_SUCCESS = 'auth/AUTH_BOOTSTRAP_SUCCESS' as const
export const AUTH_BOOTSTRAP_FAILURE = 'auth/AUTH_BOOTSTRAP_FAILURE' as const
export const AUTH_BOOTSTRAP_NETWORK_ERROR =
  'auth/AUTH_BOOTSTRAP_NETWORK_ERROR' as const

export const LOGIN_REQUEST = 'auth/LOGIN_REQUEST' as const
export const LOGIN_SUCCESS = 'auth/LOGIN_SUCCESS' as const
export const LOGIN_FAILURE = 'auth/LOGIN_FAILURE' as const
export const LOGOUT = 'auth/LOGOUT' as const

export interface LoginCredentials {
  email: string
  password: string
}

export const appInit = () => ({
  type: APP_INIT,
})

export const authBootstrapSuccess = () => ({
  type: AUTH_BOOTSTRAP_SUCCESS,
})

export const authBootstrapFailure = () => ({
  type: AUTH_BOOTSTRAP_FAILURE,
})

export const authBootstrapNetworkError = (error: string) => ({
  type: AUTH_BOOTSTRAP_NETWORK_ERROR,
  payload: error,
})

export const loginRequest = (
  credentials: LoginCredentials,
  meta: CrudMeta = {},
) => ({
  type: LOGIN_REQUEST,
  payload: { credentials, ...meta },
})

export const loginSuccess = () => ({
  type: LOGIN_SUCCESS,
})

export const loginFailure = () => ({
  type: LOGIN_FAILURE,
})

export const logout = () => ({
  type: LOGOUT,
})

export type AuthAction =
  | ReturnType<typeof appInit>
  | ReturnType<typeof authBootstrapSuccess>
  | ReturnType<typeof authBootstrapFailure>
  | ReturnType<typeof authBootstrapNetworkError>
  | ReturnType<typeof loginRequest>
  | ReturnType<typeof loginSuccess>
  | ReturnType<typeof loginFailure>
  | ReturnType<typeof logout>
