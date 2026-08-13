import { AuthTokens } from '../../api/axiosClient'
import axiosClient from '../../api/axiosClient'

export interface LoginPayload {
  email: string
  password: string
}

export const loginRequest = (payload: LoginPayload) => {
  const body = new FormData()
  body.append('email', payload.email)
  body.append('password', payload.password)

  return axiosClient.post<AuthTokens>('/auth/token-generate', body)
}
