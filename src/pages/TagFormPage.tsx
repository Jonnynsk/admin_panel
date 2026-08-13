import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useHistory, useParams } from 'react-router-dom'
import {
  Alert,
  Button,
  Form,
  Input,
  InputNumber,
  Result,
  Space,
  Spin,
  Typography,
  message,
} from 'antd'
import { TagForm, tagsActions } from '../store/tags'
import { RootState } from '../store/rootReducer'
import { toAntFields } from '../store/utils'

export const TagFormPage: React.FC<{ mode: 'create' | 'edit' }> = ({ mode }) => {
  const { id } = useParams<{ id: string }>()
  const tagId = Number(id)
  const [form] = Form.useForm<TagForm>()
  const dispatch = useDispatch()
  const history = useHistory()
  const { current, detailLoading, submitting, error } = useSelector(
    (state: RootState) => state.tags,
  )
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (mode === 'edit' && Number.isFinite(tagId)) {
      dispatch(tagsActions.fetchDetailRequest({ id: tagId }))
    }
  }, [dispatch, mode, tagId])

  useEffect(
    () => () => {
      dispatch(tagsActions.clearCurrent())
    },
    [dispatch],
  )

  const initialValues = useMemo(() => {
    if (!current || mode !== 'edit') {
      return { sort: 100 }
    }
    return {
      name: current.name,
      code: current.code,
      sort: current.sort ?? 100,
    }
  }, [current, mode])

  useEffect(() => {
    form.setFieldsValue(initialValues)
  }, [form, initialValues])

  const onFinish = (values: TagForm) => {
    setFormError(null)

    const meta = {
      onSuccess: () => {
        message.success(mode === 'create' ? 'Тег создан' : 'Тег обновлён')
        history.push('/tags')
      },
      onError: (
        fieldErrors: { field: string; message: string }[],
        msg: string,
      ) => {
        if (fieldErrors.length) {
          form.setFields(toAntFields(fieldErrors))
          return
        }
        setFormError(msg || 'Произошла системная ошибка')
      },
    }

    if (mode === 'create') {
      dispatch(tagsActions.createRequest({ data: values, ...meta }))
      return
    }

    dispatch(tagsActions.updateRequest({ id: tagId, data: values, ...meta }))
  }

  if (mode === 'edit' && !Number.isFinite(tagId)) {
    return <Result status="404" title="Некорректный ID тега" />
  }

  if (mode === 'edit' && !detailLoading && error && !current) {
    return <Result status="error" title="Ошибка" subTitle={error} />
  }

  if (mode === 'edit' && (detailLoading || !current)) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        {mode === 'create' ? 'Новый тег' : `Тег #${tagId}`}
      </Typography.Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initialValues}
        style={{ maxWidth: 480 }}
      >
        <Form.Item
          name="name"
          label="Название"
          rules={[{ required: true, message: 'Укажите название' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="code"
          label="Код"
          rules={[{ required: true, message: 'Укажите код' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="sort" label="Сортировка">
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>

        {formError && (
          <Form.Item>
            <Alert message={formError} type="error" showIcon />
          </Form.Item>
        )}

        <Space>
          <Button type="primary" htmlType="submit" loading={submitting}>
            Сохранить
          </Button>
          <Link to="/tags">
            <Button>Отмена</Button>
          </Link>
        </Space>
      </Form>
    </div>
  )
}
