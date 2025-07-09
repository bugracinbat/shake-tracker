import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Shake Tracker/);
  });

  test('should display the AppBar', async ({ page }) => {
    await page.goto('/');
    const appBar = page.locator('header[class*="MuiAppBar"]');
    await expect(appBar).toBeVisible();
  });

  test('should show the hero section', async ({ page }) => {
    await page.goto('/');
    const heroTitle = page.locator('h2:has-text("Shake Tracker")');
    await expect(heroTitle).toBeVisible();
    
    const heroSubtitle = page.locator('text=Real-time earthquake monitoring');
    await expect(heroSubtitle).toBeVisible();
  });

  test('should have a map section', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the map section to be present
    await page.waitForSelector('#earthquake-map-section', { timeout: 30000 });
    
    const mapSection = page.locator('#earthquake-map-section');
    await expect(mapSection).toBeVisible();
    
    const mapTitle = page.locator('text=Live Earthquake Map');
    await expect(mapTitle).toBeVisible();
  });

  test('should show earthquake table', async ({ page }) => {
    await page.goto('/');
    
    // Wait for data to load
    await page.waitForLoadState('networkidle');
    
    // Check for the earthquake table
    const earthquakeTable = page.locator('table').first();
    await expect(earthquakeTable).toBeVisible({ timeout: 30000 });
    
    // Check table headers
    await expect(page.locator('th:has-text("Date")')).toBeVisible();
    await expect(page.locator('th:has-text("Location")')).toBeVisible();
    await expect(page.locator('th:has-text("Magnitude")')).toBeVisible();
  });

  test('should have search functionality', async ({ page }) => {
    await page.goto('/');
    
    const searchField = page.locator('input[placeholder*="Search earthquakes"]');
    await expect(searchField).toBeVisible();
  });

  test('should display quick analytics cards', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('text=Total Earthquakes')).toBeVisible();
    await expect(page.locator('text=Strongest Magnitude')).toBeVisible();
    await expect(page.locator('text=Last 24h')).toBeVisible();
  });
});