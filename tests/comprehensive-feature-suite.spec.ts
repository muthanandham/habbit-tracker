import { test, expect, Page } from '@playwright/test';

test.describe('Life-OS Comprehensive Feature Suite', () => {
  
  // Helper to mock authentication
  const mockAuth = async (page: Page) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          user: { id: 'test-user-123', email: 'aiden@lifeos.com', name: 'Aiden Thorne' },
          token: 'mock-jwt-token',
          isAuthenticated: true
        },
        version: 0
      }));
    });
  };

  test.beforeEach(async ({ page }) => {
    await mockAuth(page);
    await page.goto('/');
    // Wait for the dashboard to render
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();
  });

  test('Navigation: Should navigate between all core modules', async ({ page }) => {
    const modules = [
      { id: 'nav-habits', url: '/habits', title: 'Habits' },
      { id: 'nav-tasks', url: '/tasks', title: 'Tasks' },
      { id: 'nav-wellness', url: '/wellness', title: 'Wellness Tracker' },
      { id: 'nav-journal', url: '/journal', title: 'Daily Journal' },
      { id: 'nav-dashboard', url: '/', title: 'Good' },
    ];

    for (const module of modules) {
      await page.click(`[data-testid="${module.id}"]`);
      await page.waitForURL(new RegExp(`${module.url}$`));
      
      const heading = page.locator('main h1');
      if (module.id === 'nav-dashboard') {
        await expect(heading).toContainText(/Good/);
      } else {
        await expect(heading).toContainText(module.title);
      }
    }
  });

  test('Habits: Should add and toggle a new habit', async ({ page }) => {
    await page.click('[data-testid="nav-habits"]');
    await expect(page.locator('main h1')).toContainText('Habits');
    
    // Open add modal
    await page.click('[data-testid="add-habit-button"]');
    
    // Fill details
    const habitName = `Test Habit ${Date.now()}`;
    await page.fill('[data-testid="new-habit-name"]', habitName);
    await page.click('[data-testid="save-habit-button"]');
    
    // Verify added
    const habitItem = page.locator(`[data-testid="habit-item-${habitName.toLowerCase().replace(/\s+/g, '-')}"]`);
    await expect(habitItem).toBeVisible();
    
    // Toggle habit
    const toggle = habitItem.locator('[data-testid="habit-toggle"]');
    await toggle.click();
    
    // Verify visual change
    await expect(toggle).toHaveClass(/bg-accent-habit/);
  });

  test('Tasks: Should add and toggle a must-do task', async ({ page }) => {
    await page.click('[data-testid="nav-tasks"]');
    await expect(page.locator('main h1')).toContainText('Tasks');
    
    // Open add modal
    await page.click('[data-testid="add-task-button"]');
    
    // Fill title
    const taskTitle = `Critical Task ${Date.now()}`;
    await page.fill('[data-testid="new-task-title"]', taskTitle);
    
    // Mark as Must-Do
    await page.click('[data-testid="must-do-toggle"]');
    
    // Save
    await page.click('[data-testid="save-task-button"]');
    
    // Verify in Must-Do section
    const testId = `task-item-${taskTitle.toLowerCase().replace(/\s+/g, '-')}`;
    const taskItem = page.locator(`[data-testid="${testId}"]`);
    await expect(taskItem).toBeVisible();
    
    // Toggle completion
    const toggle = taskItem.locator('[data-testid="task-toggle"]');
    await toggle.click();
    
    // Verify line-through appears (it might move out of Must-do, so look for text)
    await expect(page.locator(`text=${taskTitle}`).first()).toHaveClass(/line-through/);
  });

  test('Wellness: Should log today\'s wellness metrics', async ({ page }) => {
    await page.click('[data-testid="nav-wellness"]');
    await expect(page.locator('main h1')).toContainText('Wellness Tracker');
    
    // Open log modal
    await page.click('[data-testid="log-today-button"]');
    
    // Verify modal visible
    await expect(page.locator('text=Log Today\'s Wellness')).toBeVisible();

    // Adjust sliders
    const moodSlider = page.locator('[data-testid="mood-slider"]');
    await moodSlider.focus();
    await page.keyboard.press('ArrowRight');
    
    // Save
    await page.click('[data-testid="save-wellness-log"]');
    
    // Verify modal closed
    await expect(page.locator('text=Log Today\'s Wellness')).not.toBeVisible();
  });

  test('Journal: Should save a new journal entry', async ({ page }) => {
    await page.click('[data-testid="nav-journal"]');
    await expect(page.locator('main h1')).toContainText('Daily Journal');
    
    const entryText = `End-to-end test entry at ${new Date().toISOString()}`;
    await page.fill('[data-testid="journal-textarea"]', entryText);
    
    // Save
    await page.click('[data-testid="save-journal-button"]');
    
    // Verify entry appears in past entries
    await expect(page.locator('text=' + entryText)).toBeVisible();
  });

});
