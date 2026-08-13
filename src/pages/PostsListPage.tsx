import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useHistory, useLocation } from 'react-router-dom'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Popconfirm, Space, Table, Typography, message } from 'antd'
import { ColumnsType } from 'antd/es/table'
import {
  clearPostsError,
  deletePostRequest,
  fetchPostsRequest,
} from '../store/posts/actions'
import { PostListItem } from '../store/posts/types'
import { RootState } from '../store/rootReducer'

const readPageFromSearch = (search: string): number => {
  const raw = new URLSearchParams(search).get('page')
  const page = Number(raw)
  return Number.isFinite(page) && page > 0 ? page : 1
}

export const PostsListPage: React.FC = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const location = useLocation()
  const page = readPageFromSearch(location.search)

  const { list, loading, error, pagination } = useSelector(
    (state: RootState) => state.posts,
  )

  useEffect(() => {
    dispatch(fetchPostsRequest({ page }))
  }, [dispatch, page])

  useEffect(() => {
    if (!error) {
      return
    }
    message.error(error)
    dispatch(clearPostsError())
  }, [error, dispatch])

  const columns: ColumnsType<PostListItem> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: 'Превью',
      dataIndex: 'previewPicture',
      width: 90,
      render: (picture: PostListItem['previewPicture']) =>
        picture?.url ? (
          <img
            src={picture.url}
            alt={picture.name}
            style={{ width: 48, height: 48, objectFit: 'cover' }}
          />
        ) : (
          '—'
        ),
    },
    {
      title: 'Заголовок',
      dataIndex: 'title',
    },
    {
      title: 'Код',
      dataIndex: 'code',
    },
    {
      title: 'Автор',
      dataIndex: 'authorName',
      render: (value?: string) => value || '—',
    },
    {
      title: 'Теги',
      dataIndex: 'tagNames',
      render: (tags?: string[]) => (tags?.length ? tags.join(', ') : '—'),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Link to={`/posts/${record.id}/edit`}>
            <Button type="link" icon={<EditOutlined />} />
          </Link>
          <Popconfirm
            title="Удалить пост?"
            okText="Да"
            cancelText="Нет"
            onConfirm={() => dispatch(deletePostRequest({ id: record.id }))}
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Space
        style={{
          width: '100%',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>
          Посты
        </Typography.Title>
        <Link to="/posts/create">
          <Button type="primary" icon={<PlusOutlined />}>
            Создать
          </Button>
        </Link>
      </Space>

      <Table<PostListItem>
        rowKey="id"
        columns={columns}
        dataSource={list}
        loading={loading}
        pagination={{
          current: pagination.currentPage || page,
          total: pagination.totalCount,
          pageSize: pagination.perPage,
          showSizeChanger: false,
          onChange: (nextPage) => {
            history.push(nextPage <= 1 ? '/' : `/?page=${nextPage}`)
          },
        }}
      />
    </div>
  )
}
