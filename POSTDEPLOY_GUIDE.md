# 🚀 Post-Deployment Guide

## Overview

The `postDeploy.js` script automatically configures your frontend after smart contract deployment by injecting contract addresses and generating necessary configuration files.

## Features

✅ **Automatic Configuration**
- Updates .env with contract addresses
- Saves deployment info to JSON
- Generates JavaScript config files
- Extracts contract ABIs for frontend
- Provides verification commands

✅ **Network Support**
- Base Sepolia (testnet)
- Base Mainnet (production)
- Localhost (development)

✅ **Safety Features**
- Address validation (checksummed Ethereum addresses)
- Dry-run mode (test without changes)
- Automatic .env creation from template
- Preserves existing configuration

---

## Usage

### Automatic (Recommended)

Post-deployment runs automatically after deployment:

```bash
# Testnet deployment
npm run deploy:testnet
# → Validates environment
# → Deploys contracts
# → Runs postDeploy.js automatically

# Mainnet deployment
npm run deploy:mainnet
# → Validates environment
# → Deploys contracts
# → Runs postDeploy.js automatically
```

### Manual

Run post-deployment script manually:

```bash
# Basic usage
node contracts/scripts/postDeploy.js <network> <daoAddress> <nftAddress>

# Example for Base Sepolia
node contracts/scripts/postDeploy.js baseSepolia 0x1234567890abcdef... 0xabcdef1234567890...

# Example for Base Mainnet
node contracts/scripts/postDeploy.js base 0x9876543210fedcba... 0xfedcba9876543210...
```

### Dry Run (Test Without Changes)

Preview what would be updated:

```bash
node contracts/scripts/postDeploy.js baseSepolia 0x1234... 0x5678... --dry-run
```

### Help

Display usage information:

```bash
node contracts/scripts/postDeploy.js --help
```

---

## What Gets Updated

### 1. Root `.env` File

**Location:** `.env`

**Updated Variables:**
```env
VITE_CHAIN_ID=84532
VITE_NETWORK_NAME=Base Sepolia
VITE_RPC_URL=https://sepolia.base.org
VITE_DAO_CONTRACT_ADDRESS=0x1234567890abcdef...
VITE_NFT_CONTRACT_ADDRESS=0xabcdef1234567890...
```

- If `.env` exists → Updates addresses
- If `.env` missing → Creates from `.env.example`

### 2. Deployment Info JSON

**Location:** `contracts/deployments/<network>.json`

**Contents:**
```json
{
  "network": "baseSepolia",
  "chainId": "84532",
  "contracts": {
    "RitualDAO": {
      "address": "0x1234567890abcdef...",
      "deployedAt": "2025-10-06T12:34:56.789Z"
    },
    "PropheticSessionNFT": {
      "address": "0xabcdef1234567890...",
      "deployedAt": "2025-10-06T12:34:56.789Z"
    }
  },
  "updatedAt": "2025-10-06T12:34:56.789Z"
}
```

### 3. JavaScript Config

**Location:** `config/contracts.js`

**Contents:**
```javascript
export const CONTRACTS = {
    DAO: '0x1234567890abcdef...',
    NFT: '0xabcdef1234567890...'
};

export const DAO_ADDRESS = '0x1234567890abcdef...';
export const NFT_ADDRESS = '0xabcdef1234567890...';
```

- ES6 module format
- CommonJS compatible
- Direct imports for frontend

### 4. Contract ABIs

**Location:** `config/abis/`

**Files Generated:**
- `RitualDAO.json` - DAO contract ABI
- `PropheticSessionNFT.json` - NFT contract ABI

**Source:** Extracted from `artifacts/contracts/`

---

## Network Configurations

### Base Sepolia (Testnet)

```javascript
{
    chainId: '84532',
    name: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    explorerUrl: 'https://sepolia.basescan.org',
    envPrefix: 'VITE_'
}
```

**Usage:**
```bash
node contracts/scripts/postDeploy.js baseSepolia <daoAddr> <nftAddr>
```

