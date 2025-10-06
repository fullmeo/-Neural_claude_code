# GitHub Actions Workflows

## 📋 Overview

DJ Cloudio uses GitHub Actions for automated CI/CD pipelines to ensure code quality, security, and reliable deployments.

---

## 🔧 Active Workflows

### 1. **CI/CD Pipeline** (`ci-cd-pipeline.yml`)

**Triggers:**
- Push to `main`, `develop`
- Pull requests to `main`
- Manual dispatch

**Jobs:**
1. **Code Quality** - ESLint, Prettier
2. **Smart Contract Tests** - Hardhat test suite (81 tests)
3. **Frontend Tests** - Jest/Vitest tests
4. **Security Audit** - npm audit, Snyk, Slither
5. **Deploy Testnet** - Base Sepolia (develop branch)
6. **Deploy Frontend** - Netlify/Vercel
7. **Deploy Mainnet** - Base Mainnet (manual, main branch)
8. **Notifications** - Slack, Discord

**Required Secrets:**
```
TESTNET_PRIVATE_KEY
BASE_SEPOLIA_RPC_URL
BASESCAN_API_KEY
NETLIFY_AUTH_TOKEN
NETLIFY_SITE_ID
SNYK_TOKEN
SLACK_WEBHOOK_URL (optional)
DISCORD_WEBHOOK (optional)
```

---

### 2. **Code Quality & Security** (`code-quality.yml`)

**Triggers:**
- Push to `main`, `develop`, `feature/**`
- Pull requests
- Manual dispatch with task selection

**Jobs:**

#### **JavaScript/HTML Linting**
- ESLint with reviewdog integration
- Prettier format check
- Inline PR comments for issues

#### **CodeQL Security Scan**
- GitHub's semantic code analysis
- Security vulnerability detection
- Automatic SARIF upload to Security tab

#### **SonarCloud Quality Gate**
- Code smells, bugs, vulnerabilities
- Technical debt analysis
- Coverage reports integration
- Quality metrics dashboard

#### **Smart Contract Security (Slither)**
- Solidity static analysis
- Vulnerability detection (reentrancy, overflow, etc.)
- JSON + Markdown reports
- Automatic PR comments

#### **Dependency Security**
- npm audit (moderate+ severity)
- Snyk vulnerability scanning
- SARIF upload for GitHub Security

#### **Code Complexity Analysis**
- Cyclomatic complexity reports
- Code duplication detection (jscpd)
- Artifact uploads

#### **AI-Assisted Code Review**
- Automated PR analysis
- Review checklist generation
- Change summary

#### **Performance Benchmarking**
- Smart contract gas usage
- Bundle size analysis
- Performance reports

#### **Documentation Validation**
- README existence check
- NatSpec documentation verification
- TODO/FIXME detection

#### **Quality Gate Summary**
- Aggregates all check results
- Fails if critical checks fail
- Single status indicator

**Required Secrets:**
```
SONAR_TOKEN (optional - for SonarCloud)
SNYK_TOKEN (optional - for Snyk)
```

---

### 3. **Test Workflow** (`test-workflow.yml`)

Simple test runner for quick validation.

**Triggers:**
- Push to any branch
- Pull requests

**Jobs:**
- Run test suite
- Report results

---

## 🚀 Setup Instructions

### Step 1: Configure Secrets

Go to **Settings → Secrets and variables → Actions** and add:

#### **Required for Deployment:**
```bash
TESTNET_PRIVATE_KEY=0x... (dedicated testnet wallet)
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_RPC_URL=https://mainnet.base.org (for production)
BASESCAN_API_KEY=your_basescan_api_key
```

#### **Optional for Enhanced Features:**
```bash
# SonarCloud (code quality)
SONAR_TOKEN=your_sonarcloud_token

# Snyk (security scanning)
SNYK_TOKEN=your_snyk_token

# Netlify (frontend deployment)
NETLIFY_AUTH_TOKEN=your_netlify_token
NETLIFY_SITE_ID=your_site_id

# Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
DISCORD_WEBHOOK=https://discord.com/api/webhooks/...
```

### Step 2: Enable GitHub Features

1. **Code Scanning (CodeQL)**
   - Go to **Security → Code scanning**
   - Enable CodeQL analysis
   - Results appear in PR checks

2. **Dependency Graph**
   - Go to **Insights → Dependency graph**
   - Enable Dependabot alerts
   - Automatic PR for dependency updates

3. **Branch Protection Rules**
   - Go to **Settings → Branches**
   - Protect `main` branch:
     - Require PR reviews (2 reviewers recommended)
     - Require status checks (all CI jobs)
     - Require branches to be up to date
     - Include administrators

### Step 3: External Service Setup (Optional)

#### **SonarCloud**
1. Sign up at https://sonarcloud.io
2. Import your GitHub repository
3. Get `SONAR_TOKEN` from Account → Security
4. Update `code-quality.yml` with your organization name

#### **Snyk**
1. Sign up at https://snyk.io
2. Integrate with GitHub
3. Get `SNYK_TOKEN` from Account Settings
4. Snyk will automatically scan PRs

#### **Netlify/Vercel** (Frontend Deployment)
1. Create account and link repository
2. Get deployment tokens
3. Configure build settings:
   - Build command: `npm run build` (if using build system)
   - Publish directory: `./` or `./dist`

---

## 📊 Workflow Outputs

### Artifacts
Each workflow generates downloadable artifacts:

- **Test Coverage Reports** (`coverage/`)
- **Security Audit Reports** (`slither-report.*`)
- **Complexity Analysis** (`complexity-report.md`)
- **Gas Usage Reports** (`gas-report.txt`)
- **Deployment Logs** (`deployment-output.txt`)

**Access:** Go to Actions → Select workflow run → Artifacts

### PR Comments
Automated comments on pull requests:
- ✅ ESLint inline suggestions
- 🔒 Slither security findings
- 🤖 AI code review checklist
- 📊 Test coverage changes

### Security Tab
Security vulnerabilities appear in:
- **Code scanning alerts** (CodeQL, Snyk)
- **Dependabot alerts** (outdated dependencies)
- **Secret scanning** (if enabled)

---

## 🔍 Monitoring & Debugging

### Check Workflow Status
```bash
# View recent runs
gh workflow list

# View specific workflow runs
gh run list --workflow=code-quality.yml

# Watch live execution
gh run watch
```

### Common Issues

#### **1. Workflow fails with "missing secrets"**
**Solution:** Add required secrets in repository settings

#### **2. Slither fails to install**
**Solution:** Check Python version (needs 3.8+), or use `continue-on-error: true`

#### **3. SonarCloud scan fails**
**Solution:** Verify `SONAR_TOKEN` is valid and organization name is correct

#### **4. Tests fail in CI but pass locally**
**Solution:** Check for environment differences (Node version, dependencies)

#### **5. Deployment fails with gas errors**
**Solution:** Ensure testnet wallet has sufficient ETH from faucet

### Debugging Steps
1. Click on failed job in Actions tab
2. Expand failing step to see logs
3. Check for error messages
4. Verify secrets are configured
5. Re-run workflow with debug logging:
   - Add `ACTIONS_RUNNER_DEBUG: true` to env
   - Add `ACTIONS_STEP_DEBUG: true` to env

---

## 🎯 Best Practices

### For Contributors
1. **Before pushing:**
   ```bash
   npm run lint           # Fix linting issues
   npm run format         # Auto-format code
   npm test               # Run tests locally
   ```

2. **Create PRs from feature branches:**
   ```bash
   git checkout -b feature/my-feature
   git commit -m "feat: add new feature"
   git push origin feature/my-feature
   ```

3. **Wait for CI checks to pass** before requesting review

### For Maintainers
1. **Never merge with failing CI**
2. **Review security alerts immediately**
3. **Keep dependencies updated** (use Dependabot PRs)
4. **Monitor gas usage trends** in performance reports
5. **Require 2 approvals** for mainnet deployments

---

## 📈 Metrics & Reporting

### Code Quality Metrics
- **Test Coverage:** Target >90% (current: 100% functions, 86.84% branches)
- **Code Smells:** Target <5 (SonarCloud)
- **Technical Debt:** Target <1 day
- **Duplication:** Target <3%

### Security Metrics
- **High/Critical Vulnerabilities:** Target 0
- **Medium Vulnerabilities:** Review within 7 days
- **Low Vulnerabilities:** Review within 30 days

### Performance Metrics
- **Smart Contract Gas:**
  - DAO Voting: <110k gas
  - NFT Minting: <400k gas
  - Finalization: <80k gas
- **Frontend Bundle:** Target <200KB

---

## 🔄 Workflow Triggers Summary

| Event | CI/CD Pipeline | Code Quality | Test Workflow |
|-------|----------------|--------------|---------------|
| Push to `main` | ✅ Full pipeline | ✅ All checks | ✅ Tests only |
| Push to `develop` | ✅ + Testnet deploy | ✅ All checks | ✅ Tests only |
| Push to `feature/*` | ✅ No deploy | ✅ All checks | ✅ Tests only |
| Pull Request | ✅ No deploy | ✅ + PR comments | ✅ Tests only |
| Manual Dispatch | ✅ Custom | ✅ Task selection | ✅ Tests only |
| Issue Comment `/fix` | ❌ | ❌ | ❌ |

---

## 🛠️ Maintenance

### Update Workflows
1. Edit workflow files in `.github/workflows/`
2. Test changes in feature branch
3. Verify workflow runs successfully
4. Merge to main

### Update Dependencies
```bash
# GitHub Actions versions
# Check for updates: https://github.com/actions

# Node.js version
# Update NODE_VERSION in workflows

# Solidity version
# Update in hardhat.config.js and workflows
```

### Rotate Secrets
1. Generate new tokens/keys
2. Update in GitHub Settings → Secrets
3. Test workflow execution
4. Delete old secrets

---

## 📚 Resources

- **GitHub Actions Docs:** https://docs.github.com/actions
- **CodeQL Queries:** https://github.com/github/codeql
- **SonarCloud:** https://sonarcloud.io/documentation
- **Slither:** https://github.com/crytic/slither
- **Snyk:** https://docs.snyk.io
- **Hardhat CI:** https://hardhat.org/hardhat-runner/docs/guides/continuous-integration

---

## 🆘 Support

**Issues with workflows?**
1. Check logs in Actions tab
2. Review this documentation
3. Open issue with `ci/cd` label
4. Tag `@maintainers` for urgent issues

**Need new workflow features?**
1. Open feature request issue
2. Describe use case and requirements
3. Suggest implementation if possible

---

**Last Updated:** October 6, 2025
**Maintainer:** DJ Cloudio Team
**Status:** ✅ Production Ready
