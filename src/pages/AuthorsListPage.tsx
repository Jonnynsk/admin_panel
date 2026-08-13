import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Popconfirm, Space, Table, Typography, message } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { Author, authorsActions } from '../store/authors'
import { RootState } from '../store/rootReducer'

export const AuthorsListPage: React.FC = () => {
  const dispatch = useDispatch()
  const { list, loading, error } = useSelector((state: RootState) => state.authors)

  useEffect(() => {
    dispatch(authorsActions.fetchRequest())
  }, [dispatch])

  useEffect(() => {
    if (!error) {
      return
    }
    message.error(error)
    dispatch(authorsActions.clearError())
  }, [error, dispatch])

  const columns: ColumnsType<Author> = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    {
      title: 'ФИО',
      render: (_, row) =>
        [row.lastName, row.name, row.secondName].filter(Boolean).join(' '),
    },
    {
      title: 'Аватар',
      dataIndex: 'avatar',
      width: 90,
      render: (avatar: Author['avatar']) =>
        avatar?.url ? (
          <img
            src={avatar.url}
            alt={avatar.name}
            style={{ width: 40, height: 40, objectFit: 'cover' }}
          />
        ) : (
          '—'
        ),
    },
    {
      title: 'Действия',
      width: 140,
      render: (_, row) => (
        <Space>
          <Link to={`/authors/${row.id}/edit`}>
            <Button type="link" icon={<EditOutlined />} />
          </Link>
          <Popconfirm
            title="Удалить автора?"
            onConfirm={() =>
              dispatch(authorsActions.deleteRequest({ id: row.id }))
            }
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          Авторы
        </Typography.Title>
        <Link to="/authors/create">
          <Button type="primary" icon={<PlusOutlined />}>
            Создать
          </Button>
        </Link>
      </Space>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={list} pagination={false} />
    </div>
  )
}
