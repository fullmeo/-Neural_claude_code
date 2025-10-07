#!/usr/bin/env node

/**
 * 🚀 Post-Deployment Script
 *
 * Automatically injects deployed contract addresses into frontend configuration
 * and updates environment variables after successful deployment.
 *
 * Usage:
 *   node scripts/postDeploy.js <network> <daoAddress> <nftAddress>
 *
 * Example:
 *   node scripts/postDeploy.js baseSepolia 0x1234... 0x5678...
 */

const fs = require('fs');
const path = require('path');

// ANSI colors for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

function colorize(text, color) {
    return `${colors[color]}${text}${colors.reset}`;
}

function printHeader(text) {
    console.log();
    console.log(colorize('═'.repeat(80), 'cyan'));
    console.log(colorize(`  ${text}`, 'bright'));
    console.log(colorize('═'.repeat(80), 'cyan'));
    console.log();
}

function printSuccess(text) {
    console.log(colorize(`✅ ${text}`, 'green'));
}

function printError(text) {
    console.log(colorize(`❌ ${text}`, 'red'));
}

function printWarning(text) {
    console.log(colorize(`⚠️  ${text}`, 'yellow'));
}

function printInfo(text) {
    console.log(colorize(`ℹ️  ${text}`, 'cyan'));
}

function printMystical(text) {
    console.log(colorize(`🔮 ${text}`, 'magenta'));
}

/**
 * Validate Ethereum address format
 */
function isValidAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Parse command line arguments
 */
