import axiosClient, { RetryConfig } from '../../api/axiosClient'
import { FieldError, ParsedApiError } from '../utils'

export type CrudMeta<TResult = unknown> = {
  onSuccess?: (result?: TResult) => void
  onError?: (fieldErrors: FieldError[], message: string) => void
}

export type WithMeta<TData, TResult = unknown> = {
  data: TData
} & CrudMeta<TResult>

export type IdMetaPayload<TResult = unknown> = {
  id: number
} & CrudMeta<TResult>

export type UpdateMetaPayload<TForm, TResult = unknown> = {
  id: number
  data: TForm
} & CrudMeta<TResult>

export type FetchMetaPayload = {
  page?: number
} & CrudMeta

export interface CrudPagination {
  currentPage: number
  totalCount: number
  pageCount: number
  perPage: number
}

export interface CrudEndpoints {
  list: string
  detail: string
  create: string
  update: string
  remove: string
}

export interface CrudModuleConfig<TEntity extends { id: number }, TForm> {
  name: string
  endpoints: CrudEndpoints
  withPagination?: boolean
  serialize?: (data: TForm) => FormData | Record<string, unknown>
  mapListItem?: (raw: unknown) => TEntity
  toListItem?: (form: TForm, id: number) => TEntity
  findCreated?: (form: TForm, list: TEntity[]) => TEntity | undefined
}

export const parseCreatedId = (data: unknown): number | null => {
  if (typeof data === 'number' && Number.isFinite(data) && data > 0) {
    return data
  }
  if (data && typeof data === 'object' && 'id' in data) {
    const id = Number((data as { id: unknown }).id)
    if (Number.isFinite(id) && id > 0) {
      return id
    }
  }
  return null
}

export interface CrudState<TEntity> {
  list: TEntity[]
  current: TEntity | null
  loading: boolean
  detailLoading: boolean
  submitting: boolean
  error: string | null
  pagination: CrudPagination
}

export const initialCrudPagination: CrudPagination = {
  currentPage: 1,
  totalCount: 0,
  pageCount: 0,
  perPage: 20,
}

export const createInitialCrudState = <TEntity,>(): CrudState<TEntity> => ({
  list: [],
  current: null,
  loading: false,
  detailLoading: false,
  submitting: false,
  error: null,
  pagination: initialCrudPagination,
})

export const toFormData = (data: Record<string, unknown>): FormData => {
  const body = new FormData()

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }
    if (value instanceof File) {
      body.append(key, value)
      return
    }
    if (typeof value === 'boolean') {
      body.append(key, value ? '1' : '0')
      return
    }
    if (Array.isArray(value)) {
      value.forEach((item) => body.append(`${key}[]`, String(item)))
      return
    }
    body.append(key, String(value))
  })

  return body
}

const readHeader = (
  headers: Record<string, unknown>,
  name: string,
): string | undefined => {
  const value = headers[name] ?? headers[name.toLowerCase()]
  if (value == null) {
    return undefined
  }
  return Array.isArray(value) ? String(value[0]) : String(value)
}

export const parseCrudPagination = (
  headers: unknown,
): CrudPagination => {
  const record = (headers || {}) as Record<string, unknown>
  return {
    currentPage: Number(readHeader(record, 'X-Pagination-Current-Page') || 1),
    pageCount: Number(readHeader(record, 'X-Pagination-Page-Count') || 0),
    perPage: Number(readHeader(record, 'X-Pagination-Per-Page') || 20),
    totalCount: Number(readHeader(record, 'X-Pagination-Total-Count') || 0),
  }
}

export const invokeErrorMeta = (
  meta: Pick<CrudMeta, 'onError'> | undefined,
  parsed: ParsedApiError,
): void => {
  meta?.onError?.(parsed.fieldErrors, parsed.message)
}

export const invokeSuccessMeta = <T,>(
  meta: Pick<CrudMeta<T>, 'onSuccess'> | undefined,
  result?: T,
): void => {
  meta?.onSuccess?.(result)
}