### Base Mainnet (Production)

```javascript
{
    chainId: '8453',
    name: 'Base Mainnet',
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    envPrefix: 'VITE_'
}
```

**Usage:**
```bash
node contracts/scripts/postDeploy.js base <daoAddr> <nftAddr>
```

### Localhost (Development)

```javascript
{
    chainId: '31337',
    name: 'Localhost',
    rpcUrl: 'http://localhost:8545',
    explorerUrl: '',
    envPrefix: 'VITE_'
}
```

**Usage:**
```bash
node contracts/scripts/postDeploy.js localhost <daoAddr> <nftAddr>
```

---

## Verification Commands

After successful post-deployment, the script provides verification commands:

### Contract Verification

```bash
# RitualDAO
npx hardhat verify --network baseSepolia 0x1234567890abcdef...

# PropheticSessionNFT
npx hardhat verify --network baseSepolia 0xabcdef1234567890...
```

### Block Explorer Links

**Base Sepolia:**
- DAO: `https://sepolia.basescan.org/address/0x1234...`
- NFT: `https://sepolia.basescan.org/address/0x5678...`

**Base Mainnet:**
- DAO: `https://basescan.org/address/0x1234...`
- NFT: `https://basescan.org/address/0x5678...`

---

## Output Example

```
═══════════════════════════════════════════════════════════════════════════
  🚀 Post-Deployment Configuration
═══════════════════════════════════════════════════════════════════════════

🔮 Configuring deployment for Base Sepolia

📋 Deployment Details:
────────────────────────────────────────────────────────────────────────────
  Network:     Base Sepolia (Chain ID: 84532)
  RPC URL:     https://sepolia.base.org
  DAO Address: 0x1234567890abcdef...
  NFT Address: 0xabcdef1234567890...
────────────────────────────────────────────────────────────────────────────

ℹ️  Step 1: Updating environment variables...
✅ .env file found
✅ .env file updated successfully

ℹ️  Step 2: Saving deployment information...
✅ Deployment info saved to contracts/deployments/baseSepolia.json

ℹ️  Step 3: Generating JavaScript config...
✅ JavaScript config file created

ℹ️  Step 4: Extracting contract ABIs...
✅ Generated ABI: RitualDAO.json
✅ Generated ABI: PropheticSessionNFT.json

📜 Contract Verification Commands:
────────────────────────────────────────────────────────────────────────────

RitualDAO:
npx hardhat verify --network baseSepolia 0x1234567890abcdef...

PropheticSessionNFT:
npx hardhat verify --network baseSepolia 0xabcdef1234567890...

🔍 View on Block Explorer:
DAO: https://sepolia.basescan.org/address/0x1234567890abcdef...
NFT: https://sepolia.basescan.org/address/0xabcdef1234567890...

═══════════════════════════════════════════════════════════════════════════
  ✨ Post-Deployment Complete
═══════════════════════════════════════════════════════════════════════════

✅ Frontend configuration updated successfully!

🔮 Next steps:
  1. Verify contracts on block explorer (see commands above)
  2. Test frontend integration: npm start
  3. Validate environment: npm run validate:env
  4. Connect MetaMask and test DAO/NFT functions

🔮 The ritual is complete. The contracts are bound to the frontend. 🔮

═══════════════════════════════════════════════════════════════════════════
```

---

## Troubleshooting

### Invalid Address Error

```
❌ Invalid DAO address: 0x1234
```

**Solution:** Ensure addresses are valid Ethereum addresses (0x + 40 hex chars)

### .env File Not Found

```
❌ .env and .env.example not found!
```

**Solution:** Create `.env.example` in project root or run from project root

### Network Not Supported

```
❌ Unknown network: testnet
```

**Solution:** Use supported networks: `baseSepolia`, `base`, or `localhost`

### Artifacts Not Found

```
⚠️  Artifact not found: artifacts/contracts/RitualDAO.sol/RitualDAO.json
```

**Solution:** Compile contracts first:
```bash
npm run compile
```

---

## Integration with Deployment

