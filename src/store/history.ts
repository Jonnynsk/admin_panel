import { createBrowserHistory } from 'history'

const basename =
  import.meta.env.BASE_URL === '/'
    ? undefined
    : import.meta.env.BASE_URL.replace(/\/$/, '')

export const history = createBrowserHistory(
  basename ? { basename } : undefined,
)
