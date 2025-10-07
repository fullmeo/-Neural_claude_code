/**
 * 🎨 Neural Glyph Generator - Tarot NFT Artwork Creator
 *
 * Generates unique SVG glyphs for each Tarot card and NFT session.
 * Creates mystical, geometric artwork based on card symbolism.
 *
 * Features:
 * - 22 unique SVG templates for Major Arcana
 * - Sacred geometry patterns
 * - Color palettes from cosmogram
 * - IPFS-ready metadata generation
 * - Session-specific customization
 */

class NeuralGlyphGenerator {
    constructor() {
        // Tarot color palette (from cosmogram)
        this.tarotColors = {
            'The Fool': '#FFD700',          // Gold
            'The Magician': '#9370DB',      // Purple
            'The High Priestess': '#4169E1', // Royal Blue
            'The Empress': '#FF69B4',       // Pink
            'The Emperor': '#DC143C',       // Crimson
            'The Hierophant': '#DAA520',    // Goldenrod
            'The Lovers': '#FF1493',        // Deep Pink
            'The Chariot': '#4682B4',       // Steel Blue
            'Strength': '#FF4500',          // Orange Red
            'The Hermit': '#708090',        // Slate Gray
            'Wheel of Fortune': '#32CD32',  // Lime Green
            'Justice': '#000080',           // Navy
            'The Hanged Man': '#00CED1',    // Turquoise
            'Death': '#000000',             // Black
            'Temperance': '#87CEEB',        // Sky Blue
            'The Devil': '#8B0000',         // Dark Red
            'The Tower': '#FF8C00',         // Dark Orange
            'The Star': '#00FFFF',          // Cyan
            'The Moon': '#E6E6FA',          // Lavender
            'The Sun': '#FFD700',           // Gold
            'Judgement': '#FFFFFF',         // White
            'The World': '#9400D3'          // Dark Violet
        };

        // Sacred geometry symbols
        this.symbols = {
            'The Fool': '🃏',
            'The Magician': '🎩',
            'The High Priestess': '🔮',
            'The Empress': '👑',
            'The Emperor': '🏛️',
            'The Hierophant': '⛪',
            'The Lovers': '💕',
            'The Chariot': '🏇',
            'Strength': '🦁',
            'The Hermit': '🕯️',
            'Wheel of Fortune': '☸️',
            'Justice': '⚖️',
            'The Hanged Man': '🙃',
            'Death': '💀',
            'Temperance': '🍶',
            'The Devil': '😈',
            'The Tower': '🗼',
            'The Star': '⭐',
            'The Moon': '🌙',
            'The Sun': '☀️',
            'Judgement': '📯',
            'The World': '🌍'
        };

        console.log('[NeuralGlyphGenerator] 🎨 Glyph generator initialized');
    }

