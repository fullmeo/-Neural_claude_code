# 🚀 Quick Start - Deployment & Cosmogram

## 5-Minute Guide to Deploy and Visualize

---

## Step 1: Configure Environment (2 minutes)

### Create .env files

```bash
# Root .env (if not exists)
cp .env.example .env

# Contracts .env
cd contracts
cp .env.example .env
cd ..
```

### Edit contracts/.env

Add your credentials:

```env
# Required for deployment
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_basescan_api_key_here
TESTNET_PRIVATE_KEY=0x...your_private_key_64_chars...

# Optional for mainnet
BASE_RPC_URL=https://mainnet.base.org
MAINNET_PRIVATE_KEY=0x...
```

**Get API Key:** https://basescan.org/myapikey

### Validate Configuration

```bash
npm run validate:env:contracts
```

Should show:
```
✅ BASE_SEPOLIA_RPC_URL is set
✅ BASESCAN_API_KEY is set
✅ TESTNET_PRIVATE_KEY is set
✅ Validation PASSED!
```

---

## Step 2: Deploy to Testnet (1 minute)

### Single Command Deployment

```bash
npm run deploy:testnet
```

This automatically:
1. ✅ Validates environment
2. ✅ Compiles contracts
3. ✅ Deploys RitualDAO
4. ✅ Deploys PropheticSessionNFT
5. ✅ Injects addresses into .env
6. ✅ Generates config files
7. ✅ Extracts ABIs
8. ✅ Shows verification commands

### Expected Output

```
✅ RitualDAO deployed to: 0x1234567890abcdef...
✅ PropheticSessionNFT deployed to: 0xabcdef1234567890...

🚀 Post-Deployment Configuration
✅ .env file updated
✅ Deployment info saved
✅ JavaScript config created
✅ ABIs extracted

📜 Verification Commands:
npx hardhat verify --network baseSepolia 0x1234...
npx hardhat verify --network baseSepolia 0x5678...
```

---

## Step 3: Verify Contracts (1 minute)

### Copy-Paste Verification Commands

From the deployment output:

```bash
npx hardhat verify --network baseSepolia 0xYOUR_DAO_ADDRESS
npx hardhat verify --network baseSepolia 0xYOUR_NFT_ADDRESS
```

### Check on BaseScan

Visit the provided links:
- DAO: `https://sepolia.basescan.org/address/0x...`
- NFT: `https://sepolia.basescan.org/address/0x...`

---

## Step 4: Launch Cosmogram (30 seconds)

### Open Visualization

```bash
npm run start:cosmogram
```

Opens: http://localhost:3001

### Connect & Load

1. Click **"📡 Load Data"**
2. Accept MetaMask connection
3. Wait for data to load
4. See your DAO/NFT cosmogram! 🌌

---

## Step 5: Test Frontend (30 seconds)

### Launch Main App

```bash
npm start
```

Opens: http://localhost:3000

### Verify Integration

1. Connect MetaMask (Base Sepolia)
2. Check DAO tab - should show contract address
3. Check NFT tab - should show contract address
4. Create a test proposal
5. Watch it appear in cosmogram!

---

## Quick Commands Reference

```bash
# Deployment
npm run deploy:testnet          # Deploy + auto-configure
npm run deploy:mainnet          # Production deploy

# Post-Deployment (manual)
npm run postdeploy             # With prompts
node contracts/scripts/postDeploy.js baseSepolia 0xDAO 0xNFT

# Validation
npm run validate:env           # Frontend config
npm run validate:env:contracts # Deployment config
npm run validate:security      # Security checks

# Visualization
npm run start:cosmogram        # Cosmic visualization
npm start                      # Main app

# Testing
npm test                       # Smart contract tests
npm run coverage               # Coverage report
```

---

## Troubleshooting

### ❌ "Private key must start with 0x"

**Fix:**
```env
# Wrong
TESTNET_PRIVATE_KEY=1234567890abcdef...

# Correct
TESTNET_PRIVATE_KEY=0x1234567890abcdef...
```

### ❌ "Contract addresses not configured"

**Fix:**
```bash
# Re-run post-deployment
npm run postdeploy:testnet
```

### ❌ "MetaMask connection failed"

**Fix:**
1. Unlock MetaMask
2. Switch to Base Sepolia network
3. Refresh page
4. Try again

### ❌ "Insufficient funds"

**Fix:**
Get testnet ETH:
- https://www.alchemy.com/faucets/base-sepolia
- https://basescan.org/faucet

---

## What You'll See

### Cosmogram Visualization

**Elements:**
- 🔮 **Central Circle** - Pulsing cosmic nexus
- ⭕ **Orbital Nodes** - DAO proposals with Tarot colors
- 💎 **Diamonds** - NFT sessions rotating
- ✨ **Particles** - Cosmic dust with connections
- 🌟 **Beams** - Mystical connections on finalization

**Stats:**
- Total proposals count
- Total sessions minted
- Vote counts per proposal
- Energy levels per session

**Interactions:**
- Click proposals → See details
- Click sessions → See metadata
- Hover → Glow effects
- Live updates from blockchain

### Configuration Files Created

```
config/
├── contracts.js              # JS imports
└── abis/
    ├── RitualDAO.json       # DAO ABI
    └── PropheticSessionNFT.json  # NFT ABI

contracts/deployments/
└── baseSepolia.json         # Deployment info

.env                         # Updated with addresses
```

---

## Full Deployment Flow

```
1. Configure .env files (contracts/)
   ↓
2. npm run deploy:testnet
   ↓
3. Validate environment ✅
   ↓
4. Deploy RitualDAO ✅
   ↓
5. Deploy PropheticSessionNFT ✅
   ↓
6. Post-deployment automation ✅
   - Update .env
   - Generate configs
   - Extract ABIs
   ↓
7. Verify on BaseScan ✅
   ↓
8. npm run start:cosmogram
   ↓
9. Connect MetaMask ✅
   ↓
10. Load blockchain data ✅
   ↓
11. Visualize DAO/NFT cosmos! 🌌
```

---

## Network Info

### Base Sepolia (Testnet)

- **Chain ID:** 84532
- **RPC:** https://sepolia.base.org
- **Explorer:** https://sepolia.basescan.org
- **Faucet:** https://basescan.org/faucet

### Base Mainnet (Production)

- **Chain ID:** 8453
- **RPC:** https://mainnet.base.org
- **Explorer:** https://basescan.org

---

## Next Steps

### After Deployment

1. ✅ Create DAO proposals
2. ✅ Cast votes
3. ✅ Mint NFT sessions
4. ✅ Watch cosmogram update
5. ✅ Share your cosmic visualization!

### Advanced

- Read `POSTDEPLOY_GUIDE.md` for advanced options
- Read `COSMOGRAM_GUIDE.md` for customization
- Explore Tarot symbolism
- Integrate with main app

---

## Success Checklist

- [ ] Contracts deployed ✅
- [ ] Addresses injected ✅
- [ ] Contracts verified ✅
- [ ] Cosmogram loading data ✅
- [ ] Frontend connected ✅
- [ ] DAO proposals visible ✅
- [ ] NFT sessions visible ✅
- [ ] Everything working! 🎉

---

**🌌 From zero to cosmic visualization in 5 minutes! 🔮**
