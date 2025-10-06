/**
 * Neural Prophetic Loader - Mystical Track Selection System
 *
 * Links tracks to ritual energies, tarot archetypes, and cosmic vibrations.
 * Creates prophetic playlists based on symbolic meanings and energy flows.
 *
 * @version 1.0.0
 * @requires neural-event-bus.js, neural-track-loader.js
 */

const NeuralPropheticLoader = {
    name: 'Prophetic Loader',
    version: '1.0.0',

    // Module state
    initialized: false,
    eventBus: null,
    trackLoader: null,

    // Prophetic mappings
    enabled: false,

    /**
     * Ritual Energy Archetypes
     * Each ritual has specific energy signatures and meanings
     */
    ritualEnergies: {
        INVOCATION: {
            name: 'Invocation',
            symbol: '🌙',
            energy: 'ethereal',
            keywords: ['mystical', 'ambient', 'ethereal', 'spiritual', 'celestial', 'dreamy'],
            bpmRange: [60, 100],
            energyRange: [0.1, 0.4],
            tarotCards: ['The Moon', 'The Star', 'The High Priestess'],
            description: 'Opening the veil between worlds',
            vibe: 'Soft, mystical, inviting the divine'
        },
        REVELATION: {
            name: 'Révélation',
            symbol: '⚡',
            energy: 'explosive',
            keywords: ['powerful', 'intense', 'dramatic', 'epic', 'triumphant', 'climax'],
            bpmRange: [120, 145],
            energyRange: [0.7, 1.0],
            tarotCards: ['The Tower', 'The Sun', 'Judgement'],
            description: 'The moment of divine truth revealed',
            vibe: 'Explosive, revelatory, transformative power'
        },
        TRANSMUTATION: {
            name: 'Transmutation',
            symbol: '🔮',
            energy: 'transformative',
            keywords: ['experimental', 'psychedelic', 'evolving', 'morphing', 'transcendent', 'alchemical'],
            bpmRange: [85, 130],
            energyRange: [0.4, 0.8],
            tarotCards: ['Death', 'The Magician', 'Temperance'],
            description: 'Alchemical transformation of being',
            vibe: 'Genre-bending, reality-shifting, metamorphic'
        },
        ASCENSION: {
            name: 'Ascension',
            symbol: '🌟',
            energy: 'uplifting',
            keywords: ['uplifting', 'euphoric', 'rising', 'soaring', 'transcendent', 'cosmic'],
            bpmRange: [110, 138],
            energyRange: [0.6, 0.9],
            tarotCards: ['The World', 'The Star', 'The Chariot'],
            description: 'Rising to higher consciousness',
            vibe: 'Uplifting, spiritual ascent, cosmic journey'
        },
        MEDITATION: {
            name: 'Méditation',
            symbol: '🧘',
            energy: 'contemplative',
            keywords: ['calm', 'peaceful', 'meditative', 'healing', 'sacred', 'serene'],
            bpmRange: [50, 90],
            energyRange: [0.1, 0.3],
            tarotCards: ['The Hermit', 'The Hanged Man', 'Strength'],
            description: 'Deep inner reflection and peace',
            vibe: 'Tranquil, introspective, healing silence'
        }
    },

    /**
     * Tarot Card Vibrations
     * Each card has musical characteristics
     */
    tarotVibrations: {
        'The Fool': { energy: 0.5, mood: 'playful', bpm: 115, vibe: 'spontaneous adventure' },
        'The Magician': { energy: 0.7, mood: 'creative', bpm: 125, vibe: 'manifestation power' },
        'The High Priestess': { energy: 0.3, mood: 'mystical', bpm: 80, vibe: 'hidden knowledge' },
        'The Empress': { energy: 0.6, mood: 'nurturing', bpm: 100, vibe: 'abundant flow' },
        'The Emperor': { energy: 0.8, mood: 'powerful', bpm: 130, vibe: 'structured authority' },
        'The Hierophant': { energy: 0.5, mood: 'traditional', bpm: 95, vibe: 'sacred wisdom' },
        'The Lovers': { energy: 0.6, mood: 'harmonic', bpm: 110, vibe: 'divine union' },
        'The Chariot': { energy: 0.9, mood: 'driven', bpm: 135, vibe: 'victorious momentum' },
        'Strength': { energy: 0.5, mood: 'courageous', bpm: 105, vibe: 'inner fortitude' },
        'The Hermit': { energy: 0.2, mood: 'introspective', bpm: 70, vibe: 'solitary wisdom' },
        'Wheel of Fortune': { energy: 0.6, mood: 'cyclical', bpm: 120, vibe: 'cosmic cycles' },
        'Justice': { energy: 0.5, mood: 'balanced', bpm: 115, vibe: 'karmic equilibrium' },
        'The Hanged Man': { energy: 0.3, mood: 'suspended', bpm: 75, vibe: 'perspective shift' },
        'Death': { energy: 0.7, mood: 'transformative', bpm: 90, vibe: 'profound change' },
        'Temperance': { energy: 0.4, mood: 'balanced', bpm: 100, vibe: 'alchemical blend' },
        'The Devil': { energy: 0.8, mood: 'intense', bpm: 128, vibe: 'shadow work' },
        'The Tower': { energy: 1.0, mood: 'explosive', bpm: 140, vibe: 'sudden awakening' },
        'The Star': { energy: 0.4, mood: 'hopeful', bpm: 85, vibe: 'celestial guidance' },
        'The Moon': { energy: 0.3, mood: 'mysterious', bpm: 78, vibe: 'subconscious depths' },
        'The Sun': { energy: 0.9, mood: 'joyful', bpm: 125, vibe: 'radiant vitality' },
        'Judgement': { energy: 0.8, mood: 'revelatory', bpm: 118, vibe: 'cosmic calling' },
        'The World': { energy: 0.7, mood: 'complete', bpm: 122, vibe: 'universal harmony' }
    },

    /**
     * Musical Energies (for track metadata tagging)
     */
    musicalEnergies: {
        ethereal: { keywords: ['ambient', 'pad', 'reverb', 'space', 'atmospheric'] },
        explosive: { keywords: ['drop', 'bass', 'kick', 'hard', 'massive'] },
        transformative: { keywords: ['evolve', 'morph', 'transition', 'build', 'journey'] },
        uplifting: { keywords: ['rise', 'soar', 'uplift', 'euphoria', 'hope'] },
        contemplative: { keywords: ['calm', 'peace', 'meditate', 'silence', 'breath'] }
    },

    /**
     * Initialize Prophetic Loader
     */
    async init(context) {
        console.log('[Prophetic Loader] Initializing...');

        this.eventBus = context.eventBus;

        // Get Track Loader instance
        const bridge = window.NeuralBridge;
        this.trackLoader = bridge?.innovations?.get('Track Loader')?.instance;

        if (!this.trackLoader) {
            console.warn('[Prophetic Loader] Track Loader not available');
            return { status: 'error', error: 'Missing Track Loader' };
        }

        this.setupEventListeners();

        this.initialized = true;
        console.log('[Prophetic Loader] Initialized successfully');

        return { status: 'ready' };
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for ritual triggers to select appropriate tracks
        this.eventBus.on('ritual:trigger', (data) => {
            if (this.enabled) {
                this.onRitualTriggered(data);
            }
        });

        // Listen for track analysis to tag with energies
        this.eventBus.on('analyzer:result', (data) => {
            if (this.enabled && data.track && data.analysis) {
                this.tagTrackWithEnergies(data.track, data.analysis);
            }
        });

        console.log('[Prophetic Loader] Event listeners registered');
    },

    /**
     * Handle ritual triggered - select tracks that match ritual energy
     */
    onRitualTriggered(data) {
        const { ritual, fromDeck, toDeck } = data;

        if (!this.ritualEnergies[ritual]) {
            console.warn(`[Prophetic Loader] Unknown ritual: ${ritual}`);
            return;
        }

        const ritualEnergy = this.ritualEnergies[ritual];
        console.log(`[Prophetic Loader] 🔮 ${ritual} triggered - seeking ${ritualEnergy.energy} energy tracks`);

        // Suggest next track based on ritual energy
        const suggestedTrack = this.selectTrackForRitual(ritual);

        if (suggestedTrack) {
            this.eventBus.emit('prophetic:track-suggestion', {
                ritual: ritual,
                track: suggestedTrack,
                energy: ritualEnergy,
                message: `${ritualEnergy.symbol} ${ritual}: ${ritualEnergy.description}`
            });

            console.log(`[Prophetic Loader] 💫 Suggested: ${suggestedTrack.name} for ${ritual}`);
        }
    },

    /**
     * Select track that matches ritual energy
     */
    selectTrackForRitual(ritualName) {
        const ritual = this.ritualEnergies[ritualName];
        if (!this.trackLoader || !this.trackLoader.library) return null;

        const library = this.trackLoader.library;
        const scoredTracks = [];

        for (const track of library) {
            const analysis = this.trackLoader.trackAnalysis?.get(track.name || track);
            if (!analysis) continue;

            let score = 0;

            // BPM matching
            const bpm = analysis.bpm?.value || 120;
            if (bpm >= ritual.bpmRange[0] && bpm <= ritual.bpmRange[1]) {
                score += 40;
            }

            // Energy matching
            const energy = analysis.energy?.value || 0.5;
            if (energy >= ritual.energyRange[0] && energy <= ritual.energyRange[1]) {
                score += 30;
            }

            // Keyword matching in filename
            const trackName = (track.name || track).toLowerCase();
            for (const keyword of ritual.keywords) {
                if (trackName.includes(keyword.toLowerCase())) {
                    score += 15;
                }
            }

            // Genre matching
            const genre = analysis.genre?.value || '';
            if (ritual.energy === 'ethereal' && genre.includes('ambient')) score += 20;
            if (ritual.energy === 'explosive' && genre.includes('electronic')) score += 20;
            if (ritual.energy === 'transformative' && genre.includes('experimental')) score += 20;
            if (ritual.energy === 'uplifting' && genre.includes('trance')) score += 20;
            if (ritual.energy === 'contemplative' && genre.includes('downtempo')) score += 20;

            // Avoid recently played
            if (this.trackLoader.playHistory?.includes(track)) {
                score -= 50;
            }

            scoredTracks.push({ track, score, analysis });
        }

        // Sort by score and return best match
        scoredTracks.sort((a, b) => b.score - a.score);

        if (scoredTracks.length > 0) {
            const best = scoredTracks[0];
            console.log(`[Prophetic Loader] Best match score: ${best.score} for ${best.track.name}`);
            return best.track;
        }

        return null;
    },

    /**
     * Tag track with energy archetypes
     */
    tagTrackWithEnergies(track, analysis) {
        const trackName = track.name || track;
        const tags = [];

        // Analyze based on BPM and energy
        const bpm = analysis.bpm?.value || 120;
        const energy = analysis.energy?.value || 0.5;

        // Match to ritual energies
        for (const [ritualName, ritual] of Object.entries(this.ritualEnergies)) {
            let match = 0;

            if (bpm >= ritual.bpmRange[0] && bpm <= ritual.bpmRange[1]) match++;
            if (energy >= ritual.energyRange[0] && energy <= ritual.energyRange[1]) match++;

            if (match === 2) {
                tags.push({
                    ritual: ritualName,
                    energy: ritual.energy,
                    symbol: ritual.symbol,
                    confidence: 1.0
                });
            } else if (match === 1) {
                tags.push({
                    ritual: ritualName,
                    energy: ritual.energy,
                    symbol: ritual.symbol,
                    confidence: 0.5
                });
            }
        }

        // Match to tarot cards
        for (const [cardName, cardVibe] of Object.entries(this.tarotVibrations)) {
            const bpmMatch = Math.abs(bpm - cardVibe.bpm) < 15;
            const energyMatch = Math.abs(energy - cardVibe.energy) < 0.2;

            if (bpmMatch && energyMatch) {
                tags.push({
                    type: 'tarot',
                    card: cardName,
                    vibe: cardVibe.vibe,
                    confidence: 0.8
                });
            }
        }

        if (tags.length > 0) {
            console.log(`[Prophetic Loader] 🃏 Tagged "${trackName}":`, tags);

            // Store tags in track metadata
            if (!track.propheticTags) {
                track.propheticTags = tags;
            }
        }
    },

    /**
     * Draw a tarot card for next track selection
     */
    drawTarotForNextTrack() {
        const cards = Object.keys(this.tarotVibrations);
        const randomCard = cards[Math.floor(Math.random() * cards.length)];
        const cardVibe = this.tarotVibrations[randomCard];

        console.log(`[Prophetic Loader] 🃏 Drew: ${randomCard} - ${cardVibe.vibe}`);

        // Find track matching this card's vibration
        if (!this.trackLoader || !this.trackLoader.library) return null;

        const library = this.trackLoader.library;
        for (const track of library) {
            const analysis = this.trackLoader.trackAnalysis?.get(track.name || track);
            if (!analysis) continue;

            const bpm = analysis.bpm?.value || 120;
            const energy = analysis.energy?.value || 0.5;

            if (Math.abs(bpm - cardVibe.bpm) < 10 && Math.abs(energy - cardVibe.energy) < 0.15) {
                return {
                    track,
                    card: randomCard,
                    vibe: cardVibe.vibe,
                    message: `The ${randomCard} speaks: ${cardVibe.vibe}`
                };
            }
        }

        return null;
    },

    /**
     * Create a prophetic journey (full set playlist)
     */
    createPropheticJourney() {
        const journey = [
            { ritual: 'INVOCATION', tracks: 2, phase: 'Opening the Portal' },
            { ritual: 'ASCENSION', tracks: 3, phase: 'Rising Energies' },
            { ritual: 'REVELATION', tracks: 2, phase: 'Peak Experience' },
            { ritual: 'TRANSMUTATION', tracks: 2, phase: 'Transformation' },
            { ritual: 'MEDITATION', tracks: 2, phase: 'Integration & Closure' }
        ];

        const playlist = [];

        for (const phase of journey) {
            for (let i = 0; i < phase.tracks; i++) {
                const track = this.selectTrackForRitual(phase.ritual);
                if (track) {
                    playlist.push({
                        track,
                        ritual: phase.ritual,
                        phase: phase.phase,
                        symbol: this.ritualEnergies[phase.ritual].symbol
                    });
                }
            }
        }

        console.log('[Prophetic Loader] 🌌 Prophetic Journey Created:', playlist);
        return playlist;
    },

    /**
     * Enable/disable prophetic mode
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        console.log(`[Prophetic Loader] ${enabled ? 'Enabled' : 'Disabled'}`);

        this.eventBus.emit('prophetic:mode-changed', { enabled });
    },

    /**
     * Get state
     */
    getState() {
        return {
            initialized: this.initialized,
            enabled: this.enabled,
            rituals: Object.keys(this.ritualEnergies).length,
            tarotCards: Object.keys(this.tarotVibrations).length
        };
    },

    /**
     * Cleanup
     */
    cleanup() {
        console.log('[Prophetic Loader] Cleaning up...');
        this.enabled = false;
        this.initialized = false;
        this.eventBus.emit('prophetic:cleanup');
    }
};

// Export for browser
if (typeof window !== 'undefined') {
    window.NeuralPropheticLoader = NeuralPropheticLoader;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NeuralPropheticLoader;
}
