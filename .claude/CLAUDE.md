# CLAUDE.md - DJ Cloudio Project Instructions

## Project Overview

**DJ Cloudio** is an AI-powered DJ mixing application with Web3 integration, featuring:
- Neural AI Autopilot with 10 advanced transitions
- Prophetic playlist system with Tarot integration
- Narrative engine with epic story arcs
- DAO voting for ritual selection
- NFT session minting with complete metadata

## Core Technologies

- **Frontend**: Web Audio API, HTML5, Vanilla JavaScript
- **Blockchain**: Solidity 0.8.20, Hardhat, Web3.js
- **Network**: Base (Ethereum L2)
- **Architecture**: Event-driven with NeuralEventBus

## Code Style & Standards

### JavaScript
- ES6+ syntax with async/await
- Event-driven architecture using NeuralEventBus
- Modular design with separate Neural modules
- Comprehensive error handling with try-catch
- Detailed console logging for debugging

### Smart Contracts
- Solidity 0.8.20 with OpenZeppelin contracts
- ReentrancyGuard for security
- Ownable for access control
- Detailed events for blockchain tracking
- Gas-optimized where possible

### Documentation
- Clear inline comments explaining complex logic
- JSDoc-style function documentation
- README files for each major component
- Step-by-step deployment guides

## File Structure

```
Neural_claude_code/
├── .github/workflows/          # CI/CD pipelines
├── contracts/                  # Smart contracts
│   ├── RitualDAO.sol
│   ├── PropheticSessionNFT.sol
│   └── scripts/deploy.js
├── neural-*.js                # Neural modules
├── neuralmix_enhanced_fixed.html
└── *.md                       # Documentation
```

## Key Modules

### 1. Neural AI Autopilot (`neural-ai-autopilot.js`)
- Autonomous DJ session management
- Intelligent transition selection
- Track analysis (BPM, energy, key)
- Auto-loading with queue management

### 2. Transitions (`neural-ai-transitions.js`)
- 10 advanced transitions: Pulse Sync, Ghost Fade, Genre Warp, etc.
- 5 ritual presets: Invocation, Révélation, Transmutation, Ascension, Méditation
- Mathematical curves for smooth transitions
- Audio effect sequencing

### 3. Prophetic Loader (`neural-prophetic-loader.js`)
- 5 ritual energy archetypes
- 22 Tarot card vibrations
- Score-based track selection
- Mystical track matching

### 4. Narrative Engine (`neural-narrative-engine.js`)
- 5 epic story templates
- Chapter progression system
- Plot twist mechanics
- Automatic story advancement

### 5. Web3 Integration
- `neural-web3-connector.js` - Multi-chain support
- `neural-dao-curator.js` - DAO voting logic
- `neural-nft-session.js` - NFT minting with metadata

## Development Guidelines

### Adding New Features

1. **Create Module File**: `neural-[feature-name].js`
2. **Register with Bridge**: Add to `neuralmix_enhanced_fixed.html`
3. **Event Communication**: Use NeuralEventBus for inter-module communication
4. **UI Integration**: Add panel in HTML with appropriate styling
5. **Documentation**: Update README and relevant guides

### Event-Driven Pattern

```javascript
// Emit events
this.eventBus.emit('event:name', { data });

// Listen to events
this.eventBus.on('event:name', (data) => {
  // Handle event
});
```

### Error Handling

```javascript
try {
  // Operation
  console.log('[Module] Operation successful');
} catch (error) {
  console.error('[Module] Operation failed:', error);
  this.eventBus.emit('error', { module: 'ModuleName', error });
}
```

## Smart Contract Development

### Deployment Process

1. **Local Testing**: `npx hardhat test`
2. **Compile**: `npx hardhat compile`
3. **Deploy Testnet**: `npm run deploy:base-sepolia`
4. **Verify**: `npx hardhat verify --network baseSepolia ADDRESS`

### Security Checklist

- [ ] ReentrancyGuard on state-changing functions
- [ ] Access control with Ownable/modifiers
- [ ] Input validation
- [ ] Event emissions for all important actions
- [ ] Gas optimization
- [ ] External audit (production)

## Web3 Integration

### Wallet Configuration

```javascript
// Testnet
Wallet: 0x074059A50bBB09e74CacfDc73376Da4931eB8f3B
Network: Base Sepolia (Chain ID: 84532)
RPC: https://sepolia.base.org

// Production
Network: Base Mainnet (Chain ID: 8453)
RPC: https://mainnet.base.org
```

### Contract Interaction

```javascript
// DAO Voting
await NeuralDAOCurator.createRitualProposal({ name, date, votingDuration });
await NeuralDAOCurator.castVote(proposalId, ritualId, reason);
await NeuralDAOCurator.finalizeProposal(proposalId);

// NFT Minting
await NeuralNFTSession.mintSessionNFT(sessionId, recipientAddress);
```

## CI/CD with Claude Code

### Automated Workflows

- **Code Review**: Automatic PR analysis
- **Auto-Fix**: `/claude fix` in issues
- **Test Generation**: Smart contract tests >90% coverage
- **Security Audit**: OWASP Top 10 scanning
- **Performance**: Optimization suggestions
- **Documentation**: Auto-updates

