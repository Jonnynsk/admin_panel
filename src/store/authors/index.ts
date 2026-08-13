import { createCrudModule } from '../crud/createCrudModule'
import { toFormData } from '../crud/types'

export interface Author {
  id: number
  name: string
  lastName?: string
  secondName?: string
  shortDescription?: string
  description?: string
  avatar?: { id: number; name: string; url: string } | null
  updatedAt?: string
  createdAt?: string
}

export interface AuthorForm {
  name: string
  lastName?: string
  secondName?: string
  shortDescription?: string
  description?: string
  avatar?: File
  removeAvatar?: boolean
}

export const authorsModule = createCrudModule<Author, AuthorForm, 'authors'>({
  name: 'authors',
  withPagination: false,
  endpoints: {
    list: '/manage/authors',
    detail: '/manage/authors/detail',
    create: '/manage/authors/add',
    update: '/manage/authors/edit',
    remove: '/manage/authors/remove',
  },
  serialize: (data) =>
    toFormData({
      name: data.name,
      lastName: data.lastName,
      secondName: data.secondName,
      shortDescription: data.shortDescription,
      description: data.description,
      ...(data.avatar instanceof File ? { avatar: data.avatar } : {}),
      ...(data.removeAvatar ? { removeAvatar: true } : {}),
    }),
  toListItem: (data, id): Author => ({
    id,
    name: data.name,
    lastName: data.lastName,
    secondName: data.secondName,
    shortDescription: data.shortDescription,
    description: data.description,
    ...(data.removeAvatar ? { avatar: null } : {}),
  }),
  findCreated: (data, list) =>
    list.find(
      (item) =>
        item.name === data.name &&
        (item.lastName || '') === (data.lastName || ''),
    ),
})

export const {
  actions: authorsActions,
  reducer: authorsReducer,
  saga: authorsSaga,
} = authorsModule
