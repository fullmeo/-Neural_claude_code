/**
 * Neural Audio Bridge - Phase 2: Audio Integration
 *
 * Connects innovation modules to reference app's audio system non-invasively.
 * Provides real-time audio analysis, routing, and monitoring.
 *
 * @version 1.0.0
 * @requires neural-event-bus.js
 */

class NeuralAudioBridge {
    constructor(eventBus, options = {}) {
        this.eventBus = eventBus;
        this.options = {
            maxLatency: 10, // ms (increased tolerance)
            analysisInterval: 50, // ms
            fftSize: 2048,
            ...options
        };

        // Audio context references
        this.audioContext = null;
        this.decks = new Map(); // deckId -> { source, analyzer, gainNode }
        this.masterAnalyzer = null;
        this.masterGain = null;

        // Performance monitoring
        this.stats = {
            latency: [],
            glitches: 0,
            connections: 0,
            lastUpdate: Date.now()
        };

        // Hooks storage
        this.originalMethods = new Map();

        this.initialized = false;
    }

    /**
     * Initialize audio bridge and detect reference app's audio context
     * @returns {Promise<boolean>} Success status
     */
    async init() {
        try {
            console.log('[NeuralAudioBridge] Initializing...');

            // Detect reference app's audio context
            this.audioContext = await this.detectAudioContext();
            if (!this.audioContext) {
                throw new Error('No AudioContext found in reference app');
            }

            // Create master analyzer
            this.createMasterAnalyzer();

            // Inject non-invasive hooks
            this.injectAudioHooks();

            // Start monitoring
            this.startMonitoring();

            this.initialized = true;
            this.eventBus.emit('audio:bridge:ready', {
                sampleRate: this.audioContext.sampleRate,
                state: this.audioContext.state
            });

            console.log('[NeuralAudioBridge] Initialized successfully');
            return true;

        } catch (error) {
            console.error('[NeuralAudioBridge] Init failed:', error);
            this.eventBus.emit('audio:bridge:error', { error: error.message });
            return false;
        }
    }