### GitHub Actions Triggers

```yaml
# On push to main/develop
- Code quality checks
- Smart contract tests
- Security audits
- Deployment (if secrets configured)

# On PR
- Claude Code review
- Test suite execution

# Manual
- workflow_dispatch for specific tasks
```

## Testing Guidelines

### Smart Contracts

```javascript
// Test structure
describe('RitualDAO', () => {
  it('should create proposal', async () => {
    // Setup
    // Execute
    // Assert
  });
});
```

### Frontend

- Manual testing with local server: `npm start`
- Web Audio API testing with real audio files
- MetaMask integration testing on Base Sepolia
- End-to-end flow validation

## Performance Optimization

### Audio Processing
- Keep audio latency <10ms
- Use Web Audio API buffers efficiently
- Optimize transition algorithms
- Minimize DOM manipulations during playback

### Smart Contracts
- Batch operations where possible
- Optimize storage usage
- Use events instead of storage for logs
- Consider L2 gas costs

### Frontend
- Lazy load modules
- Event bus optimization
- Minimize global scope pollution
- Efficient event listener management

## Security Best Practices

### Private Keys
- ❌ NEVER commit private keys
- ❌ NEVER use production wallet in testnet
- ✅ Use environment variables
- ✅ Use dedicated deployment wallet
- ✅ Enable 2FA on GitHub

### Smart Contracts
- ✅ Reentrancy protection
- ✅ Access control
- ✅ Input validation
- ✅ Safe math (Solidity 0.8+)
- ✅ External audits before mainnet

### Frontend
- ✅ Validate user inputs
- ✅ Sanitize Web3 interactions
- ✅ Handle MetaMask errors gracefully
- ✅ HTTPS only for production

## Deployment Checklist

### Testnet (Base Sepolia)
- [ ] Configure secrets in GitHub
- [ ] Get testnet ETH from faucet
- [ ] Deploy contracts via CI/CD
- [ ] Verify contracts on BaseScan
- [ ] Update frontend with addresses
- [ ] Test all flows end-to-end

### Production (Base Mainnet)
- [ ] Security audit completed
- [ ] All tests passing (>90% coverage)
- [ ] Create production environment
- [ ] Configure mainnet secrets
- [ ] Deploy with 2 reviewer approvals
- [ ] Verify contracts publicly
- [ ] IPFS metadata integration
- [ ] Monitor transactions

## Common Tasks

### Add New Transition

1. Define in `neural-ai-transitions.js`:
```javascript
async executeNewTransition(fromDeck, toDeck, duration) {
  // Implementation
}
```

2. Register in `transitionTypes` array
3. Add UI button in HTML
4. Document in README

### Add New Ritual

1. Define in `neural-prophetic-loader.js`:
```javascript
ritualEnergies: {
  NEW_RITUAL: {
    name: 'New Ritual',
    symbol: '🔮',
    energy: 'type',
    keywords: ['word1', 'word2'],
    bpmRange: [min, max],
    energyRange: [min, max],
    tarotCards: ['Card1', 'Card2']
  }
}
```

2. Update DAO contract options
3. Add to UI dropdown
4. Document symbolism

### Add Smart Contract Function

1. Implement in contract:
```solidity
function newFunction(params) external {
  // Validation
  // Logic
  // Event emission
}
```

2. Write tests
3. Update deployment if needed
4. Add to frontend integration
5. Document in guides

## Troubleshooting

### Web Audio Issues
- Check AudioContext state (suspended/running)
- Verify track loading (CORS, format)
- Monitor latency warnings
- Check browser console for errors

### Web3 Issues
- Verify MetaMask is on correct network
- Check contract addresses are updated
- Ensure wallet has sufficient funds
- Review transaction logs on BaseScan

### CI/CD Issues
- Verify secrets are configured
- Check GitHub Actions permissions
- Review workflow logs for errors
- Ensure dependencies are up to date

## Resources

- **Base Docs**: https://docs.base.org
- **Hardhat**: https://hardhat.org/docs
- **Web Audio API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- **OpenZeppelin**: https://docs.openzeppelin.com/contracts

## Quick Commands

```bash
# Development
npm start                    # Start local server
npm run lint                 # Check code quality
npm run format               # Format code

# Smart Contracts
cd contracts
npm test                     # Run tests
npx hardhat compile          # Compile
npm run deploy:base-sepolia  # Deploy testnet

# Git
git checkout -b feature/name # New feature branch
git commit -m "type: message" # Conventional commits
git push origin branch       # Push changes

# GitHub CLI
gh workflow list             # List workflows
gh run watch                 # Watch workflow execution
gh secret list               # List secrets (names only)
```

## Project Goals

1. **Autonomous DJ Experience**: AI handles track selection and mixing
2. **Mystical Integration**: Tarot and ritual energies guide the journey
3. **Web3 Native**: DAO governance and NFT collectibles
4. **Professional Quality**: Production-ready code and deployment
5. **Community Driven**: Open source with clear contribution guidelines

---

**Remember**: This is an AI-powered prophetic DJ application. Every transition is a ritual, every session is a journey, and every NFT is a sacred artifact. Code with intention. 🎛️✨🔮
