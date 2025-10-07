# 🌌 Neural Cosmogram Guide

## Overview

The Neural Cosmogram is a mystical visualization tool that displays DAO proposals and NFT sessions as a living cosmic map, using sacred geometry, Tarot symbolism, and real-time blockchain data.

## Features

✨ **Cosmic Visualization**
- DAO proposals as orbital nodes with Tarot colors
- NFT sessions as diamond constellations
- Particle network showing connections
- Sacred geometry patterns
- Real-time pulse animations

🔮 **Tarot Integration**
- 22 Major Arcana color mappings
- Tarot-based ritual assignments
- Mystical energy representations
- Symbolic connections

📡 **Blockchain Data**
- Live DAO proposal tracking
- NFT session monitoring
- Vote count visualization
- Proposal lifecycle states

🎨 **Interactive Elements**
- Click proposals for details
- Click sessions for metadata
- Hover effects and tooltips
- Smooth animations

---

## Getting Started

### 1. Launch Cosmogram

```bash
# Start cosmogram visualization
npm run start:cosmogram
# Opens http://localhost:3001
```

Or manually:
```bash
npx serve . -p 3001
# Navigate to http://localhost:3001/cosmogram.html
```

### 2. Connect to Blockchain

**Prerequisites:**
- MetaMask installed
- Contract addresses configured (via postDeploy.js)
- Connected to Base Sepolia or Base Mainnet

**Steps:**
1. Click "📡 Load Data" button
2. Accept MetaMask connection request
3. Wait for blockchain data to load
4. Cosmogram displays proposals and sessions

---

## Visual Elements

### Central Circle 🔮

**Position:** Center of cosmogram
**Appearance:** Pulsing purple orb with 🔮 symbol
**Meaning:** Cosmic center, ritual nexus

### DAO Proposals ⭕

**Position:** Orbital ring around center
**Appearance:** Colored circles with vote counts
**Colors:** Mapped to Tarot cards

**States:**
- **Active** (bright color): Proposal accepting votes
- **Finalized** (gray): Proposal completed

**Information:**
- Circle size pulses when votes are cast
- Number shows total votes
- Click to see full details

### NFT Sessions 💎

**Position:** Inner constellation
**Appearance:** Rotating diamonds
**Colors:** Tarot-based ritual colors

**Information:**
- Diamond size represents energy level
- Glows when session updates
- ID shown below (last 4 chars)
- Click for full metadata

### Cosmic Particles ✨

**Appearance:** White dots connected by lines
**Behavior:** Drift and connect when nearby
**Purpose:** Visual ambiance, cosmic atmosphere

### Mystical Connections 🌟

**Appearance:** Purple beams from proposals to center
**Trigger:** When proposal is finalized
**Fades:** Over 5 seconds

---

## Tarot Color Mapping

Each Tarot card has a unique color representing its energy:

| Tarot Card | Color | Hex | Energy |
|------------|-------|-----|--------|
| The Fool | Gold | #FFD700 | New beginnings |
| The Magician | Purple | #9370DB | Power |
| The High Priestess | Royal Blue | #4169E1 | Mystery |
| The Empress | Pink | #FF69B4 | Fertility |
| The Emperor | Crimson | #DC143C | Authority |
| The Hierophant | Goldenrod | #DAA520 | Tradition |
| The Lovers | Deep Pink | #FF1493 | Love |
| The Chariot | Steel Blue | #4682B4 | Victory |
| Strength | Orange Red | #FF4500 | Courage |
| The Hermit | Slate Gray | #708090 | Wisdom |
| Wheel of Fortune | Lime Green | #32CD32 | Destiny |
| Justice | Navy | #000080 | Balance |
| The Hanged Man | Turquoise | #00CED1 | Sacrifice |
| Death | Black | #000000 | Transformation |
| Temperance | Sky Blue | #87CEEB | Harmony |
| The Devil | Dark Red | #8B0000 | Bondage |
| The Tower | Dark Orange | #FF8C00 | Chaos |
| The Star | Cyan | #00FFFF | Hope |
| The Moon | Lavender | #E6E6FA | Illusion |
| The Sun | Gold | #FFD700 | Joy |
| Judgement | White | #FFFFFF | Rebirth |
| The World | Dark Violet | #9400D3 | Completion |

---

## User Interface

### Header

**Elements:**
- Title: "🌌 Neural Cosmogram"
- 📡 Load Data: Connect and load blockchain data
- 🔄 Refresh: Reload current data
- 🧹 Clear: Clear all visualizations

### Stats Panel

**Metrics:**
- DAO Proposals count
- NFT Sessions count
- Real-time updates

### Sidebar

**Sections:**

1. **DAO Proposals**
   - List of all proposals
   - Status badges (Active/Finalized)
   - Vote counts
   - Tarot cards

2. **NFT Sessions**
   - List of all minted sessions
   - Session IDs
   - Ritual types
   - Energy levels
   - Tarot associations

### Connection Status

**Location:** Top right
**Indicators:**
- 🟢 Connected: Blockchain connection active
- ⚫ Disconnected: No blockchain connection

---

## Interactions

### Click on Proposal

