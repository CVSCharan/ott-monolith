import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAccessToken } from '@/lib/jwt'
import { checkRateLimit } from '@/lib/redis'
import { logger } from '@/lib/logger'

/**
 * StreamForge Proxy Middleware.
 * Enforces rate limiting, token shape validation, and security headers.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1'

  // Log incoming API request (Morgan equivalent)
  if (pathname.startsWith('/api/')) {
    logger.info({ method: request.method, path: pathname, ip }, 'Incoming API Request')
  }

  // ── 1. Security Headers ──────────────────────────────────
  const response = NextResponse.next()
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  )

  // ── 2. Rate Limiting via Redis Token Bucket ──────────────
  const isAuthRoute = pathname.startsWith('/api/auth')
  if (isAuthRoute) {
    // 10 req / 15 min per IP, fail-closed
    const ipLimit = await checkRateLimit({
      key: `auth:ip:${ip}`,
      limit: 10,
      windowSeconds: 900,
      failClosed: true,
    })

    if (!ipLimit.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'TOO_MANY_REQUESTS',
          message: 'Too many authentication attempts. Please try again later.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': ipLimit.resetSeconds.toString(),
          },
        },
      )
    }
  } else if (pathname.startsWith('/api/')) {
    // 100 req / min general rate limit, fail-open
    const generalLimit = await checkRateLimit({
      key: `general:ip:${ip}`,
      limit: 100,
      windowSeconds: 60,
      failClosed: false,
    })

    if (!generalLimit.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'TOO_MANY_REQUESTS',
          message: 'Rate limit exceeded.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': generalLimit.resetSeconds.toString(),
          },
        },
      )
    }
  }

  // ── 3. JWT Inspection & Header Propagation ───────────────
  const token = request.cookies.get('access_token')?.value

  if (token) {
    const payload = await verifyAccessToken(token)
    if (payload) {
      // Enrich headers for Server Components and Route Handlers
      response.headers.set('x-account-id', payload.sub)
      response.headers.set('x-account-email', payload.email)
      response.headers.set('x-account-role', payload.role)
      response.headers.set('x-plan-slug', payload.planSlug)
      if (payload.profileId) {
        response.headers.set('x-profile-id', payload.profileId)
        response.headers.set('x-profile-mode', payload.isKids ? 'kids' : 'general')
        response.headers.set('x-max-maturity-rank', payload.maxMaturityRank.toString())
      }
    }
  }

  // ── 4. Admin Route Protection ────────────────────────────
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const role = response.headers.get('x-account-role')
    if (role !== 'admin') {
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({ error: 'FORBIDDEN', message: 'Admin privilege required.' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } },
        )
      }
      return NextResponse.redirect(
        new URL('/login?from=' + encodeURIComponent(pathname), request.url),
      )
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
