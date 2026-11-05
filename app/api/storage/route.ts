import { NextRequest, NextResponse } from 'next/server'

// Proxy untuk Supabase Storage — key tetap di server
// Client hit /api/storage?path=... untuk operasi storage

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action') || 'list'
  const bucket = 'lamaran'
  const prefix = searchParams.get('prefix') || ''

  const baseUrl = `${process.env.SUPABASE_URL}/storage/v1`
  const headers = {
    Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
    apikey: process.env.SUPABASE_ANON_KEY!,
    'Content-Type': 'application/json',
  }

  if (action === 'list') {
    const res = await fetch(`${baseUrl}/object/list/${bucket}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ prefix, limit: 100 }),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  }

  if (action === 'public-url') {
    const path = searchParams.get('path') || ''
    if (!path) return NextResponse.json({ error: 'Path diperlukan' }, { status: 400 })
    return NextResponse.json({
      url: `${process.env.SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`,
    })
  }

  return NextResponse.json({ error: 'Action tidak dikenal' }, { status: 400 })
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path') || ''
  if (!path) return NextResponse.json({ error: 'Path diperlukan' }, { status: 400 })

  const bucket = 'lamaran'
  const body = await req.arrayBuffer()
  const contentType = req.headers.get('content-type') || 'application/octet-stream'

  const res = await fetch(
    `${process.env.SUPABASE_URL}/storage/v1/object/${bucket}/${path}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        apikey: process.env.SUPABASE_ANON_KEY!,
        'Content-Type': contentType,
      },
      body,
    }
  )

  const data = await res.json().catch(() => null)
  return NextResponse.json(data, { status: res.status })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path') || ''
  if (!path) return NextResponse.json({ error: 'Path diperlukan' }, { status: 400 })

  const bucket = 'lamaran'
  const res = await fetch(
    `${process.env.SUPABASE_URL}/storage/v1/object/${bucket}/${path}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        apikey: process.env.SUPABASE_ANON_KEY!,
      },
    }
  )

  return new NextResponse(null, { status: res.status })
}
