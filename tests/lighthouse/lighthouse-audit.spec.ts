import { test, expect, chromium } from '@playwright/test';
import lighthouse from 'lighthouse';
import fs from 'fs';
import path from 'path';

const lighthouseReportDir = path.join(process.cwd(), 'lighthouse-reports');

test.describe('Lighthouse Audits', () => {
  test.beforeAll(async () => {
    // Create reports directory if it doesn't exist
    if (!fs.existsSync(lighthouseReportDir)) {
      fs.mkdirSync(lighthouseReportDir, { recursive: true });
    }
  });

  test('Generate Lighthouse Report for Homepage', async () => {
    const browser = await chromium.launch({
      args: ['--remote-debugging-port=9222'],
      headless: false,
    });
    
    const page = await browser.newPage();
    await page.goto('http://localhost:5173/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Run Lighthouse
    const runnerResult = await lighthouse('http://localhost:5173/', {
      port: 9222,
      output: ['html', 'json'],
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      throttling: {
        rttMs: 40,
        throughputKbps: 10 * 1024,
        cpuSlowdownMultiplier: 1,
      },
    });

    if (!runnerResult) {
      throw new Error('Lighthouse failed to generate report');
    }

    // Save reports
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Save HTML report
    if (runnerResult.report && Array.isArray(runnerResult.report)) {
      const htmlReport = runnerResult.report[0];
      const jsonReport = runnerResult.report[1];
      
      fs.writeFileSync(
        path.join(lighthouseReportDir, `lighthouse-report-${timestamp}.html`),
        htmlReport
      );
      
      fs.writeFileSync(
        path.join(lighthouseReportDir, `lighthouse-report-${timestamp}.json`),
        jsonReport
      );
    }

    // Extract scores
    const scores = {
      performance: runnerResult.lhr.categories.performance.score * 100,
      accessibility: runnerResult.lhr.categories.accessibility.score * 100,
      'best-practices': runnerResult.lhr.categories['best-practices'].score * 100,
      seo: runnerResult.lhr.categories.seo.score * 100,
    };

    console.log('Lighthouse Scores:', scores);

    // Assert minimum scores
    expect(scores.performance).toBeGreaterThanOrEqual(50);
    expect(scores.accessibility).toBeGreaterThanOrEqual(80);
    expect(scores['best-practices']).toBeGreaterThanOrEqual(80);
    expect(scores.seo).toBeGreaterThanOrEqual(80);

    // Save summary
    const summary = {
      timestamp,
      url: 'http://localhost:5173/',
      scores,
      audits: {
        'first-contentful-paint': runnerResult.lhr.audits['first-contentful-paint'].numericValue,
        'largest-contentful-paint': runnerResult.lhr.audits['largest-contentful-paint'].numericValue,
        'cumulative-layout-shift': runnerResult.lhr.audits['cumulative-layout-shift'].numericValue,
        'total-blocking-time': runnerResult.lhr.audits['total-blocking-time'].numericValue,
      },
    };

    fs.writeFileSync(
      path.join(lighthouseReportDir, `lighthouse-summary-${timestamp}.json`),
      JSON.stringify(summary, null, 2)
    );

    await browser.close();
  });

  test('Generate Mobile Lighthouse Report', async () => {
    const browser = await chromium.launch({
      args: ['--remote-debugging-port=9223'],
      headless: false,
    });
    
    const page = await browser.newPage();
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
    
    // Run Lighthouse with mobile config
    const runnerResult = await lighthouse('http://localhost:5173/', {
      port: 9223,
      output: ['html', 'json'],
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      formFactor: 'mobile',
      screenEmulation: {
        mobile: true,
        width: 375,
        height: 667,
        deviceScaleFactor: 2,
      },
      throttling: {
        rttMs: 150,
        throughputKbps: 1.6 * 1024,
        cpuSlowdownMultiplier: 4,
      },
    });

    if (!runnerResult) {
      throw new Error('Lighthouse failed to generate report');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Save reports
    if (runnerResult.report && Array.isArray(runnerResult.report)) {
      const htmlReport = runnerResult.report[0];
      
      fs.writeFileSync(
        path.join(lighthouseReportDir, `lighthouse-mobile-report-${timestamp}.html`),
        htmlReport
      );
    }

    // Extract scores
    const scores = {
      performance: runnerResult.lhr.categories.performance.score * 100,
      accessibility: runnerResult.lhr.categories.accessibility.score * 100,
      'best-practices': runnerResult.lhr.categories['best-practices'].score * 100,
      seo: runnerResult.lhr.categories.seo.score * 100,
    };

    console.log('Mobile Lighthouse Scores:', scores);

    await browser.close();
  });
});