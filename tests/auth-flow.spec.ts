import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test('register and login flow', async ({ page }) => {
    // Go to register page
    await page.goto('http://localhost:5173/register');
    
    // Fill register form - using label selectors
    await page.getByLabel('Name').fill('playwright-test');
    await page.getByLabel('Email').fill('playwright@test.com');
    await page.getByLabel('Password').fill('test123456');
    
    // Submit
    await page.getByRole('button', { name: 'Create Account' }).click();
    
    // Wait for navigation
    await page.waitForTimeout(2000);
    
    // Now test login
    await page.goto('http://localhost:5173/login');
    await page.getByLabel('Email').fill('playwright@test.com');
    await page.getByLabel('Password').fill('test123456');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for navigation
    await page.waitForTimeout(2000);
    
    const urlAfterLogin = page.url();
    
    // Should be on dashboard (root path "/")
    expect(urlAfterLogin).toContain('/');
  });
});