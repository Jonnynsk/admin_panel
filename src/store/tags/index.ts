import { createCrudModule } from '../crud/createCrudModule'
import { toFormData } from '../crud/types'

export interface Tag {
  id: number
  name: string
  code: string
  sort?: number
  updatedAt?: string
  createdAt?: string
}

export interface TagForm {
  name: string
  code: string
  sort?: number
}

export const tagsModule = createCrudModule<Tag, TagForm, 'tags'>({
  name: 'tags',
  withPagination: false,
  endpoints: {
    list: '/manage/tags',
    detail: '/manage/tags/detail',
    create: '/manage/tags/add',
    update: '/manage/tags/edit',
    remove: '/manage/tags/remove',
  },
  serialize: (data) =>
    toFormData({
      name: data.name,
      code: data.code,
      sort: data.sort ?? 100,
    }),
  toListItem: (data, id): Tag => ({
    id,
    name: data.name,
    code: data.code,
    sort: data.sort ?? 100,
  }),
  findCreated: (data, list) => list.find((item) => item.code === data.code),
})

export const {
  actions: tagsActions,
  reducer: tagsReducer,
  saga: tagsSaga,
} = tagsModule
