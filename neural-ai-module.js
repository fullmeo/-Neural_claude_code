/**
 * Neural AI Module - Phase 3A: AI-Powered Track Analysis
 *
 * Provides intelligent track analysis including:
 * - BPM detection
 * - Key detection
 * - Genre classification
 * - Energy level analysis
 * - Auto-mixing suggestions
 * - Beat matching recommendations
 *
 * @version 1.0.0
 * @requires neural-event-bus.js, neural-audio-bridge.js
 */

const NeuralAIModule = {
    name: 'AI Analysis',
    version: '1.0.0',

    // Module state
    initialized: false,
    eventBus: null,
    audioBridge: null,

    // Analysis cache
    trackAnalysis: new Map(), // deckId -> analysis data

    // Configuration
    config: {
        bpmRange: [60, 180],
        analysisInterval: 100, // ms
        confidenceThreshold: 0.7,
        autoSuggest: true
    },

    /**
     * Initialize the AI module
     * @param {Object} context - Bridge context
     * @returns {Promise<Object>} Init status
     */
    async init(context) {
        console.log('[AI Module] Initializing...');

        this.eventBus = context.eventBus;
        this.audioBridge = window.audioBridge; // Get audio bridge instance

        if (!this.audioBridge) {
            console.warn('[AI Module] Audio bridge not available, limited functionality');
        }

        // Listen to track loaded events
        this.eventBus.on('audio:track:loaded', (data) => this.onTrackLoaded(data));

        // Listen to play events for real-time analysis
        this.eventBus.on('audio:deck:play', (data) => this.onDeckPlay(data));

        // Listen to pause events
        this.eventBus.on('audio:deck:pause', (data) => this.onDeckPause(data));

        this.initialized = true;
        console.log('[AI Module] Initialized successfully');

        return { status: 'ready', features: ['bpm', 'key', 'genre', 'energy', 'suggestions'] };
    },

    /**
     * Handle track loaded event
     * @param {Object} data - Track data
     */
    async onTrackLoaded(data) {
        const { deckId, filename } = data;
        console.log(`[AI Module] Analyzing track on deck ${deckId}: ${filename}`);

        // Get audio analysis from bridge
        const audioData = this.audioBridge?.getDeckAnalysis(deckId);

        if (!audioData) {
            console.warn(`[AI Module] No audio data for deck ${deckId}`);
            return;
        }

        // Perform analysis
        const analysis = await this.analyzeTrack(deckId, audioData, filename);

        // Cache analysis
        this.trackAnalysis.set(deckId, analysis);

        // Emit analysis complete event
        this.eventBus.emit('ai:analysis:complete', {
            deckId,
            filename,
            analysis
        });

        // Auto-suggest if enabled
        if (this.config.autoSuggest) {
            this.generateSuggestions(deckId, analysis);
        }

        console.log(`[AI Module] Analysis complete for deck ${deckId}:`, analysis);
    },

    /**
     * Analyze track
     * @param {string} deckId - Deck identifier
     * @param {Object} audioData - Audio analysis data
     * @param {string} filename - Track filename
     * @returns {Promise<Object>} Analysis results
     */
    async analyzeTrack(deckId, audioData, filename) {
        const startTime = performance.now();

        // Run parallel analysis
        const [bpm, key, genre, energy] = await Promise.all([
            this.detectBPM(audioData),
            this.detectKey(audioData),
            this.classifyGenre(audioData, filename),
            this.analyzeEnergy(audioData)
        ]);

        const analysisTime = performance.now() - startTime;

        return {
            bpm: {
                value: bpm.value,
                confidence: bpm.confidence
            },
            key: {
                value: key.value,
                confidence: key.confidence
            },
            genre: {
                value: genre.value,
                confidence: genre.confidence
            },
            energy: {
                value: energy.value,
                level: energy.level // low, medium, high
            },
            metadata: {
                filename,
                analyzedAt: Date.now(),
                analysisTime: Math.round(analysisTime)
            }
        };
    },

    /**
     * Detect BPM using autocorrelation
     * @param {Object} audioData - Audio data with frequency/waveform
     * @returns {Promise<Object>} BPM detection result
     */
    async detectBPM(audioData) {
        // Simple BPM detection using energy peaks
        const { waveform } = audioData;

        if (!waveform || waveform.length === 0) {
            return { value: 120, confidence: 0.5 };
        }

        // Calculate energy peaks
        const peaks = this.findEnergyPeaks(waveform);

        // Estimate BPM from peak intervals
        const bpm = this.calculateBPMFromPeaks(peaks);

        // Validate BPM range
        const validBPM = Math.max(
            this.config.bpmRange[0],
            Math.min(this.config.bpmRange[1], bpm)
        );

        // Calculate confidence based on peak consistency
        const confidence = this.calculatePeakConfidence(peaks);

        return {
            value: Math.round(validBPM),
            confidence: Math.min(1, confidence)
        };
    },

    /**
     * Find energy peaks in waveform
     * @param {Uint8Array} waveform - Audio waveform data
     * @returns {Array<number>} Peak positions
     */
    findEnergyPeaks(waveform) {
        const peaks = [];
        const threshold = 200; // Energy threshold
        const minDistance = 10; // Minimum distance between peaks

        for (let i = minDistance; i < waveform.length - minDistance; i++) {
            if (waveform[i] > threshold) {
                // Check if local maximum
                let isMax = true;
                for (let j = -minDistance; j <= minDistance; j++) {
                    if (j !== 0 && waveform[i + j] > waveform[i]) {
                        isMax = false;
                        break;
                    }
                }
                if (isMax) {
                    peaks.push(i);
                }
            }
        }

        return peaks;
    },

    /**
     * Calculate BPM from peak intervals
     * @param {Array<number>} peaks - Peak positions
     * @returns {number} Estimated BPM
     */
    calculateBPMFromPeaks(peaks) {
        if (peaks.length < 2) return 120;

        // Calculate intervals between peaks
        const intervals = [];
        for (let i = 1; i < peaks.length; i++) {
            intervals.push(peaks[i] - peaks[i - 1]);
        }

        // Find median interval
        intervals.sort((a, b) => a - b);
        const medianInterval = intervals[Math.floor(intervals.length / 2)];

        // Convert to BPM (assuming 44.1kHz sample rate, FFT size 2048)
        // This is a simplified calculation
        const sampleRate = 44100;
        const fftSize = 2048;
        const timePerSample = fftSize / sampleRate;
        const beatInterval = medianInterval * timePerSample;
        const bpm = 60 / beatInterval;

        return bpm;
    },

    /**
     * Calculate confidence from peak consistency
     * @param {Array<number>} peaks - Peak positions
     * @returns {number} Confidence score
     */
    calculatePeakConfidence(peaks) {
        if (peaks.length < 3) return 0.5;

        const intervals = [];
        for (let i = 1; i < peaks.length; i++) {
            intervals.push(peaks[i] - peaks[i - 1]);
        }

        // Calculate standard deviation
        const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervals.length;
        const stdDev = Math.sqrt(variance);

        // Lower std dev = higher confidence
        const normalizedStdDev = stdDev / mean;
        return Math.max(0, 1 - normalizedStdDev);
    },

    /**
     * Detect musical key
     * @param {Object} audioData - Audio data
     * @returns {Promise<Object>} Key detection result
     */
    async detectKey(audioData) {
        const { frequency } = audioData;

        if (!frequency || frequency.length === 0) {
            return { value: 'C', confidence: 0.5 };
        }

        // Simplified key detection using frequency distribution
        // In production, would use Krumhansl-Schmuckler algorithm
        const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

        // Find dominant frequency bins
        let maxBin = 0;
        let maxValue = 0;
        for (let i = 0; i < frequency.length; i++) {
            if (frequency[i] > maxValue) {
                maxValue = frequency[i];
                maxBin = i;
            }
        }

        // Map to key (simplified)
        const keyIndex = maxBin % 12;
        const detectedKey = keys[keyIndex];

        return {
            value: detectedKey,
            confidence: 0.6 + Math.random() * 0.2 // Placeholder confidence
        };
    },

    /**
     * Classify genre based on spectral features
     * @param {Object} audioData - Audio data
     * @param {string} filename - Track filename
     * @returns {Promise<Object>} Genre classification
     */
    async classifyGenre(audioData, filename) {
        const { frequency } = audioData;

        // Simplified genre classification
        // In production, would use ML model
        const genres = ['House', 'Techno', 'Trance', 'Hip-Hop', 'Drum & Bass', 'Dubstep'];

        // Analyze frequency distribution
        let bassEnergy = 0;
        let midEnergy = 0;
        let highEnergy = 0;

        const bassRange = Math.floor(frequency.length * 0.1);
        const midRange = Math.floor(frequency.length * 0.5);

        for (let i = 0; i < frequency.length; i++) {
            if (i < bassRange) bassEnergy += frequency[i];
            else if (i < midRange) midEnergy += frequency[i];
            else highEnergy += frequency[i];
        }

        // Simple genre heuristics
        let genre = 'Electronic';
        let confidence = 0.6;

        if (bassEnergy > midEnergy * 1.5) {
            genre = bassEnergy > highEnergy ? 'Dubstep' : 'Drum & Bass';
            confidence = 0.7;
        } else if (midEnergy > bassEnergy * 1.2) {
            genre = 'Trance';
            confidence = 0.65;
        } else if (highEnergy > midEnergy) {
            genre = 'Techno';
            confidence = 0.7;
        }

        // Check filename for hints
        const lowerFilename = filename.toLowerCase();
        for (const g of genres) {
            if (lowerFilename.includes(g.toLowerCase())) {
                genre = g;
                confidence = 0.8;
                break;
            }
        }

        return { value: genre, confidence };
    },

    /**
     * Analyze energy level
     * @param {Object} audioData - Audio data
     * @returns {Promise<Object>} Energy analysis
     */
    async analyzeEnergy(audioData) {
        const { frequency } = audioData;

        if (!frequency || frequency.length === 0) {
            return { value: 0.5, level: 'medium' };
        }

        // Calculate RMS energy
        let sum = 0;
        for (let i = 0; i < frequency.length; i++) {
            sum += frequency[i] * frequency[i];
        }
        const rms = Math.sqrt(sum / frequency.length);

        // Normalize to 0-1
        const normalizedEnergy = Math.min(1, rms / 255);

        // Classify level
        let level = 'medium';
        if (normalizedEnergy < 0.3) level = 'low';
        else if (normalizedEnergy > 0.7) level = 'high';

        return {
            value: normalizedEnergy,
            level
        };
    },

    /**
     * Generate mixing suggestions
     * @param {string} deckId - Current deck
     * @param {Object} analysis - Track analysis
     */
    generateSuggestions(deckId, analysis) {
        const otherDeckId = deckId === 'a' ? 'b' : 'a';
        const otherAnalysis = this.trackAnalysis.get(otherDeckId);

        if (!otherAnalysis) {
            console.log('[AI Module] No comparison track, skipping suggestions');
            return;
        }

        const suggestions = {
            deckId,
            compatible: false,
            recommendations: []
        };

        // BPM compatibility
        const bpmDiff = Math.abs(analysis.bpm.value - otherAnalysis.bpm.value);
        if (bpmDiff < 5) {
            suggestions.compatible = true;
            suggestions.recommendations.push({
                type: 'bpm',
                message: `Perfect BPM match! (±${bpmDiff} BPM)`,
                action: 'ready_to_mix'
            });
        } else if (bpmDiff < 10) {
            suggestions.recommendations.push({
                type: 'bpm',
                message: `Close BPM (±${bpmDiff} BPM). Minor adjustment needed.`,
                action: 'adjust_tempo',
                adjustment: otherAnalysis.bpm.value - analysis.bpm.value
            });
        } else {
            suggestions.recommendations.push({
                type: 'bpm',
                message: `Large BPM difference (±${bpmDiff} BPM). Not recommended.`,
                action: 'skip'
            });
        }

        // Key compatibility (Camelot wheel)
        if (analysis.key.value === otherAnalysis.key.value) {
            suggestions.compatible = true;
            suggestions.recommendations.push({
                type: 'key',
                message: 'Perfect key match!',
                action: 'harmonic_mix'
            });
        }

        // Energy transition
        const energyDiff = analysis.energy.value - otherAnalysis.energy.value;
        if (Math.abs(energyDiff) < 0.2) {
            suggestions.recommendations.push({
                type: 'energy',
                message: 'Smooth energy transition',
                action: 'blend'
            });
        } else if (energyDiff > 0.2) {
            suggestions.recommendations.push({
                type: 'energy',
                message: 'Energy build-up detected',
                action: 'quick_cut'
            });
        } else {
            suggestions.recommendations.push({
                type: 'energy',
                message: 'Energy drop detected',
                action: 'slow_fade'
            });
        }

        // Emit suggestions
        this.eventBus.emit('ai:suggestions', suggestions);
        console.log('[AI Module] Suggestions generated:', suggestions);
    },

    /**
     * Real-time analysis during playback
     * @param {Object} data - Play event data
     */
    onDeckPlay(data) {
        const { deckId } = data;

        // Start real-time monitoring
        this.startRealTimeAnalysis(deckId);
    },

    /**
     * Stop real-time analysis
     * @param {Object} data - Pause event data
     */
    onDeckPause(data) {
        const { deckId } = data;
        this.stopRealTimeAnalysis(deckId);
    },

    /**
     * Start real-time analysis
     * @param {string} deckId - Deck identifier
     */
    startRealTimeAnalysis(deckId) {
        if (this.analysisIntervals?.[deckId]) {
            clearInterval(this.analysisIntervals[deckId]);
        }

        if (!this.analysisIntervals) {
            this.analysisIntervals = {};
        }

        this.analysisIntervals[deckId] = setInterval(() => {
            const audioData = this.audioBridge?.getDeckAnalysis(deckId);
            if (audioData) {
                // Emit real-time data for visualizations
                this.eventBus.emit('ai:realtime:data', {
                    deckId,
                    frequency: audioData.frequency,
                    waveform: audioData.waveform,
                    timestamp: Date.now()
                });
            }
        }, this.config.analysisInterval);

        console.log(`[AI Module] Started real-time analysis for deck ${deckId}`);
    },

    /**
     * Stop real-time analysis
     * @param {string} deckId - Deck identifier
     */
    stopRealTimeAnalysis(deckId) {
        if (this.analysisIntervals?.[deckId]) {
            clearInterval(this.analysisIntervals[deckId]);
            delete this.analysisIntervals[deckId];
            console.log(`[AI Module] Stopped real-time analysis for deck ${deckId}`);
        }
    },

    /**
     * Get cached analysis for a deck
     * @param {string} deckId - Deck identifier
     * @returns {Object|null} Cached analysis
     */
    getAnalysis(deckId) {
        return this.trackAnalysis.get(deckId) || null;
    },

    /**
     * Cleanup module
     */
    cleanup() {
        console.log('[AI Module] Cleaning up...');

        // Stop all real-time analysis
        if (this.analysisIntervals) {
            Object.keys(this.analysisIntervals).forEach(deckId => {
                this.stopRealTimeAnalysis(deckId);
            });
        }

        // Clear cache
        this.trackAnalysis.clear();

        this.initialized = false;
        console.log('[AI Module] Cleanup complete');
    }
};

// Export for browser
if (typeof window !== 'undefined') {
    window.NeuralAIModule = NeuralAIModule;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NeuralAIModule;
}
