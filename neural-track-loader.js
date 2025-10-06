/**
 * Neural Track Loader - Phase 3: Auto-Loading Engine
 *
 * Manages automatic track loading for fully autonomous DJ sessions.
 * Provides intelligent track queuing, selection, and preloading.
 *
 * @version 1.0.0
 * @requires neural-event-bus.js
 */

class NeuralTrackLoader {
    constructor(eventBus, options = {}) {
        this.eventBus = eventBus;
        this.options = {
            queueSize: 10,
            preloadTracks: 3,
            enableSmartSelection: true,
            analysisDepth: 'full', // 'basic' | 'full'
            ...options
        };

        // Track queues
        this.queueA = [];
        this.queueB = [];
        this.library = []; // Full track library
        this.playHistory = []; // Recently played tracks

        // Analysis cache
        this.trackAnalysis = new Map();

        // State
        this.initialized = false;
        this.autoLoadEnabled = false;
        this.propheticMode = false;
        this.propheticLoader = null;
        this.isReady = false;

        this.setupEventListeners();

        // Register globally for direct access
        if (typeof window !== 'undefined') {
            window.NeuralTrackLoader = this;
        }
    }

    /**
     * Initialize track loader with library
     * @param {Array} trackLibrary - Array of track objects or FileList
     * @returns {Promise<boolean>}
     */
    async init(trackLibrary = []) {
        try {
            console.log('[NeuralTrackLoader] Initializing...');

            // Convert FileList to array if needed
            this.library = Array.isArray(trackLibrary)
                ? trackLibrary
                : Array.from(trackLibrary);

            console.log(`[NeuralTrackLoader] Library loaded: ${this.library.length} tracks`);

            // Analyze tracks if smart selection enabled
            if (this.options.enableSmartSelection && this.library.length > 0) {
                await this.analyzeLibrary();
            }

            // Preload initial queues
            await this.buildInitialQueues();

            this.initialized = true;
            this.isReady = true;

            this.eventBus.emit('loader:ready', {
                librarySize: this.library.length,
                queueSizeA: this.queueA.length,
                queueSizeB: this.queueB.length
            });

            console.log('[NeuralTrackLoader] Initialized successfully');
            console.log('[NeuralTrackLoader] ✓ Global instance ready at window.NeuralTrackLoader');
            return true;

        } catch (error) {
            console.error('[NeuralTrackLoader] Init failed:', error);
            return false;
        }
    }

    /**
     * Analyze library tracks for smart selection
     * @private
     */
    async analyzeLibrary() {
        console.log('[NeuralTrackLoader] Analyzing library...');

        // Request analysis from audio bridge or analyzer
        for (const track of this.library) {
            // Emit request for analysis
            this.eventBus.emit('analyzer:request', {
                track: track,
                depth: this.options.analysisDepth
            });
        }

        // Listen for analysis results
        this.eventBus.on('analyzer:result', (data) => {
            if (data.track && data.analysis) {
                this.trackAnalysis.set(data.track.name || data.track, data.analysis);
            }
        });

        console.log('[NeuralTrackLoader] Library analysis requested');
    }

    /**
     * Build initial track queues
     * @private
     */
    async buildInitialQueues() {
        if (this.library.length === 0) {
            console.warn('[NeuralTrackLoader] No tracks in library');
            return;
        }

        // Shuffle library for variety
        const shuffled = this.shuffleArray([...this.library]);

        // Split into alternating queues
        shuffled.forEach((track, index) => {
            if (index % 2 === 0) {
                this.queueA.push(track);
            } else {
                this.queueB.push(track);
            }
        });

        // Limit to queue size
        this.queueA = this.queueA.slice(0, this.options.queueSize);
        this.queueB = this.queueB.slice(0, this.options.queueSize);

        console.log(`[NeuralTrackLoader] Queues built: A=${this.queueA.length}, B=${this.queueB.length}`);
    }

    /**
     * Get next track for specified deck (Public API)
     * @param {string} deckId - 'a' or 'b'
     * @param {Object} context - Current session context for smart selection
     * @returns {File|Object|null}
     */
    getNextTrack(deckId, context = {}) {
        return this.getNext(deckId, context);
    }

