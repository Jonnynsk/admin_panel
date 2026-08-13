import { FieldError } from '../utils'
import { CrudMeta } from '../crud/types'
import {
  DeletePostPayload,
  FetchPostsPayload,
  PostDetail,
  PostFormPayload,
  PostListItem,
  PostsPagination,
  UpdatePostPayload,
} from './types'

export const FETCH_POSTS_REQUEST = 'posts/FETCH_POSTS_REQUEST' as const
export const FETCH_POSTS_SUCCESS = 'posts/FETCH_POSTS_SUCCESS' as const
export const FETCH_POSTS_FAILURE = 'posts/FETCH_POSTS_FAILURE' as const

export const FETCH_POST_DETAIL_REQUEST = 'posts/FETCH_POST_DETAIL_REQUEST' as const
export const FETCH_POST_DETAIL_SUCCESS = 'posts/FETCH_POST_DETAIL_SUCCESS' as const
export const FETCH_POST_DETAIL_FAILURE = 'posts/FETCH_POST_DETAIL_FAILURE' as const

export const CREATE_POST_REQUEST = 'posts/CREATE_POST_REQUEST' as const
export const CREATE_POST_SUCCESS = 'posts/CREATE_POST_SUCCESS' as const
export const CREATE_POST_FAILURE = 'posts/CREATE_POST_FAILURE' as const

export const UPDATE_POST_REQUEST = 'posts/UPDATE_POST_REQUEST' as const
export const UPDATE_POST_SUCCESS = 'posts/UPDATE_POST_SUCCESS' as const
export const UPDATE_POST_FAILURE = 'posts/UPDATE_POST_FAILURE' as const

export const DELETE_POST_REQUEST = 'posts/DELETE_POST_REQUEST' as const
export const DELETE_POST_SUCCESS = 'posts/DELETE_POST_SUCCESS' as const
export const DELETE_POST_FAILURE = 'posts/DELETE_POST_FAILURE' as const

export const CLEAR_POST_FORM_ERRORS = 'posts/CLEAR_POST_FORM_ERRORS' as const
export const CLEAR_CURRENT_POST = 'posts/CLEAR_CURRENT_POST' as const
export const CLEAR_POSTS_ERROR = 'posts/CLEAR_POSTS_ERROR' as const

export interface PostsErrorPayload {
  message: string
  fieldErrors: FieldError[]
}

export const fetchPostsRequest = (payload: FetchPostsPayload = {}) => ({
  type: FETCH_POSTS_REQUEST,
  payload,
})

export const fetchPostsSuccess = (
  list: PostListItem[],
  pagination: PostsPagination,
) => ({
  type: FETCH_POSTS_SUCCESS,
  payload: { list, pagination },
})

export const fetchPostsFailure = (payload: PostsErrorPayload) => ({
  type: FETCH_POSTS_FAILURE,
  payload,
})

export const fetchPostDetailRequest = (id: number) => ({
  type: FETCH_POST_DETAIL_REQUEST,
  payload: id,
})

export const fetchPostDetailSuccess = (post: PostDetail) => ({
  type: FETCH_POST_DETAIL_SUCCESS,
  payload: post,
})

export const fetchPostDetailFailure = (payload: PostsErrorPayload) => ({
  type: FETCH_POST_DETAIL_FAILURE,
  payload,
})

export const createPostRequest = (
  data: PostFormPayload,
  meta: CrudMeta<number> = {},
) => ({
  type: CREATE_POST_REQUEST,
  payload: { data, ...meta },
})

export const createPostSuccess = (id: number) => ({
  type: CREATE_POST_SUCCESS,
  payload: id,
})

export const createPostFailure = () => ({
  type: CREATE_POST_FAILURE,
})

export const updatePostRequest = (
  payload: UpdatePostPayload,
  meta: CrudMeta = {},
) => ({
  type: UPDATE_POST_REQUEST,
  payload: { ...payload, ...meta },
})

export const updatePostSuccess = (id: number) => ({
  type: UPDATE_POST_SUCCESS,
  payload: id,
})

export const updatePostFailure = () => ({
  type: UPDATE_POST_FAILURE,
})

export const deletePostRequest = (payload: DeletePostPayload) => ({
  type: DELETE_POST_REQUEST,
  payload,
})

export const deletePostSuccess = (id: number) => ({
  type: DELETE_POST_SUCCESS,
  payload: id,
})

export const deletePostFailure = (payload: PostsErrorPayload) => ({
  type: DELETE_POST_FAILURE,
  payload,
})

export const clearPostFormErrors = () => ({
  type: CLEAR_POST_FORM_ERRORS,
})

export const clearCurrentPost = () => ({
  type: CLEAR_CURRENT_POST,
})

export const clearPostsError = () => ({
  type: CLEAR_POSTS_ERROR,
})

export type PostsAction =
  | ReturnType<typeof fetchPostsRequest>
  | ReturnType<typeof fetchPostsSuccess>
  | ReturnType<typeof fetchPostsFailure>
  | ReturnType<typeof fetchPostDetailRequest>
  | ReturnType<typeof fetchPostDetailSuccess>
  | ReturnType<typeof fetchPostDetailFailure>
  | ReturnType<typeof createPostRequest>
  | ReturnType<typeof createPostSuccess>
  | ReturnType<typeof createPostFailure>
  | ReturnType<typeof updatePostRequest>
  | ReturnType<typeof updatePostSuccess>
  | ReturnType<typeof updatePostFailure>
  | ReturnType<typeof deletePostRequest>
  | ReturnType<typeof deletePostSuccess>
  | ReturnType<typeof deletePostFailure>
  | ReturnType<typeof clearPostFormErrors>
  | ReturnType<typeof clearCurrentPost>
  | ReturnType<typeof clearPostsError>
