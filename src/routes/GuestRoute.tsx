import React from 'react'
import { Location } from 'history'
import { useSelector } from 'react-redux'
import { Redirect, Route, RouteProps } from 'react-router-dom'
import { GlobalLoader } from '../components/GlobalLoader'
import { selectAuthInitialized, selectIsAuthenticated } from './authCheck'

type GuestRouteProps = RouteProps

type LocationState = {
  from?: Location
}

export const GuestRoute: React.FC<GuestRouteProps> = ({ children, ...rest }) => {
  const initialized = useSelector(selectAuthInitialized)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  return (
    <Route
      {...rest}
      render={({ location }) => {
        if (!initialized) {
          return <GlobalLoader />
        }

        if (isAuthenticated) {
          const from = (location.state as LocationState | undefined)?.from
          return <Redirect to={from ?? '/'} />
        }

        return children
      }}
    />
  )
}
