import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Form, Input, Typography } from 'antd'
import '../layouts/AdminLayout.css'
import { loginRequest } from '../store/auth/actions'
import { RootState } from '../store/rootReducer'
import { toAntFields } from '../store/utils'

interface LoginFormValues {
  email: string
  password: string
}

export const LoginPage: React.FC = () => {
  const [form] = Form.useForm<LoginFormValues>()
  const dispatch = useDispatch()
  const loading = useSelector((state: RootState) => state.auth.loading)
  const [formError, setFormError] = useState<string | null>(null)

  const onFinish = (values: LoginFormValues) => {
    setFormError(null)

    dispatch(
      loginRequest(values, {
        onError: (fieldErrors, msg) => {
          if (fieldErrors.length) {
            form.setFields(toAntFields(fieldErrors))
            return
          }
          setFormError(msg || 'Произошла системная ошибка')
        },
      }),
    )
  }

  return (
    <div className="login-page">
      <Card className="login-card" title="Вход в админ-панель">
        <Typography.Paragraph type="secondary">
          Используйте учётные данные API Machineheads
        </Typography.Paragraph>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Введите email' },
              { type: 'email', message: 'Некорректный email' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="email@example.com"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Пароль"
            rules={[{ required: true, message: 'Введите пароль' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Пароль"
              autoComplete="current-password"
            />
          </Form.Item>

          {formError && (
            <Form.Item>
              <Alert message={formError} type="error" showIcon />
            </Form.Item>
          )}

          <Button type="primary" htmlType="submit" block loading={loading}>
            Войти
          </Button>
        </Form>
      </Card>
    </div>
  )
}
