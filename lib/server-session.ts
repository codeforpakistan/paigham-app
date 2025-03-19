import { cookies } from 'next/headers'
import { SessionData } from './session'

export const SESSION_COOKIE_NAME = 'paigham_session'

export function getServerSession(): SessionData | null {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
    
    if (!sessionCookie?.value) {
      console.log('No session cookie found')
      return null
    }

    const sessionData = JSON.parse(sessionCookie.value)
    console.log('Session data parsed:', {
      user_id: sessionData.user?.id,
      company_id: sessionData.company_id,
      has_access_token: !!sessionData.access_token
    })

    return sessionData
  } catch (error) {
    console.error('Error parsing session cookie:', error)
    return null
  }
}

export function setServerSession(sessionData: SessionData) {
  try {
    const cookieStore = cookies()
    cookieStore.set({
      name: SESSION_COOKIE_NAME,
      value: JSON.stringify(sessionData),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })
    return true
  } catch (error) {
    console.error('Error creating session:', error)
    return false
  }
}

export function deleteServerSession() {
  try {
    const cookieStore = cookies()
    cookieStore.delete(SESSION_COOKIE_NAME)
    return true
  } catch (error) {
    console.error('Error deleting session:', error)
    return false
  }
} 