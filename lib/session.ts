import { getIronSession, SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'

export interface HRSession {
  isLoggedIn: boolean
  email?: string
  nama?: string
  role?: string
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'crustea_hr',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 jam
  },
}

export async function getHRSession() {
  return getIronSession<HRSession>(cookies(), sessionOptions)
}
