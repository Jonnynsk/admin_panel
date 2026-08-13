import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Route, Switch, useLocation } from 'react-router-dom'
import {
  LogoutOutlined,
  TagsOutlined,
  TeamOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'
import { Button, Layout, Menu, Result, Typography } from 'antd'
import { AuthorFormPage } from '../pages/AuthorFormPage'
import { AuthorsListPage } from '../pages/AuthorsListPage'
import { PostCreatePage } from '../pages/PostCreatePage'
import { PostEditPage } from '../pages/PostEditPage'
import { PostsListPage } from '../pages/PostsListPage'
import { TagFormPage } from '../pages/TagFormPage'
import { TagsListPage } from '../pages/TagsListPage'
import { logout } from '../store/auth/actions'
import { RootState } from '../store/rootReducer'
import './AdminLayout.css'

const { Header, Sider, Content } = Layout

const resolveSelectedKey = (pathname: string): string => {
  if (pathname.startsWith('/authors')) {
    return '/authors'
  }
  if (pathname.startsWith('/tags')) {
    return '/tags'
  }
  return '/'
}

export const AdminLayout: React.FC = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const loading = useSelector((state: RootState) => state.auth.loading)
  const selectedKey = resolveSelectedKey(location.pathname)

  return (
    <Layout className="admin-layout">
      <Sider breakpoint="lg" collapsedWidth={64} theme="dark">
        <div className="admin-logo">Admin</div>
        <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]}>
          <Menu.Item key="/" icon={<UnorderedListOutlined />}>
            <Link to="/">Посты</Link>
          </Menu.Item>
          <Menu.Item key="/authors" icon={<TeamOutlined />}>
            <Link to="/authors">Авторы</Link>
          </Menu.Item>
          <Menu.Item key="/tags" icon={<TagsOutlined />}>
            <Link to="/tags">Теги</Link>
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Header className="admin-header">
          <Typography.Text className="admin-header-title">
            Панель администратора
          </Typography.Text>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            loading={loading}
            onClick={() => dispatch(logout())}
          >
            Выйти
          </Button>
        </Header>

        <Content className="admin-content">
          <Switch>
            <Route exact path="/" component={PostsListPage} />
            <Route exact path="/posts/create" component={PostCreatePage} />
            <Route exact path="/posts/:id/edit" component={PostEditPage} />
            <Route exact path="/authors" component={AuthorsListPage} />
            <Route
              exact
              path="/authors/create"
              render={() => <AuthorFormPage mode="create" />}
            />
            <Route
              exact
              path="/authors/:id/edit"
              render={() => <AuthorFormPage mode="edit" />}
            />
            <Route exact path="/tags" component={TagsListPage} />
            <Route
              exact
              path="/tags/create"
              render={() => <TagFormPage mode="create" />}
            />
            <Route
              exact
              path="/tags/:id/edit"
              render={() => <TagFormPage mode="edit" />}
            />
            <Route
              render={() => (
                <Result
                  status="404"
                  title="404"
                  subTitle="Страница не найдена"
                />
              )}
            />
          </Switch>
        </Content>
      </Layout>
    </Layout>
  )
}
