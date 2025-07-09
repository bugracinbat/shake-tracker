import { test } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';
import { lighthouseConfig, lighthouseMobileConfig, thresholds, mobileThresholds } from './lighthouse.config';
import fs from 'fs';
import path from 'path';

const lighthouseReportDir = path.join(process.cwd(), 'lighthouse-reports');

test.describe('Lighthouse Performance Tests', () => {
  test.beforeAll(async () => {
    // Create reports directory if it doesn't exist
    if (!fs.existsSync(lighthouseReportDir)) {
      fs.mkdirSync(lighthouseReportDir, { recursive: true });
    }
  });

  test('Homepage - Desktop Performance', async ({ page, browserName }) => {
    // Only run Lighthouse tests in Chromium
    test.skip(browserName !== 'chromium', 'Lighthouse only works in Chromium');

    await page.goto('/');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Run Lighthouse audit
    const reportPath = path.join(lighthouseReportDir, `homepage-desktop-${Date.now()}.html`);
    
    await playAudit({
      page,
      thresholds,
      reports: {
        formats: {
          html: true,
        },
        name: reportPath,
        directory: lighthouseReportDir,
      },
      config: lighthouseConfig,
    });

    console.log(`Desktop Lighthouse report saved to: ${reportPath}`);
  });

  test('Homepage - Mobile Performance', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Lighthouse only works in Chromium');

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const reportPath = path.join(lighthouseReportDir, `homepage-mobile-${Date.now()}.html`);
    
    await playAudit({
      page,
      thresholds: mobileThresholds,
      reports: {
        formats: {
          html: true,
        },
        name: reportPath,
        directory: lighthouseReportDir,
      },
      config: lighthouseMobileConfig,
    });

    console.log(`Mobile Lighthouse report saved to: ${reportPath}`);
  });

  test('Analytics Page Performance', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Lighthouse only works in Chromium');

    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');
    
    const reportPath = path.join(lighthouseReportDir, `analytics-desktop-${Date.now()}.html`);
    
    await playAudit({
      page,
      thresholds,
      reports: {
        formats: {
          html: true,
        },
        name: reportPath,
        directory: lighthouseReportDir,
      },
      config: lighthouseConfig,
    });

    console.log(`Analytics Lighthouse report saved to: ${reportPath}`);
  });

  test('Full User Journey Performance', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Lighthouse only works in Chromium');

    // Navigate to homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Interact with search
    const searchInput = page.locator('input[placeholder*="Search earthquakes"]');
    await searchInput.fill('California');
    await searchInput.press('Enter');
    await page.waitForTimeout(2000);
    
    // Run Lighthouse after user interaction
    const reportPath = path.join(lighthouseReportDir, `user-journey-${Date.now()}.html`);
    
    await playAudit({
      page,
      thresholds,
      reports: {
        formats: {
          html: true,
        },
        name: reportPath,
        directory: lighthouseReportDir,
      },
      config: lighthouseConfig,
    });

    console.log(`User Journey Lighthouse report saved to: ${reportPath}`);
  });
});