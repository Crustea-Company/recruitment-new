import { NextRequest, NextResponse } from 'next/server'
import { getHRSession } from '@/lib/session'

interface HRAccount {
  email: string
  password: string
  nama: string
  role: string
}

function validateInput(email: unknown, password: unknown): string | null {
  if (typeof email !== 'string' || typeof password !== 'string') return 'Input tidak valid'
  if (!email.includes('@') || email.length > 255) return 'Email tidak valid'
  if (password.length < 1 || password.length > 100) return 'Password tidak valid'
  return null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'Body tidak valid' }, { status: 400 })

    const { email, password } = body
    const validationError = validateInput(email, password)
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })

    const accounts: HRAccount[] = JSON.parse(process.env.HR_ACCOUNTS || '[]')
    const akun = accounts.find(
      (a) => a.email === email.trim().toLowerCase() && a.password === password
    )

    if (!akun) {
      // Delay untuk mencegah brute force timing attack
      await new Promise((r) => setTimeout(r, 300))
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })
    }

    const session = await getHRSession()
    session.isLoggedIn = true
    session.email = akun.email
    session.nama = akun.nama
    session.role = akun.role
    await session.save()

    return NextResponse.json({ email: akun.email, nama: akun.nama, role: akun.role })
  } catch (e) {
    console.error('Login error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
