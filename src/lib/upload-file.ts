type UploadFileOptions = {
  groupId?: string
  actor?: string
  variant?: 'avatar' | 'cover'
  groupName?: string
  name?: string
}

export async function uploadFile(
  file: File,
  options: UploadFileOptions = {},
): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  if (options.groupId) formData.append('groupId', options.groupId)
  if (options.actor) {
    formData.append('actor', options.actor)
    if (options.variant) formData.append('variant', options.variant)
  }
  if (options.groupName) formData.append('groupName', options.groupName)
  if (options.name) formData.append('uploadName', options.name)

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) throw new Error('Upload failed')

  const { ipfsHash } = await response.json()
  return ipfsHash
}
