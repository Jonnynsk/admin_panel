import { AxiosResponse } from 'axios'
import { SagaIterator } from 'redux-saga'
import { call, put, select, spawn, takeLatest } from 'redux-saga/effects'
import { isSilentAuthError } from '../../api/axiosClient'
import { parseApiError } from '../utils'
import {
  CrudMeta,
  CrudModuleConfig,
  CrudPagination,
  CrudState,
  FetchMetaPayload,
  IdMetaPayload,
  UpdateMetaPayload,
  WithMeta,
  createActionTypes,
  createCrudApi,
  createInitialCrudState,
  invokeErrorMeta,
  invokeSuccessMeta,
  parseCreatedId,
  parseCrudPagination,
} from './types'

export const createCrudModule = <
  TEntity extends { id: number },
  TForm,
  Name extends string,
>(
  config: CrudModuleConfig<TEntity, TForm> & { name: Name },
) => {
  const types = createActionTypes(config.name)
  const api = createCrudApi(config)

  const toListItem =
    config.toListItem ??
    ((form: TForm, id: number) =>
      ({ ...(form as unknown as object), id }) as TEntity)

  const fetchRequest = (payload: FetchMetaPayload = {}) => ({
    type: types.FETCH_REQUEST,
    payload,
  })

  const fetchSuccess = (list: TEntity[], pagination: CrudPagination) => ({
    type: types.FETCH_SUCCESS,
    payload: { list, pagination },
  })

  const fetchFailure = (message: string) => ({
    type: types.FETCH_FAILURE,
    payload: message,
  })

  const fetchDetailRequest = (payload: IdMetaPayload<TEntity>) => ({
    type: types.FETCH_DETAIL_REQUEST,
    payload,
  })

  const fetchDetailSuccess = (entity: TEntity) => ({
    type: types.FETCH_DETAIL_SUCCESS,
    payload: entity,
  })

  const fetchDetailFailure = (message: string) => ({
    type: types.FETCH_DETAIL_FAILURE,
    payload: message,
  })

  const createRequest = (payload: WithMeta<TForm, number>) => ({
    type: types.CREATE_REQUEST,
    payload,
  })

  const createSuccess = (entity: TEntity) => ({
    type: types.CREATE_SUCCESS,
    payload: entity,
  })

  const createFailure = () => ({
    type: types.CREATE_FAILURE,
  })

  const updateRequest = (payload: UpdateMetaPayload<TForm>) => ({
    type: types.UPDATE_REQUEST,
    payload,
  })

  const updateSuccess = (entity: TEntity) => ({
    type: types.UPDATE_SUCCESS,
    payload: entity,
  })

  const updateFailure = () => ({
    type: types.UPDATE_FAILURE,
  })

  const deleteRequest = (payload: IdMetaPayload) => ({
    type: types.DELETE_REQUEST,
    payload,
  })

  const deleteSuccess = (id: number) => ({
    type: types.DELETE_SUCCESS,
    payload: id,
  })

  const deleteFailure = (message: string) => ({
    type: types.DELETE_FAILURE,
    payload: message,
  })

  const clearCurrent = () => ({
    type: types.CLEAR_CURRENT,
  })

  const clearError = () => ({
    type: types.CLEAR_ERROR,
  })

  const actions = {
    fetchRequest,
    fetchSuccess,
    fetchFailure,
    fetchDetailRequest,
    fetchDetailSuccess,
    fetchDetailFailure,
    createRequest,
    createSuccess,
    createFailure,
    updateRequest,
    updateSuccess,
    updateFailure,
    deleteRequest,
    deleteSuccess,
    deleteFailure,
    clearCurrent,
    clearError,
  }

  type ModuleAction =
    | ReturnType<typeof fetchRequest>
    | ReturnType<typeof fetchSuccess>
    | ReturnType<typeof fetchFailure>
    | ReturnType<typeof fetchDetailRequest>
    | ReturnType<typeof fetchDetailSuccess>
    | ReturnType<typeof fetchDetailFailure>
    | ReturnType<typeof createRequest>
    | ReturnType<typeof createSuccess>
    | ReturnType<typeof createFailure>
    | ReturnType<typeof updateRequest>
    | ReturnType<typeof updateSuccess>
    | ReturnType<typeof updateFailure>
    | ReturnType<typeof deleteRequest>
    | ReturnType<typeof deleteSuccess>
    | ReturnType<typeof deleteFailure>
    | ReturnType<typeof clearCurrent>
    | ReturnType<typeof clearError>

  const reducer = (
    state: CrudState<TEntity> = createInitialCrudState<TEntity>(),
    action: ModuleAction,
  ): CrudState<TEntity> => {
    switch (action.type) {
      case types.FETCH_REQUEST:
        return { ...state, loading: true, error: null }

      case types.FETCH_SUCCESS: {
        const { list, pagination } = (
          action as ReturnType<typeof fetchSuccess>
        ).payload
        return {
          ...state,
          loading: false,
          list,
          pagination,
          error: null,
        }
      }

      case types.FETCH_FAILURE:
        return {
          ...state,
          loading: false,
          error: (action as ReturnType<typeof fetchFailure>).payload,
        }

      case types.FETCH_DETAIL_REQUEST:
        return {
          ...state,
          detailLoading: true,
          current: null,
          error: null,
        }

      case types.FETCH_DETAIL_SUCCESS:
        return {
          ...state,
          detailLoading: false,
          current: (action as ReturnType<typeof fetchDetailSuccess>).payload,
        }

      case types.FETCH_DETAIL_FAILURE:
        return {
          ...state,
          detailLoading: false,
          current: null,
          error: (action as ReturnType<typeof fetchDetailFailure>).payload,
        }

      case types.CREATE_REQUEST:
      case types.UPDATE_REQUEST:
        return { ...state, submitting: true }

      case types.CREATE_SUCCESS: {
        const entity = (action as ReturnType<typeof createSuccess>).payload
        const exists = state.list.some((item) => item.id === entity.id)
        return {
          ...state,
          submitting: false,
          list: exists
            ? state.list.map((item) => (item.id === entity.id ? entity : item))
            : [entity, ...state.list],
          pagination: {
            ...state.pagination,
            totalCount: exists
              ? state.pagination.totalCount
              : state.pagination.totalCount + 1,
          },
        }
      }

      case types.UPDATE_SUCCESS: {
        const entity = (action as ReturnType<typeof updateSuccess>).payload
        const merge = (prev: TEntity): TEntity => {
          const next = { ...prev }
          ;(Object.keys(entity) as Array<keyof TEntity>).forEach((key) => {
            if (entity[key] !== undefined) {
              next[key] = entity[key]
            }
          })
          return next
        }
        return {
          ...state,
          submitting: false,
          list: state.list.map((item) =>
            item.id === entity.id ? merge(item) : item,
          ),
          current:
            state.current?.id === entity.id ? merge(state.current) : state.current,
        }
      }

      case types.CREATE_FAILURE:
      case types.UPDATE_FAILURE:
        return { ...state, submitting: false }

      case types.DELETE_REQUEST:
        return { ...state, loading: true, error: null }

      case types.DELETE_SUCCESS: {
        const id = (action as ReturnType<typeof deleteSuccess>).payload
        return {
          ...state,
          loading: false,
          list: state.list.filter((item) => item.id !== id),
          pagination: {
            ...state.pagination,
            totalCount: Math.max(0, state.pagination.totalCount - 1),
          },
        }
      }

      case types.DELETE_FAILURE:
        return {
          ...state,
          loading: false,
          error: (action as ReturnType<typeof deleteFailure>).payload,
        }

      case types.CLEAR_CURRENT:
        return { ...state, current: null, detailLoading: false }

      case types.CLEAR_ERROR:
        return { ...state, error: null }

      default:
        return state
    }
  }

  function* fetchSaga(
    action: ReturnType<typeof fetchRequest>,
  ): SagaIterator {
    const { page, onSuccess, onError } = action.payload
    const meta: CrudMeta = { onSuccess, onError }

    try {
      const response: AxiosResponse<TEntity[]> = yield call(api.fetchList, page)
      const pagination = config.withPagination
        ? parseCrudPagination(response.headers)
        : {
            currentPage: 1,
            pageCount: 1,
            perPage: response.data.length || 20,
            totalCount: response.data.length,
          }

      yield put(fetchSuccess(response.data, pagination))
      invokeSuccessMeta(meta, response.data)
    } catch (error) {
      if (isSilentAuthError(error)) {
        yield put(fetchFailure(''))
        return
      }
      const parsed = parseApiError(error, 'Не удалось загрузить список')
      yield put(fetchFailure(parsed.message))
      invokeErrorMeta(meta, parsed)
    }
  }

  function* fetchDetailSaga(
    action: ReturnType<typeof fetchDetailRequest>,
  ): SagaIterator {
    const { id, onSuccess, onError } = action.payload
    const meta: CrudMeta<TEntity> = { onSuccess, onError }

    try {
      const response: AxiosResponse<TEntity> = yield call(api.fetchDetail, id)
      yield put(fetchDetailSuccess(response.data))
      invokeSuccessMeta(meta, response.data)
    } catch (error) {
      if (isSilentAuthError(error)) {
        yield put(fetchDetailFailure(''))
        return
      }
      const parsed = parseApiError(error, 'Не удалось загрузить запись')
      yield put(fetchDetailFailure(parsed.message))
      invokeErrorMeta(meta, parsed)
    }
  }

  function* refreshListSaga(): SagaIterator {
    try {
      const response: AxiosResponse<TEntity[]> = yield call(api.fetchList)
      const pagination = config.withPagination
        ? parseCrudPagination(response.headers)
        : {
            currentPage: 1,
            pageCount: 1,
            perPage: response.data.length || 20,
            totalCount: response.data.length,
          }
      yield put(fetchSuccess(response.data, pagination))
    } catch (error) {
      if (isSilentAuthError(error)) {
        return
      }
    }
  }

  function* createSaga(
    action: ReturnType<typeof createRequest>,
  ): SagaIterator {
    const { data, onSuccess, onError } = action.payload
    const meta: CrudMeta<number> = { onSuccess, onError }

    let createdId: number | null = null
    try {
      const response: AxiosResponse<unknown> = yield call(api.create, data)
      createdId = parseCreatedId(response.data)
    } catch (error) {
      if (isSilentAuthError(error)) {
        yield put(createFailure())
        return
      }
      const parsed = parseApiError(error, 'Не удалось создать')
      yield put(createFailure())
      invokeErrorMeta(meta, parsed)
      return
    }

    if (createdId != null) {
      yield put(createSuccess(toListItem(data, createdId)))
      invokeSuccessMeta(meta, createdId)
      yield spawn(refreshListSaga)
      return
    }

    yield call(refreshListSaga)
    const list: TEntity[] = yield select(
      (state: Record<string, CrudState<TEntity>>) =>
        state[config.name]?.list ?? [],
    )
    const found = config.findCreated?.(data, list)
    if (found) {
      yield put(createSuccess(found))
      invokeSuccessMeta(meta, found.id)
      return
    }

    yield put(createFailure())
    invokeSuccessMeta(meta)
  }

  function* updateSaga(
    action: ReturnType<typeof updateRequest>,
  ): SagaIterator {
    const { id, data, onSuccess, onError } = action.payload
    const meta: CrudMeta = { onSuccess, onError }

    try {
      yield call(api.update, id, data)
      yield put(updateSuccess(toListItem(data, id)))
    } catch (error) {
      if (isSilentAuthError(error)) {
        yield put(updateFailure())
        return
      }
      const parsed = parseApiError(error, 'Не удалось обновить')
      yield put(updateFailure())
      invokeErrorMeta(meta, parsed)
      return
    }

    invokeSuccessMeta(meta)
    yield spawn(refreshListSaga)
  }

  function* deleteSaga(
    action: ReturnType<typeof deleteRequest>,
  ): SagaIterator {
    const { id, onSuccess, onError } = action.payload
    const meta: CrudMeta = { onSuccess, onError }

    try {
      yield call(api.remove, id)
      yield put(deleteSuccess(id))
      invokeSuccessMeta(meta)
    } catch (error) {
      if (isSilentAuthError(error)) {
        yield put(deleteFailure(''))
        return
      }
      const parsed = parseApiError(error, 'Не удалось удалить')
      yield put(deleteFailure(parsed.message))
      invokeErrorMeta(meta, parsed)
    }
  }

  function* saga(): SagaIterator {
    yield takeLatest(types.FETCH_REQUEST, fetchSaga)
    yield takeLatest(types.FETCH_DETAIL_REQUEST, fetchDetailSaga)
    yield takeLatest(types.CREATE_REQUEST, createSaga)
    yield takeLatest(types.UPDATE_REQUEST, updateSaga)
    yield takeLatest(types.DELETE_REQUEST, deleteSaga)
  }

  return {
    name: config.name,
    types,
    actions,
    reducer,
    saga,
    api,
  }
}

export type CrudModule<TEntity extends { id: number }, TForm, Name extends string> =
  ReturnType<typeof createCrudModule<TEntity, TForm, Name>>
