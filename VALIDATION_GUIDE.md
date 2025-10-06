# 🔍 Environment Validation Guide

## Overview

The `validate-env.js` script ensures all required environment variables are correctly configured before deployment or running the application. It prevents common deployment errors and catches security issues.

## Features

✅ **Variable Validation**
- Checks required environment variables exist
- Validates variable formats (private keys, URLs)
- Detects placeholder values
- Context-specific validation (frontend vs contracts)

✅ **Security Checks**
- Verifies .env not tracked by git
- Checks file permissions (Unix/Linux)
- Validates no secrets in .env.example files
- Prevents accidental secret commits

✅ **Smart Handling**
- Optional variables treated as informational only
- Default values for development variables
- Deployment variables can be skipped during dev
- Color-coded output for easy reading

## Usage

### Basic Commands

```bash
# Validate frontend environment
npm run validate:env

# Validate contracts environment
npm run validate:env:contracts

# Run only security checks
npm run validate:security

# Manual validation
node validate-env.js frontend
node validate-env.js contracts --contracts
node validate-env.js --security-only
```

### CLI Options

```bash
node validate-env.js [context] [options]

Contexts:
  frontend   - Validate frontend environment (default)
  contracts  - Validate smart contracts environment

Options:
  --contracts         Use contracts/.env instead of .env
  --skip-deployment   Skip deployment variable validation
  --security-only     Only run security checks
  --help, -h          Show help message
```

### Examples

```bash
# Frontend validation (skipping deployment vars)
node validate-env.js frontend --skip-deployment

# Contracts validation
node validate-env.js contracts --contracts

# Security audit only
node validate-env.js --security-only

# Help message
node validate-env.js --help
```

## Automatic Validation

### On Application Start

The `prestart` hook automatically validates environment before starting:

```bash
npm start
# → Runs validate-env.js frontend --skip-deployment
# → Then starts server if validation passes
```

### Before Deployment

Deployment commands validate environment first:

```bash
npm run deploy:testnet
# → Runs validate-env.js contracts --contracts
# → Then deploys to Base Sepolia if valid

npm run deploy:mainnet
# → Runs validate-env.js contracts --contracts
# → Then deploys to Base Mainnet if valid
```

## Environment Requirements

### Frontend Variables