### Deployment Flow

```
npm run deploy:testnet
  ↓
1. Validate environment (npm run validate:env:contracts)
  ↓
2. Deploy contracts (npx hardhat run scripts/deploy.js)
  ↓
3. Post-deployment (npm run postdeploy:testnet)
  ↓
4. Frontend configured automatically ✅
```

### Manual Post-Deployment

If deployment succeeds but post-deployment fails:

```bash
# Get addresses from deployment output
# Then run manually:
node contracts/scripts/postDeploy.js baseSepolia 0xDAO_ADDRESS 0xNFT_ADDRESS
```

---

## File Structure

After successful post-deployment:

```
Neural_claude_code/
├── .env                              # UPDATED - Contract addresses
├── config/                           # CREATED
│   ├── contracts.js                  # JS config with addresses
│   └── abis/                         # CREATED
│       ├── RitualDAO.json           # DAO ABI
│       └── PropheticSessionNFT.json # NFT ABI
├── contracts/
│   ├── deployments/                  # CREATED
│   │   ├── baseSepolia.json         # Testnet deployment info
│   │   └── base.json                # Mainnet deployment info
│   └── scripts/
│       └── postDeploy.js            # Post-deployment script
└── ...
```

---

## Next Steps After Post-Deployment

### 1. Verify Contracts

```bash
# Use commands provided by script
npx hardhat verify --network baseSepolia 0xDAO_ADDRESS
npx hardhat verify --network baseSepolia 0xNFT_ADDRESS
```

### 2. Test Frontend Integration

```bash
npm start
# Open http://localhost:3000
# Connect MetaMask
# Test DAO/NFT functionality
```

### 3. Validate Configuration

```bash
npm run validate:env
# Should show contract addresses configured
```

### 4. Launch Cosmogram

```bash
npm run start:cosmogram
# Open http://localhost:3001
# Visualize DAO proposals and NFT sessions
```

---

## Security Notes

✅ **Safe Operations:**
- Only updates configuration files
- Never modifies smart contracts
- Preserves existing .env settings
- Creates backups implicitly (git)

⚠️  **Important:**
- Run from project root directory
- Ensure git tracking up to date
- Verify addresses before running
- Use `--dry-run` to test first

---

## Advanced Usage

### Custom Environment Prefix

Modify `getNetworkConfig()` in `postDeploy.js`:

```javascript
{
    envPrefix: 'CUSTOM_'  // Changes VITE_ to CUSTOM_
}
```

### Multiple Deployments

Track multiple network deployments:

```bash
# Deploy to testnet
npm run deploy:testnet
# Creates: contracts/deployments/baseSepolia.json

# Deploy to mainnet
npm run deploy:mainnet
# Creates: contracts/deployments/base.json

# Both deployments tracked independently
```

### CI/CD Integration

Add to GitHub Actions workflow:

```yaml
- name: Deploy Contracts
  run: npm run deploy:testnet

- name: Post-Deployment Configuration
  run: |
    DAO_ADDR=$(cat contracts/deployments/baseSepolia.json | jq -r '.contracts.RitualDAO.address')
    NFT_ADDR=$(cat contracts/deployments/baseSepolia.json | jq -r '.contracts.PropheticSessionNFT.address')
    echo "DAO deployed at $DAO_ADDR"
    echo "NFT deployed at $NFT_ADDR"
```

---

## Resources

**Scripts:**
- `contracts/scripts/postDeploy.js` - Main post-deployment script
- `contracts/scripts/deploy.js` - Deployment script

**Documentation:**
- `VALIDATION_GUIDE.md` - Environment validation
- `SECURITY.md` - Security best practices
- `README.md` - General project overview

**Commands:**
```bash
npm run deploy:testnet     # Deploy + auto post-deploy
npm run postdeploy        # Manual post-deploy
npm run validate:env      # Validate configuration
npm start                 # Test frontend
npm run start:cosmogram   # Visualize deployments
```

---

🚀 **Post-deployment automation ensures your frontend is always in sync with deployed contracts!**
