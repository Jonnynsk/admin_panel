import {
  APP_INIT,
  AUTH_BOOTSTRAP_FAILURE,
  AUTH_BOOTSTRAP_NETWORK_ERROR,
  AUTH_BOOTSTRAP_SUCCESS,
  AuthAction,
  LOGIN_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT,
} from './actions'

export interface AuthState {
  isAuthenticated: boolean
  initialized: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  isAuthenticated: false,
  initialized: false,
  loading: false,
  error: null,
}

const authReducer = (state = initialState, action: AuthAction): AuthState => {
  switch (action.type) {
    case APP_INIT:
      return {
        ...state,
        loading: true,
        error: null,
        initialized: false,
      }

    case AUTH_BOOTSTRAP_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        initialized: true,
        loading: false,
        error: null,
      }

    case AUTH_BOOTSTRAP_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        initialized: true,
        loading: false,
        error: null,
      }

    case AUTH_BOOTSTRAP_NETWORK_ERROR:
      return {
        ...state,
        isAuthenticated: false,
        initialized: false,
        loading: false,
        error: action.payload,
      }

    case LOGIN_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      }

    case LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        initialized: true,
        loading: false,
        error: null,
      }

    case LOGIN_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        loading: false,
      }

    case LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        initialized: true,
        loading: false,
        error: null,
      }

    default:
      return state
  }
}

export default authReducer
