import { cookies } from 'next/headers'
import type { SessionData } from './session'

const SESSION_COOKIE_NAME = 'paigham_session'

export async function getServerSession(req?: Request): Promise<SessionData | null> {
  // If Request object is provided (middleware), use it
  if (req) {
    const cookieHeader = req.headers.get('cookie')
    if (!cookieHeader) return null

    const sessionCookie = cookieHeader
      .split('; ')
      .find(row => row.startsWith(`${SESSION_COOKIE_NAME}=`))

    if (!sessionCookie) return null

    try {
      return JSON.parse(decodeURIComponent(sessionCookie.split('=')[1])) as SessionData
    } catch {
      return null
    }
  }

  // Use next/headers (only in server components)
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

    if (!sessionCookie?.value) return null

    return JSON.parse(sessionCookie.value) as SessionData
  } catch {
    return null
  }
} 