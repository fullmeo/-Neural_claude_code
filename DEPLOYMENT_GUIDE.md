# 🚀 DJ Cloudio - Testnet Deployment Guide

## Prerequisites

1. **Node.js & npm** installed
2. **MetaMask or compatible wallet** with Base Sepolia testnet configured
3. **Testnet ETH** (get from Base Sepolia faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)

## Step 1: Setup Environment

### 1.1 Install Contract Dependencies

```bash
cd contracts
npm install
```

### 1.2 Configure Environment Variables

Create `.env` file from template:

```bash
cp .env.example .env
```

Edit `.env` and add:
- Your private key (NEVER commit this!)
- RPC URLs (use Alchemy, Infura, or public RPCs)
- API keys for block explorers (optional, for verification)

**Important:** Your wallet address is already configured: `0x074059A50bBB09e74CacfDc73376Da4931eB8f3B`

### 1.3 Get Testnet ETH

1. Go to: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
2. Enter your wallet: `0x074059A50bBB09e74CacfDc73376Da4931eB8f3B`
3. Request testnet ETH (you'll receive ~0.1 ETH)

## Step 2: Deploy Contracts to Base Sepolia

```bash
# Compile contracts
npm run compile

# Deploy to Base Sepolia Testnet
npm run deploy:base-sepolia
```

Expected output:
```
🚀 Deploying DJ Cloudio Prophetic Contracts...

Deploying with account: 0x074059A50bBB09e74CacfDc73376Da4931eB8f3B
Network: baseSepolia
Chain ID: 84532

📜 Deploying RitualDAO...
✓ RitualDAO deployed to: 0x...

🎨 Deploying PropheticSessionNFT...
✓ PropheticSessionNFT deployed to: 0x...

✅ Deployment complete!
```

## Step 3: Update Frontend Configuration

Copy deployed addresses to `neural-web3-connector.js`:

```javascript
contracts: {
    // Base Sepolia (Testnet)
    84532: {
        dao: '0xYOUR_DAO_ADDRESS',  // From deployment output
        nft: '0xYOUR_NFT_ADDRESS'   // From deployment output
    }
}
```

## Step 4: Verify Contracts (Optional)

```bash
# Get API key from https://basescan.org/myapikey
export BASESCAN_API_KEY=your_api_key

# Verify contracts
npx hardhat verify --network baseSepolia 0xYOUR_DAO_ADDRESS
npx hardhat verify --network baseSepolia 0xYOUR_NFT_ADDRESS
```

## Step 5: Configure Base Sepolia in MetaMask

Add Base Sepolia testnet to MetaMask:

- **Network Name:** Base Sepolia
- **RPC URL:** https://sepolia.base.org
- **Chain ID:** 84532
- **Currency Symbol:** ETH
- **Block Explorer:** https://sepolia.basescan.org

## Step 6: Test the Application

1. Open the app: http://localhost:3000
2. Click "Connect Wallet" button (in Web3 panel)
3. Approve MetaMask connection
4. You should see:
   - Connected wallet: `0x074059...8f3B`
   - Network: Base Sepolia
   - Balance: ~0.1 ETH

### Test DAO Voting

1. Create a ritual proposal:
   ```javascript
   // In browser console
   const dao = window.NeuralBridge.innovations.get('DAO Curator').instance;
   await dao.createRitualProposal({
       name: 'Test Event',
       date: new Date(Date.now() + 86400000), // Tomorrow
       votingDuration: 3600000 // 1 hour
   });
   ```

2. Cast a vote:
   ```javascript
   const proposalId = dao.activeProposal;
   await dao.castVote(proposalId, 'INVOCATION', 'Opening the portal!');
   ```

3. Finalize (after voting period):
   ```javascript
   await dao.finalizeProposal(proposalId);
   ```

### Test NFT Minting

1. Start autopilot session
2. Play some tracks with rituals
3. Stop autopilot
4. Mint session NFT:
   ```javascript
   const nftModule = window.NeuralBridge.innovations.get('NFT Session').instance;
   const sessionId = nftModule.sessionHistory[0].id;
   await nftModule.mintSessionNFT(sessionId);
   ```

5. View on BaseScan:
   - Go to: https://sepolia.basescan.org/token/0xYOUR_NFT_ADDRESS
   - See your minted session NFT!

## Step 7: Production Deployment (Base Mainnet)

When ready for production:

```bash
# Get real ETH on Base mainnet
# Deploy to Base mainnet
npm run deploy:base

# Update frontend config with mainnet addresses
contracts: {
    8453: {  // Base mainnet
        dao: '0x...',
        nft: '0x...'
    }
}
```

## Contract Addresses

After deployment, your contracts will be at:

### Base Sepolia (Testnet - Chain ID: 84532)
- RitualDAO: `[TO BE DEPLOYED]`
- PropheticSessionNFT: `[TO BE DEPLOYED]`

### Base Mainnet (Production - Chain ID: 8453)
- RitualDAO: `[PENDING]`
- PropheticSessionNFT: `[PENDING]`

## Troubleshooting

### "Insufficient funds" error
- Get more testnet ETH from faucet
- Check you're on Base Sepolia network

### "Transaction underpriced" error
- Increase gas price in hardhat.config.js

### "Contract verification failed"
- Make sure BASESCAN_API_KEY is set
- Wait a few blocks after deployment

### MetaMask doesn't connect
- Make sure Base Sepolia is added to MetaMask
- Refresh page and try again
- Check browser console for errors

## Resources

- **Base Sepolia Faucet:** https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- **Base Docs:** https://docs.base.org
- **BaseScan (Testnet):** https://sepolia.basescan.org
- **Hardhat Docs:** https://hardhat.org/docs

## Next Steps

1. ✅ Deploy contracts to Base Sepolia
2. ✅ Update frontend with addresses
3. ✅ Test DAO voting flow
4. ✅ Test NFT minting
5. 🔄 Setup IPFS for metadata (Pinata/NFT.Storage)
6. 🔄 Create session artwork generator
7. 🔄 Deploy to Base mainnet

---

**Your Wallet:** `0x074059A50bBB09e74CacfDc73376Da4931eB8f3B`

**Need help?** Check contract events on BaseScan or browser console for detailed logs.