**Required (Development):**
- `VITE_CHAIN_ID` - Network Chain ID (default: 84532)
- `VITE_NETWORK_NAME` - Network Name (default: Base Sepolia)
- `VITE_RPC_URL` - RPC URL (default: https://sepolia.base.org)

**Optional:**
- `VITE_DAO_CONTRACT_ADDRESS` - DAO Contract Address (after deployment)
- `VITE_NFT_CONTRACT_ADDRESS` - NFT Contract Address (after deployment)
- `VITE_IPFS_GATEWAY` - IPFS Gateway (default: https://ipfs.io/ipfs/)
- `VITE_PINATA_API_KEY` - Pinata API Key for IPFS
- `VITE_GA_TRACKING_ID` - Google Analytics ID

### Contracts Variables

**Required:**
- `BASE_SEPOLIA_RPC_URL` - Base Sepolia RPC URL
- `BASESCAN_API_KEY` - BaseScan API Key for verification

**Deployment (can skip with --skip-deployment):**
- `TESTNET_PRIVATE_KEY` - Private key for testnet deployment
- `MAINNET_PRIVATE_KEY` - Private key for mainnet deployment

**Optional:**
- `BASE_RPC_URL` - Base Mainnet RPC URL
- `PINATA_API_KEY` - Pinata API Key
- `PINATA_SECRET_KEY` - Pinata Secret Key
- `NFT_STORAGE_API_KEY` - NFT.Storage API Key

## Validation Rules

### Private Key Format

```bash
✅ Valid: 0x1234567890abcdef... (66 chars with 0x prefix)
❌ Invalid: 1234567890abcdef... (missing 0x)
❌ Invalid: 0x1234... (wrong length)
```

### URL Format

```bash
✅ Valid: https://sepolia.base.org
✅ Valid: http://localhost:8545
❌ Invalid: sepolia.base.org (missing protocol)
❌ Invalid: ftp://example.com (wrong protocol)
```

### Placeholder Detection

The script detects and warns about placeholder values:

```bash
⚠️  Warning: your_api_key_here
⚠️  Warning: YOUR_PRIVATE_KEY
⚠️  Warning: replace_me
⚠️  Warning: CHANGEME
```

## Security Checks

### 1. Git Tracking

Verifies `.env` is NOT tracked by git:

```bash
✅ .env is NOT tracked by git (good!)
❌ DANGER: .env is tracked by git!
   → Run: git rm --cached .env
```

### 2. File Permissions (Unix/Linux)

Checks `.env` is not readable by others:

```bash
✅ .env has secure permissions (600)
⚠️  .env is readable by others (permissions: 644)
   → Run: chmod 600 .env
```

### 3. Secrets in Examples

Validates `.env.example` files don't contain real secrets:

```bash
✅ .env.example does not contain secrets
❌ .env.example contains a real private key!
```

## Output Format

### Success Output

```
═══════════════════════════════════════════════════
  Security Checks
═══════════════════════════════════════════════════

✅ .env is NOT tracked by git (good!)
✅ .env.example does not contain secrets
✅ contracts/.env.example does not contain secrets

✅ All security checks PASSED!

═══════════════════════════════════════════════════
  Validating FRONTEND Environment
═══════════════════════════════════════════════════

📋 DEVELOPMENT Variables:

✅ VITE_CHAIN_ID is set (84532)
✅ VITE_NETWORK_NAME is set (Base Sepolia)
✅ VITE_RPC_URL is set (https://sepolia.base.org)

📋 OPTIONAL Variables:

❌ VITE_DAO_CONTRACT_ADDRESS is missing! (after deployment)
✅ VITE_IPFS_GATEWAY is set (https://ipfs.io/ipfs/)

✅ Validation PASSED! All required variables are set.

═══════════════════════════════════════════════════
  ✅ VALIDATION COMPLETE - ENVIRONMENT IS READY!
═══════════════════════════════════════════════════
```

### Failure Output

```
❌ Validation FAILED! Missing required variables.
ℹ️  See documentation: .env.example or SECURITY.md
```

## Setup Instructions

### 1. Create .env File

```bash
# Copy example template
cp .env.example .env

# Edit with your values
nano .env  # or vim, code, etc.
```

### 2. Fill Required Variables

For **frontend** development:

```env
VITE_CHAIN_ID=84532
VITE_NETWORK_NAME=Base Sepolia
VITE_RPC_URL=https://sepolia.base.org
VITE_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

For **contracts** deployment:

```env
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_basescan_api_key
TESTNET_PRIVATE_KEY=0x1234567890abcdef... (66 chars)
```

### 3. Validate Configuration

```bash
# Frontend
npm run validate:env

# Contracts
npm run validate:env:contracts

# Security
npm run validate:security
```

### 4. Start Application

```bash
npm start
# Validation runs automatically via prestart hook
```

## Troubleshooting

### .env File Not Found

```
❌ .env file NOT found: /path/to/.env
ℹ️  Create it from template: cp .env.example .env
```

**Solution:** Create .env from template:
```bash
cp .env.example .env
```

### Private Key Format Error

```
❌ TESTNET_PRIVATE_KEY must start with 0x
❌ TESTNET_PRIVATE_KEY has incorrect length (expected 66 chars)
```

**Solution:** Ensure private key format:
- Starts with `0x`
- Followed by 64 hexadecimal characters
- Total length: 66 characters

### URL Format Error

```
❌ VITE_RPC_URL must be a valid URL
```

**Solution:** Ensure URL starts with `http://` or `https://`

### Git Tracking Warning

```
❌ .env is tracked by git! This is a SECURITY RISK!
ℹ️  Run: git rm --cached .env
```

**Solution:** Remove from git:
```bash
git rm --cached .env
git commit -m "Remove .env from git tracking"
```

### Security Checks Failed

```
❌ Security checks FAILED! Fix issues above.
```

**Solution:** Address each security warning, then re-run validation.

**Force Continue (not recommended):**
```bash
node validate-env.js frontend --force
```

## Integration with CI/CD

### GitHub Actions

Add to workflow:

```yaml
- name: Validate Environment
  run: npm run validate:env:contracts

- name: Security Checks
  run: npm run validate:security
```

### Pre-commit Hook

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash
npm run validate:security
if [ $? -ne 0 ]; then
  echo "❌ Security validation failed!"
  exit 1
fi
```

## Best Practices

✅ **DO:**
- Run validation before every deployment
- Keep .env.example updated with new variables
- Use secure private keys (never reuse production keys)
- Set proper file permissions (chmod 600 .env)
- Review security warnings carefully

❌ **DON'T:**
- Commit .env files to git
- Use placeholder values in production
- Share private keys via insecure channels
- Skip security validation (use --force)
- Ignore warnings about optional variables

## Resources

- **Environment Setup:** `.env.example`
- **Security Guide:** `SECURITY.md`
- **Git Ignore Test:** `test-gitignore.sh`
- **Claude CLI:** `CLAUDE_CLI_README.md`

## Support

**Issues:** https://github.com/fullmeo/-Neural_claude_code/issues
**Security:** security@djcloudio.com (or GitHub Security Advisory)

---

🔍 **Environment validation ensures deployment success and security compliance.**
