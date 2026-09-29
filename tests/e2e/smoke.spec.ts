import { test, expect } from '@playwright/test'

test.describe('StreamForge Core Smoke Suite', () => {
  test('Liveness endpoint responds with status ok', async ({ request }) => {
    const res = await request.get('/api/health/live')
    expect(res.status()).toBe(200)
    const json = await res.json()
    expect(json.status).toBe('ok')
  })

  test('Readiness endpoint returns structured service health', async ({ request }) => {
    const res = await request.get('/api/health/ready')
    expect([200, 503]).toContain(res.status())
    const json = await res.json()
    expect(json).toHaveProperty('status')
    expect(json).toHaveProperty('services')
    expect(json.services).toHaveProperty('database')
    expect(json.services).toHaveProperty('redis')
    expect(json.services).toHaveProperty('worker')
  })

  test('Core Web Vitals RUM endpoint ingests metrics', async ({ request }) => {
    const res = await request.post('/api/telemetry/rum', {
      data: {
        name: 'LCP',
        value: 1250.5,
        rating: 'good',
        url: '/watch/big-buck-bunny',
      },
    })
    expect(res.status()).toBe(204)
  })

  test('Core Web Vitals RUM endpoint rejects invalid metric', async ({ request }) => {
    const res = await request.post('/api/telemetry/rum', {
      data: {
        name: 'INVALID_METRIC',
        value: 100,
      },
    })
    expect(res.status()).toBe(422)
  })

  test('Subscription Plans page displays pricing tiers and feature comparison', async ({
    page,
  }) => {
    await page.goto('/plans')
    await expect(page).toHaveTitle(/Plans/i)
    await expect(page.getByText('Standard')).toBeVisible()
    await expect(page.getByText('Premium')).toBeVisible()
    await expect(page.getByText(/₹149/)).toBeVisible()
    await expect(page.getByText(/₹249/)).toBeVisible()
  })

  test('Admin dashboard requires authentication and redirects unauthenticated user', async ({
    page,
  }) => {
    await page.goto('/admin')
    // Should be redirected away from admin console or show access denied
    await expect(page).not.toHaveURL(/\/admin$/)
  })
})