function parseArguments() {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
${colorize('🚀 Post-Deployment Script', 'bright')}

${colorize('Usage:', 'cyan')}
  node scripts/postDeploy.js <network> <daoAddress> <nftAddress>

${colorize('Arguments:', 'cyan')}
  network       Network name (baseSepolia, base, localhost)
  daoAddress    Deployed RitualDAO contract address
  nftAddress    Deployed PropheticSessionNFT contract address

${colorize('Options:', 'cyan')}
  --help, -h    Show this help message
  --dry-run     Show what would be updated without making changes

${colorize('Examples:', 'cyan')}
  node scripts/postDeploy.js baseSepolia 0x1234... 0x5678...
  node scripts/postDeploy.js base 0xabcd... 0xef01... --dry-run
        `);
        process.exit(0);
    }

    const network = args[0];
    const daoAddress = args[1];
    const nftAddress = args[2];
    const isDryRun = args.includes('--dry-run');

    if (!network || !daoAddress || !nftAddress) {
        printError('Missing required arguments!');
        console.log('Usage: node scripts/postDeploy.js <network> <daoAddress> <nftAddress>');
        console.log('Run with --help for more information');
        process.exit(1);
    }

    if (!isValidAddress(daoAddress)) {
        printError(`Invalid DAO address: ${daoAddress}`);
        process.exit(1);
    }

    if (!isValidAddress(nftAddress)) {
        printError(`Invalid NFT address: ${nftAddress}`);
        process.exit(1);
    }

    return { network, daoAddress, nftAddress, isDryRun };
}

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
            envPrefix: 'VITE_'
        },
        base: {
            chainId: '8453',
            name: 'Base Mainnet',
            rpcUrl: 'https://mainnet.base.org',
            explorerUrl: 'https://basescan.org',
            envPrefix: 'VITE_'
        },
        localhost: {
            chainId: '31337',
            name: 'Localhost',
            rpcUrl: 'http://localhost:8545',
            explorerUrl: '',
            envPrefix: 'VITE_'
        }
    };

    if (!configs[network]) {
        printError(`Unknown network: ${network}`);
        printInfo('Supported networks: baseSepolia, base, localhost');
        process.exit(1);
    }

    return configs[network];
}

/**
 * Update .env file with contract addresses
 */
function updateEnvFile(envPath, networkConfig, daoAddress, nftAddress, isDryRun) {
    printInfo(`Updating ${envPath}...`);

    // Read existing .env or create from template
    let envContent = '';
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
        printSuccess('.env file found');
    } else {
        const examplePath = path.join(path.dirname(envPath), '.env.example');
        if (fs.existsSync(examplePath)) {
            envContent = fs.readFileSync(examplePath, 'utf8');
            printWarning('.env not found, creating from .env.example');
        } else {
            printError('.env and .env.example not found!');
            process.exit(1);
        }
    }

    // Parse existing env vars
    const envVars = {};
    envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const match = trimmed.match(/^([^=]+)=(.*)$/);
            if (match) {
                envVars[match[1].trim()] = match[2].trim();
            }
        }
    });

    // Update with new values
    const prefix = networkConfig.envPrefix;
    envVars[`${prefix}CHAIN_ID`] = networkConfig.chainId;
    envVars[`${prefix}NETWORK_NAME`] = networkConfig.name;
    envVars[`${prefix}RPC_URL`] = networkConfig.rpcUrl;
    envVars[`${prefix}DAO_CONTRACT_ADDRESS`] = daoAddress;
    envVars[`${prefix}NFT_CONTRACT_ADDRESS`] = nftAddress;

    // Reconstruct .env content
    const newEnvContent = Object.entries(envVars)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n') + '\n';

    // Write to file (or dry run)
    if (isDryRun) {
        printWarning('DRY RUN - Would update .env with:');
        console.log(colorize(newEnvContent, 'cyan'));
    } else {
        fs.writeFileSync(envPath, newEnvContent, 'utf8');
        printSuccess('.env file updated successfully');
    }

    return envVars;
}

/**
 * Update deployment info JSON
 */
function updateDeploymentInfo(network, daoAddress, nftAddress, isDryRun) {
    const deploymentPath = path.join(__dirname, '..', 'deployments', `${network}.json`);
    const deploymentsDir = path.dirname(deploymentPath);

    // Create deployments directory if it doesn't exist
    if (!fs.existsSync(deploymentsDir)) {
        if (!isDryRun) {
            fs.mkdirSync(deploymentsDir, { recursive: true });
            printSuccess('Created deployments directory');
        } else {
            printInfo('Would create deployments directory');
        }
    }

    const deploymentInfo = {
        network,
        chainId: getNetworkConfig(network).chainId,
        contracts: {
            RitualDAO: {
                address: daoAddress,
                deployedAt: new Date().toISOString()
            },
            PropheticSessionNFT: {
                address: nftAddress,
                deployedAt: new Date().toISOString()
            }
        },
        updatedAt: new Date().toISOString()
    };

    if (isDryRun) {
        printWarning(`DRY RUN - Would create ${deploymentPath}:`);
        console.log(colorize(JSON.stringify(deploymentInfo, null, 2), 'cyan'));
    } else {
        fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2), 'utf8');
        printSuccess(`Deployment info saved to ${deploymentPath}`);
    }

    return deploymentInfo;
}

/**
 * Update contract addresses in JavaScript config files
 */
function updateJsConfig(daoAddress, nftAddress, isDryRun) {
    const configPath = path.join(__dirname, '..', '..', 'config', 'contracts.js');
    const configDir = path.dirname(configPath);

    // Create config directory if needed
    if (!fs.existsSync(configDir)) {
        if (!isDryRun) {
            fs.mkdirSync(configDir, { recursive: true });
        } else {
            printInfo('Would create config directory');
        }
    }

    const configContent = `/**
 * 🔮 Contract Addresses Configuration
 *
 * Auto-generated by postDeploy.js
 * Last updated: ${new Date().toISOString()}
 */

export const CONTRACTS = {
    DAO: '${daoAddress}',
    NFT: '${nftAddress}'
};

export const DAO_ADDRESS = '${daoAddress}';
export const NFT_ADDRESS = '${nftAddress}';

// For CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONTRACTS, DAO_ADDRESS, NFT_ADDRESS };
}
`;

    if (isDryRun) {
        printWarning(`DRY RUN - Would create ${configPath}`);
        console.log(colorize(configContent, 'cyan'));
    } else {
        fs.writeFileSync(configPath, configContent, 'utf8');
        printSuccess('JavaScript config file created');
    }
}

/**
 * Generate contract ABIs for frontend
 */
function generateABIs(isDryRun) {
    const artifactsDir = path.join(__dirname, '..', 'artifacts', 'contracts');
    const abiDir = path.join(__dirname, '..', '..', 'config', 'abis');

    if (!fs.existsSync(artifactsDir)) {
        printWarning('Artifacts directory not found, skipping ABI generation');
        return;
    }

    const contracts = ['RitualDAO', 'PropheticSessionNFT'];

    if (!isDryRun && !fs.existsSync(abiDir)) {
        fs.mkdirSync(abiDir, { recursive: true });
    }

    contracts.forEach(contractName => {
        const artifactPath = path.join(artifactsDir, `${contractName}.sol`, `${contractName}.json`);

        if (fs.existsSync(artifactPath)) {
            const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
            const abi = artifact.abi;

            const abiPath = path.join(abiDir, `${contractName}.json`);

            if (isDryRun) {
                printInfo(`Would generate ABI: ${abiPath}`);
            } else {
                fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2), 'utf8');
                printSuccess(`Generated ABI: ${contractName}.json`);
            }
        } else {
            printWarning(`Artifact not found: ${artifactPath}`);
        }
    });
}

/**
 * Generate verification commands
 */
function generateVerificationCommands(network, daoAddress, nftAddress) {
    const networkConfig = getNetworkConfig(network);

    console.log();
    console.log(colorize('📜 Contract Verification Commands:', 'bright'));
    console.log(colorize('─'.repeat(80), 'cyan'));
    console.log();

    const daoCmd = `npx hardhat verify --network ${network} ${daoAddress}`;
    const nftCmd = `npx hardhat verify --network ${network} ${nftAddress}`;

    console.log(colorize('RitualDAO:', 'cyan'));
    console.log(colorize(daoCmd, 'green'));
    console.log();

    console.log(colorize('PropheticSessionNFT:', 'cyan'));
    console.log(colorize(nftCmd, 'green'));
    console.log();

    if (networkConfig.explorerUrl) {
        console.log(colorize('🔍 View on Block Explorer:', 'bright'));
        console.log(colorize(`DAO: ${networkConfig.explorerUrl}/address/${daoAddress}`, 'cyan'));
        console.log(colorize(`NFT: ${networkConfig.explorerUrl}/address/${nftAddress}`, 'cyan'));
        console.log();
    }
}

/**
 * Main execution
 */
async function main() {
    printHeader('🚀 Post-Deployment Configuration');

    const { network, daoAddress, nftAddress, isDryRun } = parseArguments();
    const networkConfig = getNetworkConfig(network);

    if (isDryRun) {
        printWarning('DRY RUN MODE - No files will be modified');
        console.log();
    }

    // Display deployment info
    printMystical(`Configuring deployment for ${networkConfig.name}`);
    console.log();
    console.log(colorize('📋 Deployment Details:', 'bright'));
    console.log(colorize('─'.repeat(80), 'cyan'));
    console.log(colorize(`  Network:     ${networkConfig.name} (Chain ID: ${networkConfig.chainId})`, 'cyan'));
    console.log(colorize(`  RPC URL:     ${networkConfig.rpcUrl}`, 'cyan'));
    console.log(colorize(`  DAO Address: ${daoAddress}`, 'cyan'));
    console.log(colorize(`  NFT Address: ${nftAddress}`, 'cyan'));
    console.log(colorize('─'.repeat(80), 'cyan'));
    console.log();

    // Update .env file
    printInfo('Step 1: Updating environment variables...');
    const rootEnvPath = path.join(__dirname, '..', '..', '.env');
    updateEnvFile(rootEnvPath, networkConfig, daoAddress, nftAddress, isDryRun);
    console.log();

    // Update deployment info
    printInfo('Step 2: Saving deployment information...');
    updateDeploymentInfo(network, daoAddress, nftAddress, isDryRun);
    console.log();

    // Update JS config
    printInfo('Step 3: Generating JavaScript config...');
    updateJsConfig(daoAddress, nftAddress, isDryRun);
    console.log();

    // Generate ABIs
    printInfo('Step 4: Extracting contract ABIs...');
    generateABIs(isDryRun);
    console.log();

    // Generate verification commands
    generateVerificationCommands(network, daoAddress, nftAddress);

    // Final summary
    printHeader('✨ Post-Deployment Complete');

    if (!isDryRun) {
        printSuccess('Frontend configuration updated successfully!');
        console.log();
        printMystical('Next steps:');
        console.log(colorize('  1. Verify contracts on block explorer (see commands above)', 'cyan'));
        console.log(colorize('  2. Test frontend integration: npm start', 'cyan'));
        console.log(colorize('  3. Validate environment: npm run validate:env', 'cyan'));
        console.log(colorize('  4. Connect MetaMask and test DAO/NFT functions', 'cyan'));
        console.log();
        printMystical('The ritual is complete. The contracts are bound to the frontend. 🔮');
    } else {
        printInfo('This was a dry run. Run without --dry-run to apply changes.');
    }

    console.log();
    console.log(colorize('═'.repeat(80), 'cyan'));
    console.log();
}

// Error handling
process.on('unhandledRejection', (error) => {
    console.error();
    printError(`Post-deployment failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
});

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error();
        printError(`Fatal error: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    });
}

module.exports = { main, updateEnvFile, updateDeploymentInfo, updateJsConfig };
