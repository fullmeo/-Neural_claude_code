#!/usr/bin/env node

/**
 * 🔮 Oracle CLI - Command Line Divination Tool
 *
 * Interactive oracle for receiving guidance on development actions
 */

const NeuralOracle = require('./neural-oracle.js');
const NeuralEventBus = require('./neural-event-bus.js');

// Create event bus and oracle
const eventBus = new NeuralEventBus();
const oracle = new NeuralOracle(eventBus);

// Parse command
const args = process.argv.slice(2);
const command = args[0] || 'divine';

// CLI commands
const commands = {
    divine: () => {
        console.log('🔮 Drawing a Tarot card for guidance...\n');
        oracle.divine();
    },

    consult: () => {
        const situation = args[1] || 'feature';
        console.log(`🔮 Consulting oracle about: ${situation}...\n`);
        oracle.consultOracle(situation);
    },

    prophecy: () => {
        console.log('🔮 Revealing three-card prophecy...\n');
        oracle.prophecy();
    },

    next: () => {
        console.log('🔮 Predicting next action...\n');
        oracle.predictNext();
    },

    help: () => {
        console.log(`
🔮 Oracle CLI - Divine Your Next Development Move

USAGE:
  node oracle-cli.js [command] [options]

COMMANDS:
  divine              Draw a Tarot card for general guidance (default)
  consult <situation> Get specific guidance for a situation
  prophecy            Three-card reading (past, present, future)
  next                Predict next action based on recent events
  help                Show this help message

SITUATIONS (for consult):
  deployment          Guidance for deployment rituals
  debugging           Help finding and fixing bugs
  refactoring         Wisdom for code transformation
  security            Security audit guidance
  documentation       Writing docs inspiration
  feature             New feature development
  emergency           Crisis response guidance

EXAMPLES:
  node oracle-cli.js                    # General divination
  node oracle-cli.js divine             # Same as above
  node oracle-cli.js consult deployment # Deployment guidance
  node oracle-cli.js prophecy           # Three-card reading
  node oracle-cli.js next               # Predict next action

INTEGRATION:
  # Add to package.json scripts
  "oracle": "node oracle-cli.js",
  "oracle:consult": "node oracle-cli.js consult",
  "oracle:prophecy": "node oracle-cli.js prophecy"

  # Then use:
  npm run oracle
  npm run oracle:consult deployment
  npm run oracle:prophecy

May the cosmic forces guide your code! ✨
`);
    }
};

// Execute command
const commandFunc = commands[command] || commands.help;
commandFunc();
