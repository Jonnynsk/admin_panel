import { AxiosResponse } from 'axios'
import { push } from 'connected-react-router'
import { SagaIterator } from 'redux-saga'
import { call, put, select, takeLatest } from 'redux-saga/effects'
import { isSilentAuthError } from '../../api/axiosClient'
import { parseCreatedId } from '../crud/types'
import { RootState } from '../rootReducer'
import { parseApiError } from '../utils'
import {
  CREATE_POST_REQUEST,
  DELETE_POST_REQUEST,
  FETCH_POSTS_REQUEST,
  FETCH_POST_DETAIL_REQUEST,
  UPDATE_POST_REQUEST,
  createPostFailure,
  createPostRequest,
  createPostSuccess,
  deletePostFailure,
  deletePostRequest,
  deletePostSuccess,
  fetchPostDetailFailure,
  fetchPostDetailRequest,
  fetchPostDetailSuccess,
  fetchPostsFailure,
  fetchPostsRequest,
  fetchPostsSuccess,
  updatePostFailure,
  updatePostRequest,
  updatePostSuccess,
} from './actions'
import * as postsApi from './api'
import { PostDetail, PostListItem } from './types'

function* fetchPostsSaga(
  action: ReturnType<typeof fetchPostsRequest>,
): SagaIterator {
  try {
    const page = action.payload.page ?? 1
    const response: AxiosResponse<PostListItem[]> = yield call(
      postsApi.fetchPosts,
      page,
    )

    const pagination = postsApi.parsePaginationHeaders(response.headers)
    yield put(fetchPostsSuccess(response.data, pagination))
  } catch (error) {
    if (isSilentAuthError(error)) {
      yield put(fetchPostsFailure(parseApiError(error, '')))
      return
    }
    yield put(
      fetchPostsFailure(parseApiError(error, 'Не удалось загрузить посты')),
    )
  }
}

function* fetchPostDetailSaga(
  action: ReturnType<typeof fetchPostDetailRequest>,
): SagaIterator {
  try {
    const response: AxiosResponse<PostDetail> = yield call(
      postsApi.fetchPostDetail,
      action.payload,
    )
    yield put(fetchPostDetailSuccess(response.data))
  } catch (error) {
    if (isSilentAuthError(error)) {
      yield put(fetchPostDetailFailure(parseApiError(error, '')))
      return
    }
    yield put(
      fetchPostDetailFailure(
        parseApiError(error, 'Не удалось загрузить пост'),
      ),
    )
  }
}

function* redirectToPostsList(): SagaIterator {
  const currentPage: number = yield select(
    (state: RootState) => state.posts.pagination.currentPage || 1,
  )
  yield put(push(currentPage > 1 ? `/?page=${currentPage}` : '/'))
}

function* createPostSaga(
  action: ReturnType<typeof createPostRequest>,
): SagaIterator {
  const { data, onSuccess, onError } = action.payload

  let createdId: number
  try {
    const response: AxiosResponse<unknown> = yield call(
      postsApi.createPost,
      data,
    )
    const id = parseCreatedId(response.data)
    if (id == null) {
      yield put(createPostFailure())
      onError?.([], 'Сервер не вернул id созданного поста')
      return
    }
    createdId = id
    yield put(createPostSuccess(createdId))
  } catch (error) {
    if (isSilentAuthError(error)) {
      yield put(createPostFailure())
      return
    }
    const parsed = parseApiError(error, 'Не удалось создать пост')
    yield put(createPostFailure())
    onError?.(parsed.fieldErrors, parsed.message)
    return
  }

  onSuccess?.(createdId)
  yield call(redirectToPostsList)
}

function* updatePostSaga(
  action: ReturnType<typeof updatePostRequest>,
): SagaIterator {
  const { id, data, onSuccess, onError } = action.payload

  try {
    yield call(postsApi.updatePost, id, data)
    yield put(updatePostSuccess(id))
  } catch (error) {
    if (isSilentAuthError(error)) {
      yield put(updatePostFailure())
      return
    }
    const parsed = parseApiError(error, 'Не удалось обновить пост')
    yield put(updatePostFailure())
    onError?.(parsed.fieldErrors, parsed.message)
    return
  }

  onSuccess?.(undefined)
  yield call(redirectToPostsList)
}

function* deletePostSaga(
  action: ReturnType<typeof deletePostRequest>,
): SagaIterator {
  try {
    yield call(postsApi.deletePost, action.payload.id)
    yield put(deletePostSuccess(action.payload.id))
  } catch (error) {
    if (isSilentAuthError(error)) {
      yield put(deletePostFailure(parseApiError(error, '')))
      return
    }
    yield put(
      deletePostFailure(parseApiError(error, 'Не удалось удалить пост')),
    )
  }
}

export function* postsSaga(): SagaIterator {
  yield takeLatest(FETCH_POSTS_REQUEST, fetchPostsSaga)
  yield takeLatest(FETCH_POST_DETAIL_REQUEST, fetchPostDetailSaga)
  yield takeLatest(CREATE_POST_REQUEST, createPostSaga)
  yield takeLatest(UPDATE_POST_REQUEST, updatePostSaga)
  yield takeLatest(DELETE_POST_REQUEST, deletePostSaga)
}