    /**
     * Generate SVG glyph for a Tarot card
     */
    generateGlyph(cardName, sessionData = {}) {
        const color = this.tarotColors[cardName] || '#FFFFFF';
        const symbol = this.symbols[cardName] || '🔮';
        const timestamp = sessionData.timestamp || Date.now();
        const sessionId = sessionData.sessionId || 'unknown';
        const energy = sessionData.energy || 50;

        // Generate unique pattern based on session ID
        const pattern = this.generatePattern(sessionId, cardName);

        // Create SVG
        const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Background Gradient -->
  <defs>
    <radialGradient id="bg-gradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:0.3" />
      <stop offset="100%" style="stop-color:#000510;stop-opacity:1" />
    </radialGradient>

    <linearGradient id="card-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:${this.shiftColor(color, -30)};stop-opacity:1" />
    </linearGradient>

    <!-- Glow Filter -->
    <filter id="glow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Sacred Geometry Pattern -->
    <pattern id="geometry" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      ${pattern}
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" fill="url(#bg-gradient)"/>

  <!-- Sacred Geometry Background -->
  <rect width="512" height="512" fill="url(#geometry)" opacity="0.2"/>

  <!-- Outer Circle (Energy Ring) -->
  <circle cx="256" cy="256" r="${200 + (energy / 2)}"
    fill="none"
    stroke="${color}"
    stroke-width="3"
    opacity="0.6"
    filter="url(#glow)">
    <animate attributeName="r"
      from="${200 + (energy / 2)}"
      to="${210 + (energy / 2)}"
      dur="3s"
      repeatCount="indefinite"/>
  </circle>

  <!-- Sacred Symbol (Based on Card) -->
  ${this.generateSacredSymbol(cardName, color)}

  <!-- Central Circle -->
  <circle cx="256" cy="256" r="120"
    fill="url(#card-gradient)"
    stroke="${color}"
    stroke-width="4"
    filter="url(#glow)"/>

  <!-- Card Number (Major Arcana) -->
  <text x="256" y="200"
    font-family="Arial, sans-serif"
    font-size="48"
    font-weight="bold"
    text-anchor="middle"
    fill="#FFFFFF"
    opacity="0.9">
    ${this.getCardNumber(cardName)}
  </text>

  <!-- Card Symbol -->
  <text x="256" y="280"
    font-family="Arial, sans-serif"
    font-size="80"
    text-anchor="middle">
    ${symbol}
  </text>

  <!-- Card Name -->
  <text x="256" y="340"
    font-family="Georgia, serif"
    font-size="20"
    font-weight="bold"
    text-anchor="middle"
    fill="#FFFFFF"
    opacity="0.95">
    ${cardName.toUpperCase()}
  </text>

  <!-- Session ID (Bottom) -->
  <text x="256" y="480"
    font-family="monospace"
    font-size="12"
    text-anchor="middle"
    fill="${color}"
    opacity="0.7">
    ${sessionId.slice(0, 16)}...
  </text>

  <!-- Energy Indicator -->
  ${this.generateEnergyIndicator(energy, color)}

  <!-- Border -->
  <rect x="10" y="10" width="492" height="492"
    fill="none"
    stroke="${color}"
    stroke-width="2"
    opacity="0.6"/>
</svg>`;

        return svg;
    }

    /**
     * Generate sacred geometry pattern
     */
    generatePattern(sessionId, cardName) {
        // Use session ID to create unique pattern
        const hash = this.hashString(sessionId);
        const num = hash % 5;

        const patterns = [
            // Flower of Life
            `<circle cx="20" cy="20" r="8" fill="none" stroke="currentColor" stroke-width="1"/>
             <circle cx="14" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1"/>
             <circle cx="26" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1"/>`,

            // Metatron's Cube
            `<path d="M 20 5 L 35 15 L 35 25 L 20 35 L 5 25 L 5 15 Z"
              fill="none" stroke="currentColor" stroke-width="1"/>
             <line x1="20" y1="5" x2="20" y2="35" stroke="currentColor" stroke-width="1"/>
             <line x1="5" y1="15" x2="35" y2="25" stroke="currentColor" stroke-width="1"/>`,

            // Vesica Piscis
            `<circle cx="15" cy="20" r="10" fill="none" stroke="currentColor" stroke-width="1"/>
             <circle cx="25" cy="20" r="10" fill="none" stroke="currentColor" stroke-width="1"/>`,

            // Seed of Life
            `<circle cx="20" cy="20" r="6" fill="none" stroke="currentColor" stroke-width="1"/>
             <circle cx="26" cy="20" r="6" fill="none" stroke="currentColor" stroke-width="1"/>
             <circle cx="14" cy="20" r="6" fill="none" stroke="currentColor" stroke-width="1"/>`,

            // Sri Yantra Triangle
            `<path d="M 20 10 L 30 30 L 10 30 Z" fill="none" stroke="currentColor" stroke-width="1"/>
             <path d="M 20 30 L 30 10 L 10 10 Z" fill="none" stroke="currentColor" stroke-width="1"/>`
        ];

        return patterns[num];
    }