    /**
     * Get next track for specified deck (Internal)
     * @param {string} deckId - 'a' or 'b'
     * @param {Object} context - Current session context for smart selection
     * @returns {File|Object|null}
     */
    getNext(deckId, context = {}) {
        const queue = deckId === 'a' ? this.queueA : this.queueB;

        if (queue.length === 0) {
            console.warn(`[NeuralTrackLoader] Queue ${deckId} is empty`);
            this.refillQueue(deckId);
            return queue.shift() || null;
        }

        // Prophetic mode: let Prophetic Loader decide if ritual is active
        if (this.propheticMode && this.propheticLoader && context.activeRitual) {
            const propheticTrack = this.propheticLoader.selectTrackForRitual(context.activeRitual);
            if (propheticTrack && queue.includes(propheticTrack)) {
                const index = queue.indexOf(propheticTrack);
                queue.splice(index, 1);
                console.log(`[NeuralTrackLoader] 🔮 Prophetic selection for ${context.activeRitual}`);
                return propheticTrack;
            }
        }

        // Smart selection based on context
        if (this.options.enableSmartSelection && context.currentTrack) {
            const selectedTrack = this.selectSmartTrack(queue, context);
            if (selectedTrack) {
                // Remove from queue
                const index = queue.indexOf(selectedTrack);
                queue.splice(index, 1);
                return selectedTrack;
            }
        }

        // Default: FIFO
        return queue.shift();
    }

    /**
     * Smart track selection based on context
     * @private
     */
    selectSmartTrack(queue, context) {
        const { currentTrack, currentAnalysis, energyFlow, sessionTime } = context;

        // Score each track
        const scores = queue.map(track => {
            const analysis = this.trackAnalysis.get(track.name || track);
            if (!analysis) return { track, score: Math.random() };

            let score = 0;

            // BPM compatibility (+30 points if within 5 BPM)
            if (currentAnalysis?.bpm && analysis.bpm) {
                const bpmDiff = Math.abs(currentAnalysis.bpm.value - analysis.bpm.value);
                score += bpmDiff < 5 ? 30 : (10 - bpmDiff);
            }

            // Energy flow matching (+25 points for matching strategy)
            if (energyFlow && analysis.energy) {
                if (energyFlow === 'build' && analysis.energy.value > currentAnalysis?.energy?.value) {
                    score += 25;
                } else if (energyFlow === 'plateau' && Math.abs(analysis.energy.value - currentAnalysis?.energy?.value) < 0.2) {
                    score += 25;
                } else if (energyFlow === 'decline' && analysis.energy.value < currentAnalysis?.energy?.value) {
                    score += 25;
                }
            }

            // Key compatibility (+20 points for harmonic mixing)
            if (currentAnalysis?.key && analysis.key) {
                if (this.isHarmonicMatch(currentAnalysis.key.value, analysis.key.value)) {
                    score += 20;
                }
            }

            // Genre compatibility (+15 points for same genre)
            if (currentAnalysis?.genre && analysis.genre) {
                if (currentAnalysis.genre.value === analysis.genre.value) {
                    score += 15;
                }
            }

            // Avoid recently played (-50 points)
            if (this.playHistory.includes(track)) {
                score -= 50;
            }

            // Time-based variation (early session favors intro tracks)
            if (sessionTime < 600000 && analysis.energy?.value < 0.5) { // First 10 min
                score += 10;
            }

            return { track, score };
        });

        // Sort by score and return best match
        scores.sort((a, b) => b.score - a.score);
        console.log(`[NeuralTrackLoader] Smart selection scores:`, scores.slice(0, 3));

        return scores[0]?.track;
    }

    /**
     * Check harmonic compatibility (Camelot wheel)
     * @private
     */
    isHarmonicMatch(key1, key2) {
        // Simplified harmonic mixing rules
        const harmonicPairs = {
            '8A': ['8A', '8B', '7A', '9A'],
            '8B': ['8B', '8A', '7B', '9B'],
            // Add full Camelot wheel mapping
        };

        return harmonicPairs[key1]?.includes(key2) || false;
    }

    /**
     * Load next track on specified deck
     * @param {string} deckId - 'a' or 'b'
     * @param {Object} context - Current session context
     * @returns {Promise<boolean>}
     */
    async loadNextTrack(deckId, context = {}) {
        if (!this.initialized) {
            console.error('[NeuralTrackLoader] Not initialized');
            return false;
        }

        const nextTrack = this.getNext(deckId, context);
        if (!nextTrack) {
            console.warn(`[NeuralTrackLoader] No track available for deck ${deckId}`);
            return false;
        }

        try {
            // Load track via reference app
            if (window.app?.loadTrack) {
                await window.app.loadTrack(deckId, nextTrack);

                // Add to play history
                this.playHistory.push(nextTrack);
                if (this.playHistory.length > 20) {
                    this.playHistory.shift();
                }

                // Refill queue if low
                const queue = deckId === 'a' ? this.queueA : this.queueB;
                if (queue.length < this.options.preloadTracks) {
                    this.refillQueue(deckId);
                }

                this.eventBus.emit('loader:track-loaded', {
                    deckId,
                    track: nextTrack.name || nextTrack,
                    queueRemaining: queue.length
                });

                console.log(`[NeuralTrackLoader] Loaded on ${deckId}: ${nextTrack.name || nextTrack}`);
                return true;
            }

            return false;

        } catch (error) {
            console.error(`[NeuralTrackLoader] Failed to load track on ${deckId}:`, error);
            return false;
        }
    }

