#!/usr/bin/env node

/**
 * 🔍 Environment Variables Validator
 *
 * Validates that all required environment variables are set
 * before deployment or running the application.
 */

const fs = require('fs');
const path = require('path');

// ANSI colors for output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m'
};

function colorize(text, color) {
    return `${colors[color]}${text}${colors.reset}`;
}

function printHeader(text) {
    console.log();
    console.log(colorize('═'.repeat(70), 'cyan'));
    console.log(colorize(`  ${text}`, 'bright'));
    console.log(colorize('═'.repeat(70), 'cyan'));
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

// Required environment variables for different contexts
const ENV_REQUIREMENTS = {
    frontend: {
        development: [
            { key: 'VITE_CHAIN_ID', default: '84532', description: 'Network Chain ID' },
            { key: 'VITE_NETWORK_NAME', default: 'Base Sepolia', description: 'Network Name' },
            { key: 'VITE_RPC_URL', default: 'https://sepolia.base.org', description: 'RPC URL' }
        ],
        optional: [
            { key: 'VITE_DAO_CONTRACT_ADDRESS', description: 'DAO Contract Address (after deployment)' },
            { key: 'VITE_NFT_CONTRACT_ADDRESS', description: 'NFT Contract Address (after deployment)' },
            { key: 'VITE_IPFS_GATEWAY', default: 'https://ipfs.io/ipfs/', description: 'IPFS Gateway' },
            { key: 'VITE_PINATA_API_KEY', description: 'Pinata API Key for IPFS' },
            { key: 'VITE_GA_TRACKING_ID', description: 'Google Analytics ID' }
        ]
    },
    contracts: {
        required: [
            { key: 'BASE_SEPOLIA_RPC_URL', description: 'Base Sepolia RPC URL' },
            { key: 'BASESCAN_API_KEY', description: 'BaseScan API Key for verification' }
        ],
        deployment: [
            { key: 'TESTNET_PRIVATE_KEY', description: 'Private key for testnet deployment', secret: true },
            { key: 'MAINNET_PRIVATE_KEY', description: 'Private key for mainnet deployment', secret: true }
        ],
        optional: [
            { key: 'BASE_RPC_URL', description: 'Base Mainnet RPC URL' },
            { key: 'PINATA_API_KEY', description: 'Pinata API Key' },
            { key: 'PINATA_SECRET_KEY', description: 'Pinata Secret Key', secret: true },
            { key: 'NFT_STORAGE_API_KEY', description: 'NFT.Storage API Key' }
        ]
    }
};

/**
 * Check if .env file exists
 */
function checkEnvFileExists(envPath) {
    if (fs.existsSync(envPath)) {
        printSuccess(`.env file found: ${envPath}`);
        return true;
    } else {
        printError(`.env file NOT found: ${envPath}`);
        printInfo('Create it from template: cp .env.example .env');
        return false;
    }
}

/**
 * Load .env file
 */
function loadEnvFile(envPath) {
    try {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const envVars = {};

        envContent.split('\n').forEach(line => {
            line = line.trim();

            // Skip comments and empty lines
            if (line.startsWith('#') || line === '') return;

            // Parse KEY=VALUE
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim();
                envVars[key] = value;
            }
        });

        return envVars;
    } catch (error) {
        printError(`Failed to load .env file: ${error.message}`);
        return null;
    }
}

/**
 * Validate environment variable
 */
function validateEnvVar(envVars, varConfig) {
    const { key, default: defaultValue, description, secret } = varConfig;
    const value = envVars[key] || process.env[key];

    if (!value) {
        if (defaultValue) {
            printWarning(`${key} not set, using default: ${defaultValue}`);
            return { valid: true, warning: true };
        } else {
            printError(`${key} is missing! (${description})`);
            return { valid: false };
        }
    }

    // Check if it's a placeholder
    const placeholders = ['your_', 'YOUR_', 'replace_me', 'REPLACE_ME', 'changeme', 'CHANGEME'];
    const isPlaceholder = placeholders.some(p => value.toLowerCase().includes(p.toLowerCase()));

    if (isPlaceholder) {
        printWarning(`${key} contains placeholder value (${description})`);
        return { valid: true, warning: true };
    }

    // Validate private key format
    if (key.includes('PRIVATE_KEY')) {
        if (!value.startsWith('0x')) {
            printError(`${key} must start with 0x`);
            return { valid: false };
        }
        if (value.length !== 66) {
            printError(`${key} has incorrect length (expected 66 chars with 0x prefix)`);
            return { valid: false };
        }
        printSuccess(`${key} is set (${secret ? '***hidden***' : 'valid format'})`);
        return { valid: true };
    }

    // Validate URL format
    if (key.includes('URL') || key.includes('RPC')) {
        if (!value.startsWith('http://') && !value.startsWith('https://')) {
            printError(`${key} must be a valid URL`);
            return { valid: false };
        }
        printSuccess(`${key} is set (${value})`);
        return { valid: true };
    }

    // General validation
    if (secret) {
        printSuccess(`${key} is set (***hidden***)`);
    } else {
        const displayValue = value.length > 50 ? value.substring(0, 47) + '...' : value;
        printSuccess(`${key} is set (${displayValue})`);
    }

    return { valid: true };
}

/**
 * Validate environment for a specific context
 */
