# GitHub Actions Workflows

This directory contains all GitHub Actions workflows for the Shake Tracker project.

## 📋 Workflow Overview

### 🔄 CI Pipeline (`ci.yml`)
**Triggers:** Push to main/develop, Pull requests  
**Purpose:** Continuous Integration

**Jobs:**
- **lint-and-typecheck** - ESLint and TypeScript validation
- **build** - Application build verification
- **test-e2e** - End-to-end testing with Playwright
- **lighthouse-audit** - Performance testing with Lighthouse
- **security-scan** - Dependency vulnerability scanning

### 🚀 Deployment (`deploy.yml`)
**Triggers:** Push to main, Manual dispatch, Tags  
**Purpose:** Production deployment

**Jobs:**
- **build-and-deploy** - Build and deploy to multiple platforms
- **post-deployment** - Post-deployment verification tests

**Deployment Targets:**
- GitHub Pages
- Netlify
- Vercel

### 🔍 Pull Request Checks (`pr.yml`)
**Triggers:** Pull request events  
**Purpose:** Enhanced PR validation

**Jobs:**
- **pr-info** - Automatic PR analysis and comments
- **quick-checks** - Fast validation checks
- **visual-regression** - Visual regression testing
- **performance-check** - Performance impact analysis

### 📦 Dependency Management (`dependencies.yml`)
**Triggers:** Weekly schedule, Manual dispatch  
**Purpose:** Dependency maintenance

**Jobs:**
- **dependency-review** - Weekly dependency audit
- **update-dependencies** - Automated dependency updates

### 🎯 Issue Management (`issue-management.yml`)
**Triggers:** Issue events, PR events, Schedule  
**Purpose:** Community management

**Jobs:**
- **label-issues** - Auto-labeling based on content
- **triage-issues** - Automated issue triage
- **close-stale-issues** - Stale issue cleanup
- **pr-feedback** - PR contributor engagement

## 🔧 Required Secrets

To enable all workflows, configure these secrets in your GitHub repository:

### Deployment Secrets
```
NETLIFY_AUTH_TOKEN    # For Netlify deployment
NETLIFY_SITE_ID       # Netlify site identifier
VERCEL_TOKEN          # For Vercel deployment
VERCEL_ORG_ID         # Vercel organization ID
VERCEL_PROJECT_ID     # Vercel project ID
```

### Notification Secrets
```
SLACK_WEBHOOK_URL     # For deployment notifications
```

## 🔧 Required Variables

Configure these variables in your repository settings:

```
PRODUCTION_URL        # Your production URL for testing
```

## 📊 Workflow Status

You can monitor workflow status via:
- GitHub Actions tab in your repository
- Status badges in README.md
- Slack notifications (if configured)

## 🛠️ Customization

### Modifying Workflows

1. **CI Pipeline:** Adjust test commands in `ci.yml`
2. **Deployment:** Update deployment targets in `deploy.yml`
3. **PR Checks:** Customize performance thresholds in `pr.yml`
4. **Dependencies:** Modify update schedule in `dependencies.yml`

### Adding New Workflows

1. Create new `.yml` file in this directory
2. Follow GitHub Actions syntax
3. Test with workflow dispatch events
4. Document in this README

## 🔗 Useful Links

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Playwright CI Documentation](https://playwright.dev/docs/ci)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Security Best Practices](https://docs.github.com/en/actions/security-guides)

## 📈 Monitoring

### Performance Metrics
- Lighthouse reports stored as artifacts
- Performance regression alerts in PRs
- Bundle size tracking

### Test Results
- Playwright test reports
- Visual regression screenshots
- Coverage reports (if configured)

### Security
- Dependency vulnerability scans
- Automated security updates
- Audit logs in workflow runs