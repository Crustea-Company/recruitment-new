import { NextRequest, NextResponse } from 'next/server'

function getAllowedOrigins(): string[] {
  return (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
}

export function middleware(req: NextRequest) {
  const origin = req.headers.get('origin') || ''
  const allowedOrigins = getAllowedOrigins()
  const isAllowed = !origin || allowedOrigins.includes(origin)

  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': isAllowed && origin ? origin : allowedOrigins[0] || '*',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  }

  // Handle preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: { ...corsHeaders, 'Access-Control-Max-Age': '86400' },
    })
  }

  const res = NextResponse.next()
  for (const [k, v] of Object.entries(corsHeaders)) {
    res.headers.set(k, v)
  }
  return res
}

export const config = {
  matcher: '/api/:path*',
}
