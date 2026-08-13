import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { Result } from 'antd'
import {
  clearCurrentPost,
  fetchPostDetailRequest,
} from '../store/posts/actions'
import { RootState } from '../store/rootReducer'
import { PostForm, PostFormValues } from './PostForm'

export const PostEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const postId = Number(id)
  const dispatch = useDispatch()
  const { current, detailLoading, error } = useSelector(
    (state: RootState) => state.posts,
  )

  useEffect(() => {
    if (Number.isFinite(postId)) {
      dispatch(fetchPostDetailRequest(postId))
    }
    return () => {
      dispatch(clearCurrentPost())
    }
  }, [dispatch, postId])

  const initialValues = useMemo<Partial<PostFormValues> | undefined>(() => {
    if (!current) {
      return undefined
    }

    return {
      title: current.title,
      code: current.code,
      text: current.text,
      authorId: current.author?.id,
      tagIds: current.tags?.map((tag) => tag.id),
      previewPicture: current.previewPicture?.url
        ? [
            {
              uid: String(current.previewPicture.id),
              name: current.previewPicture.name,
              status: 'done',
              url: current.previewPicture.url,
            },
          ]
        : [],
    }
  }, [current])

  if (!Number.isFinite(postId)) {
    return <Result status="404" title="Некорректный ID поста" />
  }

  if (!detailLoading && error && !current) {
    return <Result status="error" title="Ошибка" subTitle={error} />
  }

  return (
    <PostForm
      mode="edit"
      postId={postId}
      loading={detailLoading || !current}
      initialValues={initialValues}
    />
  )
}