    /**
     * Generate sacred symbol based on card
     */
    generateSacredSymbol(cardName, color) {
        const symbols = {
            'The Fool': `<path d="M 256 100 Q 300 150 256 200 Q 212 150 256 100" fill="${color}" opacity="0.3"/>`,
            'The Magician': `<path d="M 256 120 L 256 200 M 220 160 L 292 160" stroke="${color}" stroke-width="8" opacity="0.3"/>`,
            'The Star': `<polygon points="256,100 280,170 350,170 295,210 315,280 256,240 197,280 217,210 162,170 232,170" fill="${color}" opacity="0.3"/>`,
            'The Sun': `<circle cx="256" cy="150" r="40" fill="${color}" opacity="0.3"/>
                        <path d="M 256 90 L 256 210 M 216 150 L 296 150 M 226 110 L 286 190 M 286 110 L 226 190" stroke="${color}" stroke-width="4" opacity="0.3"/>`,
            'The Moon': `<path d="M 256 100 Q 220 150 256 200 Q 240 150 256 100" fill="${color}" opacity="0.3"/>`,
            'The World': `<circle cx="256" cy="150" r="50" fill="none" stroke="${color}" stroke-width="6" opacity="0.3"/>`,
            'Death': `<path d="M 256 100 L 256 200 M 220 140 L 292 140 M 220 180 L 292 180" stroke="${color}" stroke-width="6" opacity="0.3"/>`,
            'default': `<circle cx="256" cy="150" r="40" fill="none" stroke="${color}" stroke-width="4" opacity="0.3"/>`
        };

        return symbols[cardName] || symbols['default'];
    }

    /**
     * Generate energy indicator
     */
    generateEnergyIndicator(energy, color) {
        const bars = Math.floor(energy / 20); // 5 bars max
        let barsHtml = '';

        for (let i = 0; i < 5; i++) {
            const opacity = i < bars ? 0.8 : 0.2;
            barsHtml += `<rect x="${30 + i * 20}" y="${450 - i * 5}" width="15" height="${20 + i * 5}" fill="${color}" opacity="${opacity}"/>`;
        }

        return barsHtml;
    }

    /**
     * Get card number (0-21)
     */
    getCardNumber(cardName) {
        const numbers = {
            'The Fool': '0',
            'The Magician': 'I',
            'The High Priestess': 'II',
            'The Empress': 'III',
            'The Emperor': 'IV',
            'The Hierophant': 'V',
            'The Lovers': 'VI',
            'The Chariot': 'VII',
            'Strength': 'VIII',
            'The Hermit': 'IX',
            'Wheel of Fortune': 'X',
            'Justice': 'XI',
            'The Hanged Man': 'XII',
            'Death': 'XIII',
            'Temperance': 'XIV',
            'The Devil': 'XV',
            'The Tower': 'XVI',
            'The Star': 'XVII',
            'The Moon': 'XVIII',
            'The Sun': 'XIX',
            'Judgement': 'XX',
            'The World': 'XXI'
        };

        return numbers[cardName] || '?';
    }

    /**
     * Shift color brightness
     */
    shiftColor(hex, amount) {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.max(0, Math.min(255, (num >> 16) + amount));
        const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
        const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    }

