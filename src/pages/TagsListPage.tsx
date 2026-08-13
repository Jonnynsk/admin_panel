import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Popconfirm, Space, Table, Typography, message } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { Tag, tagsActions } from '../store/tags'
import { RootState } from '../store/rootReducer'

export const TagsListPage: React.FC = () => {
  const dispatch = useDispatch()
  const { list, loading, error } = useSelector((state: RootState) => state.tags)

  useEffect(() => {
    dispatch(tagsActions.fetchRequest())
  }, [dispatch])

  useEffect(() => {
    if (!error) {
      return
    }
    message.error(error)
    dispatch(tagsActions.clearError())
  }, [error, dispatch])

  const columns: ColumnsType<Tag> = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: 'Название', dataIndex: 'name' },
    { title: 'Код', dataIndex: 'code' },
    { title: 'Сортировка', dataIndex: 'sort', width: 120 },
    {
      title: 'Действия',
      width: 140,
      render: (_, row) => (
        <Space>
          <Link to={`/tags/${row.id}/edit`}>
            <Button type="link" icon={<EditOutlined />} />
          </Link>
          <Popconfirm
            title="Удалить тег?"
            onConfirm={() =>
              dispatch(tagsActions.deleteRequest({ id: row.id }))
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
          Теги
        </Typography.Title>
        <Link to="/tags/create">
          <Button type="primary" icon={<PlusOutlined />}>
            Создать
          </Button>
        </Link>
      </Space>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={list} pagination={false} />
    </div>
  )
}
