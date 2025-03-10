import { type User } from '@supabase/supabase-js'

export const SESSION_COOKIE_NAME = 'paigham_session'

export interface SessionData {
  user: {
    id: string
    email: string
    role: string
  }
  company_id: string
  access_token: string
}

// Client-side session management
export function setSessionCookie(session: SessionData) {
  if (typeof window === 'undefined') return

  // Set cookie that expires in 7 days
  document.cookie = `${SESSION_COOKIE_NAME}=${JSON.stringify(session)}; path=/; max-age=604800; SameSite=Lax`
}

export function getSessionCookie(): SessionData | null {
  if (typeof window === 'undefined') return null

  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${SESSION_COOKIE_NAME}=`))

  if (!cookie) return null

  try {
    return JSON.parse(cookie.split('=')[1])
  } catch {
    return null
  }
}

export function clearSessionCookie() {
  if (typeof window === 'undefined') return

  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
}

export async function createSession(user: User, access_token: string) {
  // Get user profile with company info
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/users/profile`, {
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch user profile')
  }

  const profile = await response.json()

  const sessionData: SessionData = {
    user: {
      id: user.id,
      email: user.email!,
      role: profile.role || 'user'
    },
    company_id: profile.company_id,
    access_token
  }

  setSessionCookie(sessionData)
  return sessionData
} 