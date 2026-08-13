import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Result } from 'antd'
import {
  selectAuthBootstrapError,
  selectAuthInitialized,
  selectAuthLoading,
} from '../routes/authCheck'
import { appInit } from '../store/auth/actions'
import { GlobalLoader } from './GlobalLoader'

export const AppBootstrap: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useDispatch()
  const initialized = useSelector(selectAuthInitialized)
  const loading = useSelector(selectAuthLoading)
  const error = useSelector(selectAuthBootstrapError)

  if (!initialized) {
    if (error) {
      return (
        <div className="app-bootstrap">
          <Result
            status="warning"
            title="Нет связи с сервером"
            subTitle={error}
            extra={
              <Button
                type="primary"
                loading={loading}
                onClick={() => dispatch(appInit())}
              >
                Повторить
              </Button>
            }
          />
        </div>
      )
    }

    return <GlobalLoader tip="Восстановление сессии…" />
  }

  return <>{children}</>
}
