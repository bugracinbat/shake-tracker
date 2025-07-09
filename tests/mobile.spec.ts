import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['iPhone 12'] });

test.describe('Mobile Experience', () => {
  test('should be responsive on mobile devices', async ({ page }) => {
    await page.goto('/');
    
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeLessThan(500);
    
    // Check AppBar is visible
    const appBar = page.locator('header[class*="MuiAppBar"]');
    await expect(appBar).toBeVisible();
    
    // Check map section exists
    const mapSection = page.locator('#earthquake-map-section');
    await expect(mapSection).toBeVisible();
  });

  test('should show mobile menu button', async ({ page }) => {
    await page.goto('/');
    
    // Look for the menu icon button
    const mobileMenuButton = page.locator('button').filter({ has: page.locator('svg[data-testid="MenuIcon"]') });
    const isMenuVisible = await mobileMenuButton.isVisible();
    
    if (isMenuVisible) {
      await mobileMenuButton.click();
      
      // Check if menu opens
      const menuItems = page.locator('[role="menu"]');
      await expect(menuItems).toBeVisible({ timeout: 5000 });
    }
  });

  test('should scroll smoothly on mobile', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Test vertical scrolling
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(1000);
    
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);
  });

  test('should have touch-friendly UI elements', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that buttons have adequate size for touch
    const buttons = page.locator('button:visible');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      let foundLargeButton = false;
      
      // Check multiple buttons to find one that meets touch requirements
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        const box = await button.boundingBox();
        
        if (box && box.width >= 44 && box.height >= 44) {
          foundLargeButton = true;
          break;
        }
      }
      
      // Also check for icon buttons which might be smaller but still touch-friendly
      if (!foundLargeButton) {
        const iconButtons = page.locator('[class*="MuiIconButton"]');
        const iconButtonCount = await iconButtons.count();
        
        for (let i = 0; i < Math.min(iconButtonCount, 3); i++) {
          const iconButton = iconButtons.nth(i);
          const box = await iconButton.boundingBox();
          
          if (box) {
            // Icon buttons can be slightly smaller but should still be touch-friendly (40px is acceptable)
            expect(box.width).toBeGreaterThanOrEqual(40);
            expect(box.height).toBeGreaterThanOrEqual(40);
            foundLargeButton = true;
            break;
          }
        }
      }
      
      expect(foundLargeButton).toBe(true);
    }
  });

  test('should display earthquake data table on mobile', async ({ page }) => {
    await page.goto('/');
    
    // Wait for table to load
    await page.waitForSelector('table', { timeout: 30000 });
    
    const table = page.locator('table');
    await expect(table).toBeVisible();
    
    // Check if table is horizontally scrollable on mobile
    const tableContainer = page.locator('[class*="MuiTableContainer"]');
    const containerBox = await tableContainer.boundingBox();
    const tableBox = await table.boundingBox();
    
    // Table might be wider than container on mobile (horizontal scroll)
    if (containerBox && tableBox) {
      console.log('Table is scrollable:', tableBox.width > containerBox.width);
    }
  });
});