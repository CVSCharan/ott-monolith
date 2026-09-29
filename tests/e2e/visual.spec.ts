import { test, expect } from '@playwright/test'

test.describe('Deterministic Visual Regression Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Force reduced motion to disable CSS transitions and Ken Burns zoom effects
    await page.emulateMedia({ reducedMotion: 'reduce' })
  })

  test('Subscription Plans Page visual snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/plans')
    await page.waitForLoadState('networkidle')

    // Mask dynamic clock/timestamp or external network elements if any
    const pricingCards = page.locator('main')
    await expect(pricingCards).toBeVisible()

    // Assert visual layout consistency
    await expect(page).toHaveScreenshot('plans-desktop-matrix.png', {
      maxDiffPixelRatio: 0.05,
      animations: 'disabled',
    })
  })

  test('Public Homepage Shell visual snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.locator('body')).toBeVisible()

    await expect(page).toHaveScreenshot('homepage-desktop-shell.png', {
      maxDiffPixelRatio: 0.05,
      animations: 'disabled',
    })
  })
})
