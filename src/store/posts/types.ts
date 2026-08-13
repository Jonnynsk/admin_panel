export interface PostPicture {
  id: number
  name: string
  url: string
}

export interface PostListItem {
  id: number
  title: string
  code: string
  authorName?: string
  previewPicture?: PostPicture | null
  tagNames?: string[]
  updatedAt?: string
  createdAt?: string
}

export interface PostDetail {
  id: number
  title: string
  code: string
  text: string
  previewPicture?: PostPicture | null
  author?: {
    id: number
    fullName?: string
  } | null
  tags?: Array<{ id: number; name: string; code: string }>
}

export interface PostFormPayload {
  code: string
  title: string
  authorId: number
  tagIds?: number[]
  text: string
  previewPicture?: File
}

export interface PostsPagination {
  currentPage: number
  totalCount: number
  pageCount: number
  perPage: number
}

export interface FetchPostsPayload {
  page?: number
}

export interface UpdatePostPayload {
  id: number
  data: PostFormPayload
}

export interface DeletePostPayload {
  id: number
}

export interface AuthorOption {
  id: number
  name: string
  lastName?: string
  secondName?: string
}

export interface TagOption {
  id: number
  name: string
  code: string
}
