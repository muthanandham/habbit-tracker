import { test, expect } from '@playwright/test';

test.describe('AI Gateway Integration', () => {
  test('CommandBar should open on CMD+K and submit request', async ({ page }) => {
    // Intercept AI API request for reliable testing
    await page.route('**/api/ai/process', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          type: 'wellness',
          action: 'create',
          data: { category: 'hydration', value: 500 },
          message: 'Water logged successfully through AI.',
        }),
      });
    });

    // 1. Mock authentication state in localStorage before navigation
    await page.addInitScript(() => {
      window.localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          user: { id: 'test-id', email: 'test@test.com', name: 'Test User' },
          token: 'test-token',
          isAuthenticated: true
        },
        version: 0
      }));
    });

    // Go to landing page
    await page.goto('http://localhost:5173/');
    
    // 2. Verify floating trigger exists
    const trigger = page.locator('[data-testid="command-bar-trigger"]');
    await expect(trigger).toBeVisible();
    
    // 2. Open CommandBar via click
    await trigger.click();
    
    // 3. Verify input is focused and visible
    const input = page.locator('[data-testid="command-bar-input"]');
    await expect(input).toBeVisible();
    await expect(input).toBeFocused();
    
    // 4. Fill and submit
    await input.fill('I just drank 500ml water');
    
    // Intercept alert
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Water logged successfully through AI.');
      await dialog.dismiss();
    });
    
    await page.locator('[data-testid="command-bar-submit"]').click();
    
    // 5. Verify input is cleared
    await expect(input).toHaveValue('');
  });
});
