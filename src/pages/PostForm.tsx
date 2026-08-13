import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { UploadOutlined } from '@ant-design/icons'
import {
  Button,
  Alert,
  Form,
  Input,
  Select,
  Space,
  Spin,
  Typography,
  Upload,
} from 'antd'
import { UploadFile } from 'antd/es/upload/interface'
import { authorsActions } from '../store/authors'
import {
  clearPostFormErrors,
  createPostRequest,
  updatePostRequest,
} from '../store/posts/actions'
import { PostFormPayload } from '../store/posts/types'
import { RootState } from '../store/rootReducer'
import { tagsActions } from '../store/tags'
import { POST_PREVIEW_REMOVE_UNSUPPORTED } from '../store/constants'
import { toAntFields } from '../store/utils'
import { resolveUploadField } from '../utils/uploadField'

export interface PostFormValues {
  code: string
  title: string
  authorId: number
  tagIds?: number[]
  text: string
  previewPicture?: UploadFile[]
}

interface PostFormProps {
  mode: 'create' | 'edit'
  postId?: number
  initialValues?: Partial<PostFormValues>
  loading?: boolean
}

const normFile = (event: { fileList: UploadFile[] } | UploadFile[]) =>
  Array.isArray(event) ? event : event?.fileList

const normFileReplace = (event: { fileList: UploadFile[] } | UploadFile[]) => {
  const list = normFile(event)
  return (list ?? []).slice(-1)
}

export const PostForm: React.FC<PostFormProps> = ({
  mode,
  postId,
  initialValues,
  loading = false,
}) => {
  const [form] = Form.useForm<PostFormValues>()
  const dispatch = useDispatch()
  const submitting = useSelector((state: RootState) => state.posts.submitting)
  const authors = useSelector((state: RootState) => state.authors.list)
  const tags = useSelector((state: RootState) => state.tags.list)
  const authorsLoading = useSelector(
    (state: RootState) => state.authors.loading && state.authors.list.length === 0,
  )
  const tagsLoading = useSelector(
    (state: RootState) => state.tags.loading && state.tags.list.length === 0,
  )

  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    dispatch(clearPostFormErrors())
    dispatch(authorsActions.fetchRequest())
    dispatch(tagsActions.fetchRequest())
  }, [dispatch])

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues)
    }
  }, [form, initialValues])

  const onFinish = (values: PostFormValues) => {
    setFormError(null)

    const upload = resolveUploadField(values.previewPicture)

    if (mode === 'edit' && upload.status === 'removed') {
      setFormError(POST_PREVIEW_REMOVE_UNSUPPORTED)
      return
    }

    const payload: PostFormPayload = {
      code: values.code,
      title: values.title,
      authorId: values.authorId,
      tagIds: values.tagIds,
      text: values.text,
      ...(upload.status === 'new' ? { previewPicture: upload.file } : {}),
    }

    const meta = {
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
      dispatch(createPostRequest(payload, meta))
      return
    }

    if (postId != null) {
      dispatch(updatePostRequest({ id: postId, data: payload }, meta))
    }
  }

  if (loading || authorsLoading || tagsLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        {mode === 'create' ? 'Создание поста' : `Редактирование #${postId}`}
      </Typography.Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initialValues}
        style={{ maxWidth: 720 }}
      >
        <Form.Item
          name="title"
          label="Заголовок"
          rules={[{ required: true, message: 'Укажите заголовок' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="code"
          label="Символьный код"
          rules={[{ required: true, message: 'Укажите код' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="authorId"
          label="Автор"
          rules={[{ required: true, message: 'Выберите автора' }]}
        >
          <Select
            showSearch
            optionFilterProp="children"
            placeholder="Выберите автора"
          >
            {authors.map((author) => (
              <Select.Option key={author.id} value={author.id}>
                {[author.lastName, author.name, author.secondName]
                  .filter(Boolean)
                  .join(' ') || `Author #${author.id}`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="tagIds" label="Теги">
          <Select mode="multiple" allowClear placeholder="Теги">
            {tags.map((tag) => (
              <Select.Option key={tag.id} value={tag.id}>
                {tag.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="text"
          label="Текст"
          rules={[{ required: true, message: 'Введите текст' }]}
        >
          <Input.TextArea rows={8} />
        </Form.Item>

        <Form.Item
          name="previewPicture"
          label="Превью"
          valuePropName="fileList"
          getValueFromEvent={mode === 'edit' ? normFileReplace : normFile}
          extra={
            mode === 'edit'
              ? 'Удаление превью на сервере недоступно — только замена файла'
              : undefined
          }
        >
          <Upload
            beforeUpload={() => false}
            listType="picture"
            maxCount={mode === 'edit' ? 2 : 1}
            accept="image/*"
            showUploadList={
              mode === 'edit' ? { showRemoveIcon: false } : undefined
            }
          >
            <Button icon={<UploadOutlined />}>
              {mode === 'edit' ? 'Загрузить / заменить' : 'Загрузить изображение'}
            </Button>
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
          <Link to="/">
            <Button>Отмена</Button>
          </Link>
        </Space>
      </Form>
    </div>
  )
}
