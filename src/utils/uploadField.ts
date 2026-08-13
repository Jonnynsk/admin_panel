import { UploadFile } from 'antd/es/upload/interface'

export type ResolvedUpload =
  | { status: 'unchanged' }
  | { status: 'new'; file: File }
  | { status: 'removed' }

export const resolveUploadField = (
  fileList?: UploadFile[],
): ResolvedUpload => {
  const item = fileList?.[0]

  if (!item) {
    return { status: 'removed' }
  }

  const file = item.originFileObj as File | undefined
  if (file) {
    return { status: 'new', file }
  }

  return { status: 'unchanged' }
}
