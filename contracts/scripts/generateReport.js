#!/usr/bin/env node

/**
 * 🧾 Ritual Deployment Report Generator
 *
 * Automatically generates a comprehensive deployment report in Markdown format
 * after each deployment, including contract addresses, verification status,
 * Tarot symbolism, and ritual metadata.
 *
 * Usage:
 *   node scripts/generateReport.js <network> <daoAddress> <nftAddress>
 *
 * Example:
 *   node scripts/generateReport.js baseSepolia 0x1234... 0x5678...
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI colors
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    magenta: '\x1b[35m'
};

function colorize(text, color) {
    return `${colors[color]}${text}${colors.reset}`;
}

// Tarot cards for ritual symbolism
const TAROT_MAJOR_ARCANA = [
    { name: 'The Fool', number: 0, symbol: '🃏', meaning: 'New beginnings, spontaneity, adventure' },
    { name: 'The Magician', number: 1, symbol: '🎩', meaning: 'Manifestation, resourcefulness, power' },
    { name: 'The High Priestess', number: 2, symbol: '🔮', meaning: 'Intuition, sacred knowledge, mystery' },
    { name: 'The Empress', number: 3, symbol: '👑', meaning: 'Fertility, abundance, nurturing' },
    { name: 'The Emperor', number: 4, symbol: '🏛️', meaning: 'Authority, structure, control' },
    { name: 'The Hierophant', number: 5, symbol: '⛪', meaning: 'Tradition, conformity, morality' },
    { name: 'The Lovers', number: 6, symbol: '💕', meaning: 'Love, harmony, relationships' },
    { name: 'The Chariot', number: 7, symbol: '🏇', meaning: 'Control, willpower, victory' },
    { name: 'Strength', number: 8, symbol: '🦁', meaning: 'Courage, patience, compassion' },
    { name: 'The Hermit', number: 9, symbol: '🕯️', meaning: 'Soul searching, introspection, wisdom' },
    { name: 'Wheel of Fortune', number: 10, symbol: '☸️', meaning: 'Change, cycles, destiny' },
    { name: 'Justice', number: 11, symbol: '⚖️', meaning: 'Justice, fairness, truth' },
    { name: 'The Hanged Man', number: 12, symbol: '🙃', meaning: 'Suspension, sacrifice, letting go' },
    { name: 'Death', number: 13, symbol: '💀', meaning: 'Endings, transformation, transition' },
    { name: 'Temperance', number: 14, symbol: '🍶', meaning: 'Balance, moderation, patience' },
    { name: 'The Devil', number: 15, symbol: '😈', meaning: 'Shadow, materialism, bondage' },
    { name: 'The Tower', number: 16, symbol: '🗼', meaning: 'Upheaval, chaos, revelation' },
    { name: 'The Star', number: 17, symbol: '⭐', meaning: 'Hope, faith, renewal' },
    { name: 'The Moon', number: 18, symbol: '🌙', meaning: 'Illusion, fear, subconscious' },
    { name: 'The Sun', number: 19, symbol: '☀️', meaning: 'Success, vitality, joy' },
    { name: 'Judgement', number: 20, symbol: '📯', meaning: 'Reflection, reckoning, rebirth' },
    { name: 'The World', number: 21, symbol: '🌍', meaning: 'Completion, accomplishment, travel' }
];

/**
 * Get network configuration
 */
function getNetworkConfig(network) {
    const configs = {
        baseSepolia: {
            chainId: '84532',
            name: 'Base Sepolia',
            rpcUrl: 'https://sepolia.base.org',
            explorerUrl: 'https://sepolia.basescan.org',
            explorerName: 'BaseScan Sepolia',
            type: 'testnet'
        },
        base: {
            chainId: '8453',
            name: 'Base Mainnet',
            rpcUrl: 'https://mainnet.base.org',
            explorerUrl: 'https://basescan.org',
            explorerName: 'BaseScan',
            type: 'mainnet'
        },
        localhost: {
            chainId: '31337',
            name: 'Localhost',
            rpcUrl: 'http://localhost:8545',
            explorerUrl: '',
            explorerName: 'Local Explorer',
            type: 'development'
        }
    };

    return configs[network] || null;
}

