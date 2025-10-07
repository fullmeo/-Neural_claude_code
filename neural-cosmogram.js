/**
 * 🌌 Neural Cosmogram - DAO/NFT Session Visualization
 *
 * Creates mystical visualizations of DAO proposals and NFT sessions
 * using sacred geometry, celestial patterns, and blockchain data.
 *
 * Features:
 * - Tarot-based ritual visualization
 * - DAO proposal lifecycle tracking
 * - NFT session constellation mapping
 * - Real-time blockchain data integration
 * - Interactive cosmic canvas
 */

class NeuralCosmogram {
    constructor(canvasId, eventBus) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.eventBus = eventBus;

        // Cosmogram state
        this.proposals = [];
        this.sessions = [];
        this.particles = [];
        this.connections = [];

        // Visual configuration
        this.config = {
            centerX: 0,
            centerY: 0,
            radius: 200,
            particleCount: 100,
            connectionDistance: 150,
            rotationSpeed: 0.001,
            pulseSpeed: 0.02
        };

        // Tarot symbolism colors
        this.tarotColors = {
            'The Fool': '#FFD700',      // Gold - New beginnings
            'The Magician': '#9370DB',  // Purple - Power
            'The High Priestess': '#4169E1', // Royal Blue - Mystery
            'The Empress': '#FF69B4',   // Pink - Fertility
            'The Emperor': '#DC143C',   // Crimson - Authority
            'The Hierophant': '#DAA520', // Goldenrod - Tradition
            'The Lovers': '#FF1493',    // Deep Pink - Love
            'The Chariot': '#4682B4',   // Steel Blue - Victory
            'Strength': '#FF4500',      // Orange Red - Courage
            'The Hermit': '#708090',    // Slate Gray - Wisdom
            'Wheel of Fortune': '#32CD32', // Lime Green - Destiny
            'Justice': '#000080',       // Navy - Balance
            'The Hanged Man': '#00CED1', // Turquoise - Sacrifice
            'Death': '#000000',         // Black - Transformation
            'Temperance': '#87CEEB',    // Sky Blue - Harmony
            'The Devil': '#8B0000',     // Dark Red - Bondage
            'The Tower': '#FF8C00',     // Dark Orange - Chaos
            'The Star': '#00FFFF',      // Cyan - Hope
            'The Moon': '#E6E6FA',      // Lavender - Illusion
            'The Sun': '#FFD700',       // Gold - Joy
            'Judgement': '#FFFFFF',     // White - Rebirth
            'The World': '#9400D3'      // Dark Violet - Completion
        };

        // Animation state
        this.animationId = null;
        this.time = 0;