    /**
     * Refill queue from library
     * @private
     */
    refillQueue(deckId) {
        const queue = deckId === 'a' ? this.queueA : this.queueB;
        const available = this.library.filter(track =>
            !queue.includes(track) &&
            !this.playHistory.slice(-10).includes(track)
        );

        if (available.length === 0) {
            console.warn(`[NeuralTrackLoader] No available tracks for deck ${deckId}`);
            return;
        }

        const shuffled = this.shuffleArray(available);
        const toAdd = shuffled.slice(0, this.options.queueSize - queue.length);

        queue.push(...toAdd);
        console.log(`[NeuralTrackLoader] Refilled queue ${deckId}: +${toAdd.length} tracks`);
    }

    /**
     * Check and load tracks if decks empty
     * @param {Object} context - Session context
     * @returns {Promise<Object>}
     */
    async checkAndLoadTracks(context = {}) {
        const results = { a: false, b: false };

        // Check deck A
        const deckAEmpty = !window.app?.getCurrentTrack?.('a');
        if (deckAEmpty) {
            results.a = await this.loadNextTrack('a', context);
        }

        // Check deck B
        const deckBEmpty = !window.app?.getCurrentTrack?.('b');
        if (deckBEmpty) {
            results.b = await this.loadNextTrack('b', context);
        }

        if (results.a || results.b) {
            console.log(`[NeuralTrackLoader] Auto-loaded: A=${results.a}, B=${results.b}`);
        }

        return results;
    }

    /**
     * Preload tracks into queues
     * @param {Array} tracksA - Tracks for deck A
     * @param {Array} tracksB - Tracks for deck B
     */
    preload(tracksA = [], tracksB = []) {
        this.queueA = [...tracksA];
        this.queueB = [...tracksB];

        console.log(`[NeuralTrackLoader] Queues preloaded: A=${this.queueA.length}, B=${this.queueB.length}`);

        this.eventBus.emit('loader:queues-updated', {
            queueA: this.queueA.length,
            queueB: this.queueB.length
        });
    }

    /**
     * Enable/disable auto-loading
     * @param {boolean} enabled
     */
    setAutoLoad(enabled) {
        this.autoLoadEnabled = enabled;
        console.log(`[NeuralTrackLoader] Auto-load ${enabled ? 'enabled' : 'disabled'}`);

        this.eventBus.emit('loader:autoload-changed', { enabled });
    }

    /**
     * Setup event listeners
     * @private
     */
    setupEventListeners() {
        // Listen for transition completion
        this.eventBus.on('transition:complete', async (data) => {
            if (this.autoLoadEnabled) {
                await this.checkAndLoadTracks(data.context);
            }
        });

        // Listen for track end
        this.eventBus.on('deck:track-ended', async (data) => {
            if (this.autoLoadEnabled) {
                await this.loadNextTrack(data.deckId, data.context);
            }
        });
    }

    /**
     * Fisher-Yates shuffle
     * @private
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Link Prophetic Loader
     */
    setPropheticLoader(propheticLoader) {
        this.propheticLoader = propheticLoader;
        console.log('[NeuralTrackLoader] Prophetic Loader linked');
    },

    /**
     * Get current state
     */
    getState() {
        return {
            initialized: this.initialized,
            autoLoadEnabled: this.autoLoadEnabled,
            propheticMode: this.propheticMode,
            librarySize: this.library.length,
            queueA: this.queueA.length,
            queueB: this.queueB.length,
            playHistory: this.playHistory.length,
            analyzedTracks: this.trackAnalysis.size
        };
    }

    /**
     * Cleanup
     */
    cleanup() {
        console.log('[NeuralTrackLoader] Cleaning up...');

        this.queueA = [];
        this.queueB = [];
        this.playHistory = [];
        this.trackAnalysis.clear();
        this.initialized = false;

        this.eventBus.emit('loader:cleanup');
        console.log('[NeuralTrackLoader] Cleanup complete');
    }
}

// Export for browser
if (typeof window !== 'undefined') {
    window.NeuralTrackLoader = NeuralTrackLoader;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NeuralTrackLoader;
}
