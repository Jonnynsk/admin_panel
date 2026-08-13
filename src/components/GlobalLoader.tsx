import React from 'react'
import { Spin } from 'antd'
import './GlobalLoader.css'

type GlobalLoaderProps = {
  tip?: string
}

export const GlobalLoader: React.FC<GlobalLoaderProps> = ({
  tip = 'Восстановление сессии…',
}) => (
  <div className="global-loader" role="status" aria-live="polite">
    <Spin size="large" tip={tip} />
  </div>
)
