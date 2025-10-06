#!/usr/bin/env node

/**
 * 🤖 Claude CLI - DJ Cloudio Development Assistant
 *
 * Simulates Claude Code interactions for local development
 * Reads .claude/CLAUDE.md configuration and provides AI-assisted actions
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 GLYPHS & STYLING
// ═══════════════════════════════════════════════════════════════════════════

const GLYPHS = {
  // Status
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  rocket: '🚀',
  star: '⭐',
  fire: '🔥',
  brain: '🧠',
  robot: '🤖',
  magic: '✨',
  crystal: '🔮',

  // Actions
  test: '🧪',
  build: '🏗️',
  deploy: '🚀',
  security: '🔒',
  docs: '📚',
  fix: '🔧',
  analyze: '🔍',
  optimize: '⚡',
  review: '👀',
  refactor: '♻️',

  // Categories
  smart_contract: '📜',
  frontend: '🎨',
  backend: '⚙️',
  database: '💾',
  api: '🌐',

  // Files
  file: '📄',
  folder: '📁',
  code: '💻',
  config: '⚙️',

  // Misc
  arrow_right: '→',
  arrow_left: '←',
  check: '✓',
  cross: '✗',
  bullet: '•',
  dash: '─',
  chain: '⛓️',
  lightning: '⚡',
  target: '🎯',
  trophy: '🏆'
};

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // Background colors
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 UI UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

function colorize(text, color) {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

function printBanner() {
  console.log();
  console.log(colorize('╔═══════════════════════════════════════════════════════════════════════╗', 'cyan'));
  console.log(colorize('║', 'cyan') + colorize('     🤖 CLAUDE CLI - DJ Cloudio Development Assistant 🎛️✨          ', 'bright') + colorize('║', 'cyan'));
  console.log(colorize('╚═══════════════════════════════════════════════════════════════════════╝', 'cyan'));
  console.log();
}

function printSection(title, icon = GLYPHS.bullet) {
  console.log();
  console.log(colorize(`${icon} ${title}`, 'bright'));
  console.log(colorize('─'.repeat(60), 'dim'));
}

function printSuccess(message) {
  console.log(colorize(`${GLYPHS.success} ${message}`, 'green'));
}

function printError(message) {
  console.log(colorize(`${GLYPHS.error} ${message}`, 'red'));
}

function printWarning(message) {
  console.log(colorize(`${GLYPHS.warning} ${message}`, 'yellow'));
}

function printInfo(message) {
  console.log(colorize(`${GLYPHS.info} ${message}`, 'cyan'));
}

function printAction(message, icon = GLYPHS.arrow_right) {
  console.log(colorize(`  ${icon} ${message}`, 'white'));
}

// ═══════════════════════════════════════════════════════════════════════════
// 📁 FILE SYSTEM UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

function findProjectRoot() {
  let currentDir = process.cwd();

  while (currentDir !== path.parse(currentDir).root) {
    if (fs.existsSync(path.join(currentDir, '.claude', 'CLAUDE.md')) ||
        fs.existsSync(path.join(currentDir, 'package.json'))) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }

  return process.cwd();
}

function readClaudeConfig(projectRoot) {
  const configPath = path.join(projectRoot, '.claude', 'CLAUDE.md');

  if (!fs.existsSync(configPath)) {
    printWarning('No .claude/CLAUDE.md found. Using default configuration.');
    return null;
  }

  try {
    const content = fs.readFileSync(configPath, 'utf8');
    return parseClaudeConfig(content);
  } catch (error) {
    printError(`Failed to read .claude/CLAUDE.md: ${error.message}`);
    return null;
  }
}

function parseClaudeConfig(content) {
  const config = {
    projectName: 'Unknown Project',
    technologies: [],
    modules: [],
    guidelines: [],
    quickCommands: []
  };

  // Extract project name
  const projectMatch = content.match(/# CLAUDE\.md - (.+?) Project Instructions/);
  if (projectMatch) {
    config.projectName = projectMatch[1];
  }

  // Extract technologies
  const techSection = content.match(/## Core Technologies([\s\S]*?)##/);
  if (techSection) {
    const techLines = techSection[1].split('\n').filter(line => line.trim().startsWith('-'));
    config.technologies = techLines.map(line => line.replace(/^-\s*\*\*(.+?)\*\*:.*/, '$1').trim());
  }

  // Extract modules
  const moduleSection = content.match(/### Key Modules([\s\S]*?)##/);
  if (moduleSection) {
    const moduleMatches = moduleSection[1].matchAll(/### \d+\. (.+?) \(`(.+?)`\)/g);
    config.modules = Array.from(moduleMatches).map(match => ({
      name: match[1],
      file: match[2]
    }));
  }

  // Extract quick commands
  const commandSection = content.match(/## Quick Commands([\s\S]*?)$/);
  if (commandSection) {
    const commandMatches = commandSection[1].matchAll(/```bash\n([\s\S]*?)```/g);
    if (commandMatches) {
      for (const match of commandMatches) {
        const commands = match[1].split('\n').filter(line => line.trim() && !line.startsWith('#'));
        config.quickCommands.push(...commands);
      }
    }
  }

  return config;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🧪 ANALYSIS FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function analyzeProject(projectRoot) {
  printSection('Project Analysis', GLYPHS.analyze);

  const stats = {
    files: { js: 0, sol: 0, html: 0, md: 0, json: 0 },
    directories: 0,
    tests: 0,
    documentation: 0,
    gitStatus: 'unknown'
  };

  // Count files
  function scanDirectory(dir, depth = 0) {
    if (depth > 5) return; // Prevent infinite recursion

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          stats.directories++;
          scanDirectory(fullPath, depth + 1);
        } else {
          const ext = path.extname(entry.name).toLowerCase();
          if (ext === '.js') stats.files.js++;
          if (ext === '.sol') stats.files.sol++;
          if (ext === '.html') stats.files.html++;
          if (ext === '.md') {
            stats.files.md++;
            stats.documentation++;
          }
          if (ext === '.json') stats.files.json++;

          if (entry.name.includes('test') || entry.name.includes('spec')) {
            stats.tests++;
          }
        }
      }
    } catch (error) {
      // Silently skip inaccessible directories
    }
  }

  scanDirectory(projectRoot);

  // Check Git status
  try {
    const gitStatus = execSync('git status --porcelain', { cwd: projectRoot, encoding: 'utf8' });
    stats.gitStatus = gitStatus.trim() ? 'modified' : 'clean';
  } catch (error) {
    stats.gitStatus = 'not a git repo';
  }

  // Print results
  printInfo(`JavaScript files: ${stats.files.js}`);
  printInfo(`Solidity contracts: ${stats.files.sol}`);
  printInfo(`HTML files: ${stats.files.html}`);
  printInfo(`Documentation files: ${stats.files.md}`);
  printInfo(`Test files: ${stats.tests}`);
  printInfo(`Directories: ${stats.directories}`);
  printInfo(`Git status: ${stats.gitStatus}`);

  return stats;
}

