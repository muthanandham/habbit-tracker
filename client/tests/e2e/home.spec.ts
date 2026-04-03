import { test, expect } from '@playwright/test';

test.describe('Life-OS E2E', () => {
  test('has correct title', async ({ page }) => {
    await page.goto('/');

    // The app should load with the correct title
    await expect(page).toHaveTitle(/Life-OS/i);
  });

  test('shows login page for unauthenticated users', async ({ page }) => {
    // Navigate to a page first so we can access localStorage
    await page.goto('/login');
    // Clear auth state
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    // Reload so the app re-reads the empty storage
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // The login page has the Life-OS h1 heading
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/Life-OS/i);

    // The email field is type="text" with id="email"
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();

    // Should have a Sign In button
    const signInButton = page.getByRole('button', { name: /sign in/i });
    await expect(signInButton).toBeVisible();
  });

  test('shows register page with form fields', async ({ page }) => {
    await page.goto('/register');

    // The register page has the Life-OS h1 heading
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/Life-OS/i);

    // Should have a Create Account button
    const createButton = page.getByRole('button', { name: /create account/i });
    await expect(createButton).toBeVisible();
  });

  test('navigates between login and register', async ({ page }) => {
    await page.goto('/login');

    // Click the "Create one" link to go to register
    const registerLink = page.getByText(/create one/i);
    await expect(registerLink).toBeVisible();
    await registerLink.click();

    // Should be on register page now
    await expect(page).toHaveURL(/\/register/);

    // Click the "Sign in" link to go back to login
    const loginLink = page.getByText(/sign in/i).last();
    await expect(loginLink).toBeVisible();
    await loginLink.click();

    // Should be on login page now
    await expect(page).toHaveURL(/\/login/);
  });
});
