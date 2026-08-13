import { RootState } from '../store/rootReducer'

export const selectIsAuthenticated = (state: RootState): boolean =>
  state.auth.isAuthenticated

export const selectAuthInitialized = (state: RootState): boolean =>
  state.auth.initialized

export const selectAuthBootstrapError = (state: RootState): string | null =>
  state.auth.error

export const selectAuthLoading = (state: RootState): boolean => state.auth.loading
