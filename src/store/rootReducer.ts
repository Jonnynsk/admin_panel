import { connectRouter, RouterState } from 'connected-react-router'
import { History } from 'history'
import { AnyAction, combineReducers, Reducer } from 'redux'
import { Author, authorsReducer } from './authors'
import { LOGOUT } from './auth/actions'
import authReducer, { AuthState } from './auth/reducer'
import { CrudState } from './crud/types'
import postsReducer, { PostsState } from './posts/reducer'
import { Tag, tagsReducer } from './tags'

export interface RootState {
  router: RouterState
  auth: AuthState
  posts: PostsState
  authors: CrudState<Author>
  tags: CrudState<Tag>
}

export const createRootReducer = (history: History): Reducer<RootState> => {
  const appReducer = combineReducers({
    router: connectRouter(history),
    auth: authReducer,
    posts: postsReducer,
    authors: authorsReducer,
    tags: tagsReducer,
  })

  return (state: RootState | undefined, action: AnyAction): RootState => {
    if (action.type === LOGOUT && state) {
      return appReducer({ router: state.router } as RootState, action)
    }

    return appReducer(state, action)
  }
}
