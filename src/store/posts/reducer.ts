import { FieldError } from '../utils'
import {
  CLEAR_CURRENT_POST,
  CLEAR_POST_FORM_ERRORS,
  CLEAR_POSTS_ERROR,
  CREATE_POST_FAILURE,
  CREATE_POST_REQUEST,
  CREATE_POST_SUCCESS,
  DELETE_POST_FAILURE,
  DELETE_POST_REQUEST,
  DELETE_POST_SUCCESS,
  FETCH_POSTS_FAILURE,
  FETCH_POSTS_REQUEST,
  FETCH_POSTS_SUCCESS,
  FETCH_POST_DETAIL_FAILURE,
  FETCH_POST_DETAIL_REQUEST,
  FETCH_POST_DETAIL_SUCCESS,
  PostsAction,
  UPDATE_POST_FAILURE,
  UPDATE_POST_REQUEST,
  UPDATE_POST_SUCCESS,
} from './actions'
import { PostDetail, PostListItem, PostsPagination } from './types'

export interface PostsState {
  list: PostListItem[]
  current: PostDetail | null
  loading: boolean
  detailLoading: boolean
  submitting: boolean
  error: string | null
  fieldErrors: FieldError[]
  pagination: PostsPagination
}

const initialPagination: PostsPagination = {
  currentPage: 1,
  totalCount: 0,
  pageCount: 0,
  perPage: 20,
}

const initialState: PostsState = {
  list: [],
  current: null,
  loading: false,
  detailLoading: false,
  submitting: false,
  error: null,
  fieldErrors: [],
  pagination: initialPagination,
}

const postsReducer = (
  state = initialState,
  action: PostsAction,
): PostsState => {
  switch (action.type) {
    case FETCH_POSTS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      }

    case FETCH_POSTS_SUCCESS:
      return {
        ...state,
        loading: false,
        list: action.payload.list,
        pagination: action.payload.pagination,
        error: null,
      }

    case FETCH_POSTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.message,
      }

    case FETCH_POST_DETAIL_REQUEST:
      return {
        ...state,
        detailLoading: true,
        current: null,
        error: null,
        fieldErrors: [],
      }

    case FETCH_POST_DETAIL_SUCCESS:
      return {
        ...state,
        detailLoading: false,
        current: action.payload,
        error: null,
      }

    case FETCH_POST_DETAIL_FAILURE:
      return {
        ...state,
        detailLoading: false,
        current: null,
        error: action.payload.message,
      }

    case CREATE_POST_REQUEST:
    case UPDATE_POST_REQUEST:
      return {
        ...state,
        submitting: true,
        error: null,
        fieldErrors: [],
      }

    case CREATE_POST_SUCCESS:
    case UPDATE_POST_SUCCESS:
      return {
        ...state,
        submitting: false,
        error: null,
        fieldErrors: [],
      }

    case CREATE_POST_FAILURE:
    case UPDATE_POST_FAILURE:
      return {
        ...state,
        submitting: false,
      }

    case DELETE_POST_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      }

    case DELETE_POST_SUCCESS:
      return {
        ...state,
        loading: false,
        list: state.list.filter((post) => post.id !== action.payload),
        pagination: {
          ...state.pagination,
          totalCount: Math.max(0, state.pagination.totalCount - 1),
        },
        error: null,
      }

    case DELETE_POST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.message,
      }

    case CLEAR_POST_FORM_ERRORS:
      return {
        ...state,
        error: null,
        fieldErrors: [],
      }

    case CLEAR_CURRENT_POST:
      return {
        ...state,
        current: null,
        detailLoading: false,
        fieldErrors: [],
        error: null,
      }

    case CLEAR_POSTS_ERROR:
      return {
        ...state,
        error: null,
      }

    default:
      return state
  }
}

export default postsReducer
