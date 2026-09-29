'use server'

import { cookies } from 'next/headers'
import * as authService from './service'
import { verifyAccessToken } from '@/lib/jwt'

/**
 * Server Actions for Authentication & Profile switching.
 * Thin adapters invoking service functions and managing httpOnly cookies.
 */

export async function requireSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  if (!token) {
    throw new Error('Unauthorized: Authentication required.')
  }

  const payload = await verifyAccessToken(token)
  if (!payload) {
    throw new Error('Unauthorized: Invalid or expired session.')
  }

  return payload
}

export async function getSessionUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  if (!token) {
    return null
  }

  try {
    return await verifyAccessToken(token)
  } catch {
    return null
  }
}

export async function requireAdmin() {
  const session = await requireSession()
  if (session.role !== 'admin') {
    throw new Error('Forbidden: Admin privilege required.')
  }
  return session
}

export async function signUpAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password || password.length < 8) {
    return { success: false, error: 'Valid email and minimum 8-character password required.' }
  }

  try {
    await authService.registerAccount(email, password)
    return await loginAction(formData)
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { success: false, error: 'Email and password required.' }
  }

  try {
    const { accessToken, refreshToken, activeProfile } = await authService.authenticate(
      email,
      password,
    )

    const cookieStore = await cookies()

    // Access token cookie (Path=/, 15 minutes)
    cookieStore.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60,
    })

    // Refresh token cookie (Path=/api/auth, 7 days)
    cookieStore.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60,
    })

    return {
      success: true,
      activeProfileId: activeProfile?.id || null,
      isKids: activeProfile?.isKids || false,
    }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('access_token')
  cookieStore.delete('refresh_token')
  return { success: true }
}

export async function selectProfileAction(targetProfileId: string, pin?: string) {
  const session = await requireSession()

  try {
    const { accessToken, profile } = await authService.selectActiveProfile(
      session.sub,
      targetProfileId,
      session.isKids,
      pin,
    )

    const cookieStore = await cookies()
    cookieStore.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60,
    })

    return {
      success: true,
      profile: {
        id: profile.id,
        name: profile.name,
        isKids: profile.isKids,
      },
    }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}

export async function verifyPinAction(pin: string) {
  const session = await requireSession()

  try {
    const isValid = await authService.verifyParentalPin(session.sub, pin)
    return { success: isValid }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}
