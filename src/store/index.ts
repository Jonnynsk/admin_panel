import { routerMiddleware } from 'connected-react-router'
import { applyMiddleware, compose, createStore, Store } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { setUnauthorizedHandler } from '../api/axiosClient'
import { appInit, logout } from './auth/actions'
import { history } from './history'
import { createRootReducer, RootState } from './rootReducer'
import { rootSaga } from './rootSaga'

const sagaMiddleware = createSagaMiddleware()

const composeEnhancers =
  (typeof window !== 'undefined' &&
    (
      window as unknown as {
        __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose
      }
    ).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  compose

export const store: Store<RootState> = createStore(
  createRootReducer(history),
  composeEnhancers(applyMiddleware(routerMiddleware(history), sagaMiddleware)),
)

sagaMiddleware.run(rootSaga)

setUnauthorizedHandler(() => {
  store.dispatch(logout())
})

store.dispatch(appInit())

export type AppDispatch = typeof store.dispatch
export type { RootState }
export { history }