/**
 * Get random Tarot card for ritual
 */
function getRandomTarotCard() {
    const randomIndex = Math.floor(Math.random() * TAROT_MAJOR_ARCANA.length);
    return TAROT_MAJOR_ARCANA[randomIndex];
}

/**
 * Get deployment timestamp
 */
function getTimestamp() {
    return new Date().toISOString();
}

/**
 * Get git info
 */
function getGitInfo() {
    try {
        const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
        const commit = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
        const author = execSync('git config user.name', { encoding: 'utf8' }).trim();
        return { branch, commit, author };
    } catch (error) {
        return { branch: 'unknown', commit: 'unknown', author: 'unknown' };
    }
}

/**
 * Get contract size from artifacts
 */
function getContractSize(contractName) {
    try {
        const artifactPath = path.join(
            __dirname,
            '..',
            'artifacts',
            'contracts',
            `${contractName}.sol`,
            `${contractName}.json`
        );

        if (!fs.existsSync(artifactPath)) {
            return 'Unknown';
        }

        const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
        const bytecode = artifact.bytecode.replace('0x', '');
        const sizeInBytes = bytecode.length / 2;
        const sizeInKB = (sizeInBytes / 1024).toFixed(2);

        return `${sizeInKB} KB (${sizeInBytes} bytes)`;
    } catch (error) {
        return 'Unknown';
    }
}

/**
 * Load deployment info if exists
 */
function loadDeploymentInfo(network) {
    try {
        const deploymentPath = path.join(__dirname, '..', 'deployments', `${network}.json`);
        if (fs.existsSync(deploymentPath)) {
            return JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
        }
    } catch (error) {
        console.warn('Could not load deployment info:', error.message);
    }
    return null;
}

/**
 * Get test results
 */
function getTestResults() {
    try {
        // Check if test results exist
        const coveragePath = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');
        if (fs.existsSync(coveragePath)) {
            const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
            return {
                hasTests: true,
                coverage: coverage.total
            };
        }
    } catch (error) {
        // Ignore
    }

    return { hasTests: false };
}

/**
 * Get transaction details from deployment
 */
function getTransactionDetails(network, address) {
    try {
        const deploymentInfo = loadDeploymentInfo(network);
        if (deploymentInfo && deploymentInfo.contracts) {
            // Try to find transaction hash from deployment info
            const contract = Object.values(deploymentInfo.contracts).find(c =>
                c.address && c.address.toLowerCase() === address.toLowerCase()
            );

            if (contract && contract.transactionHash) {
                return {
                    txHash: contract.transactionHash,
                    blockNumber: contract.blockNumber || 'Unknown',
                    gasUsed: contract.gasUsed || 'Unknown'
                };
            }
        }
    } catch (error) {
        // Ignore
    }

    return {
        txHash: 'Unknown (check deployment logs)',
        blockNumber: 'Unknown',
        gasUsed: 'Unknown'
    };
}

/**
 * Generate ritual report
 */
