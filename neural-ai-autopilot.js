/**
 * Neural AI Autopilot - Autonomous DJ Session Management
 *
 * Provides intelligent, autonomous DJ session control including:
 * - Auto track switching based on analysis
 * - Smart playlist generation
 * - Energy flow management
 * - Automatic transitions
 * - Session narrative building
 * - Crowd energy tracking
 *
 * @version 1.0.0
 * @requires neural-event-bus.js, neural-ai-module.js, neural-ai-transitions.js, neural-state-manager.js
 */

const NeuralAIAutopilot = {
    name: 'AI Autopilot',
    version: '1.0.0',

    // Module state
    initialized: false,
    eventBus: null,
    aiModule: null,
    transitionsModule: null,
    stateManager: null,
    trackLoader: null,

    // Autopilot state
    active: false,
    currentDeck: 'a',
    nextDeck: 'b',
    sessionStartTime: null,
    trackHistory: [],

    // Configuration
    config: {
        autoSwitchEnabled: true,
        transitionTiming: 'smart', // 'smart', 'fixed', 'random'
        minTrackDuration: 120000, // 2 minutes
        maxTrackDuration: 300000, // 5 minutes
        transitionPoint: 0.75, // Start transition at 75% of track
        energyFlowStrategy: 'adaptive', // 'adaptive', 'build', 'plateau', 'decline'
        transitionStyle: 'auto', // 'auto', 'crossfade', 'filter_sweep', etc.
        bpmTolerance: 10, // ±10 BPM acceptable
        keyCompatibilityRequired: false
    },

    // Session state
    sessionStats: {
        tracksPlayed: 0,
        transitionsMade: 0,
        avgEnergyLevel: 0,
        sessionDuration: 0,
        avgBPM: 0
    },

    // Timers
    trackTimer: null,
    energyMonitor: null,

    /**
     * Initialize the AI Autopilot
     * @param {Object} context - Bridge context
     * @returns {Promise<Object>} Init status
     */
    async init(context) {
        console.log('[AI Autopilot] Initializing...');

        this.eventBus = context.eventBus;

        // Get module instances
        const bridge = window.NeuralBridge;
        this.aiModule = bridge?.innovations?.get('AI Analysis')?.instance;
        this.transitionsModule = bridge?.innovations?.get('AI Transitions')?.instance;
        this.stateManager = bridge?.innovations?.get('State Manager')?.instance;
        this.trackLoader = bridge?.innovations?.get('Track Loader')?.instance;

        if (!this.aiModule || !this.transitionsModule) {
            console.warn('[AI Autopilot] Required modules not available');
            return { status: 'error', error: 'Missing dependencies' };
        }

        if (!this.trackLoader) {
            console.warn('[AI Autopilot] Track Loader not available - auto-loading disabled');
        }

        // Listen to events
        this.setupEventListeners();

        this.initialized = true;
        console.log('[AI Autopilot] Initialized successfully');

        return {
            status: 'ready',
            features: ['auto-switch', 'energy-flow', 'smart-transitions', 'session-narrative']
        };
    },

    /**
     * Setup event listeners
     * @private
     */
    setupEventListeners() {
        // Listen to AI analysis for decision making
        this.eventBus.on('ai:analysis:complete', (data) => {
            this.onAnalysisComplete(data);
        });

        // Listen to transition completions
        this.eventBus.on('transition:completed', (data) => {
            this.onTransitionComplete(data);
        });

        // Listen to deck events
        this.eventBus.on('audio:deck:play', (data) => {
            this.onDeckPlay(data);
        });

        this.eventBus.on('audio:deck:pause', (data) => {
            this.onDeckPause(data);
        });

        console.log('[AI Autopilot] Event listeners registered');
    },

    /**
     * Start autopilot session
     */
    start() {
        if (this.active) {
            console.warn('[AI Autopilot] Already active');
            return false;
        }

        console.log('[AI Autopilot] Starting autonomous session...');

        this.active = true;
        this.sessionStartTime = Date.now();
        this.trackHistory = [];
        this.resetSessionStats();

        // Start energy monitoring
        this.startEnergyMonitoring();

        // Check and load initial tracks if Track Loader available
        if (this.trackLoader) {
            this.checkAndLoadTracks();
        }

        // Emit start event
        this.eventBus.emit('autopilot:started', {
            config: this.config,
            timestamp: this.sessionStartTime
        });

        console.log('[AI Autopilot] ✓ Autonomous mode active');
        return true;
    },

    /**
     * Stop autopilot session
     */
    stop() {
        if (!this.active) {
            console.warn('[AI Autopilot] Not active');
            return false;
        }

        console.log('[AI Autopilot] Stopping autonomous session...');

        this.active = false;

        // Clear timers
        if (this.trackTimer) {
            clearTimeout(this.trackTimer);
            this.trackTimer = null;
        }

        if (this.energyMonitor) {
            clearInterval(this.energyMonitor);
            this.energyMonitor = null;
        }

        // Calculate final stats
        this.sessionStats.sessionDuration = Date.now() - this.sessionStartTime;

        // Emit stop event with session summary
        this.eventBus.emit('autopilot:stopped', {
            stats: this.sessionStats,
            trackHistory: this.trackHistory,
            duration: this.sessionStats.sessionDuration
        });

        console.log('[AI Autopilot] Session ended. Stats:', this.sessionStats);
        return true;
    },

    /**
     * Handle analysis complete
     * @param {Object} data - Analysis data
     */
    onAnalysisComplete(data) {
        if (!this.active) return;

        const { deckId, analysis } = data;

        console.log(`[AI Autopilot] Analysis received for deck ${deckId}:`, {
            bpm: analysis.bpm.value,
            key: analysis.key.value,
            energy: analysis.energy.level
        });

        // Add to track history
        this.trackHistory.push({
            deckId,
            analysis,
            timestamp: Date.now(),
            played: false
        });

        // Update session stats
        this.updateSessionStats(analysis);

        // If this is the next deck, evaluate if we should transition
        if (deckId === this.nextDeck) {
            this.evaluateAutoSwitch();
        }
    },

    /**
     * Handle deck play event
     * @param {Object} data - Play event data
     */
    onDeckPlay(data) {
        if (!this.active) return;

        const { deckId } = data;
        this.currentDeck = deckId;
        this.nextDeck = deckId === 'a' ? 'b' : 'a';

        console.log(`[AI Autopilot] Deck ${deckId} playing. Next deck: ${this.nextDeck}`);

        // Mark track as played
        const currentTrack = this.trackHistory.find(t => t.deckId === deckId && !t.played);
        if (currentTrack) {
            currentTrack.played = true;
            currentTrack.playStartTime = Date.now();
        }

        // Schedule next transition
        this.scheduleNextTransition();
    },

    /**
     * Handle deck pause event
     * @param {Object} data - Pause event data
     */
    onDeckPause(data) {
        if (!this.active) return;

        console.log(`[AI Autopilot] Deck ${data.deckId} paused`);

        // Clear transition timer
        if (this.trackTimer) {
            clearTimeout(this.trackTimer);
            this.trackTimer = null;
        }
    },

    /**
     * Schedule next automatic transition
     * @private
     */
    scheduleNextTransition() {
        // Clear existing timer
        if (this.trackTimer) {
            clearTimeout(this.trackTimer);
        }

        const currentAnalysis = this.getCurrentTrackAnalysis();
        if (!currentAnalysis) {
            console.warn('[AI Autopilot] No current track analysis');
            return;
        }

        // Calculate transition timing
        let transitionDelay;

        if (this.config.transitionTiming === 'smart') {
            // Smart timing based on track characteristics
            transitionDelay = this.calculateSmartTransitionTiming(currentAnalysis);
        } else if (this.config.transitionTiming === 'fixed') {
            transitionDelay = this.config.minTrackDuration * this.config.transitionPoint;
        } else {
            // Random timing within acceptable range
            transitionDelay = this.config.minTrackDuration +
                Math.random() * (this.config.maxTrackDuration - this.config.minTrackDuration);
        }

        console.log(`[AI Autopilot] Next transition scheduled in ${Math.round(transitionDelay / 1000)}s`);

        this.trackTimer = setTimeout(() => {
            this.executeAutoSwitch();
        }, transitionDelay);

        this.eventBus.emit('autopilot:transition-scheduled', {
            delay: transitionDelay,
            currentDeck: this.currentDeck,
            nextDeck: this.nextDeck
        });
    },

    /**
     * Calculate smart transition timing
     * @param {Object} analysis - Track analysis
     * @returns {number} Delay in ms
     */
    calculateSmartTransitionTiming(analysis) {
        const energy = analysis.energy.value;
        const bpm = analysis.bpm.value;

        // Base duration on energy level
        let duration;
        if (energy > 0.7) {
            // High energy - shorter duration
            duration = this.config.minTrackDuration * 1.2;
        } else if (energy > 0.4) {
            // Medium energy - standard duration
            duration = (this.config.minTrackDuration + this.config.maxTrackDuration) / 2;
        } else {
            // Low energy - longer duration
            duration = this.config.maxTrackDuration * 0.8;
        }

        // Adjust for BPM (faster BPM = shorter duration)
        if (bpm > 130) {
            duration *= 0.9;
        } else if (bpm < 100) {
            duration *= 1.1;
        }

        // Apply transition point
        return duration * this.config.transitionPoint;
    },

    /**
     * Evaluate if auto-switch should happen
     * @private
     */
    evaluateAutoSwitch() {
        if (!this.config.autoSwitchEnabled) return;

        const currentAnalysis = this.getCurrentTrackAnalysis();
        const nextAnalysis = this.getNextTrackAnalysis();

        if (!currentAnalysis || !nextAnalysis) {
            console.log('[AI Autopilot] Missing analysis data for auto-switch evaluation');
            return;
        }

        // Check compatibility
        const compatible = this.areTracksCompatible(currentAnalysis, nextAnalysis);

        console.log('[AI Autopilot] Track compatibility:', compatible);

        if (compatible) {
            console.log('[AI Autopilot] ✓ Tracks are compatible for auto-switch');
        } else {
            console.log('[AI Autopilot] ⚠ Tracks may not be ideal match');
            // Continue anyway in autopilot mode, but choose appropriate transition
        }
    },

    /**
     * Execute automatic switch
     * @private
     */
    async executeAutoSwitch() {
        if (!this.active) return;

        console.log(`[AI Autopilot] Executing auto-switch: ${this.currentDeck} → ${this.nextDeck}`);

        const currentAnalysis = this.getCurrentTrackAnalysis();
        const nextAnalysis = this.getNextTrackAnalysis();

        // Determine best transition type (peut être un string ou un objet ritual)
        const transitionType = this.selectTransitionType(currentAnalysis, nextAnalysis);

        // Determine transition duration based on energy difference
        let duration = 12000; // Default 12 seconds
        if (currentAnalysis && nextAnalysis) {
            const energyDiff = Math.abs(currentAnalysis.energy.value - nextAnalysis.energy.value);
            if (energyDiff > 0.3) {
                duration = 16000; // Longer transition for big energy changes
            } else if (energyDiff < 0.1) {
                duration = 8000; // Shorter transition for similar energy
            }
        }

        // Check if it's a ritual or normal transition
        if (typeof transitionType === 'object' && transitionType.ritual) {
            // Execute ritual preset
            const ritual = transitionType.ritual;
            console.log(`[AI Autopilot] 🔮 Executing ritual: ${ritual}`);

            this.eventBus.emit('ritual:trigger', {
                ritual: ritual,
                fromDeck: this.currentDeck,
                toDeck: this.nextDeck,
                duration: duration * 1.5, // Rituels plus longs
                source: 'autopilot'
            });

            this.eventBus.emit('autopilot:ritual-executed', {
                from: this.currentDeck,
                to: this.nextDeck,
                ritual: ritual,
                duration: duration * 1.5
            });
        } else {
            // Trigger standard transition
            this.eventBus.emit('transition:trigger', {
                type: transitionType,
                fromDeck: this.currentDeck,
                toDeck: this.nextDeck,
                duration: duration,
                source: 'autopilot'
            });

            this.eventBus.emit('autopilot:switch-executed', {
                from: this.currentDeck,
                to: this.nextDeck,
                transitionType,
                duration
            });
        }

        this.sessionStats.transitionsMade++;
    },

    /**
     * Handle transition complete
     * @param {Object} data - Transition data
     */
    onTransitionComplete(data) {
        if (!this.active) return;

        console.log('[AI Autopilot] Transition completed, updating deck states');

        // Swap deck roles
        const temp = this.currentDeck;
        this.currentDeck = this.nextDeck;
        this.nextDeck = temp;

        // Auto-load next track if Track Loader available
        if (this.trackLoader) {
            this.checkAndLoadTracks();
        } else {
            // Emit notification for UI to prompt loading next track
            this.eventBus.emit('autopilot:next-track-needed', {
                deck: this.nextDeck,
                suggestion: this.generateTrackSuggestion()
            });
        }
    },

    /**
     * Select best transition type based on analysis
     * @param {Object} currentAnalysis - Current track analysis
     * @param {Object} nextAnalysis - Next track analysis
     * @returns {string|Object} Transition type or ritual
     */
    selectTransitionType(currentAnalysis, nextAnalysis) {
        if (!currentAnalysis || !nextAnalysis) {
            return 'crossfade';
        }

        const { bpm: currentBPM, energy: currentEnergy, genre: currentGenre } = currentAnalysis;
        const { bpm: nextBPM, energy: nextEnergy, genre: nextGenre } = nextAnalysis;

        // BPM et Energy differences
        const bpmDiff = Math.abs(currentBPM.value - nextBPM.value);
        const energyDiff = nextEnergy.value - currentEnergy.value;

        // Genre compatibility
        const genreDifferent = currentGenre.value !== nextGenre.value;

        // Session context (time-based flow)
        const sessionDuration = Date.now() - this.sessionStartTime;
        const earlySession = sessionDuration < 900000; // Less than 15 min
        const lateSession = sessionDuration > 3600000; // More than 1 hour

        // NOUVEAUX STYLES AVANCÉS

        // 1. PULSE SYNC - Pour tracks percussifs ou techno
        if (currentEnergy.value > 0.7 && nextEnergy.value > 0.7 && bpmDiff < 3) {
            if (currentGenre.value.includes('techno') || currentGenre.value.includes('electronic')) {
                return 'pulse_sync';
            }
        }

        // 2. GHOST FADE - Pour ambiances chill ou ambient
        if (currentEnergy.value < 0.3 || nextEnergy.value < 0.3) {
            return 'ghost_fade';
        }

        // 3. GENRE WARP - Pour changement de genre narratif
        if (genreDifferent && Math.abs(energyDiff) > 0.3) {
            return 'genre_warp';
        }

        // 4. DROP ECHO - Pour tracks à haute énergie
        if (nextEnergy.value > 0.8 && energyDiff > 0.3) {
            return 'drop_echo';
        }

        // 5. REVERSE SURGE - Effet dramatique ou introspectif
        if (energyDiff < -0.4 || (lateSession && Math.random() > 0.7)) {
            return 'reverse_surge';
        }

        // 6. STROBE CUT - Électro, trap, ou glitch
        if (currentGenre.value.includes('electro') || currentGenre.value.includes('trap')) {
            if (bpmDiff < 5 && Math.random() > 0.6) {
                return 'strobe_cut';
            }
        }

        // 7. ENERGY SPIRAL - Transitions vers climax émotionnel
        if (energyDiff > 0.4 && nextEnergy.value > 0.75) {
            return 'energy_spiral';
        }

        // 8. SILENCE RITUAL - Moment sacré (rare, intentionnel)
        if (earlySession && Math.random() > 0.95) {
            // Rare ritual pour marquer le début
            return 'silence_ritual';
        }

        // 9. BASS TUNNEL - Tracks sombres ou introspectifs
        if (currentEnergy.value > 0.5 && nextEnergy.value < 0.4) {
            return 'bass_tunnel';
        }

        // 10. MELODY MERGE - Tracks compatibles en tonalité
        if (currentAnalysis.key.value === nextAnalysis.key.value &&
            Math.abs(energyDiff) < 0.2 && bpmDiff < 5) {
            return 'melody_merge';
        }

        // PRESETS DE RITUELS (conditions spéciales)

        // INVOCATION - Début de session ou tracks calmes
        if (earlySession && currentEnergy.value < 0.4) {
            return { ritual: 'INVOCATION' };
        }

        // RÉVÉLATION - Peak energy moment
        if (nextEnergy.value > 0.85 && energyDiff > 0.35) {
            return { ritual: 'REVELATION' };
        }

        // TRANSMUTATION - Grand changement de contexte
        if (genreDifferent && bpmDiff > 15) {
            return { ritual: 'TRANSMUTATION' };
        }

        // ASCENSION - Build progressif vers climax
        if (energyDiff > 0.3 && this.sessionStats.avgEnergyLevel < 0.6) {
            return { ritual: 'ASCENSION' };
        }

        // MÉDITATION - Fin de session ou cool down
        if (lateSession && energyDiff < -0.3) {
            return { ritual: 'MEDITATION' };
        }

        // TRANSITIONS CLASSIQUES (fallback)
        if (bpmDiff < 5 && Math.abs(energyDiff) < 0.2) {
            return 'crossfade';
        } else if (energyDiff > 0.3) {
            return 'energy_build';
        } else if (energyDiff < -0.3) {
            return 'filter_sweep';
        } else if (bpmDiff > 10) {
            return 'echo_out';
        } else {
            return 'bass_swap';
        }
    },

    /**
     * Check if tracks are compatible
     * @param {Object} currentAnalysis - Current track
     * @param {Object} nextAnalysis - Next track
     * @returns {boolean} Compatible
     */
    areTracksCompatible(currentAnalysis, nextAnalysis) {
        if (!currentAnalysis || !nextAnalysis) return false;

        // Check BPM compatibility
        const bpmDiff = Math.abs(currentAnalysis.bpm.value - nextAnalysis.bpm.value);
        const bpmCompatible = bpmDiff <= this.config.bpmTolerance;

        // Check key compatibility (if required)
        let keyCompatible = true;
        if (this.config.keyCompatibilityRequired) {
            keyCompatible = currentAnalysis.key.value === nextAnalysis.key.value;
        }

        // Check energy flow
        const energyFlowOk = this.checkEnergyFlow(currentAnalysis.energy, nextAnalysis.energy);

        return bpmCompatible && keyCompatible && energyFlowOk;
    },

    /**
     * Check if energy flow is acceptable
     * @param {Object} currentEnergy - Current energy
     * @param {Object} nextEnergy - Next energy
     * @returns {boolean} Flow is acceptable
     */
    checkEnergyFlow(currentEnergy, nextEnergy) {
        const energyDiff = nextEnergy.value - currentEnergy.value;

        switch (this.config.energyFlowStrategy) {
            case 'build':
                // Prefer increasing energy
                return energyDiff >= -0.1;

            case 'decline':
                // Prefer decreasing energy
                return energyDiff <= 0.1;

            case 'plateau':
                // Prefer similar energy
                return Math.abs(energyDiff) < 0.2;

            case 'adaptive':
            default:
                // Calculate session average and adapt
                const sessionAvg = this.sessionStats.avgEnergyLevel;
                if (sessionAvg < 0.5) {
                    // Build energy if session is low
                    return energyDiff >= -0.15;
                } else if (sessionAvg > 0.7) {
                    // Allow some decline if session is high
                    return energyDiff >= -0.3;
                } else {
                    // Maintain in mid range
                    return Math.abs(energyDiff) < 0.25;
                }
        }
    },

    /**
     * Generate track suggestion for next load
     * @returns {Object} Track suggestion
     */
    generateTrackSuggestion() {
        const currentAnalysis = this.getCurrentTrackAnalysis();
        if (!currentAnalysis) {
            return {
                bpmRange: [120, 130],
                energy: 'medium',
                key: 'any'
            };
        }

        const targetBPM = currentAnalysis.bpm.value;
        const targetEnergy = currentAnalysis.energy.value;

        // Adjust based on energy flow strategy
        let energySuggestion;
        switch (this.config.energyFlowStrategy) {
            case 'build':
                energySuggestion = targetEnergy + 0.1;
                break;
            case 'decline':
                energySuggestion = targetEnergy - 0.1;
                break;
            default:
                energySuggestion = targetEnergy;
        }

        return {
            bpmRange: [
                targetBPM - this.config.bpmTolerance,
                targetBPM + this.config.bpmTolerance
            ],
            energy: energySuggestion > 0.7 ? 'high' : energySuggestion > 0.4 ? 'medium' : 'low',
            key: currentAnalysis.key.value,
            genre: currentAnalysis.genre.value
        };
    },

    /**
     * Get current track analysis
     * @returns {Object|null} Analysis
     */
    getCurrentTrackAnalysis() {
        const current = this.trackHistory.find(t => t.deckId === this.currentDeck && t.played);
        return current?.analysis || null;
    },

    /**
     * Get next track analysis
     * @returns {Object|null} Analysis
     */
    getNextTrackAnalysis() {
        const next = this.trackHistory.find(t => t.deckId === this.nextDeck && !t.played);
        return next?.analysis || null;
    },

    /**
     * Start energy monitoring
     * @private
     */
    startEnergyMonitoring() {
        this.energyMonitor = setInterval(() => {
            this.updateEnergyMetrics();
        }, 10000); // Update every 10 seconds
    },

    /**
     * Update energy metrics
     * @private
     */
    updateEnergyMetrics() {
        const currentAnalysis = this.getCurrentTrackAnalysis();
        if (!currentAnalysis) return;

        const energyLevel = currentAnalysis.energy.value;

        this.eventBus.emit('autopilot:energy-update', {
            current: energyLevel,
            average: this.sessionStats.avgEnergyLevel,
            trend: this.calculateEnergyTrend()
        });
    },

    /**
     * Calculate energy trend
     * @returns {string} Trend ('rising', 'falling', 'stable')
     */
    calculateEnergyTrend() {
        if (this.trackHistory.length < 2) return 'stable';

        const recent = this.trackHistory.slice(-3);
        const energyLevels = recent.map(t => t.analysis.energy.value);

        const avgChange = (energyLevels[energyLevels.length - 1] - energyLevels[0]) / energyLevels.length;

        if (avgChange > 0.1) return 'rising';
        if (avgChange < -0.1) return 'falling';
        return 'stable';
    },

    /**
     * Update session stats
     * @param {Object} analysis - Track analysis
     */
    updateSessionStats(analysis) {
        this.sessionStats.tracksPlayed++;

        // Update average energy
        const totalEnergy = this.sessionStats.avgEnergyLevel * (this.sessionStats.tracksPlayed - 1);
        this.sessionStats.avgEnergyLevel = (totalEnergy + analysis.energy.value) / this.sessionStats.tracksPlayed;

        // Update average BPM
        const totalBPM = this.sessionStats.avgBPM * (this.sessionStats.tracksPlayed - 1);
        this.sessionStats.avgBPM = (totalBPM + analysis.bpm.value) / this.sessionStats.tracksPlayed;
    },

    /**
     * Reset session stats
     * @private
     */
    resetSessionStats() {
        this.sessionStats = {
            tracksPlayed: 0,
            transitionsMade: 0,
            avgEnergyLevel: 0,
            sessionDuration: 0,
            avgBPM: 0
        };
    },

    /**
     * Get autopilot state
     * @returns {Object} State
     */
    getState() {
        return {
            active: this.active,
            currentDeck: this.currentDeck,
            nextDeck: this.nextDeck,
            stats: this.sessionStats,
            trackHistory: this.trackHistory.length,
            sessionDuration: this.sessionStartTime ? Date.now() - this.sessionStartTime : 0
        };
    },

    /**
     * Update configuration
     * @param {Object} updates - Config updates
     */
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
        this.eventBus.emit('autopilot:config-updated', this.config);
        console.log('[AI Autopilot] Config updated:', this.config);
    },

    /**
     * Check and load tracks on empty decks
     * @private
     */
    async checkAndLoadTracks() {
        // Direct check for global Track Loader
        if (!window.NeuralTrackLoader?.isReady) {
            console.warn('[AI Autopilot] Track Loader not available - auto-loading disabled');
            return;
        }

        const trackLoader = window.NeuralTrackLoader;
        if (!trackLoader) return;

        const context = {
            currentTrack: window.app?.getCurrentTrack?.(this.currentDeck),
            currentAnalysis: this.trackHistory[this.trackHistory.length - 1]?.analysis,
            energyFlow: this.config.energyFlowStrategy,
            sessionTime: Date.now() - this.sessionStartTime
        };

        const results = await this.trackLoader.checkAndLoadTracks(context);

        if (results.a || results.b) {
            console.log('[AI Autopilot] Auto-loaded tracks:', results);
        }
    },

    /**
     * Cleanup module
     */
    cleanup() {
        console.log('[AI Autopilot] Cleaning up...');

        // Stop if active
        if (this.active) {
            this.stop();
        }

        this.initialized = false;
        console.log('[AI Autopilot] Cleanup complete');
    }
};

// Export for browser
if (typeof window !== 'undefined') {
    window.NeuralAIAutopilot = NeuralAIAutopilot;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NeuralAIAutopilot;
}
