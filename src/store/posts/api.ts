import { AxiosResponse } from 'axios'
import axiosClient, { RetryConfig } from '../../api/axiosClient'
import {
  AuthorOption,
  PostDetail,
  PostFormPayload,
  PostListItem,
  PostsPagination,
  TagOption,
} from './types'

const readHeader = (
  headers: AxiosResponse['headers'],
  name: string,
): string | undefined => {
  if (!headers || typeof headers !== 'object') {
    return undefined
  }

  const record = headers as Record<string, unknown>
  const value = record[name] ?? record[name.toLowerCase()]

  if (value == null) {
    return undefined
  }

  return Array.isArray(value) ? String(value[0]) : String(value)
}

export const parsePaginationHeaders = (
  headers: AxiosResponse['headers'],
): PostsPagination => ({
  currentPage: Number(readHeader(headers, 'X-Pagination-Current-Page') || 1),
  pageCount: Number(readHeader(headers, 'X-Pagination-Page-Count') || 0),
  perPage: Number(readHeader(headers, 'X-Pagination-Per-Page') || 20),
  totalCount: Number(readHeader(headers, 'X-Pagination-Total-Count') || 0),
})

export const toPostFormData = (payload: PostFormPayload): FormData => {
  const body = new FormData()
  body.append('code', payload.code)
  body.append('title', payload.title)
  body.append('authorId', String(payload.authorId))
  body.append('text', payload.text)

  payload.tagIds?.forEach((tagId) => {
    body.append('tagIds[]', String(tagId))
  })

  if (payload.previewPicture instanceof File) {
    body.append('previewPicture', payload.previewPicture)
  }

  return body
}

export const fetchPosts = (page = 1) =>
  axiosClient.get<PostListItem[]>('/manage/posts', {
    params: { page },
  })

export const fetchPostDetail = (id: number) =>
  axiosClient.get<PostDetail>('/manage/posts/detail', {
    params: { id },
  })

export const createPost = (payload: PostFormPayload) => {
  const buildBody = () => toPostFormData(payload)
  const requestConfig: RetryConfig = { _bodyFactory: buildBody }
  return axiosClient.post<{ id: number }>(
    '/manage/posts/add',
    buildBody(),
    requestConfig,
  )
}

export const updatePost = (id: number, payload: PostFormPayload) => {
  const buildBody = () => toPostFormData(payload)
  const requestConfig: RetryConfig = {
    params: { id },
    _bodyFactory: buildBody,
  }
  return axiosClient.post('/manage/posts/edit', buildBody(), requestConfig)
}

export const deletePost = (id: number) =>
  axiosClient.delete('/manage/posts/remove', {
    params: { id },
  })

export const fetchAuthors = () =>
  axiosClient.get<AuthorOption[]>('/manage/authors')

export const fetchTags = () => axiosClient.get<TagOption[]>('/manage/tags')