function generateReport(network, daoAddress, nftAddress, options = {}) {
    const networkConfig = getNetworkConfig(network);
    if (!networkConfig) {
        throw new Error(`Unknown network: ${network}`);
    }

    const tarotCard = getRandomTarotCard();
    const timestamp = getTimestamp();
    const gitInfo = getGitInfo();
    const deploymentInfo = loadDeploymentInfo(network);
    const testResults = getTestResults();

    // Get transaction details
    const daoTx = getTransactionDetails(network, daoAddress);
    const nftTx = getTransactionDetails(network, nftAddress);

    // Calculate total gas
    const totalGas = (daoTx.gasUsed !== 'Unknown' && nftTx.gasUsed !== 'Unknown')
        ? (parseInt(daoTx.gasUsed) + parseInt(nftTx.gasUsed)).toLocaleString()
        : 'Unknown';

    // Format date for filename
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS

    const filename = `deployment-report-${network}-${dateStr}-${timeStr}.md`;
    const reportPath = path.join(__dirname, '..', '..', 'reports', filename);

    // Ensure reports directory exists
    const reportsDir = path.dirname(reportPath);
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Generate report content
    const report = `# 🧾 Ritual Deployment Report

**Network:** ${networkConfig.name} (${networkConfig.type})
**Date:** ${new Date(timestamp).toLocaleString()}
**Ritual Card:** ${tarotCard.symbol} ${tarotCard.name} (${tarotCard.meaning})

---

## 📜 Deployment Summary

### Network Information

| Property | Value |
|----------|-------|
| **Network** | ${networkConfig.name} |
| **Chain ID** | ${networkConfig.chainId} |
| **RPC URL** | ${networkConfig.rpcUrl} |
| **Explorer** | [${networkConfig.explorerName}](${networkConfig.explorerUrl}) |
| **Type** | ${networkConfig.type} |

### Contract Addresses

#### RitualDAO
- **Address:** \`${daoAddress}\`
- **Block Number:** ${daoTx.blockNumber}
- **Transaction:** [View TX](${networkConfig.explorerUrl}/tx/${daoTx.txHash})
- **Gas Used:** ${daoTx.gasUsed}
- **Size:** ${getContractSize('RitualDAO')}
- **Explorer:** [View Contract](${networkConfig.explorerUrl}/address/${daoAddress})

#### PropheticSessionNFT
- **Address:** \`${nftAddress}\`
- **Block Number:** ${nftTx.blockNumber}
- **Transaction:** [View TX](${networkConfig.explorerUrl}/tx/${nftTx.txHash})
- **Gas Used:** ${nftTx.gasUsed}
- **Size:** ${getContractSize('PropheticSessionNFT')}
- **Explorer:** [View Contract](${networkConfig.explorerUrl}/address/${nftAddress})

### Gas Consumption

| Contract | Gas Used |
|----------|----------|
| **RitualDAO** | ${daoTx.gasUsed} |
| **PropheticSessionNFT** | ${nftTx.gasUsed} |
| **Total** | ${totalGas} |

---

## 🔮 Ritual Metadata

### Tarot Guidance

**${tarotCard.symbol} ${tarotCard.name}** (Major Arcana ${tarotCard.number})

> *${tarotCard.meaning}*

This ritual carries the energy of **${tarotCard.name}**, symbolizing the cosmic alignment of your deployment. Let this card's wisdom guide the success of your contracts.

### Deployment Timestamp

\`\`\`
ISO 8601: ${timestamp}
Unix Epoch: ${Math.floor(date.getTime() / 1000)}
Human: ${date.toLocaleString()}
\`\`\`

### Git Information

| Property | Value |
|----------|-------|
| **Branch** | \`${gitInfo.branch}\` |
| **Commit** | \`${gitInfo.commit}\` |
| **Author** | ${gitInfo.author} |

---

## 🧪 Quality Metrics

${testResults.hasTests ? `
### Test Coverage

| Metric | Percentage |
|--------|-----------|
| **Statements** | ${testResults.coverage.statements.pct}% |
| **Branches** | ${testResults.coverage.branches.pct}% |
| **Functions** | ${testResults.coverage.functions.pct}% |
| **Lines** | ${testResults.coverage.lines.pct}% |
` : `
### Test Coverage

*No coverage data available. Run \`npm run coverage\` to generate test coverage.*
`}

### Contract Sizes

| Contract | Size |
|----------|------|
| **RitualDAO** | ${getContractSize('RitualDAO')} |
| **PropheticSessionNFT** | ${getContractSize('PropheticSessionNFT')} |

*Note: Ethereum contract size limit is 24.576 KB*

---

## ✅ Verification Commands

### Verify on ${networkConfig.explorerName}