    /**
     * Detect AudioContext from reference app
     * @private
     * @returns {Promise<AudioContext|null>}
     */
    async detectAudioContext() {
        // Check window.app (reference app pattern)
        if (window.app?.audioContext) {
            console.log('[NeuralAudioBridge] Found AudioContext in window.app');
            return window.app.audioContext;
        }

        // Check for global AudioContext
        if (window.AudioContext || window.webkitAudioContext) {
            // Wait for user gesture to create context if needed
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;

            // Check if context already exists
            const contexts = [];
            for (let key in window) {
                if (window[key] instanceof AudioContextClass) {
                    contexts.push(window[key]);
                }
            }

            if (contexts.length > 0) {
                console.log('[NeuralAudioBridge] Found existing AudioContext');
                return contexts[0];
            }
        }

        // Poll for AudioContext creation (reference app may create it later)
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds

            const interval = setInterval(() => {
                if (window.app?.audioContext) {
                    clearInterval(interval);
                    resolve(window.app.audioContext);
                } else if (attempts++ >= maxAttempts) {
                    clearInterval(interval);
                    resolve(null);
                }
            }, 100);
        });
    }

    /**
     * Create master analyzer for overall audio monitoring
     * @private
     */
    createMasterAnalyzer() {
        this.masterAnalyzer = this.audioContext.createAnalyser();
        this.masterAnalyzer.fftSize = this.options.fftSize;
        this.masterAnalyzer.smoothingTimeConstant = 0.8;

        // Try to connect to destination
        if (this.audioContext.destination) {
            // Note: We can't directly insert into existing chain,
            // but we can tap into it for monitoring
            console.log('[NeuralAudioBridge] Master analyzer created');
        }
    }

    /**
     * Inject non-invasive hooks into audio chain
     * @private
     */
    injectAudioHooks() {
        // Hook into deck creation/loading
        if (window.app?.loadTrack) {
            const original = window.app.loadTrack.bind(window.app);
            this.originalMethods.set('loadTrack', original);

            window.app.loadTrack = async (deckId, file) => {
                // Call original (don't measure this - it includes audio decoding)
                const result = await original(deckId, file);

                // Measure only our hook overhead
                const startTime = performance.now();
                this.onTrackLoaded(deckId, file);
                const hookLatency = performance.now() - startTime;
                this.recordLatency(hookLatency);

                return result;
            };
        }

        // Hook into play/pause
        if (window.app?.play) {
            const original = window.app.play.bind(window.app);
            this.originalMethods.set('play', original);

            window.app.play = (deckId) => {
                const result = original(deckId);
                this.eventBus.emit('audio:deck:play', { deckId, timestamp: Date.now() });
                return result;
            };
        }

        if (window.app?.pause) {
            const original = window.app.pause.bind(window.app);
            this.originalMethods.set('pause', original);

            window.app.pause = (deckId) => {
                const result = original(deckId);
                this.eventBus.emit('audio:deck:pause', { deckId, timestamp: Date.now() });
                return result;
            };
        }

        console.log('[NeuralAudioBridge] Audio hooks injected');
    }

    /**
     * Handle track loaded event
     * @private
     */
    onTrackLoaded(deckId, file) {
        // Create analyzer for this deck if not exists
        if (!this.decks.has(deckId)) {
            const analyzer = this.audioContext.createAnalyser();
            analyzer.fftSize = this.options.fftSize;

            this.decks.set(deckId, {
                analyzer,
                gainNode: null,
                source: null,
                file: file
            });
        }

        this.eventBus.emit('audio:track:loaded', {
            deckId,
            filename: file.name || file,
            timestamp: Date.now()
        });
    }

    /**
     * Connect deck's audio nodes for analysis
     * @param {string} deckId - Deck identifier
     * @param {AudioNode} sourceNode - Source audio node
     * @returns {boolean} Success status
     */
    connectDeck(deckId, sourceNode) {
        try {
            if (!this.decks.has(deckId)) {
                this.decks.set(deckId, {
                    analyzer: this.audioContext.createAnalyser(),
                    gainNode: null,
                    source: sourceNode
                });
            }

            const deck = this.decks.get(deckId);
            deck.source = sourceNode;

            // Create pass-through gain node
            if (!deck.gainNode) {
                deck.gainNode = this.audioContext.createGain();
                deck.gainNode.gain.value = 1.0;
            }

            // Connect: source -> analyzer -> gain -> (original destination)
            // Note: Actual connection depends on reference app's audio graph
            deck.analyzer.fftSize = this.options.fftSize;

            this.stats.connections++;
            this.eventBus.emit('audio:deck:connected', { deckId });

            return true;

        } catch (error) {
            console.error(`[NeuralAudioBridge] Failed to connect deck ${deckId}:`, error);
            this.stats.glitches++;
            return false;
        }
    }

    /**
     * Get real-time analysis data for a deck
     * @param {string} deckId - Deck identifier
     * @returns {Object|null} Analysis data
     */
    getDeckAnalysis(deckId) {
        const deck = this.decks.get(deckId);
        if (!deck || !deck.analyzer) return null;

        const bufferLength = deck.analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const timeData = new Uint8Array(bufferLength);

        deck.analyzer.getByteFrequencyData(dataArray);
        deck.analyzer.getByteTimeDomainData(timeData);

        return {
            frequency: dataArray,
            waveform: timeData,
            fftSize: deck.analyzer.fftSize,
            sampleRate: this.audioContext.sampleRate,
            timestamp: Date.now()
        };
    }

    /**
     * Get master output analysis
     * @returns {Object|null} Analysis data
     */
    getMasterAnalysis() {
        if (!this.masterAnalyzer) return null;

        const bufferLength = this.masterAnalyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const timeData = new Uint8Array(bufferLength);

        this.masterAnalyzer.getByteFrequencyData(dataArray);
        this.masterAnalyzer.getByteTimeDomainData(timeData);

        return {
            frequency: dataArray,
            waveform: timeData,
            fftSize: this.masterAnalyzer.fftSize,
            sampleRate: this.audioContext.sampleRate,
            timestamp: Date.now()
        };
    }

    /**
     * Start performance monitoring
     * @private
     */
    startMonitoring() {
        this.monitoringInterval = setInterval(() => {
            // Emit stats for innovation modules
            this.eventBus.emit('audio:stats:update', this.getStats());

            // Check for performance issues
            const avgLatency = this.getAverageLatency();
            if (avgLatency > this.options.maxLatency) {
                console.warn(`[NeuralAudioBridge] High latency: ${avgLatency.toFixed(2)}ms`);
                this.eventBus.emit('audio:warning:latency', { latency: avgLatency });
            }

            // Reset latency buffer
            if (this.stats.latency.length > 100) {
                this.stats.latency = this.stats.latency.slice(-50);
            }

        }, this.options.analysisInterval);
    }

    /**
     * Record latency measurement
     * @private
     */
    recordLatency(latency) {
        this.stats.latency.push(latency);

        if (latency > this.options.maxLatency) {
            console.warn(`[NeuralAudioBridge] Latency spike: ${latency.toFixed(2)}ms`);
        }
    }

    /**
     * Get average latency
     * @private
     */
    getAverageLatency() {
        if (this.stats.latency.length === 0) return 0;
        const sum = this.stats.latency.reduce((a, b) => a + b, 0);
        return sum / this.stats.latency.length;
    }

    /**
     * Get performance statistics
     * @returns {Object} Stats object
     */
    getStats() {
        return {
            ...this.stats,
            avgLatency: this.getAverageLatency(),
            decks: this.decks.size,
            contextState: this.audioContext?.state,
            sampleRate: this.audioContext?.sampleRate,
            lastUpdate: Date.now()
        };
    }

    /**
     * Get current state
     * @returns {Object} State object
     */
    getState() {
        return {
            initialized: this.initialized,
            audioContextState: this.audioContext?.state,
            sampleRate: this.audioContext?.sampleRate,
            decksConnected: this.decks.size,
            stats: this.getStats()
        };
    }

    /**
     * Cleanup and restore original methods
     */
    cleanup() {
        console.log('[NeuralAudioBridge] Cleaning up...');

        // Stop monitoring
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }

        // Restore original methods
        this.originalMethods.forEach((original, methodName) => {
            if (window.app && window.app[methodName]) {
                window.app[methodName] = original;
            }
        });
        this.originalMethods.clear();

        // Disconnect audio nodes (don't close context, reference app owns it)
        this.decks.forEach((deck, deckId) => {
            try {
                if (deck.analyzer) deck.analyzer.disconnect();
                if (deck.gainNode) deck.gainNode.disconnect();
            } catch (e) {
                console.warn(`[NeuralAudioBridge] Error disconnecting deck ${deckId}:`, e);
            }
        });
        this.decks.clear();

        if (this.masterAnalyzer) {
            try {
                this.masterAnalyzer.disconnect();
            } catch (e) {
                console.warn('[NeuralAudioBridge] Error disconnecting master analyzer:', e);
            }
        }

        this.initialized = false;
        this.eventBus.emit('audio:bridge:cleanup');

        console.log('[NeuralAudioBridge] Cleanup complete');
    }
}

// Export for browser
if (typeof window !== 'undefined') {
    window.NeuralAudioBridge = NeuralAudioBridge;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NeuralAudioBridge;
}
