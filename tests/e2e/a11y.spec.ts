import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('StreamForge Accessibility Audit (axe-core)', () => {
  test('Plans page meets WCAG 2.2 AA accessibility standards', async ({ page }) => {
    await page.goto('/plans')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })
})