type ActionTypeMap<Name extends string> = {
  FETCH_REQUEST: `${Name}/FETCH_REQUEST`
  FETCH_SUCCESS: `${Name}/FETCH_SUCCESS`
  FETCH_FAILURE: `${Name}/FETCH_FAILURE`
  FETCH_DETAIL_REQUEST: `${Name}/FETCH_DETAIL_REQUEST`
  FETCH_DETAIL_SUCCESS: `${Name}/FETCH_DETAIL_SUCCESS`
  FETCH_DETAIL_FAILURE: `${Name}/FETCH_DETAIL_FAILURE`
  CREATE_REQUEST: `${Name}/CREATE_REQUEST`
  CREATE_SUCCESS: `${Name}/CREATE_SUCCESS`
  CREATE_FAILURE: `${Name}/CREATE_FAILURE`
  UPDATE_REQUEST: `${Name}/UPDATE_REQUEST`
  UPDATE_SUCCESS: `${Name}/UPDATE_SUCCESS`
  UPDATE_FAILURE: `${Name}/UPDATE_FAILURE`
  DELETE_REQUEST: `${Name}/DELETE_REQUEST`
  DELETE_SUCCESS: `${Name}/DELETE_SUCCESS`
  DELETE_FAILURE: `${Name}/DELETE_FAILURE`
  CLEAR_CURRENT: `${Name}/CLEAR_CURRENT`
  CLEAR_ERROR: `${Name}/CLEAR_ERROR`
}

export const createActionTypes = <Name extends string>(
  name: Name,
): ActionTypeMap<Name> =>
  ({
    FETCH_REQUEST: `${name}/FETCH_REQUEST`,
    FETCH_SUCCESS: `${name}/FETCH_SUCCESS`,
    FETCH_FAILURE: `${name}/FETCH_FAILURE`,
    FETCH_DETAIL_REQUEST: `${name}/FETCH_DETAIL_REQUEST`,
    FETCH_DETAIL_SUCCESS: `${name}/FETCH_DETAIL_SUCCESS`,
    FETCH_DETAIL_FAILURE: `${name}/FETCH_DETAIL_FAILURE`,
    CREATE_REQUEST: `${name}/CREATE_REQUEST`,
    CREATE_SUCCESS: `${name}/CREATE_SUCCESS`,
    CREATE_FAILURE: `${name}/CREATE_FAILURE`,
    UPDATE_REQUEST: `${name}/UPDATE_REQUEST`,
    UPDATE_SUCCESS: `${name}/UPDATE_SUCCESS`,
    UPDATE_FAILURE: `${name}/UPDATE_FAILURE`,
    DELETE_REQUEST: `${name}/DELETE_REQUEST`,
    DELETE_SUCCESS: `${name}/DELETE_SUCCESS`,
    DELETE_FAILURE: `${name}/DELETE_FAILURE`,
    CLEAR_CURRENT: `${name}/CLEAR_CURRENT`,
    CLEAR_ERROR: `${name}/CLEAR_ERROR`,
  }) as ActionTypeMap<Name>

export const createCrudApi = <TEntity extends { id: number }, TForm>(
  config: CrudModuleConfig<TEntity, TForm>,
) => {
  const serialize =
    config.serialize ??
    ((data: TForm) => toFormData(data as unknown as Record<string, unknown>))

  return {
    fetchList: (page?: number) =>
      axiosClient.get<TEntity[]>(config.endpoints.list, {
        params: page != null ? { page } : undefined,
      }),
    fetchDetail: (id: number) =>
      axiosClient.get<TEntity>(config.endpoints.detail, { params: { id } }),
    create: (data: TForm) => {
      const buildBody = () => serialize(data)
      const requestConfig: RetryConfig = { _bodyFactory: buildBody }
      return axiosClient.post<unknown>(
        config.endpoints.create,
        buildBody(),
        requestConfig,
      )
    },
    update: (id: number, data: TForm) => {
      const buildBody = () => serialize(data)
      const requestConfig: RetryConfig = {
        params: { id },
        _bodyFactory: buildBody,
      }
      return axiosClient.post(
        config.endpoints.update,
        buildBody(),
        requestConfig,
      )
    },
    remove: (id: number) =>
      axiosClient.delete(config.endpoints.remove, { params: { id } }),
  }
}