function validateContext(context, envVars) {
    printHeader(`Validating ${context.toUpperCase()} Environment`);

    const requirements = ENV_REQUIREMENTS[context];
    if (!requirements) {
        printError(`Unknown context: ${context}`);
        return false;
    }

    let allValid = true;
    let hasWarnings = false;

    // Check required variables
    for (const section in requirements) {
        if (section === 'deployment' && process.argv.includes('--skip-deployment')) {
            printInfo('Skipping deployment variables (--skip-deployment flag)');
            continue;
        }

        console.log();
        console.log(colorize(`📋 ${section.toUpperCase()} Variables:`, 'bright'));
        console.log();

        const vars = requirements[section];
        const isOptionalSection = section === 'optional';

        for (const varConfig of vars) {
            const result = validateEnvVar(envVars, varConfig);

            if (!result.valid && !isOptionalSection) {
                allValid = false;
            }
            if (result.warning) {
                hasWarnings = true;
            }
        }
    }

    console.log();
    console.log(colorize('─'.repeat(70), 'cyan'));

    if (!allValid) {
        console.log();
        printError('Validation FAILED! Missing required variables.');
        printInfo('See documentation: .env.example or SECURITY.md');
        return false;
    } else if (hasWarnings) {
        console.log();
        printWarning('Validation passed with WARNINGS. Review placeholder values.');
        return true;
    } else {
        console.log();
        printSuccess('Validation PASSED! All required variables are set.');
        return true;
    }
}

/**
 * Security checks
 */
function runSecurityChecks(envPath) {
    printHeader('Security Checks');

    let allSecure = true;

    // Check 1: .env not tracked by git
    try {
        const { execSync } = require('child_process');
        const gitTracked = execSync('git ls-files .env', { encoding: 'utf8', stdio: 'pipe' }).trim();

        if (gitTracked) {
            printError('.env is tracked by git! This is a SECURITY RISK!');
            printInfo('Run: git rm --cached .env');
            printInfo('Make sure .gitignore contains .env');
            allSecure = false;
        } else {
            printSuccess('.env is NOT tracked by git (good!)');
        }
    } catch (error) {
        printWarning('Could not check git status (not a git repo or git not installed)');
    }

    // Check 2: File permissions (Unix-like systems)
    if (process.platform !== 'win32') {
        try {
            const stats = fs.statSync(envPath);
            const mode = stats.mode & parseInt('777', 8);
            const modeStr = mode.toString(8);

            if (mode & parseInt('044', 8)) {
                printWarning(`.env is readable by others (permissions: ${modeStr})`);
                printInfo('Run: chmod 600 .env');
            } else {
                printSuccess(`.env has secure permissions (${modeStr})`);
            }
        } catch (error) {
            printWarning('Could not check file permissions');
        }
    }

    // Check 3: No private keys in example files
    const exampleFiles = ['.env.example', 'contracts/.env.example'];
    for (const exampleFile of exampleFiles) {
        const fullPath = path.join(process.cwd(), exampleFile);
        if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, 'utf8');

            // Check for actual private keys (starts with 0x and 64 hex chars)
            const keyPattern = /PRIVATE_KEY\s*=\s*0x[0-9a-fA-F]{64}/;
            if (keyPattern.test(content)) {
                printError(`${exampleFile} contains a real private key!`);
                allSecure = false;
            } else {
                printSuccess(`${exampleFile} does not contain secrets`);
            }
        }
    }

    console.log();
    console.log(colorize('─'.repeat(70), 'cyan'));
    console.log();

    if (allSecure) {
        printSuccess('All security checks PASSED!');
    } else {
        printError('Security checks FAILED! Fix issues above.');
    }

    return allSecure;
}

/**
 * Main function
 */
function main() {
    const args = process.argv.slice(2);

    // Parse arguments
    const context = args[0] || 'frontend';
    const envFile = args.includes('--contracts') ? 'contracts/.env' : '.env';
    const envPath = path.join(process.cwd(), envFile);

    console.log();
    console.log(colorize('🔍 DJ Cloudio - Environment Variables Validator', 'bright'));
    console.log();

    // Show usage
    if (args.includes('--help') || args.includes('-h')) {
        console.log('Usage: node validate-env.js [context] [options]');
        console.log();
        console.log('Contexts:');
        console.log('  frontend   Validate frontend environment (default)');
        console.log('  contracts  Validate smart contracts environment');
        console.log();
        console.log('Options:');
        console.log('  --contracts         Use contracts/.env instead of .env');
        console.log('  --skip-deployment   Skip deployment variable validation');
        console.log('  --security-only     Only run security checks');
        console.log('  --help, -h          Show this help');
        console.log();
        console.log('Examples:');
        console.log('  node validate-env.js frontend');
        console.log('  node validate-env.js contracts --contracts');
        console.log('  node validate-env.js --security-only');
        console.log();
        return;
    }

    // Check if .env exists
    if (!checkEnvFileExists(envPath)) {
        process.exit(1);
    }

    // Load .env file
    const envVars = loadEnvFile(envPath);
    if (!envVars) {
        process.exit(1);
    }

    // Run security checks
    if (!args.includes('--no-security')) {
        const securityPassed = runSecurityChecks(envPath);
        if (!securityPassed && !args.includes('--force')) {
            printError('Security checks failed. Fix issues or use --force to continue.');
            process.exit(1);
        }
    }

    // Run validation if not security-only mode
    if (!args.includes('--security-only')) {
        const validationPassed = validateContext(
            args.includes('--contracts') ? 'contracts' : context,
            envVars
        );

        if (!validationPassed) {
            process.exit(1);
        }
    }

    console.log();
    console.log(colorize('═'.repeat(70), 'green'));
    console.log(colorize('  ✅ VALIDATION COMPLETE - ENVIRONMENT IS READY!', 'green'));
    console.log(colorize('═'.repeat(70), 'green'));
    console.log();
}

// Run if called directly
if (require.main === module) {
    try {
        main();
    } catch (error) {
        console.error();
        printError(`Validation failed with error: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }
}

module.exports = { validateContext, runSecurityChecks, loadEnvFile };