        this.init();
    }

    /**
     * Initialize cosmogram
     */
    init() {
        this.resizeCanvas();
        this.initializeParticles();
        this.setupEventListeners();
        this.startAnimation();

        console.log('[NeuralCosmogram] 🌌 Cosmogram initialized');
    }

    /**
     * Resize canvas to fill container
     */
    resizeCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;

        this.config.centerX = this.canvas.width / 2;
        this.config.centerY = this.canvas.height / 2;
        this.config.radius = Math.min(this.canvas.width, this.canvas.height) * 0.35;
    }

    /**
     * Initialize cosmic particles
     */
    initializeParticles() {
        this.particles = [];

        for (let i = 0; i < this.config.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.3
            });
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());

        // Listen for DAO proposal events
        this.eventBus.on('dao:proposalCreated', (data) => this.addProposal(data));
        this.eventBus.on('dao:votesCast', (data) => this.updateProposal(data));
        this.eventBus.on('dao:proposalFinalized', (data) => this.finalizeProposal(data));

        // Listen for NFT session events
        this.eventBus.on('nft:sessionMinted', (data) => this.addSession(data));
        this.eventBus.on('session:completed', (data) => this.updateSession(data));

        // Canvas interactions
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    }

    /**
     * Add DAO proposal to cosmogram
     */
    addProposal(proposal) {
        const angle = (this.proposals.length / 22) * Math.PI * 2; // 22 Tarot cards
        const tarotCard = this.getRandomTarotCard();

        this.proposals.push({
            id: proposal.proposalId,
            name: proposal.eventName,
            angle,
            radius: this.config.radius,
            tarotCard,
            color: this.tarotColors[tarotCard] || '#FFFFFF',
            votes: 0,
            status: 'active',
            createdAt: Date.now(),
            pulse: 0
        });

        console.log(`[NeuralCosmogram] 🔮 Added proposal: ${proposal.eventName} (${tarotCard})`);
        this.eventBus.emit('cosmogram:proposalAdded', { proposal, tarotCard });
    }

    /**
     * Update proposal with vote data
     */
    updateProposal(data) {
        const proposal = this.proposals.find(p => p.id === data.proposalId);
        if (proposal) {
            proposal.votes = data.totalVotes || 0;
            proposal.pulse = 1; // Trigger pulse animation

            console.log(`[NeuralCosmogram] 📊 Updated proposal ${data.proposalId}: ${proposal.votes} votes`);
        }
    }

    /**
     * Finalize proposal
     */
    finalizeProposal(data) {
        const proposal = this.proposals.find(p => p.id === data.proposalId);
        if (proposal) {
            proposal.status = 'finalized';
            proposal.winner = data.winningRitual;

            // Create connection to winner
            this.createConnection(proposal, data.winningRitual);

            console.log(`[NeuralCosmogram] ✨ Finalized proposal ${data.proposalId}: ${data.winningRitual.name}`);
        }
    }

    /**
     * Add NFT session to cosmogram
     */
    addSession(session) {
        const angle = Math.random() * Math.PI * 2;
        const distance = this.config.radius * (0.5 + Math.random() * 0.3);

        this.sessions.push({
            id: session.tokenId,
            sessionId: session.sessionId,
            angle,
            distance,
            x: this.config.centerX + Math.cos(angle) * distance,
            y: this.config.centerY + Math.sin(angle) * distance,
            ritual: session.ritual,
            tarotCard: session.tarotCard,
            color: this.tarotColors[session.tarotCard] || '#FFFFFF',
            energy: session.energyLevel || 50,
            createdAt: Date.now(),
            glow: 0
        });

        console.log(`[NeuralCosmogram] 💎 Added NFT session: ${session.sessionId} (${session.tarotCard})`);
        this.eventBus.emit('cosmogram:sessionAdded', session);
    }

    /**
     * Update session data
     */
    updateSession(data) {
        const session = this.sessions.find(s => s.sessionId === data.sessionId);
        if (session) {
            session.energy = data.energyLevel || session.energy;
            session.glow = 1; // Trigger glow animation
        }
    }

    /**
     * Create mystical connection between elements
     */
    createConnection(from, to) {
        this.connections.push({
            from,
            to,
            strength: 1,
            createdAt: Date.now()
        });
    }

    /**
     * Get random Tarot card
     */
    getRandomTarotCard() {
        const cards = Object.keys(this.tarotColors);
        return cards[Math.floor(Math.random() * cards.length)];
    }

    /**
     * Handle canvas click
     */
    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if clicked on proposal
        for (const proposal of this.proposals) {
            const px = this.config.centerX + Math.cos(proposal.angle) * proposal.radius;
            const py = this.config.centerY + Math.sin(proposal.angle) * proposal.radius;
            const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);

            if (distance < 30) {
                this.eventBus.emit('cosmogram:proposalClicked', proposal);
                console.log(`[NeuralCosmogram] 👆 Clicked proposal: ${proposal.name}`);
                return;
            }
        }

        // Check if clicked on session
        for (const session of this.sessions) {
            const distance = Math.sqrt((x - session.x) ** 2 + (y - session.y) ** 2);

            if (distance < 20) {
                this.eventBus.emit('cosmogram:sessionClicked', session);
                console.log(`[NeuralCosmogram] 👆 Clicked session: ${session.sessionId}`);
                return;
            }
        }
    }

    /**
     * Handle mouse move for hover effects
     */
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Update cursor based on hover
        let isHovering = false;

        for (const proposal of this.proposals) {
            const px = this.config.centerX + Math.cos(proposal.angle) * proposal.radius;
            const py = this.config.centerY + Math.sin(proposal.angle) * proposal.radius;
            if (Math.sqrt((x - px) ** 2 + (y - py) ** 2) < 30) {
                isHovering = true;
                break;
            }
        }

        if (!isHovering) {
            for (const session of this.sessions) {
                if (Math.sqrt((x - session.x) ** 2 + (y - session.y) ** 2) < 20) {
                    isHovering = true;
                    break;
                }
            }
        }

        this.canvas.style.cursor = isHovering ? 'pointer' : 'default';
    }

    /**
     * Start animation loop
     */
    startAnimation() {
        const animate = () => {
            this.update();
            this.render();
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }

    /**
     * Stop animation
     */
    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Update animation state
     */
    update() {
        this.time += this.config.rotationSpeed;

        // Update particles
        for (const particle of this.particles) {
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Wrap around edges
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
        }

        // Update proposals
        for (const proposal of this.proposals) {
            proposal.angle += this.config.rotationSpeed;
            if (proposal.pulse > 0) {
                proposal.pulse -= 0.05;
            }
        }

        // Update sessions
        for (const session of this.sessions) {
            session.angle += this.config.rotationSpeed * 0.5;
            session.x = this.config.centerX + Math.cos(session.angle) * session.distance;
            session.y = this.config.centerY + Math.sin(session.angle) * session.distance;

            if (session.glow > 0) {
                session.glow -= 0.03;
            }
        }

        // Update connections (fade over time)
        this.connections = this.connections.filter(conn => {
            const age = Date.now() - conn.createdAt;
            conn.strength = Math.max(0, 1 - age / 5000); // Fade over 5 seconds
            return conn.strength > 0;
        });
    }

    /**
     * Render cosmogram
     */
    render() {
        // Clear canvas with cosmic background
        this.ctx.fillStyle = '#000510';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw cosmic particles
        this.drawParticles();

        // Draw particle connections
        this.drawParticleConnections();

        // Draw central circle (cosmic center)
        this.drawCentralCircle();

        // Draw DAO proposals
        this.drawProposals();

        // Draw NFT sessions
        this.drawSessions();

        // Draw mystical connections
        this.drawConnections();

        // Draw legend
        this.drawLegend();
    }

    /**
     * Draw cosmic particles
     */
    drawParticles() {
        for (const particle of this.particles) {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            this.ctx.fill();
        }
    }

    /**
     * Draw connections between nearby particles
     */
    drawParticleConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.config.connectionDistance) {
                    const opacity = (1 - distance / this.config.connectionDistance) * 0.2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(100, 150, 255, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        }
    }

    /**
     * Draw central cosmic circle
     */
    drawCentralCircle() {
        const pulse = Math.sin(this.time * 10) * 5 + 50;

        // Outer glow
        const gradient = this.ctx.createRadialGradient(
            this.config.centerX, this.config.centerY, 0,
            this.config.centerX, this.config.centerY, pulse
        );
        gradient.addColorStop(0, 'rgba(138, 43, 226, 0.5)');
        gradient.addColorStop(1, 'rgba(138, 43, 226, 0)');

        this.ctx.beginPath();
        this.ctx.arc(this.config.centerX, this.config.centerY, pulse, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        // Inner circle
        this.ctx.beginPath();
        this.ctx.arc(this.config.centerX, this.config.centerY, 30, 0, Math.PI * 2);
        this.ctx.fillStyle = '#1a0033';
        this.ctx.fill();
        this.ctx.strokeStyle = '#8A2BE2';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Center symbol (🔮)
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillText('🔮', this.config.centerX, this.config.centerY);
    }

    /**
     * Draw DAO proposals
     */
    drawProposals() {
        for (const proposal of this.proposals) {
            const x = this.config.centerX + Math.cos(proposal.angle) * proposal.radius;
            const y = this.config.centerY + Math.sin(proposal.angle) * proposal.radius;

            const size = 20 + (proposal.pulse > 0 ? proposal.pulse * 10 : 0);

            // Proposal glow
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, size + 10);
            gradient.addColorStop(0, proposal.color);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            this.ctx.beginPath();
            this.ctx.arc(x, y, size + 10, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();

            // Proposal circle
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fillStyle = proposal.status === 'active' ? proposal.color : '#555555';
            this.ctx.fill();
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Vote count
            if (proposal.votes > 0) {
                this.ctx.font = 'bold 12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.fillText(proposal.votes, x, y);
            }

            // Proposal name
            this.ctx.font = '10px Arial';
            this.ctx.fillStyle = '#FFFFFF';
            const nameY = y + size + 15;
            this.ctx.fillText(proposal.name.substring(0, 15), x, nameY);
        }
    }

    /**
     * Draw NFT sessions
     */
    drawSessions() {
        for (const session of this.sessions) {
            const size = 15 + (session.glow > 0 ? session.glow * 8 : 0);

            // Session glow
            if (session.glow > 0) {
                const gradient = this.ctx.createRadialGradient(
                    session.x, session.y, 0,
                    session.x, session.y, size + 15
                );
                gradient.addColorStop(0, session.color);
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

                this.ctx.beginPath();
                this.ctx.arc(session.x, session.y, size + 15, 0, Math.PI * 2);
                this.ctx.fillStyle = gradient;
                this.ctx.fill();
            }

            // Session diamond
            this.ctx.save();
            this.ctx.translate(session.x, session.y);
            this.ctx.rotate(Math.PI / 4);

            this.ctx.fillStyle = session.color;
            this.ctx.fillRect(-size/2, -size/2, size, size);

            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 1.5;
            this.ctx.strokeRect(-size/2, -size/2, size, size);

            this.ctx.restore();

            // Session ID (last 4 chars)
            this.ctx.font = '8px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillText(
                session.sessionId.slice(-4),
                session.x,
                session.y + size + 10
            );
        }
    }

    /**
     * Draw mystical connections
     */
    drawConnections() {
        for (const conn of this.connections) {
            if (conn.from && conn.to) {
                const fromX = this.config.centerX + Math.cos(conn.from.angle) * conn.from.radius;
                const fromY = this.config.centerY + Math.sin(conn.from.angle) * conn.from.radius;

                this.ctx.beginPath();
                this.ctx.moveTo(fromX, fromY);
                this.ctx.lineTo(this.config.centerX, this.config.centerY);
                this.ctx.strokeStyle = `rgba(138, 43, 226, ${conn.strength * 0.8})`;
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
            }
        }
    }

    /**
     * Draw legend
     */
    drawLegend() {
        const legendX = 20;
        const legendY = 20;

        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('🌌 Cosmogram', legendX, legendY);

        this.ctx.font = '11px Arial';
        this.ctx.fillStyle = '#AAAAAA';
        this.ctx.fillText(`⭕ DAO Proposals: ${this.proposals.length}`, legendX, legendY + 25);
        this.ctx.fillText(`💎 NFT Sessions: ${this.sessions.length}`, legendX, legendY + 45);
        this.ctx.fillText(`🔮 Active Rituals: ${this.proposals.filter(p => p.status === 'active').length}`, legendX, legendY + 65);
    }

    /**
     * Load blockchain data
     */
    async loadBlockchainData(daoContract, nftContract) {
        try {
            console.log('[NeuralCosmogram] 📡 Loading blockchain data...');

            // Load DAO proposals
            const proposalCount = await daoContract.proposalCount();
            for (let i = 1; i <= proposalCount; i++) {
                const proposal = await daoContract.proposals(i);
                this.addProposal({
                    proposalId: i,
                    eventName: proposal.eventName,
                    totalVotes: proposal.totalVotes.toString()
                });
            }

            // Load NFT sessions
            const sessionCount = await nftContract.tokenIdCounter();
            for (let i = 1; i < sessionCount; i++) {
                try {
                    const metadata = await nftContract.getSessionMetadata(i);
                    this.addSession({
                        tokenId: i,
                        sessionId: metadata.sessionId,
                        ritual: metadata.ritual,
                        tarotCard: metadata.tarotCard,
                        energyLevel: 75 // Default energy
                    });
                } catch (error) {
                    console.warn(`[NeuralCosmogram] Could not load session ${i}:`, error.message);
                }
            }

            console.log(`[NeuralCosmogram] ✅ Loaded ${this.proposals.length} proposals and ${this.sessions.length} sessions`);

        } catch (error) {
            console.error('[NeuralCosmogram] ❌ Failed to load blockchain data:', error);
        }
    }

    /**
     * Clear all data
     */
    clear() {
        this.proposals = [];
        this.sessions = [];
        this.connections = [];
        console.log('[NeuralCosmogram] 🧹 Cosmogram cleared');
    }

    /**
     * Destroy cosmogram
     */
    destroy() {
        this.stopAnimation();
        this.clear();
        console.log('[NeuralCosmogram] 💀 Cosmogram destroyed');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NeuralCosmogram;
}
