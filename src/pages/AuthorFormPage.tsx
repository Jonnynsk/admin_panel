import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useHistory, useParams } from 'react-router-dom'
import { UploadOutlined } from '@ant-design/icons'
import {
  Alert,
  Button,
  Form,
  Input,
  Result,
  Space,
  Spin,
  Typography,
  Upload,
  message,
} from 'antd'
import { UploadFile } from 'antd/es/upload/interface'
import { AuthorForm, authorsActions } from '../store/authors'
import { RootState } from '../store/rootReducer'
import { toAntFields } from '../store/utils'
import { resolveUploadField } from '../utils/uploadField'

interface AuthorFormValues {
  name: string
  lastName?: string
  secondName?: string
  shortDescription?: string
  description?: string
  avatar?: UploadFile[]
}

const normFile = (event: { fileList: UploadFile[] } | UploadFile[]) =>
  Array.isArray(event) ? event : event?.fileList

export const AuthorFormPage: React.FC<{ mode: 'create' | 'edit' }> = ({
  mode,
}) => {
  const { id } = useParams<{ id: string }>()
  const authorId = Number(id)
  const [form] = Form.useForm<AuthorFormValues>()
  const dispatch = useDispatch()
  const history = useHistory()
  const { current, detailLoading, submitting, error } = useSelector(
    (state: RootState) => state.authors,
  )
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (mode === 'edit' && Number.isFinite(authorId)) {
      dispatch(authorsActions.fetchDetailRequest({ id: authorId }))
    }
  }, [authorId, dispatch, mode])

  useEffect(
    () => () => {
      dispatch(authorsActions.clearCurrent())
    },
    [dispatch],
  )

  const initialValues = useMemo<Partial<AuthorFormValues> | undefined>(() => {
    if (!current || mode !== 'edit') {
      return undefined
    }
    return {
      name: current.name,
      lastName: current.lastName,
      secondName: current.secondName,
      shortDescription: current.shortDescription,
      description: current.description,
      avatar: current.avatar?.url
        ? [
            {
              uid: String(current.avatar.id),
              name: current.avatar.name,
              status: 'done',
              url: current.avatar.url,
            },
          ]
        : [],
    }
  }, [current, mode])

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues)
    }
  }, [form, initialValues])

  const onFinish = (values: AuthorFormValues) => {
    setFormError(null)

    const upload = resolveUploadField(values.avatar)

    const payload: AuthorForm = {
      name: values.name,
      lastName: values.lastName,
      secondName: values.secondName,
      shortDescription: values.shortDescription,
      description: values.description,
      ...(upload.status === 'new' ? { avatar: upload.file } : {}),
      ...(upload.status === 'removed' && mode === 'edit'
        ? { removeAvatar: true }
        : {}),
    }

    const meta = {
      onSuccess: () => {
        message.success(mode === 'create' ? 'Автор создан' : 'Автор обновлён')
        history.push('/authors')
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
      dispatch(authorsActions.createRequest({ data: payload, ...meta }))
      return
    }

    dispatch(
      authorsActions.updateRequest({ id: authorId, data: payload, ...meta }),
    )
  }

  if (mode === 'edit' && !Number.isFinite(authorId)) {
    return <Result status="404" title="Некорректный ID автора" />
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
        {mode === 'create' ? 'Новый автор' : `Автор #${authorId}`}
      </Typography.Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initialValues}
        style={{ maxWidth: 640 }}
      >
        <Form.Item
          name="name"
          label="Имя"
          rules={[{ required: true, message: 'Укажите имя' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="lastName" label="Фамилия">
          <Input />
        </Form.Item>
        <Form.Item name="secondName" label="Отчество">
          <Input />
        </Form.Item>
        <Form.Item name="shortDescription" label="Краткое описание">
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item name="description" label="Описание">
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item
          name="avatar"
          label="Аватар"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload beforeUpload={() => false} listType="picture" maxCount={1} accept="image/*">
            <Button icon={<UploadOutlined />}>Загрузить</Button>
          </Upload>
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
          <Link to="/authors">
            <Button>Отмена</Button>
          </Link>
        </Space>
      </Form>
    </div>
  )
}
