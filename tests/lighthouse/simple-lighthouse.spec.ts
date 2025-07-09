import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const lighthouseReportDir = path.join(process.cwd(), 'lighthouse-reports');

// Simple Lighthouse test that captures performance metrics using Playwright's built-in APIs
test.describe('Performance Metrics', () => {
  test.beforeAll(async () => {
    if (!fs.existsSync(lighthouseReportDir)) {
      fs.mkdirSync(lighthouseReportDir, { recursive: true });
    }
  });

  test('Capture performance metrics for homepage', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Performance metrics work best in Chromium');
    
    // Start collecting metrics
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Collect performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        // Navigation Timing
        navigationStart: navigation.startTime,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        
        // Core Web Vitals approximations
        firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        
        // Resource timing
        totalResources: performance.getEntriesByType('resource').length,
        totalResourceSize: performance.getEntriesByType('resource').reduce((acc, resource: any) => {
          return acc + (resource.transferSize || 0);
        }, 0),
      };
    });
    
    // Get additional metrics from Chrome DevTools Protocol
    const client = await page.context().newCDPSession(page);
    const performanceMetrics2 = await client.send('Performance.getMetrics');
    
    // Extract useful metrics
    const metricsMap = performanceMetrics2.metrics.reduce((acc: any, metric: any) => {
      acc[metric.name] = metric.value;
      return acc;
    }, {});
    
    // Create a simple performance report
    const report = {
      timestamp: new Date().toISOString(),
      url: page.url(),
      browserName,
      metrics: {
        ...performanceMetrics,
        jsHeapUsedSize: metricsMap.JSHeapUsedSize,
        jsHeapTotalSize: metricsMap.JSHeapTotalSize,
        documents: metricsMap.Documents,
        nodes: metricsMap.Nodes,
      },
      // Simple scoring based on key metrics
      scores: {
        firstContentfulPaint: performanceMetrics.firstContentfulPaint < 1800 ? 'good' : performanceMetrics.firstContentfulPaint < 3000 ? 'needs-improvement' : 'poor',
        domContentLoaded: performanceMetrics.domContentLoaded < 1500 ? 'good' : performanceMetrics.domContentLoaded < 3500 ? 'needs-improvement' : 'poor',
        resourceCount: performanceMetrics.totalResources < 50 ? 'good' : performanceMetrics.totalResources < 100 ? 'needs-improvement' : 'poor',
      }
    };
    
    // Save the report
    const reportPath = path.join(lighthouseReportDir, `performance-metrics-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('Performance Report:', report);
    console.log(`Report saved to: ${reportPath}`);
    
    // Basic assertions
    expect(performanceMetrics.firstContentfulPaint).toBeLessThan(5000); // 5 seconds max
    expect(performanceMetrics.domContentLoaded).toBeLessThan(5000); // 5 seconds max
  });

  test('Accessibility audit using Playwright', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Accessibility audit works best in Chromium');
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Run accessibility checks
    const accessibilityReport = await page.evaluate(() => {
      const issues: any[] = [];
      
      // Check for images without alt text
      const imagesWithoutAlt = Array.from(document.querySelectorAll('img:not([alt])'));
      if (imagesWithoutAlt.length > 0) {
        issues.push({
          type: 'error',
          message: `${imagesWithoutAlt.length} images without alt text`,
          elements: imagesWithoutAlt.map(img => img.outerHTML.substring(0, 100))
        });
      }
      
      // Check for buttons without accessible text
      const buttons = Array.from(document.querySelectorAll('button'));
      const buttonsWithoutText = buttons.filter(btn => 
        !btn.textContent?.trim() && !btn.getAttribute('aria-label')
      );
      if (buttonsWithoutText.length > 0) {
        issues.push({
          type: 'error',
          message: `${buttonsWithoutText.length} buttons without accessible text`,
          elements: buttonsWithoutText.map(btn => btn.outerHTML.substring(0, 100))
        });
      }
      
      // Check for proper heading hierarchy
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const headingLevels = headings.map(h => parseInt(h.tagName[1]));
      let headingIssues = false;
      for (let i = 1; i < headingLevels.length; i++) {
        if (headingLevels[i] - headingLevels[i-1] > 1) {
          headingIssues = true;
          break;
        }
      }
      if (headingIssues) {
        issues.push({
          type: 'warning',
          message: 'Heading hierarchy may have gaps'
        });
      }
      
      // Check for form labels
      const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
      const inputsWithoutLabels = inputs.filter(input => {
        const id = input.getAttribute('id');
        const hasLabel = id ? document.querySelector(`label[for="${id}"]`) : false;
        const hasAriaLabel = input.getAttribute('aria-label');
        return !hasLabel && !hasAriaLabel;
      });
      if (inputsWithoutLabels.length > 0) {
        issues.push({
          type: 'warning',
          message: `${inputsWithoutLabels.length} form inputs without labels`,
          elements: inputsWithoutLabels.map(input => input.outerHTML.substring(0, 100))
        });
      }
      
      return {
        totalIssues: issues.length,
        issues,
        score: issues.length === 0 ? 100 : Math.max(0, 100 - (issues.length * 10))
      };
    });
    
    // Save accessibility report
    const reportPath = path.join(lighthouseReportDir, `accessibility-audit-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      url: page.url(),
      ...accessibilityReport
    }, null, 2));
    
    console.log('Accessibility Report:', accessibilityReport);
    console.log(`Report saved to: ${reportPath}`);
    
    // Assert accessibility score is reasonable
    expect(accessibilityReport.score).toBeGreaterThanOrEqual(70);
  });

  test('Generate HTML performance report', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Performance report works best in Chromium');
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Collect all metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      const resources = performance.getEntriesByType('resource');
      
      return {
        navigation: {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          domInteractive: navigation.domInteractive,
          domComplete: navigation.domComplete,
        },
        paint: {
          firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        },
        resources: {
          total: resources.length,
          byType: resources.reduce((acc: any, resource: any) => {
            const type = resource.initiatorType || 'other';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {}),
        }
      };
    });
    
    // Generate simple HTML report
    const htmlReport = `
<!DOCTYPE html>
<html>
<head>
  <title>Performance Report - ${new Date().toISOString()}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
    h2 { color: #666; margin-top: 30px; }
    .metric { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .metric-name { font-weight: bold; }
    .metric-value { color: #4CAF50; }
    .poor { color: #f44336; }
    .needs-improvement { color: #ff9800; }
    .good { color: #4CAF50; }
    .summary { background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Performance Report</h1>
    <div class="summary">
      <p><strong>URL:</strong> ${page.url()}</p>
      <p><strong>Date:</strong> ${new Date().toISOString()}</p>
      <p><strong>Browser:</strong> ${browserName}</p>
    </div>
    
    <h2>Core Web Vitals</h2>
    <div class="metric">
      <span class="metric-name">First Paint</span>
      <span class="metric-value ${metrics.paint.firstPaint < 1000 ? 'good' : metrics.paint.firstPaint < 2500 ? 'needs-improvement' : 'poor'}">
        ${metrics.paint.firstPaint.toFixed(2)}ms
      </span>
    </div>
    <div class="metric">
      <span class="metric-name">First Contentful Paint</span>
      <span class="metric-value ${metrics.paint.firstContentfulPaint < 1800 ? 'good' : metrics.paint.firstContentfulPaint < 3000 ? 'needs-improvement' : 'poor'}">
        ${metrics.paint.firstContentfulPaint.toFixed(2)}ms
      </span>
    </div>
    
    <h2>Page Load Metrics</h2>
    <div class="metric">
      <span class="metric-name">DOM Content Loaded</span>
      <span class="metric-value">${metrics.navigation.domContentLoaded.toFixed(2)}ms</span>
    </div>
    <div class="metric">
      <span class="metric-name">Page Load Complete</span>
      <span class="metric-value">${metrics.navigation.loadComplete.toFixed(2)}ms</span>
    </div>
    <div class="metric">
      <span class="metric-name">DOM Interactive</span>
      <span class="metric-value">${metrics.navigation.domInteractive.toFixed(2)}ms</span>
    </div>
    
    <h2>Resource Summary</h2>
    <div class="metric">
      <span class="metric-name">Total Resources</span>
      <span class="metric-value">${metrics.resources.total}</span>
    </div>
    ${Object.entries(metrics.resources.byType).map(([type, count]) => `
    <div class="metric">
      <span class="metric-name">${type}</span>
      <span class="metric-value">${count}</span>
    </div>
    `).join('')}
  </div>
</body>
</html>
    `;
    
    const reportPath = path.join(lighthouseReportDir, `performance-report-${Date.now()}.html`);
    fs.writeFileSync(reportPath, htmlReport);
    
    console.log(`HTML Performance report saved to: ${reportPath}`);
  });
});