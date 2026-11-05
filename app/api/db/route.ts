import { NextRequest, NextResponse } from 'next/server'
import { getHRSession } from '@/lib/session'

// Operasi write yang boleh dilakukan kandidat tanpa sesi HR
const CANDIDATE_WRITE_PATTERNS = [
  /^pelamar(\?.*)?$/,          // POST: submit lamaran baru
  /^hasil_tes(\?.*)?$/,        // POST: submit hasil tes
  /^sesi_tes\?id=eq\.[^&]+$/, // PATCH: tandai sesi dipakai
  /^pesan(\?.*)?$/,            // POST: kirim pesan ke HR
]

function isCandidateWrite(path: string, method: string): boolean {
  if (method === 'GET') return true
  if (method === 'POST') return CANDIDATE_WRITE_PATTERNS.some((p) => p.test(path))
  if (method === 'PATCH' && /^sesi_tes/.test(path)) return true
  return false
}

function validatePath(path: unknown): string | null {
  if (typeof path !== 'string') return 'Path harus berupa string'
  if (path.length > 500) return 'Path terlalu panjang'
  // Cegah path traversal
  if (/\.\./.test(path) || path.startsWith('/')) return 'Path tidak valid'
  return null
}

function validateMethod(method: unknown): string | null {
  const allowed = ['GET', 'POST', 'PATCH', 'DELETE']
  if (typeof method !== 'string' || !allowed.includes(method.toUpperCase())) {
    return 'Method tidak valid'
  }
  return null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'Body tidak valid' }, { status: 400 })

    const { path, method = 'GET', body: reqBody, headers: extraHeaders = {}, prefer } = body

    const pathError = validatePath(path)
    if (pathError) return NextResponse.json({ error: pathError }, { status: 400 })

    const methodError = validateMethod(method)
    if (methodError) return NextResponse.json({ error: methodError }, { status: 400 })

    const upperMethod = method.toUpperCase()
    const isWrite = upperMethod !== 'GET'

    // Operasi write non-kandidat wajib sesi HR
    if (isWrite && !isCandidateWrite(path, upperMethod)) {
      const session = await getHRSession()
      if (!session.isLoggedIn) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const supaUrl = `${process.env.SUPABASE_URL}/rest/v1/${path}`
    const supaHeaders: Record<string, string> = {
      apikey: process.env.SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY!}`,
      'Content-Type': 'application/json',
      Prefer: prefer || 'return=representation',
    }

    // Hanya teruskan header yang aman
    const safeExtraHeaders = ['prefer', 'range'] as const
    for (const h of safeExtraHeaders) {
      if (extraHeaders[h]) supaHeaders[h] = extraHeaders[h]
    }

    const fetchOpts: RequestInit = { method: upperMethod, headers: supaHeaders }
    if (reqBody !== undefined && reqBody !== null) {
      fetchOpts.body = JSON.stringify(reqBody)
    }

    const supaRes = await fetch(supaUrl, fetchOpts)

    if (supaRes.status === 204) return new NextResponse(null, { status: 204 })

    const text = await supaRes.text()
    const data = text ? JSON.parse(text) : null
    return NextResponse.json(data, { status: supaRes.status })
  } catch (e) {
    console.error('DB proxy error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
