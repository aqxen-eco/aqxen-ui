import { NextResponse } from 'next/server'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: Request) {
  const jwt = process.env.PINATA_JWT
  if (!jwt) {
    return NextResponse.json(
      { error: 'PINATA_JWT not configured' },
      { status: 500 }
    )
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Invalid file type. Allowed: jpeg, png, gif, webp' },
      { status: 400 }
    )
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: 'File too large. Max 5MB' },
      { status: 400 }
    )
  }

  const pinataForm = new FormData()
  pinataForm.append('file', file)

  const response = await fetch(
    'https://api.pinata.cloud/pinning/pinFileToIPFS',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      body: pinataForm,
    }
  )

  if (!response.ok) {
    return NextResponse.json(
      { error: 'Failed to upload to IPFS' },
      { status: 502 }
    )
  }

  const data = await response.json()

  return NextResponse.json({ ipfsHash: data.IpfsHash })
}