    /**
     * Simple string hash function
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    /**
     * Generate NFT metadata (ERC-721/OpenSea compatible)
     */
    generateMetadata(cardName, sessionData = {}) {
        const {
            sessionId = 'unknown',
            ritual = 'Unknown Ritual',
            timestamp = Date.now(),
            energy = 50,
            bpm = 120,
            tracks = [],
            duration = 0
        } = sessionData;

        const metadata = {
            name: `${cardName} - Session #${sessionId.slice(0, 8)}`,
            description: `A prophetic DJ session blessed by ${cardName}. This NFT represents a unique musical journey through the mystical realms, guided by Tarot wisdom and cosmic vibrations.`,
            image: `ipfs://[TO_BE_REPLACED]/glyph-${sessionId}.svg`,
            external_url: `https://djcloudio.com/session/${sessionId}`,
            attributes: [
                {
                    trait_type: 'Tarot Card',
                    value: cardName
                },
                {
                    trait_type: 'Card Number',
                    value: this.getCardNumber(cardName)
                },
                {
                    trait_type: 'Ritual',
                    value: ritual
                },
                {
                    trait_type: 'Energy Level',
                    value: energy,
                    max_value: 100
                },
                {
                    trait_type: 'BPM',
                    value: bpm,
                    display_type: 'number'
                },
                {
                    trait_type: 'Duration (min)',
                    value: Math.floor(duration / 60),
                    display_type: 'number'
                },
                {
                    trait_type: 'Tracks',
                    value: tracks.length,
                    display_type: 'number'
                },
                {
                    trait_type: 'Timestamp',
                    value: timestamp,
                    display_type: 'date'
                },
                {
                    trait_type: 'Sacred Color',
                    value: this.tarotColors[cardName] || '#FFFFFF'
                }
            ],
            background_color: '000510',
            animation_url: `ipfs://[TO_BE_REPLACED]/session-${sessionId}.mp4` // Optional: video recording
        };

        return metadata;
    }

    /**
     * Generate complete NFT package (SVG + metadata)
     */
    generateNFTPackage(cardName, sessionData = {}) {
        const svg = this.generateGlyph(cardName, sessionData);
        const metadata = this.generateMetadata(cardName, sessionData);

        return {
            svg,
            metadata,
            cardName,
            sessionId: sessionData.sessionId || 'unknown',
            timestamp: sessionData.timestamp || Date.now()
        };
    }

    /**
     * Save SVG to file
     */
    saveSVG(svg, filename) {
        const fs = require('fs');
        const path = require('path');

        // Create glyphs directory if it doesn't exist
        const glyphsDir = path.join(__dirname, 'glyphs');
        if (!fs.existsSync(glyphsDir)) {
            fs.mkdirSync(glyphsDir, { recursive: true });
        }

        const filepath = path.join(glyphsDir, filename);
        fs.writeFileSync(filepath, svg, 'utf8');

        console.log(`[NeuralGlyphGenerator] ✅ SVG saved: ${filepath}`);
        return filepath;
    }

    /**
     * Save metadata to JSON
     */
    saveMetadata(metadata, filename) {
        const fs = require('fs');
        const path = require('path');

        // Create metadata directory if it doesn't exist
        const metadataDir = path.join(__dirname, 'metadata');
        if (!fs.existsSync(metadataDir)) {
            fs.mkdirSync(metadataDir, { recursive: true });
        }

        const filepath = path.join(metadataDir, filename);
        fs.writeFileSync(filepath, JSON.stringify(metadata, null, 2), 'utf8');

        console.log(`[NeuralGlyphGenerator] ✅ Metadata saved: ${filepath}`);
        return filepath;
    }

    /**
     * Generate and save complete NFT package
     */
    async createNFT(cardName, sessionData = {}) {
        const pkg = this.generateNFTPackage(cardName, sessionData);
        const sessionId = sessionData.sessionId || 'unknown';

        // Save SVG
        const svgPath = this.saveSVG(pkg.svg, `glyph-${sessionId}.svg`);

        // Save metadata
        const metadataPath = this.saveMetadata(pkg.metadata, `metadata-${sessionId}.json`);

        console.log(`[NeuralGlyphGenerator] 🎨 NFT package created for ${cardName}`);
        console.log(`  SVG: ${svgPath}`);
        console.log(`  Metadata: ${metadataPath}`);

        return {
            ...pkg,
            svgPath,
            metadataPath
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NeuralGlyphGenerator;
}
