#!/usr/bin/env node

/**
 * 🎨 Mint Deployment NFT - Cosmic Deployment Commemoration
 *
 * Automatically mints an NFT to commemorate each deployment,
 * using the Tarot card drawn during the deployment ritual.
 */

const NeuralGlyphGenerator = require('../../neural-glyph-generator.js');
const fs = require('fs');
const path = require('path');

// ANSI colors
const colors = {
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    magenta: '\x1b[35m',
    reset: '\x1b[0m'
};

function colorize(text, color) {
    return `${colors[color]}${text}${colors.reset}`;
}

/**
 * Load deployment report to extract Tarot card
 */
function loadDeploymentReport(network) {
    try {
        const reportsDir = path.join(__dirname, '..', '..', 'reports');

        // Find most recent report for this network
        const files = fs.readdirSync(reportsDir)
            .filter(f => f.startsWith(`deployment-report-${network}-`))
            .sort()
            .reverse();

        if (files.length === 0) {
            return null;
        }

        const reportPath = path.join(reportsDir, files[0]);
        const report = fs.readFileSync(reportPath, 'utf8');

        // Extract Tarot card from report
        const cardMatch = report.match(/\*\*Ritual Card:\*\* (.+?) (.+?) \(/);
        if (cardMatch) {
            return {
                card: cardMatch[2],
                symbol: cardMatch[1],
                reportFile: files[0]
            };
        }
    } catch (error) {
        console.error('Error loading deployment report:', error.message);
    }

    return null;
}

/**
 * Load deployment info
 */
function loadDeploymentInfo(network) {
    try {
        const deploymentPath = path.join(__dirname, '..', 'deployments', `${network}.json`);
        if (fs.existsSync(deploymentPath)) {
            return JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
        }
    } catch (error) {
        console.error('Error loading deployment info:', error.message);
    }

    return null;
}

/**
 * Main execution
 */
async function main() {
    const args = process.argv.slice(2);
    const network = args[0] || 'baseSepolia';
    const daoAddress = args[1];
    const nftAddress = args[2];

    console.log();
    console.log(colorize('═'.repeat(80), 'cyan'));
    console.log(colorize('  🎨 Minting Cosmic Deployment NFT', 'magenta'));
    console.log(colorize('═'.repeat(80), 'cyan'));
    console.log();

    // Load deployment report to get Tarot card
    const reportInfo = loadDeploymentReport(network);
    if (!reportInfo) {
        console.log(colorize('⚠️  No deployment report found. Using default card.', 'cyan'));
    }

    const tarotCard = reportInfo?.card || 'The Star';
    console.log(colorize(`🎴 Tarot Card: ${reportInfo?.symbol || '⭐'} ${tarotCard}`, 'magenta'));

    // Load deployment info
    const deploymentInfo = loadDeploymentInfo(network);
    const deploymentTime = deploymentInfo?.updatedAt || new Date().toISOString();

    // Create session data for deployment NFT
    const sessionData = {
        sessionId: `deployment-${network}-${Date.now()}`,
        ritual: `Deployment to ${network}`,
        timestamp: new Date(deploymentTime).getTime(),
        energy: 100, // Maximum energy for deployment
        bpm: 0,      // Not a DJ session
        tracks: [],
        duration: 0,
        // Add deployment-specific metadata
        deployment: {
            network,
            daoAddress: daoAddress || deploymentInfo?.contracts?.RitualDAO?.address || 'Unknown',
            nftAddress: nftAddress || deploymentInfo?.contracts?.PropheticSessionNFT?.address || 'Unknown',
            timestamp: deploymentTime
        }
    };

    console.log(colorize(`📍 Network: ${network}`, 'cyan'));
    console.log(colorize(`🏛️  DAO: ${sessionData.deployment.daoAddress?.slice(0, 10)}...`, 'cyan'));
    console.log(colorize(`💎 NFT: ${sessionData.deployment.nftAddress?.slice(0, 10)}...`, 'cyan'));
    console.log();

    // Generate NFT glyph and metadata
    const generator = new NeuralGlyphGenerator();
    const result = generator.createNFT(tarotCard, sessionData);

    console.log();
    console.log(colorize('✨ Deployment NFT Created!', 'green'));
    console.log(colorize(`📁 SVG: ${result.svgPath}`, 'cyan'));
    console.log(colorize(`📁 Metadata: ${result.metadataPath}`, 'cyan'));
    console.log();
    console.log(colorize('🔮 This NFT commemorates your cosmic deployment ritual!', 'magenta'));
    console.log();

    // Generate summary
    const summaryPath = path.join(__dirname, '..', '..', 'deployment-nft-summary.md');
    const summary = `# 🎨 Deployment NFT Summary

**Network:** ${network}
**Tarot Card:** ${tarotCard}
**Timestamp:** ${new Date(sessionData.timestamp).toLocaleString()}

## Contract Addresses

- **DAO:** \`${sessionData.deployment.daoAddress}\`
- **NFT:** \`${sessionData.deployment.nftAddress}\`

## NFT Assets

- **SVG Glyph:** \`${path.basename(result.svgPath)}\`
- **Metadata:** \`${path.basename(result.metadataPath)}\`

## Next Steps

1. **Upload to IPFS:**
   \`\`\`bash
   # Install IPFS CLI or use Pinata
   ipfs add ${result.svgPath}
   ipfs add ${result.metadataPath}
   \`\`\`

2. **Update Metadata:**
   - Replace \`[TO_BE_REPLACED]\` with IPFS CID
   - Update image: \`ipfs://QmXXX.../glyph-${sessionData.sessionId}.svg\`

3. **Mint On-Chain (Optional):**
   \`\`\`javascript
   await nftContract.mintSession(
     "${sessionData.sessionId}",
     metadata // IPFS URL or on-chain
   );
   \`\`\`

---

**🔮 Your deployment has been blessed by ${tarotCard}! May your contracts thrive!** ✨
`;

    fs.writeFileSync(summaryPath, summary, 'utf8');
    console.log(colorize(`📄 Summary saved: ${summaryPath}`, 'cyan'));
    console.log();
    console.log(colorize('═'.repeat(80), 'cyan'));
    console.log();
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error();
        console.error(colorize(`❌ Error: ${error.message}`, 'red'));
        console.error(error.stack);
        process.exit(1);
    });
}

module.exports = { main };