**Displays:**
- Proposal name
- Associated Tarot card
- Total votes
- Current status (Active/Finalized)

**Example:**
```
Proposal: Ritual of Ascension
Tarot: The Star
Votes: 42
Status: active
```

### Click on Session

**Displays:**
- Session ID (full)
- Token ID number
- Ritual type
- Tarot card
- Energy level

**Example:**
```
Session #5
Ritual: Invocation Rituelle
Tarot: The Magician
Energy: 85%
```

### Hover Effects

- Proposals glow on hover
- Sessions shimmer on hover
- Cursor changes to pointer
- Visual feedback

---

## Animation Behaviors

### Rotation

- Proposals orbit clockwise (slow)
- Sessions orbit clockwise (slower)
- Continuous smooth motion

### Pulses

- Proposals pulse when votes cast
- Sessions glow when updated
- Central circle pulses continuously

### Particles

- Drift randomly across canvas
- Connect when nearby (<150px)
- Wrap around edges

### Connections

- Beam from finalized proposal to center
- Fades over 5 seconds
- Purple mystical glow

---

## Event Integration

### DAO Events

**Listened Events:**
- `dao:proposalCreated` → Adds new proposal node
- `dao:votesCast` → Updates vote count, triggers pulse
- `dao:proposalFinalized` → Changes status, creates connection

### NFT Events

**Listened Events:**
- `nft:sessionMinted` → Adds new session diamond
- `session:completed` → Updates energy, triggers glow

### Cosmogram Events

**Emitted Events:**
- `cosmogram:proposalAdded` → When proposal added to visualization
- `cosmogram:sessionAdded` → When session added to visualization
- `cosmogram:proposalClicked` → User clicks proposal
- `cosmogram:sessionClicked` → User clicks session

---

## Blockchain Integration

### Loading Data

**Process:**
1. Connect to MetaMask
2. Initialize contracts (DAO + NFT)
3. Query proposal count
4. Load each proposal with metadata
5. Query NFT token count
6. Load each session with metadata
7. Display in cosmogram

**Code Example:**
```javascript
// Load proposals
const proposalCount = await daoContract.proposalCount();
for (let i = 1; i <= proposalCount; i++) {
    const proposal = await daoContract.proposals(i);
    cosmogram.addProposal({
        proposalId: i,
        eventName: proposal.eventName,
        totalVotes: proposal.totalVotes
    });
}

// Load sessions
const sessionCount = await nftContract.tokenIdCounter();
for (let i = 1; i < sessionCount; i++) {
    const metadata = await nftContract.getSessionMetadata(i);
    cosmogram.addSession({
        tokenId: i,
        sessionId: metadata.sessionId,
        ritual: metadata.ritual,
        tarotCard: metadata.tarotCard
    });
}
```

### Contract Requirements

**DAO Contract (RitualDAO.sol):**
```solidity
function proposalCount() external view returns (uint256);
function proposals(uint256 id) external view returns (
    uint256 id,
    string eventName,
    uint256 totalVotes,
    bool finalized
);
```

**NFT Contract (PropheticSessionNFT.sol):**
```solidity
function tokenIdCounter() external view returns (uint256);
function getSessionMetadata(uint256 tokenId) external view returns (
    string sessionId,
    string ritual,
    string tarotCard
);
```

---

## Configuration

### Contract Addresses

Set via environment variables (auto-injected by postDeploy.js):

```env
VITE_DAO_CONTRACT_ADDRESS=0x1234567890abcdef...
VITE_NFT_CONTRACT_ADDRESS=0xabcdef1234567890...
```

### Visual Configuration

Edit in `neural-cosmogram.js`:

```javascript
this.config = {
    centerX: 0,              // Canvas center X
    centerY: 0,              // Canvas center Y
    radius: 200,             // Orbital radius
    particleCount: 100,      // Number of particles
    connectionDistance: 150, // Particle connection threshold
    rotationSpeed: 0.001,    // Rotation speed
    pulseSpeed: 0.02         // Pulse animation speed
};
```

### Canvas Size

Automatically resizes to fill container:
- Width: Parent element width
- Height: Parent element height
- Responsive to window resize

---

## Troubleshooting

### Cosmogram Not Loading

**Problem:** Blank canvas, no elements

**Solutions:**
1. Check browser console for errors
2. Verify MetaMask installed
3. Confirm contract addresses configured
4. Ensure on correct network (Base Sepolia/Mainnet)

### "Contract Addresses Not Configured" Warning

**Problem:** Console warning about missing addresses

**Solution:**
```bash
# Run post-deployment to inject addresses
npm run deploy:testnet
# Or manually
node contracts/scripts/postDeploy.js baseSepolia 0xDAO 0xNFT
```

### No Proposals/Sessions Showing

**Problem:** Connected but empty visualization

**Possible Causes:**
1. No data on blockchain yet
   - Create DAO proposal
   - Mint NFT session

2. Wrong network selected in MetaMask
   - Switch to Base Sepolia or Base Mainnet

3. Contract addresses incorrect
   - Verify in .env file
   - Re-run postDeploy.js

### MetaMask Connection Failed

