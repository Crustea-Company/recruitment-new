import { NextResponse } from 'next/server'
import { getHRSession } from '@/lib/session'

export async function GET() {
  const session = await getHRSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ isLoggedIn: false }, { status: 401 })
  }
  return NextResponse.json({
    isLoggedIn: true,
    email: session.email,
    nama: session.nama,
    role: session.role,
  })
}