\`\`\`bash
# RitualDAO
npx hardhat verify --network ${network} ${daoAddress}

# PropheticSessionNFT
npx hardhat verify --network ${network} ${nftAddress}
\`\`\`

### Verification Links

- [RitualDAO Verification](${networkConfig.explorerUrl}/verifyContract?a=${daoAddress})
- [PropheticSessionNFT Verification](${networkConfig.explorerUrl}/verifyContract?a=${nftAddress})

---

## 🚀 Next Steps

### Immediate Actions

1. **Verify Contracts**
   \`\`\`bash
   npx hardhat verify --network ${network} ${daoAddress}
   npx hardhat verify --network ${network} ${nftAddress}
   \`\`\`

2. **Update Frontend Configuration**
   ${deploymentInfo ? '✅ Already configured by postDeploy.js' : '⚠️  Run: `npm run postdeploy:' + network + '`'}

3. **Launch Cosmogram Visualization**
   \`\`\`bash
   npm run start:cosmogram
   # Open http://localhost:3001
   # Click "📡 Load Data"
   \`\`\`

4. **Test Frontend Integration**
   \`\`\`bash
   npm start
   # Connect MetaMask to ${networkConfig.name}
   # Test DAO proposals and NFT minting
   \`\`\`

### Quality Assurance

- [ ] Contract verification complete
- [ ] Frontend addresses updated
- [ ] Cosmogram loading data
- [ ] DAO proposal creation working
- [ ] NFT minting functional
- [ ] All tests passing
- [ ] Security audit ${networkConfig.type === 'mainnet' ? '(REQUIRED)' : '(recommended)'}

### Production Checklist (Mainnet Only)

${networkConfig.type === 'mainnet' ? `
- [ ] External security audit completed
- [ ] Bug bounty program active (30+ days)
- [ ] Multi-sig wallet for contract ownership
- [ ] Time locks on critical functions
- [ ] Monitoring configured (Tenderly/Defender)
- [ ] Emergency pause mechanism tested
- [ ] Insurance coverage obtained
- [ ] Community governance active
` : `
*This is a ${networkConfig.type} deployment. Mainnet checklist not applicable.*
`}

---

## 📊 Deployment Statistics

### Configuration Files Updated

${deploymentInfo ? `
- ✅ \`.env\` - Contract addresses injected
- ✅ \`config/contracts.js\` - JavaScript config generated
- ✅ \`config/abis/\` - ABIs extracted
- ✅ \`contracts/deployments/${network}.json\` - Deployment info saved
` : `
- ⚠️  No deployment info found. Post-deployment may not have run.
`}

### Generated Resources

\`\`\`
reports/
└── ${filename}

config/
├── contracts.js
└── abis/
    ├── RitualDAO.json
    └── PropheticSessionNFT.json

contracts/deployments/
└── ${network}.json
\`\`\`

---

## 🔗 Quick Links

### Blockchain Explorers

- [RitualDAO Contract](${networkConfig.explorerUrl}/address/${daoAddress})
- [PropheticSessionNFT Contract](${networkConfig.explorerUrl}/address/${nftAddress})
- [Network Status](${networkConfig.explorerUrl})

### Project Resources

- [GitHub Repository](https://github.com/fullmeo/-Neural_claude_code)
- [Documentation](../README.md)
- [Security Guidelines](../SECURITY.md)
- [Deployment Guide](../QUICK_START_DEPLOYMENT.md)

### Tools & Services

- [Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia) (testnet only)
- [BaseScan](${networkConfig.explorerUrl})
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin](https://docs.openzeppelin.com/contracts)

---

## 🎯 Success Criteria

### Deployment Success ✅

- [x] RitualDAO deployed to ${networkConfig.name}
- [x] PropheticSessionNFT deployed to ${networkConfig.name}
- [x] Addresses recorded and documented
- [x] Ritual report generated

### Integration Success (To Verify)

- [ ] Contracts verified on ${networkConfig.explorerName}
- [ ] Frontend configuration updated
- [ ] Cosmogram visualization working
- [ ] DAO functionality tested
- [ ] NFT minting tested
- [ ] No errors in console
- [ ] MetaMask integration smooth

---

## 🔮 Ritual Completion

**The deployment ritual is complete!**

Your contracts have been blessed by **${tarotCard.name}**, channeling the energy of ${tarotCard.meaning.toLowerCase()}. May this cosmic alignment bring success to your decentralized autonomous organization and prophetic NFT sessions.

**Ritual Conducted By:** ${gitInfo.author}
**Cosmic Timestamp:** ${timestamp}
**Sacred Network:** ${networkConfig.name}
**Tarot Blessing:** ${tarotCard.symbol} ${tarotCard.name}

*The contracts are bound. The ritual is sealed. The journey begins.* 🌌

---

## 📝 Notes & Observations

<!-- Add your deployment notes here -->

### Deployment Process

- Deployment method: Hardhat deployment script
- Gas optimization: Standard
- Network conditions: ${networkConfig.type === 'mainnet' ? 'Production environment' : 'Test environment'}

### Known Issues

- None reported at deployment time

### Future Improvements

- [ ] Gas optimization analysis
- [ ] Additional contract features
- [ ] Enhanced security measures
- [ ] Community feedback integration

---

**Generated:** ${new Date().toLocaleString()}
**Report Version:** 1.0.0
**Generator:** DJ Cloudio Ritual Report System 🔮

---

*May the blockchain be with you.* ✨
`;

    // Write report
    fs.writeFileSync(reportPath, report, 'utf8');

    return {
        reportPath,
        filename,
        tarotCard,
        timestamp
    };
}

