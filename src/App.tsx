import React from 'react'
import { ConnectedRouter } from 'connected-react-router'
import { Provider } from 'react-redux'
import { Redirect, Switch } from 'react-router-dom'
import 'antd/dist/antd.css'
import { AppBootstrap } from './components/AppBootstrap'
import { AdminLayout } from './layouts/AdminLayout'
import { LoginPage } from './pages/LoginPage'
import { GuestRoute } from './routes/GuestRoute'
import { PrivateRoute } from './routes/PrivateRoute'
import { history, store } from './store'
import './App.css'

const AppRoutes: React.FC = () => (
  <ConnectedRouter history={history}>
    <Switch>
      <GuestRoute exact path="/login">
        <LoginPage />
      </GuestRoute>

      <PrivateRoute path="/">
        <AdminLayout />
      </PrivateRoute>

      <Redirect to="/" />
    </Switch>
  </ConnectedRouter>
)

const App: React.FC = () => (
  <Provider store={store}>
    <AppBootstrap>
      <AppRoutes />
    </AppBootstrap>
  </Provider>
)

export default App
