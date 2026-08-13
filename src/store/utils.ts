import axios, { AxiosError } from 'axios'
import { isSilentAuthError } from '../api/axiosClient'
import { REQUEST_FAILED, VALIDATION_ERROR } from './constants'

export interface FieldError {
  field: string
  message: string
}

export interface ParsedApiError {
  message: string
  fieldErrors: FieldError[]
}

export const getErrorMessage = (
  error: unknown,
  fallback = REQUEST_FAILED,
): string => parseApiError(error, fallback).message

export const parseApiError = (
  error: unknown,
  fallback = REQUEST_FAILED,
): ParsedApiError => {
  if (isSilentAuthError(error)) {
    return { message: '', fieldErrors: [] }
  }

  if (!axios.isAxiosError(error)) {
    if (error instanceof Error) {
      return { message: error.message || fallback, fieldErrors: [] }
    }
    return { message: fallback, fieldErrors: [] }
  }

  const axiosError = error as AxiosError<unknown>
  const data = axiosError.response?.data

  if (Array.isArray(data)) {
    const fieldErrors = data.filter(
      (item): item is FieldError =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as FieldError).field === 'string' &&
        typeof (item as FieldError).message === 'string',
    )

    return {
      message:
        fieldErrors.map((item) => item.message).join('; ') || VALIDATION_ERROR,
      fieldErrors,
    }
  }

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const record = data as Record<string, unknown>
    const fieldErrors: FieldError[] = []

    Object.entries(record).forEach(([field, value]) => {
      if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
        value.forEach((message) => {
          fieldErrors.push({ field, message })
        })
      }
    })

    if (fieldErrors.length) {
      return {
        message:
          fieldErrors.map((item) => item.message).join('; ') ||
          VALIDATION_ERROR,
        fieldErrors,
      }
    }

    if ('message' in record) {
      return {
        message: String(record.message || fallback),
        fieldErrors: [],
      }
    }
  }

  return {
    message: axiosError.message || fallback,
    fieldErrors: [],
  }
}

export const toAntFields = (
  fieldErrors: FieldError[],
): { name: string; errors: string[] }[] =>
  fieldErrors.map((item) => ({
    name: item.field,
    errors: [item.message],
  }))