/**
 * Main execution
 */
async function main() {
    const args = process.argv.slice(2);

    // Show help
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
${colorize('🧾 Ritual Deployment Report Generator', 'bright')}

${colorize('Usage:', 'cyan')}
  node scripts/generateReport.js <network> <daoAddress> <nftAddress>

${colorize('Arguments:', 'cyan')}
  network       Network name (baseSepolia, base, localhost)
  daoAddress    RitualDAO contract address
  nftAddress    PropheticSessionNFT contract address

${colorize('Options:', 'cyan')}
  --help, -h    Show this help message

${colorize('Examples:', 'cyan')}
  node scripts/generateReport.js baseSepolia 0x1234... 0x5678...
  node scripts/generateReport.js base 0xabcd... 0xef01...
        `);
        process.exit(0);
    }

    // Parse arguments
    const network = args[0];
    const daoAddress = args[1];
    const nftAddress = args[2];

    if (!network || !daoAddress || !nftAddress) {
        console.error(colorize('❌ Missing required arguments!', 'red'));
        console.log('Usage: node scripts/generateReport.js <network> <daoAddress> <nftAddress>');
        console.log('Run with --help for more information');
        process.exit(1);
    }

    console.log();
    console.log(colorize('═'.repeat(80), 'cyan'));
    console.log(colorize('  🧾 Generating Ritual Deployment Report', 'bright'));
    console.log(colorize('═'.repeat(80), 'cyan'));
    console.log();

    try {
        const result = generateReport(network, daoAddress, nftAddress);

        console.log(colorize(`🔮 Tarot Card: ${result.tarotCard.symbol} ${result.tarotCard.name}`, 'magenta'));
        console.log(colorize(`   Meaning: ${result.tarotCard.meaning}`, 'cyan'));
        console.log();
        console.log(colorize(`✅ Report generated: ${result.filename}`, 'green'));
        console.log(colorize(`📁 Location: ${result.reportPath}`, 'cyan'));
        console.log();
        console.log(colorize('═'.repeat(80), 'cyan'));
        console.log(colorize('  ✨ Ritual Report Complete', 'bright'));
        console.log(colorize('═'.repeat(80), 'cyan'));
        console.log();

    } catch (error) {
        console.error();
        console.error(colorize(`❌ Report generation failed: ${error.message}`, 'red'));
        console.error(error.stack);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error();
        console.error(colorize(`❌ Fatal error: ${error.message}`, 'red'));
        console.error(error.stack);
        process.exit(1);
    });
}

module.exports = { generateReport, getRandomTarotCard, getNetworkConfig };
