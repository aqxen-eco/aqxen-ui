'use client'

import { useRef, useState } from 'react'
import { MdAddAPhoto } from 'react-icons/md'

import { IPFS_IMAGE_SOURCE } from '@/constants'

type ImageUploadProps = {
  variant: 'avatar' | 'cover'
  value?: string
  onFileSelect: (file: File) => void
  isUploading?: boolean
}

export function ImageUpload({
  variant,
  value,
  onFileSelect,
  isUploading,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const imageUrl = preview || (value ? IPFS_IMAGE_SOURCE + value : null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))
    onFileSelect(file)
  }

  if (variant === 'avatar') {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`border-gray-2 relative size-24 overflow-hidden rounded-full border-4 ${imageUrl ? 'bg-white' : 'bg-gray-1'}`}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <MdAddAPhoto className="text-gray-3 size-6" />
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="border-gray-3 size-5 animate-spin rounded-full border-2 border-t-white" />
            </div>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleChange}
          className="hidden"
        />
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`border-gray-2 relative h-36 w-full overflow-hidden rounded-xl border ${imageUrl ? 'bg-white' : 'bg-linear-(--gradient)'}`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <MdAddAPhoto className="text-gray-3 size-8" />
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="border-gray-3 size-5 animate-spin rounded-full border-2 border-t-white" />
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}
