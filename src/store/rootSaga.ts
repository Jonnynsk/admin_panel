import { all, fork } from 'redux-saga/effects'
import { authorsSaga } from './authors'
import { authSaga } from './auth/sagas'
import { postsSaga } from './posts/sagas'
import { tagsSaga } from './tags'

export function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(postsSaga),
    fork(authorsSaga),
    fork(tagsSaga),
  ])
}