**Problem:** Cannot connect to wallet

**Solutions:**
1. Ensure MetaMask unlocked
2. Refresh page
3. Clear browser cache
4. Check network configuration

### Slow Performance

**Problem:** Laggy animations

**Solutions:**
1. Reduce particle count:
   ```javascript
   particleCount: 50  // Instead of 100
   ```

2. Increase connection distance:
   ```javascript
   connectionDistance: 100  // Instead of 150
   ```

3. Lower rotation speed:
   ```javascript
   rotationSpeed: 0.0005  // Instead of 0.001
   ```

---

## Advanced Usage

### Custom Tarot Colors

Add or modify colors in `neural-cosmogram.js`:

```javascript
this.tarotColors = {
    'The Fool': '#FFD700',
    'Custom Card': '#YOUR_COLOR',
    // ...
};
```

### Event Listeners

Listen to cosmogram events:

```javascript
eventBus.on('cosmogram:proposalClicked', (proposal) => {
    console.log('Clicked:', proposal.name);
    // Custom action
});

eventBus.on('cosmogram:sessionClicked', (session) => {
    console.log('Session:', session.sessionId);
    // Custom action
});
```

### Programmatic Control

```javascript
// Access cosmogram instance
const cosmogram = window.cosmogram;

// Add proposal manually
cosmogram.addProposal({
    proposalId: 99,
    eventName: 'Custom Ritual',
    votes: 0,
    status: 'active'
});

// Clear visualization
cosmogram.clear();

// Stop animation
cosmogram.stopAnimation();

// Restart animation
cosmogram.startAnimation();
```

---

## Integration with Main App

### Embedding in Main App

Add to `neuralmix_enhanced_fixed.html`:

```html
<!-- Add cosmogram panel -->
<div id="cosmogram-panel" class="panel">
    <canvas id="cosmogram-canvas"></canvas>
</div>

<!-- Include script -->
<script src="neural-cosmogram.js"></script>

<!-- Initialize -->
<script>
const cosmogram = new NeuralCosmogram('cosmogram-canvas', neuralEventBus);

// Listen to DAO events from neural-dao-curator.js
neuralEventBus.on('dao:proposalCreated', (data) => {
    cosmogram.addProposal(data);
});

// Listen to NFT events from neural-nft-session.js
neuralEventBus.on('nft:sessionMinted', (data) => {
    cosmogram.addSession(data);
});
</script>
```

### Standalone vs Embedded

**Standalone (cosmogram.html):**
- Full-screen visualization
- Dedicated monitoring tool
- Load data from blockchain

**Embedded (main app):**
- Side panel in DJ interface
- Real-time updates from app events
- Synchronized with user actions

---

## Performance Tips

✅ **Optimize Particle Rendering**
- Reduce particle count for low-end devices
- Increase connection distance threshold
- Use requestAnimationFrame efficiently

✅ **Canvas Optimization**
- Clear only changed regions (advanced)
- Use offscreen canvas for static elements
- Limit redraw rate if needed

✅ **Data Loading**
- Load proposals/sessions in batches
- Cache blockchain queries
- Use pagination for large datasets

---

## API Reference

### Constructor

```javascript
new NeuralCosmogram(canvasId, eventBus)
```

**Parameters:**
- `canvasId` (string): ID of canvas element
- `eventBus` (NeuralEventBus): Event bus instance

### Methods

#### Data Management

```javascript
cosmogram.addProposal(proposal)     // Add DAO proposal
cosmogram.updateProposal(data)      // Update proposal votes
cosmogram.finalizeProposal(data)    // Finalize proposal

cosmogram.addSession(session)       // Add NFT session
cosmogram.updateSession(data)       // Update session energy

cosmogram.clear()                   // Clear all data
```

#### Animation Control

```javascript
cosmogram.startAnimation()          // Start animation loop
cosmogram.stopAnimation()           // Stop animation loop
```

#### Blockchain Integration

```javascript
await cosmogram.loadBlockchainData(daoContract, nftContract)
// Load all data from contracts
```

#### Lifecycle

```javascript
cosmogram.destroy()                 // Cleanup and destroy
```

---

## Screenshots & Examples

### Empty State
- Dark cosmic background
- Pulsing central circle
- Drifting particles
- No proposals/sessions

### Active State
- Orbital proposals (colored circles)
- Constellation sessions (diamonds)
- Vote counts displayed
- Mystical connections

### Interaction
- Hover glow effects
- Click tooltips
- Sidebar details
- Live statistics

---

## Resources

**Files:**
- `neural-cosmogram.js` - Main cosmogram class
- `cosmogram.html` - Standalone visualization page
- `neural-event-bus.js` - Event system

**Documentation:**
- `POSTDEPLOY_GUIDE.md` - Contract address injection
- `VALIDATION_GUIDE.md` - Environment setup
- `.claude/CLAUDE.md` - Project architecture

**Commands:**
```bash
npm run start:cosmogram    # Launch visualization
npm run deploy:testnet     # Deploy + auto-configure
npm start                  # Main application
```

---

🌌 **The cosmogram reveals the sacred geometry of your DAO and NFT ecosystem!**
