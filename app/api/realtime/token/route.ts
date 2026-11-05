import { NextResponse } from 'next/server'

// Endpoint ini memberi client URL WebSocket Supabase Realtime
// Key tetap di server, URL dikembalikan dengan token
export async function GET() {
  const url = new URL(
    `/realtime/v1/websocket`,
    process.env.SUPABASE_URL!.replace('https://', 'wss://')
  )
  url.searchParams.set('apikey', process.env.SUPABASE_ANON_KEY!)
  url.searchParams.set('vsn', '1.0.0')
  return NextResponse.json({ wsUrl: url.toString() })
}
