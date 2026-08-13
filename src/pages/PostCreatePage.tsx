import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { clearCurrentPost } from '../store/posts/actions'
import { PostForm } from './PostForm'

export const PostCreatePage: React.FC = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(clearCurrentPost())
  }, [dispatch])

  return <PostForm mode="create" />
}
