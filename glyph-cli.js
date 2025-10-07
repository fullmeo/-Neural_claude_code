#!/usr/bin/env node

/**
 * 🎨 Glyph CLI - NFT Artwork Generator
 *
 * Generate Tarot-based SVG glyphs and NFT metadata
 */

const NeuralGlyphGenerator = require('./neural-glyph-generator.js');

const generator = new NeuralGlyphGenerator();

// Parse arguments
const args = process.argv.slice(2);
const command = args[0] || 'help';

// CLI commands
const commands = {
    generate: () => {
        const cardName = args[1] || 'The Star';
        const sessionId = args[2] || `session-${Date.now()}`;

        const sessionData = {
            sessionId,
            ritual: args[3] || 'Invocation Rituelle',
            timestamp: Date.now(),
            energy: parseInt(args[4]) || Math.floor(Math.random() * 100),
            bpm: parseInt(args[5]) || 120,
            tracks: [],
            duration: parseInt(args[6]) || 3600
        };

        console.log('🎨 Generating NFT glyph...\n');
        console.log(`Card: ${cardName}`);
        console.log(`Session: ${sessionId}`);
        console.log(`Energy: ${sessionData.energy}%`);
        console.log('');

        const result = generator.createNFT(cardName, sessionData);

        console.log('\n✅ NFT Package Created!');
        console.log(`📁 SVG: ${result.svgPath}`);
        console.log(`📁 Metadata: ${result.metadataPath}`);
        console.log('');
    },

    preview: () => {
        const cardName = args[1] || 'The Star';
        const sessionData = {
            sessionId: `preview-${Date.now()}`,
            energy: 75
        };

        const svg = generator.generateGlyph(cardName, sessionData);
        console.log(svg);
    },

    metadata: () => {
        const cardName = args[1] || 'The Star';
        const sessionData = {
            sessionId: `session-${Date.now()}`,
            ritual: 'Invocation Rituelle',
            energy: 80,
            bpm: 128,
            tracks: ['Track 1', 'Track 2', 'Track 3'],
            duration: 3600
        };

        const metadata = generator.generateMetadata(cardName, sessionData);
        console.log(JSON.stringify(metadata, null, 2));
    },

    list: () => {
        console.log('\n🎴 Available Tarot Cards:\n');
        const cards = Object.keys(generator.tarotColors);
        cards.forEach((card, index) => {
            const num = generator.getCardNumber(card);
            const color = generator.tarotColors[card];
            const symbol = generator.symbols[card];
            console.log(`  ${num.padEnd(4)} ${symbol} ${card.padEnd(25)} ${color}`);
        });
        console.log('');
    },

    batch: () => {
        console.log('🎨 Generating glyphs for all 22 Major Arcana...\n');

        const cards = Object.keys(generator.tarotColors);
        cards.forEach((card, index) => {
            const sessionData = {
                sessionId: `session-${index + 1}`,
                ritual: 'Ritual Collection',
                energy: Math.floor(Math.random() * 100),
                bpm: 120 + index * 2,
                tracks: [],
                duration: 3600
            };

            generator.createNFT(card, sessionData);
        });

        console.log('\n✅ All 22 glyphs generated!');
        console.log('📁 Check glyphs/ and metadata/ directories');
        console.log('');
    },

    help: () => {
        console.log(`
🎨 Glyph CLI - Tarot NFT Artwork Generator

USAGE:
  node glyph-cli.js [command] [options]

COMMANDS:
  generate <card> <sessionId> [ritual] [energy] [bpm] [duration]
           Generate SVG glyph and metadata for a specific card

  preview <card>
           Preview SVG output for a card (stdout)

  metadata <card>
           Preview metadata JSON for a card (stdout)

  list     List all available Tarot cards with colors

  batch    Generate glyphs for all 22 Major Arcana cards

  help     Show this help message

EXAMPLES:
  # Generate specific glyph
  node glyph-cli.js generate "The Star" session123 "Invocation" 80 128 3600

  # Preview SVG
  node glyph-cli.js preview "The Magician" > preview.svg

  # Get metadata JSON
  node glyph-cli.js metadata "The Moon" > metadata.json

  # List all cards
  node glyph-cli.js list

  # Generate all 22 glyphs
  node glyph-cli.js batch

INTEGRATION:
  # Add to package.json
  "glyph": "node glyph-cli.js",
  "glyph:generate": "node glyph-cli.js generate",
  "glyph:batch": "node glyph-cli.js batch"

  # Then use:
  npm run glyph list
  npm run glyph:generate "The Star" session123
  npm run glyph:batch

OUTPUT:
  - SVG files: glyphs/glyph-{sessionId}.svg
  - Metadata: metadata/metadata-{sessionId}.json

NFT METADATA:
  - ERC-721 compatible
  - OpenSea compatible
  - Includes all session attributes
  - IPFS-ready (update image URLs)

May your glyphs be mystical and your NFTs blessed! ✨
`);
    }
};

// Execute command
const commandFunc = commands[command] || commands.help;
commandFunc();
