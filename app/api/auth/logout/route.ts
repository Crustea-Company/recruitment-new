import { NextResponse } from 'next/server'
import { getHRSession } from '@/lib/session'

export async function POST() {
  const session = await getHRSession()
  session.destroy()
  return NextResponse.json({ ok: true })
}
