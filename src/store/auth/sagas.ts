import { push } from 'connected-react-router'
import { SagaIterator } from 'redux-saga'
import { call, put, takeLatest, takeLeading } from 'redux-saga/effects'
import {
  AuthTokens,
  isRefreshAuthFailure,
  isSilentAuthError,
  refreshAccessToken,
} from '../../api/axiosClient'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '../../api/tokens'
import { getErrorMessage, parseApiError } from '../utils'
import {
  APP_INIT,
  LOGIN_REQUEST,
  LOGOUT,
  authBootstrapFailure,
  authBootstrapNetworkError,
  authBootstrapSuccess,
  loginFailure,
  loginRequest,
  loginSuccess,
} from './actions'
import * as authApi from './api'

function* bootstrapSaga(): SagaIterator {
  const accessToken = getAccessToken()
  const refreshToken = getRefreshToken()

  if (accessToken) {
    yield put(authBootstrapSuccess())
    return
  }

  if (!refreshToken) {
    yield put(authBootstrapFailure())
    return
  }

  try {
    yield call(refreshAccessToken)
    yield put(authBootstrapSuccess())
  } catch (error) {
    if (isRefreshAuthFailure(error) || isSilentAuthError(error)) {
      clearTokens()
      yield put(authBootstrapFailure())
      return
    }

    yield put(
      authBootstrapNetworkError(
        getErrorMessage(error, 'Не удалось восстановить сессию'),
      ),
    )
  }
}

function* loginSaga(action: ReturnType<typeof loginRequest>): SagaIterator {
  const { credentials, onSuccess, onError } = action.payload

  try {
    const response: { data: AuthTokens } = yield call(
      authApi.loginRequest,
      credentials,
    )
    const { data } = response

    setTokens(data.access_token, data.refresh_token, {
      accessExpiredAt: data.access_expired_at,
      refreshExpiredAt: data.refresh_expired_at,
    })

    yield put(loginSuccess())
    onSuccess?.()
  } catch (error) {
    if (isSilentAuthError(error)) {
      return
    }
    const parsed = parseApiError(error, 'Ошибка входа')
    yield put(loginFailure())
    onError?.(parsed.fieldErrors, parsed.message)
  }
}

function* logoutSaga(): SagaIterator {
  clearTokens()
  yield put(push('/login'))
}

export function* authSaga(): SagaIterator {
  yield takeLeading(APP_INIT, bootstrapSaga)
  yield takeLatest(LOGIN_REQUEST, loginSaga)
  yield takeLatest(LOGOUT, logoutSaga)
}
