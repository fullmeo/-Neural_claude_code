/**
 * Neural DAO Curator - Decentralized Ritual Voting
 *
 * Allows DAO members to vote on ritual selection before events.
 * Creates prophetic journeys through collective decision-making.
 *
 * @version 1.0.0
 * @requires neural-event-bus.js, neural-web3-connector.js
 */

const NeuralDAOCurator = {
    name: 'DAO Curator',
    version: '1.0.0',

    // Module state
    initialized: false,
    eventBus: null,
    web3Connector: null,

    // DAO state
    proposals: new Map(),
    activeProposal: null,
    votes: new Map(),
    memberPower: new Map(), // Voting power based on token holdings

    // Ritual proposals
    ritualOptions: [
        { id: 'INVOCATION', name: 'Invocation', symbol: '🌙', energy: 'ethereal' },
        { id: 'REVELATION', name: 'Révélation', symbol: '⚡', energy: 'explosive' },
        { id: 'TRANSMUTATION', name: 'Transmutation', symbol: '🔮', energy: 'transformative' },
        { id: 'ASCENSION', name: 'Ascension', symbol: '🌟', energy: 'uplifting' },
        { id: 'MEDITATION', name: 'Méditation', symbol: '🧘', energy: 'contemplative' }
    ],

    /**
     * Initialize DAO Curator
     */
    async init(context) {
        console.log('[DAO Curator] Initializing...');

        this.eventBus = context.eventBus;

        // Get Web3 Connector
        const bridge = window.NeuralBridge;
        this.web3Connector = bridge?.innovations?.get('Web3 Connector')?.instance;

        if (!this.web3Connector) {
            console.warn('[DAO Curator] Web3 Connector not available - DAO features disabled');
        }

        this.setupEventListeners();

        this.initialized = true;
        console.log('[DAO Curator] Initialized successfully');

        return { status: 'ready' };
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for Web3 connection
        this.eventBus.on('web3:connected', (data) => {
            this.onWalletConnected(data);
        });

        // Listen for vote events from blockchain (would come from contract events)
        this.eventBus.on('dao:vote-cast', (data) => {
            this.onVoteCast(data);
        });

        console.log('[DAO Curator] Event listeners registered');
    },

    /**
     * Handle wallet connected
     */
    async onWalletConnected(data) {
        console.log('[DAO Curator] Wallet connected, loading voting power...');

        // In production, fetch voting power from DAO token contract
        // For now, simulate based on balance
        const votingPower = parseFloat(data.balance) * 100; // Simple calculation
        this.memberPower.set(data.account, votingPower);

        console.log(`[DAO Curator] Voting power: ${votingPower.toFixed(2)}`);

        // Load active proposals
        await this.loadActiveProposals();
    },

    /**
     * Create ritual proposal for upcoming event
     */
    async createRitualProposal(eventInfo) {
        if (!this.web3Connector?.connected) {
            throw new Error('Wallet not connected');
        }

        const proposalId = `ritual-${Date.now()}`;

        const proposal = {
            id: proposalId,
            type: 'ritual_selection',
            eventName: eventInfo.name || 'Upcoming Session',
            eventDate: eventInfo.date || new Date(Date.now() + 86400000), // Tomorrow
            description: eventInfo.description || 'Select the opening ritual for the session',
            options: this.ritualOptions,
            votes: new Map(),
            totalVotingPower: 0,
            startTime: Date.now(),
            endTime: Date.now() + (eventInfo.votingDuration || 3600000), // 1 hour default
            status: 'active',
            creator: this.web3Connector.account
        };

        this.proposals.set(proposalId, proposal);
        this.activeProposal = proposalId;

        console.log(`[DAO Curator] 🗳️ Proposal created: ${proposalId}`);
        console.log(`[DAO Curator] Event: ${proposal.eventName}`);
        console.log(`[DAO Curator] Voting ends: ${new Date(proposal.endTime).toLocaleString()}`);

        // Emit proposal created event
        this.eventBus.emit('dao:proposal-created', {
            proposalId,
            eventName: proposal.eventName,
            options: proposal.options,
            endTime: proposal.endTime
        });

        // In production, create proposal on-chain
        // await this.web3Connector.sendTransaction('dao', 'createProposal', [proposalData]);

        return proposal;
    },

    /**
     * Cast vote on ritual proposal
     */
    async castVote(proposalId, ritualId, reason = '') {
        if (!this.web3Connector?.connected) {
            throw new Error('Wallet not connected');
        }

        const proposal = this.proposals.get(proposalId);
        if (!proposal) {
            throw new Error('Proposal not found');
        }

        if (proposal.status !== 'active') {
            throw new Error('Proposal not active');
        }

        if (Date.now() > proposal.endTime) {
            throw new Error('Voting period ended');
        }

        const account = this.web3Connector.account;
        const votingPower = this.memberPower.get(account) || 1;

        // Check if already voted
        if (proposal.votes.has(account)) {
            const oldVote = proposal.votes.get(account);
            proposal.totalVotingPower -= oldVote.power;
        }

        // Record vote
        const vote = {
            voter: account,
            ritualId: ritualId,
            power: votingPower,
            reason: reason,
            timestamp: Date.now(),
            signature: null // Would sign on-chain
        };

        proposal.votes.set(account, vote);
        proposal.totalVotingPower += votingPower;

        console.log(`[DAO Curator] ✓ Vote cast: ${ritualId} (power: ${votingPower})`);
        if (reason) {
            console.log(`[DAO Curator] Reason: "${reason}"`);
        }

        // Emit vote event
        this.eventBus.emit('dao:vote-submitted', {
            proposalId,
            voter: account,
            ritualId,
            power: votingPower
        });

        // In production, submit vote on-chain
        // const signature = await this.web3Connector.signMessage(voteMessage);
        // await this.web3Connector.sendTransaction('dao', 'castVote', [proposalId, ritualId, signature]);

        return vote;
    },

    /**
     * Get vote results for proposal
     */
    getProposalResults(proposalId) {
        const proposal = this.proposals.get(proposalId);
        if (!proposal) {
            return null;
        }

        // Tally votes
        const results = new Map();
        this.ritualOptions.forEach(ritual => {
            results.set(ritual.id, { ritual, votes: 0, power: 0, percentage: 0 });
        });

        proposal.votes.forEach((vote) => {
            const result = results.get(vote.ritualId);
            if (result) {
                result.votes++;
                result.power += vote.power;
            }
        });

        // Calculate percentages
        results.forEach((result) => {
            result.percentage = proposal.totalVotingPower > 0
                ? (result.power / proposal.totalVotingPower) * 100
                : 0;
        });

        // Sort by voting power
        const sortedResults = Array.from(results.values())
            .sort((a, b) => b.power - a.power);

        return {
            proposalId,
            eventName: proposal.eventName,
            totalVotes: proposal.votes.size,
            totalVotingPower: proposal.totalVotingPower,
            results: sortedResults,
            winner: sortedResults[0],
            status: proposal.status,
            endTime: proposal.endTime
        };
    },

    /**
     * Finalize proposal and execute winning ritual
     */
    async finalizeProposal(proposalId) {
        const proposal = this.proposals.get(proposalId);
        if (!proposal) {
            throw new Error('Proposal not found');
        }

        if (Date.now() < proposal.endTime) {
            throw new Error('Voting period not ended');
        }

        const results = this.getProposalResults(proposalId);
        const winner = results.winner;

        proposal.status = 'finalized';
        proposal.winner = winner.ritual.id;

        console.log(`[DAO Curator] 🏆 Proposal finalized: ${proposalId}`);
        console.log(`[DAO Curator] Winner: ${winner.ritual.symbol} ${winner.ritual.name}`);
        console.log(`[DAO Curator] Votes: ${winner.votes} (${winner.power.toFixed(2)} power, ${winner.percentage.toFixed(1)}%)`);

        // Emit finalization event
        this.eventBus.emit('dao:proposal-finalized', {
            proposalId,
            eventName: proposal.eventName,
            winner: winner.ritual,
            totalVotes: results.totalVotes,
            results: results.results
        });

        // Trigger the winning ritual
        this.eventBus.emit('ritual:trigger', {
            ritual: winner.ritual.id,
            source: 'dao',
            proposalId: proposalId,
            votingResults: results
        });

        // In production, finalize on-chain and mint governance NFT
        // await this.web3Connector.sendTransaction('dao', 'finalizeProposal', [proposalId]);

        return {
            winner: winner.ritual,
            results: results
        };
    },

    /**
     * Load active proposals (from blockchain in production)
     */
    async loadActiveProposals() {
        console.log('[DAO Curator] Loading active proposals...');

        // In production, fetch from blockchain
        // const proposals = await this.web3Connector.callContract('dao', 'getActiveProposals', []);

        // For now, just log existing proposals
        this.proposals.forEach((proposal, id) => {
            if (proposal.status === 'active') {
                console.log(`[DAO Curator] Active proposal: ${id} - ${proposal.eventName}`);
            }
        });
    },

    /**
     * Handle vote cast event (from blockchain)
     */
    onVoteCast(data) {
        console.log('[DAO Curator] Vote cast detected:', data);

        // Update local state from blockchain event
        const proposal = this.proposals.get(data.proposalId);
        if (proposal) {
            // Sync with on-chain data
            this.eventBus.emit('dao:vote-synced', data);
        }
    },

    /**
     * Create prophetic journey from DAO votes
     */
    createCollectiveJourney(eventId) {
        // Get all finalized proposals for this event
        const eventProposals = Array.from(this.proposals.values())
            .filter(p => p.eventId === eventId && p.status === 'finalized')
            .sort((a, b) => a.startTime - b.startTime);

        const journey = eventProposals.map(proposal => ({
            ritual: proposal.winner,
            votingPower: this.getProposalResults(proposal.id).winner.power,
            voters: proposal.votes.size,
            timestamp: proposal.endTime
        }));

        console.log('[DAO Curator] 🌌 Collective journey created:', journey);

        this.eventBus.emit('dao:journey-created', {
            eventId,
            journey,
            totalVoters: new Set(eventProposals.flatMap(p => Array.from(p.votes.keys()))).size
        });

        return journey;
    },

    /**
     * Get voting statistics
     */
    getVotingStats() {
        const stats = {
            totalProposals: this.proposals.size,
            activeProposals: Array.from(this.proposals.values()).filter(p => p.status === 'active').length,
            finalizedProposals: Array.from(this.proposals.values()).filter(p => p.status === 'finalized').length,
            uniqueVoters: new Set(),
            totalVotes: 0,
            totalVotingPower: 0
        };

        this.proposals.forEach(proposal => {
            proposal.votes.forEach((vote, voter) => {
                stats.uniqueVoters.add(voter);
                stats.totalVotes++;
                stats.totalVotingPower += vote.power;
            });
        });

        stats.uniqueVoters = stats.uniqueVoters.size;

        return stats;
    },

    /**
     * Get current state
     */
    getState() {
        return {
            initialized: this.initialized,
            hasWeb3: !!this.web3Connector,
            connected: this.web3Connector?.connected || false,
            activeProposal: this.activeProposal,
            totalProposals: this.proposals.size,
            votingPower: this.web3Connector?.connected
                ? this.memberPower.get(this.web3Connector.account) || 0
                : 0
        };
    },

    /**
     * Cleanup
     */
    cleanup() {
        console.log('[DAO Curator] Cleaning up...');

        this.proposals.clear();
        this.votes.clear();
        this.memberPower.clear();
        this.activeProposal = null;
        this.initialized = false;

        this.eventBus.emit('dao:cleanup');
        console.log('[DAO Curator] Cleanup complete');
    }
};

// Export for browser
if (typeof window !== 'undefined') {
    window.NeuralDAOCurator = NeuralDAOCurator;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NeuralDAOCurator;
}