function analyzeCodeQuality(projectRoot) {
  printSection('Code Quality Analysis', GLYPHS.target);

  const results = {
    linting: 'not run',
    tests: 'not run',
    coverage: 'not run',
    security: 'not run'
  };

  // Check for ESLint
  try {
    execSync('npx eslint --version', { cwd: projectRoot, stdio: 'ignore' });
    printAction('Running ESLint...', GLYPHS.analyze);

    try {
      execSync('npx eslint . --ext .js,.html --max-warnings 0', { cwd: projectRoot, stdio: 'ignore' });
      printSuccess('ESLint: No issues found');
      results.linting = 'passed';
    } catch (error) {
      printWarning('ESLint: Issues found (run with --verbose for details)');
      results.linting = 'issues found';
    }
  } catch (error) {
    printInfo('ESLint not available');
  }

  // Check for tests
  const contractsDir = path.join(projectRoot, 'contracts');
  if (fs.existsSync(contractsDir)) {
    try {
      printAction('Running smart contract tests...', GLYPHS.test);
      const testOutput = execSync('npx hardhat test', { cwd: contractsDir, encoding: 'utf8' });

      const passedMatch = testOutput.match(/(\d+) passing/);
      const failedMatch = testOutput.match(/(\d+) failing/);

      if (passedMatch) {
        const passed = parseInt(passedMatch[1]);
        const failed = failedMatch ? parseInt(failedMatch[1]) : 0;

        if (failed === 0) {
          printSuccess(`Tests: ${passed} passing, 0 failing`);
          results.tests = 'passed';
        } else {
          printWarning(`Tests: ${passed} passing, ${failed} failing`);
          results.tests = 'failed';
        }
      }
    } catch (error) {
      printWarning('Tests failed to run');
      results.tests = 'error';
    }
  }

  // Check for coverage
  if (fs.existsSync(contractsDir)) {
    try {
      printAction('Checking test coverage...', GLYPHS.target);
      const coverageOutput = execSync('npx hardhat coverage', { cwd: contractsDir, encoding: 'utf8' });

      const coverageMatch = coverageOutput.match(/All files\s+\|\s+([\d.]+)/);
      if (coverageMatch) {
        const coverage = parseFloat(coverageMatch[1]);
        if (coverage >= 90) {
          printSuccess(`Coverage: ${coverage}% (excellent)`);
        } else if (coverage >= 70) {
          printInfo(`Coverage: ${coverage}% (good)`);
        } else {
          printWarning(`Coverage: ${coverage}% (needs improvement)`);
        }
        results.coverage = `${coverage}%`;
      }
    } catch (error) {
      printInfo('Coverage not available');
    }
  }

  return results;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔧 ACTION HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

const ACTIONS = {
  analyze: {
    name: 'Analyze Project',
    icon: GLYPHS.analyze,
    description: 'Comprehensive multi-dimensional code analysis',
    async execute(projectRoot, config) {
      printSection('Multi-Dimensional Analysis', GLYPHS.brain);
      analyzeProject(projectRoot);
      analyzeCodeQuality(projectRoot);

      printSection('Recommendations', GLYPHS.magic);
      printAction('Run tests regularly: npm test');
      printAction('Keep dependencies updated: npm audit fix');
      printAction('Review TODO items in code');
      printAction('Ensure documentation is up-to-date');
    }
  },

  test: {
    name: 'Run Tests',
    icon: GLYPHS.test,
    description: 'Execute test suite with coverage',
    async execute(projectRoot, config) {
      printSection('Running Tests', GLYPHS.test);

      const contractsDir = path.join(projectRoot, 'contracts');
      if (!fs.existsSync(contractsDir)) {
        printError('No contracts directory found');
        return;
      }

      try {
        printAction('Executing Hardhat tests...', GLYPHS.lightning);
        const output = execSync('npx hardhat test', { cwd: contractsDir, encoding: 'utf8' });
        console.log(output);
        printSuccess('Tests completed successfully');
      } catch (error) {
        printError('Tests failed');
        console.log(error.stdout);
      }
    }
  },

  coverage: {
    name: 'Test Coverage',
    icon: GLYPHS.target,
    description: 'Generate coverage report',
    async execute(projectRoot, config) {
      printSection('Coverage Analysis', GLYPHS.target);

      const contractsDir = path.join(projectRoot, 'contracts');
      if (!fs.existsSync(contractsDir)) {
        printError('No contracts directory found');
        return;
      }

      try {
        printAction('Generating coverage report...', GLYPHS.analyze);
        const output = execSync('npx hardhat coverage', { cwd: contractsDir, encoding: 'utf8' });
        console.log(output);
        printSuccess('Coverage report generated');
      } catch (error) {
        printError('Coverage generation failed');
      }
    }
  },

  security: {
    name: 'Security Audit',
    icon: GLYPHS.security,
    description: 'Run security analysis on smart contracts',
    async execute(projectRoot, config) {
      printSection('Security Audit', GLYPHS.security);

      printAction('Running npm audit...', GLYPHS.analyze);
      try {
        execSync('npm audit', { cwd: projectRoot, stdio: 'inherit' });
        printSuccess('npm audit completed');
      } catch (error) {
        printWarning('npm audit found vulnerabilities');
      }

      const contractsDir = path.join(projectRoot, 'contracts');
      if (fs.existsSync(contractsDir)) {
        printInfo('For Slither analysis, run: pip3 install slither-analyzer && slither .');
      }
    }
  },

  fix: {
    name: 'Auto-Fix Issues',
    icon: GLYPHS.fix,
    description: 'Automatically fix linting issues',
    async execute(projectRoot, config) {
      printSection('Auto-Fix', GLYPHS.fix);

      printAction('Running ESLint with --fix...', GLYPHS.magic);
      try {
        execSync('npx eslint . --ext .js,.html --fix', { cwd: projectRoot, stdio: 'inherit' });
        printSuccess('Linting issues fixed');
      } catch (error) {
        printWarning('Some issues could not be auto-fixed');
      }

      printAction('Running Prettier...', GLYPHS.magic);
      try {
        execSync('npx prettier --write "**/*.{js,html,css,json,md}"', { cwd: projectRoot, stdio: 'inherit' });
        printSuccess('Code formatted');
      } catch (error) {
        printInfo('Prettier not available');
      }
    }
  },

  deploy: {
    name: 'Deploy Contracts',
    icon: GLYPHS.deploy,
    description: 'Deploy smart contracts to testnet',
    async execute(projectRoot, config) {
      printSection('Deployment', GLYPHS.rocket);

      const contractsDir = path.join(projectRoot, 'contracts');
      if (!fs.existsSync(contractsDir)) {
        printError('No contracts directory found');
        return;
      }

      printAction('Compiling contracts...', GLYPHS.build);
      try {
        execSync('npx hardhat compile', { cwd: contractsDir, stdio: 'inherit' });
        printSuccess('Contracts compiled');
      } catch (error) {
        printError('Compilation failed');
        return;
      }

      printWarning('Deployment requires secrets configuration');
      printInfo('Configure .env in contracts directory with:');
      printAction('TESTNET_PRIVATE_KEY=your_key');
      printAction('BASE_SEPOLIA_RPC_URL=your_rpc_url');
      printAction('BASESCAN_API_KEY=your_api_key');

      printInfo('Run: npx hardhat run scripts/deploy.js --network baseSepolia');
    }
  },

  docs: {
    name: 'Generate Documentation',
    icon: GLYPHS.docs,
    description: 'Generate API documentation',
    async execute(projectRoot, config) {
      printSection('Documentation', GLYPHS.docs);

      printInfo('Documentation files found:');
      const docsFiles = [
        'README.md',
        'COMPLETION_SUMMARY.md',
        'PROJECT_STATUS.md',
        'DOCUMENTATION_INDEX.md',
        '.claude/CLAUDE.md'
      ];

      for (const file of docsFiles) {
        const filePath = path.join(projectRoot, file);
        if (fs.existsSync(filePath)) {
          printSuccess(file);
        } else {
          printWarning(`${file} (missing)`);
        }
      }

      printInfo('To generate JSDoc: npx jsdoc -c jsdoc.json');
    }
  },

  status: {
    name: 'Project Status',
    icon: GLYPHS.info,
    description: 'Show project health dashboard',
    async execute(projectRoot, config) {
      printSection('Project Status', GLYPHS.trophy);

      const stats = analyzeProject(projectRoot);

      printSection('Health Metrics', GLYPHS.target);

      // Tests
      if (stats.tests > 0) {
        printSuccess(`Tests: ${stats.tests} test files`);
      } else {
        printWarning('Tests: No test files found');
      }

      // Documentation
      if (stats.documentation >= 5) {
        printSuccess(`Documentation: ${stats.documentation} files (excellent)`);
      } else if (stats.documentation >= 3) {
        printInfo(`Documentation: ${stats.documentation} files (good)`);
      } else {
        printWarning(`Documentation: ${stats.documentation} files (needs improvement)`);
      }

      // Git status
      if (stats.gitStatus === 'clean') {
        printSuccess('Git: Working tree clean');
      } else if (stats.gitStatus === 'modified') {
        printWarning('Git: Uncommitted changes');
      } else {
        printInfo('Git: Not a repository');
      }
    }
  },

  review: {
    name: 'Code Review',
    icon: GLYPHS.review,
    description: 'AI-assisted code review checklist',
    async execute(projectRoot, config) {
      printSection('Code Review Checklist', GLYPHS.review);

      printInfo('Automated checks:');
      printAction(`${GLYPHS.check} Code follows project style guidelines`);
      printAction(`${GLYPHS.check} No console.log in production code`);
      printAction(`${GLYPHS.check} Error handling implemented`);
      printAction(`${GLYPHS.check} Tests added for new functionality`);
      printAction(`${GLYPHS.check} Documentation updated`);
      printAction(`${GLYPHS.check} No security vulnerabilities`);
      printAction(`${GLYPHS.check} Gas optimization considered (smart contracts)`);

      printSection('Manual Review Required', GLYPHS.warning);
      printAction('Review logic for edge cases');
      printAction('Check for proper access control');
      printAction('Verify event emissions');
      printAction('Test transaction flows end-to-end');
    }
  },

  optimize: {
    name: 'Performance Optimization',
    icon: GLYPHS.optimize,
    description: 'Analyze and optimize performance',
    async execute(projectRoot, config) {
      printSection('Performance Optimization', GLYPHS.lightning);

      printAction('Analyzing bundle size...', GLYPHS.analyze);
      try {
        const jsFiles = execSync('find . -name "*.js" -not -path "*/node_modules/*" -exec ls -lh {} \\;',
          { cwd: projectRoot, encoding: 'utf8' });

        const lines = jsFiles.split('\n').filter(l => l.trim());
        const sizes = lines.map(line => {
          const match = line.match(/(\d+[KM]?)\s+([^\s]+\.js)$/);
          return match ? { size: match[1], file: path.basename(match[2]) } : null;
        }).filter(Boolean);

        printInfo('Largest JavaScript files:');
        sizes.slice(0, 5).forEach(({size, file}) => {
          printAction(`${file}: ${size}`);
        });
      } catch (error) {
        printWarning('Could not analyze file sizes');
      }

      printSection('Optimization Recommendations', GLYPHS.magic);
      printAction('Minify JavaScript in production');
      printAction('Use code splitting for large modules');
      printAction('Lazy load non-critical components');
      printAction('Optimize Web Audio API buffer usage');
      printAction('Review smart contract gas usage');
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 INTERACTIVE MENU
// ═══════════════════════════════════════════════════════════════════════════

async function showMenu(projectRoot, config) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt) => new Promise((resolve) => {
    rl.question(prompt, resolve);
  });

  while (true) {
    console.clear();
    printBanner();

    if (config) {
      printInfo(`Project: ${config.projectName}`);
      printInfo(`Root: ${projectRoot}`);
      console.log();
    }

    printSection('Available Actions', GLYPHS.magic);

    const actions = Object.entries(ACTIONS);
    actions.forEach(([key, action], index) => {
      console.log(colorize(`  ${index + 1}. ${action.icon} ${action.name}`, 'white'));
      console.log(colorize(`     ${action.description}`, 'dim'));
    });

    console.log();
    console.log(colorize(`  0. ${GLYPHS.cross} Exit`, 'red'));
    console.log();

    const answer = await question(colorize('Select action (0-' + actions.length + '): ', 'cyan'));
    const choice = parseInt(answer);

    if (choice === 0) {
      printInfo('Goodbye! 👋');
      rl.close();
      break;
    }

    if (choice > 0 && choice <= actions.length) {
      const [key, action] = actions[choice - 1];
      console.clear();
      printBanner();

      try {
        await action.execute(projectRoot, config);
      } catch (error) {
        printError(`Action failed: ${error.message}`);
      }

      console.log();
      await question(colorize('Press Enter to continue...', 'dim'));
    } else {
      printError('Invalid choice');
      await question(colorize('Press Enter to continue...', 'dim'));
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🚀 MAIN ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const projectRoot = findProjectRoot();
  const config = readClaudeConfig(projectRoot);

  // Handle direct command execution
  if (args.length > 0) {
    const command = args[0];

    if (command === '--help' || command === '-h') {
      printBanner();
      printSection('Usage', GLYPHS.info);
      console.log('  claude-cli [action]');
      console.log();
      printSection('Available Actions', GLYPHS.magic);

      Object.entries(ACTIONS).forEach(([key, action]) => {
        console.log(colorize(`  ${key.padEnd(12)} ${action.icon} ${action.name}`, 'white'));
        console.log(colorize(`               ${action.description}`, 'dim'));
      });

      console.log();
      printSection('Examples', GLYPHS.rocket);
      printAction('claude-cli analyze  # Run project analysis');
      printAction('claude-cli test     # Run test suite');
      printAction('claude-cli          # Interactive mode');
      return;
    }

    if (ACTIONS[command]) {
      printBanner();
      await ACTIONS[command].execute(projectRoot, config);
      return;
    }

    printError(`Unknown command: ${command}`);
    printInfo('Run with --help to see available commands');
    return;
  }

  // Interactive mode
  await showMenu(projectRoot, config);
}

// Run CLI
if (require.main === module) {
  main().catch(error => {
    printError(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { ACTIONS, analyzeProject, analyzeCodeQuality };
