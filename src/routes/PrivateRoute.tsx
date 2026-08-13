import React from 'react'
import { useSelector } from 'react-redux'
import { Redirect, Route, RouteProps } from 'react-router-dom'
import { GlobalLoader } from '../components/GlobalLoader'
import { selectAuthInitialized, selectIsAuthenticated } from './authCheck'

type PrivateRouteProps = RouteProps

export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  ...rest
}) => {
  const initialized = useSelector(selectAuthInitialized)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  return (
    <Route
      {...rest}
      render={({ location }) => {
        if (!initialized) {
          return <GlobalLoader />
        }

        if (!isAuthenticated) {
          return (
            <Redirect
              to={{
                pathname: '/login',
                state: { from: location },
              }}
            />
          )
        }

        return children
      }}
    />
  )
}
