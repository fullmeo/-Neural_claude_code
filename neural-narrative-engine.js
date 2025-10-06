/**
 * Neural Narrative Engine - Story-Driven DJ Sessions
 *
 * Transforms DJ sets into epic narratives with story arcs, character development,
 * plot twists, and climactic revelations. Each transition becomes a story beat.
 *
 * @version 1.0.0
 * @requires neural-event-bus.js
 */

const NeuralNarrativeEngine = {
    name: 'Narrative Engine',
    version: '1.0.0',

    // Module state
    initialized: false,
    eventBus: null,

    // Narrative state
    activeStory: null,
    currentChapter: 0,
    storyProgress: 0,
    plotTwists: [],
    characterArcs: [],

    /**
     * Story Templates
     * Epic narratives with chapters and emotional arcs
     */
    storyTemplates: {
        HEROS_JOURNEY: {
            name: "Le Voyage du Héros",
            symbol: '⚔️',
            totalChapters: 12,
            duration: 60, // minutes
            chapters: [
                {
                    name: "Le Monde Ordinaire",
                    ritual: 'MEDITATION',
                    energy: 0.2,
                    mood: 'calm',
                    narrative: "Dans un monde de paix, avant l'appel à l'aventure...",
                    transition: 'ghost_fade'
                },
                {
                    name: "L'Appel à l'Aventure",
                    ritual: 'INVOCATION',
                    energy: 0.3,
                    mood: 'mysterious',
                    narrative: "Un signe mystérieux apparaît, changeant tout...",
                    transition: 'melody_merge'
                },
                {
                    name: "Refus de l'Appel",
                    ritual: 'MEDITATION',
                    energy: 0.25,
                    mood: 'hesitant',
                    narrative: "Le doute s'installe, la peur paralyse...",
                    transition: 'reverse_surge'
                },
                {
                    name: "Rencontre du Mentor",
                    ritual: 'INVOCATION',
                    energy: 0.4,
                    mood: 'wise',
                    narrative: "Un guide apparaît, révélant le chemin...",
                    transition: 'ghost_fade'
                },
                {
                    name: "Passage du Seuil",
                    ritual: 'TRANSMUTATION',
                    energy: 0.5,
                    mood: 'transformative',
                    narrative: "Le héros franchit le point de non-retour...",
                    transition: 'genre_warp'
                },
                {
                    name: "Épreuves et Alliés",
                    ritual: 'ASCENSION',
                    energy: 0.6,
                    mood: 'adventurous',
                    narrative: "Les défis s'accumulent, les forces s'unissent...",
                    transition: 'pulse_sync'
                },
                {
                    name: "Approche de la Caverne",
                    ritual: 'ASCENSION',
                    energy: 0.7,
                    mood: 'tense',
                    narrative: "Le danger se rapproche, la tension monte...",
                    transition: 'energy_spiral'
                },
                {
                    name: "L'Épreuve Suprême",
                    ritual: 'REVELATION',
                    energy: 0.9,
                    mood: 'intense',
                    narrative: "Face au dragon, le moment de vérité absolue !",
                    transition: 'drop_echo',
                    plotTwist: true
                },
                {
                    name: "La Récompense",
                    ritual: 'REVELATION',
                    energy: 0.85,
                    mood: 'triumphant',
                    narrative: "Victoire ! Le trésor est conquis !",
                    transition: 'drop'
                },
                {
                    name: "Le Chemin du Retour",
                    ritual: 'TRANSMUTATION',
                    energy: 0.6,
                    mood: 'reflective',
                    narrative: "Transformé, le héros retourne vers son monde...",
                    transition: 'bass_tunnel'
                },
                {
                    name: "Résurrection",
                    ritual: 'ASCENSION',
                    energy: 0.7,
                    mood: 'renewed',
                    narrative: "Un dernier défi, une renaissance finale...",
                    transition: 'energy_spiral'
                },
                {
                    name: "Retour avec l'Élixir",
                    ritual: 'MEDITATION',
                    energy: 0.3,
                    mood: 'peaceful',
                    narrative: "Le héros revient, sage et complet, apportant la lumière...",
                    transition: 'silence_ritual'
                }
            ]
        },

        COSMIC_AWAKENING: {
            name: "L'Éveil Cosmique",
            symbol: '🌌',
            totalChapters: 7,
            duration: 45,
            chapters: [
                {
                    name: "Le Sommeil Profond",
                    ritual: 'MEDITATION',
                    energy: 0.15,
                    mood: 'dormant',
                    narrative: "Dans les ténèbres de l'inconscience...",
                    transition: 'ghost_fade'
                },
                {
                    name: "Premier Rêve",
                    ritual: 'INVOCATION',
                    energy: 0.35,
                    mood: 'dreamy',
                    narrative: "Des visions émergent du subconscient...",
                    transition: 'melody_merge'
                },
                {
                    name: "L'Éveil Partiel",
                    ritual: 'TRANSMUTATION',
                    energy: 0.5,
                    mood: 'awakening',
                    narrative: "La conscience commence à percevoir la réalité...",
                    transition: 'genre_warp'
                },
                {
                    name: "Perception Cosmique",
                    ritual: 'ASCENSION',
                    energy: 0.7,
                    mood: 'expanding',
                    narrative: "L'univers se révèle dans toute sa splendeur...",
                    transition: 'energy_spiral',
                    plotTwist: true
                },
                {
                    name: "Union Divine",
                    ritual: 'REVELATION',
                    energy: 0.95,
                    mood: 'transcendent',
                    narrative: "Fusion avec le Tout, illumination absolue !",
                    transition: 'drop_echo'
                },
                {
                    name: "Intégration",
                    ritual: 'TRANSMUTATION',
                    energy: 0.6,
                    mood: 'integrating',
                    narrative: "La sagesse cosmique s'ancre dans l'être...",
                    transition: 'bass_tunnel'
                },
                {
                    name: "Nouveau Paradigme",
                    ritual: 'MEDITATION',
                    energy: 0.25,
                    mood: 'enlightened',
                    narrative: "Un monde nouveau s'ouvre, empli de lumière...",
                    transition: 'silence_ritual'
                }
            ]
        },

        ALCHEMICAL_TRANSFORMATION: {
            name: "La Transformation Alchimique",
            symbol: '🜛',
            totalChapters: 7,
            duration: 50,
            chapters: [
                {
                    name: "Nigredo - Dissolution",
                    ritual: 'MEDITATION',
                    energy: 0.2,
                    mood: 'dark',
                    narrative: "La matière brute se dissout dans les ténèbres...",
                    transition: 'ghost_fade'
                },
                {
                    name: "Albedo - Purification",
                    ritual: 'INVOCATION',
                    energy: 0.4,
                    mood: 'cleansing',
                    narrative: "L'essence se purifie, le blanc immaculé émerge...",
                    transition: 'melody_merge'
                },
                {
                    name: "Citrinitas - Illumination",
                    ritual: 'ASCENSION',
                    energy: 0.6,
                    mood: 'illuminating',
                    narrative: "La lumière dorée révèle la connaissance...",
                    transition: 'energy_spiral'
                },
                {
                    name: "Rubedo - Transmutation",
                    ritual: 'TRANSMUTATION',
                    energy: 0.75,
                    mood: 'transforming',
                    narrative: "Le rouge ardent consume l'ancien, crée le nouveau...",
                    transition: 'genre_warp',
                    plotTwist: true
                },
                {
                    name: "La Pierre Philosophale",
                    ritual: 'REVELATION',
                    energy: 0.9,
                    mood: 'triumphant',
                    narrative: "L'opus magnum est accompli ! La pierre est créée !",
                    transition: 'drop_echo'
                },
                {
                    name: "Multiplication",
                    ritual: 'ASCENSION',
                    energy: 0.7,
                    mood: 'expanding',
                    narrative: "La pierre se multiplie, la sagesse se propage...",
                    transition: 'pulse_sync'
                },
                {
                    name: "Projection - Don au Monde",
                    ritual: 'MEDITATION',
                    energy: 0.3,
                    mood: 'giving',
                    narrative: "L'élixir est offert, transformant tout sur son passage...",
                    transition: 'silence_ritual'
                }
            ]
        },

        PHOENIX_REBIRTH: {
            name: "Renaissance du Phénix",
            symbol: '🔥',
            totalChapters: 5,
            duration: 35,
            chapters: [
                {
                    name: "L'Ancien Monde",
                    ritual: 'MEDITATION',
                    energy: 0.3,
                    mood: 'nostalgic',
                    narrative: "Le phénix vieillit, son temps s'achève...",
                    transition: 'ghost_fade'
                },
                {
                    name: "Le Brasier",
                    ritual: 'REVELATION',
                    energy: 0.8,
                    mood: 'burning',
                    narrative: "Les flammes s'élèvent, tout est consumé !",
                    transition: 'drop_echo',
                    plotTwist: true
                },
                {
                    name: "Les Cendres",
                    ritual: 'MEDITATION',
                    energy: 0.2,
                    mood: 'empty',
                    narrative: "Silence absolu. Seules les cendres demeurent...",
                    transition: 'silence_ritual'
                },
                {
                    name: "Le Premier Battement",
                    ritual: 'ASCENSION',
                    energy: 0.6,
                    mood: 'emerging',
                    narrative: "Un battement. La vie renaît de la mort...",
                    transition: 'energy_spiral'
                },
                {
                    name: "L'Envol Glorieux",
                    ritual: 'REVELATION',
                    energy: 0.95,
                    mood: 'triumphant',
                    narrative: "Le phénix s'élève, plus puissant que jamais !",
                    transition: 'drop'
                }
            ]
        },

        LOVE_CONQUEST: {
            name: "La Conquête de l'Amour",
            symbol: '💖',
            totalChapters: 6,
            duration: 40,
            chapters: [
                {
                    name: "Solitude",
                    ritual: 'MEDITATION',
                    energy: 0.25,
                    mood: 'lonely',
                    narrative: "Dans la solitude, un cœur cherche...",
                    transition: 'ghost_fade'
                },
                {
                    name: "Première Rencontre",
                    ritual: 'INVOCATION',
                    energy: 0.4,
                    mood: 'enchanted',
                    narrative: "Les regards se croisent, la magie opère...",
                    transition: 'melody_merge'
                },
                {
                    name: "La Danse",
                    ritual: 'ASCENSION',
                    energy: 0.65,
                    mood: 'playful',
                    narrative: "Deux âmes dansent, l'attraction grandit...",
                    transition: 'pulse_sync'
                },
                {
                    name: "L'Obstacle",
                    ritual: 'TRANSMUTATION',
                    energy: 0.5,
                    mood: 'challenging',
                    narrative: "Un défi surgit, menaçant l'union...",
                    transition: 'genre_warp',
                    plotTwist: true
                },
                {
                    name: "La Déclaration",
                    ritual: 'REVELATION',
                    energy: 0.9,
                    mood: 'passionate',
                    narrative: "Les cœurs se dévoilent, l'amour triomphe !",
                    transition: 'drop_echo'
                },
                {
                    name: "L'Union Sacrée",
                    ritual: 'MEDITATION',
                    energy: 0.35,
                    mood: 'united',
                    narrative: "Deux âmes deviennent une, pour l'éternité...",
                    transition: 'silence_ritual'
                }
            ]
        }
    },

    /**
     * Plot Twist Library
     * Unexpected revelations that change the story
     */
    plotTwists: [
        {
            name: "La Trahison",
            impact: 'dramatic',
            effect: "L'allié devient ennemi !",
            transitionOverride: 'strobe_cut'
        },
        {
            name: "La Révélation",
            impact: 'shocking',
            effect: "La vérité cachée éclate au grand jour !",
            transitionOverride: 'drop_echo'
        },
        {
            name: "Le Retour",
            impact: 'triumphant',
            effect: "Ce qui était perdu revient !",
            transitionOverride: 'reverse_surge'
        },
        {
            name: "Le Sacrifice",
            impact: 'emotional',
            effect: "L'ultime sacrifice pour sauver le monde...",
            transitionOverride: 'silence_ritual'
        },
        {
            name: "Le Pouvoir Caché",
            impact: 'empowering',
            effect: "Une force insoupçonnée se réveille !",
            transitionOverride: 'energy_spiral'
        }
    ],

    /**
     * Initialize Narrative Engine
     */
    async init(context) {
        console.log('[Narrative Engine] Initializing...');

        this.eventBus = context.eventBus;

        this.setupEventListeners();

        this.initialized = true;
        console.log('[Narrative Engine] Initialized successfully');

        return { status: 'ready' };
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for transition completions to advance story
        this.eventBus.on('transition:completed', (data) => {
            if (this.activeStory) {
                this.advanceStory();
            }
        });

        // Listen for ritual triggers to match story beats
        this.eventBus.on('ritual:trigger', (data) => {
            if (this.activeStory) {
                this.matchRitualToStory(data.ritual);
            }
        });

        console.log('[Narrative Engine] Event listeners registered');
    },

    /**
     * Start a story arc
     */
    startStory(storyName) {
        const story = this.storyTemplates[storyName];
        if (!story) {
            console.error(`[Narrative Engine] Story not found: ${storyName}`);
            return false;
        }

        this.activeStory = {
            ...story,
            startTime: Date.now(),
            currentChapter: 0,
            completedChapters: []
        };

        this.currentChapter = 0;
        this.storyProgress = 0;

        console.log(`[Narrative Engine] 📖 Starting story: ${story.symbol} ${story.name}`);
        console.log(`[Narrative Engine] ${story.totalChapters} chapters over ${story.duration} minutes`);

        // Emit story start
        this.eventBus.emit('narrative:story-started', {
            story: story.name,
            symbol: story.symbol,
            totalChapters: story.totalChapters,
            firstChapter: story.chapters[0]
        });

        // Show first chapter
        this.showChapter(0);

        return true;
    },

    /**
     * Show current chapter narrative
     */
    showChapter(chapterIndex) {
        if (!this.activeStory) return;

        const chapter = this.activeStory.chapters[chapterIndex];
        if (!chapter) return;

        console.log(`\n[Narrative Engine] 📜 Chapter ${chapterIndex + 1}/${this.activeStory.totalChapters}: ${chapter.name}`);
        console.log(`[Narrative Engine] "${chapter.narrative}"`);
        console.log(`[Narrative Engine] Ritual: ${chapter.ritual} | Energy: ${chapter.energy} | Mood: ${chapter.mood}`);

        // Check for plot twist
        if (chapter.plotTwist) {
            this.triggerPlotTwist();
        }

        // Emit chapter event
        this.eventBus.emit('narrative:chapter-shown', {
            chapter: chapter.name,
            index: chapterIndex,
            narrative: chapter.narrative,
            ritual: chapter.ritual,
            plotTwist: chapter.plotTwist || false
        });
    },

    /**
     * Advance to next chapter
     */
    advanceStory() {
        if (!this.activeStory) return;

        this.currentChapter++;
        this.storyProgress = (this.currentChapter / this.activeStory.totalChapters) * 100;

        if (this.currentChapter >= this.activeStory.totalChapters) {
            this.endStory();
        } else {
            this.showChapter(this.currentChapter);

            // Suggest appropriate transition for next chapter
            const nextChapter = this.activeStory.chapters[this.currentChapter];
            this.eventBus.emit('narrative:suggest-transition', {
                transition: nextChapter.transition,
                ritual: nextChapter.ritual,
                chapter: nextChapter.name
            });
        }
    },

    /**
     * Trigger a plot twist
     */
    triggerPlotTwist() {
        const twist = this.plotTwists[Math.floor(Math.random() * this.plotTwists.length)];

        console.log(`\n[Narrative Engine] 🌟 PLOT TWIST: ${twist.name}`);
        console.log(`[Narrative Engine] "${twist.effect}"`);

        this.eventBus.emit('narrative:plot-twist', {
            name: twist.name,
            effect: twist.effect,
            impact: twist.impact,
            transitionOverride: twist.transitionOverride
        });
    },

    /**
     * Match ritual to story expectations
     */
    matchRitualToStory(ritual) {
        if (!this.activeStory) return;

        const currentChapter = this.activeStory.chapters[this.currentChapter];
        if (currentChapter.ritual === ritual) {
            console.log(`[Narrative Engine] ✓ Perfect ritual match for "${currentChapter.name}"`);

            this.eventBus.emit('narrative:ritual-matched', {
                chapter: currentChapter.name,
                ritual: ritual
            });
        } else {
            console.log(`[Narrative Engine] ⚠ Unexpected ritual: expected ${currentChapter.ritual}, got ${ritual}`);
        }
    },

    /**
     * End the story
     */
    endStory() {
        if (!this.activeStory) return;

        const duration = Date.now() - this.activeStory.startTime;
        const minutes = Math.floor(duration / 60000);

        console.log(`\n[Narrative Engine] 📖 Story Complete: ${this.activeStory.symbol} ${this.activeStory.name}`);
        console.log(`[Narrative Engine] Duration: ${minutes} minutes`);
        console.log(`[Narrative Engine] "Fin de l'histoire..."`);

        this.eventBus.emit('narrative:story-ended', {
            story: this.activeStory.name,
            duration: duration,
            chapters: this.activeStory.totalChapters
        });

        this.activeStory = null;
        this.currentChapter = 0;
        this.storyProgress = 0;
    },

    /**
     * Get current story state
     */
    getState() {
        return {
            initialized: this.initialized,
            hasActiveStory: !!this.activeStory,
            currentStory: this.activeStory?.name || null,
            currentChapter: this.currentChapter,
            totalChapters: this.activeStory?.totalChapters || 0,
            progress: this.storyProgress,
            availableStories: Object.keys(this.storyTemplates)
        };
    },

    /**
     * Cleanup
     */
    cleanup() {
        console.log('[Narrative Engine] Cleaning up...');
        this.activeStory = null;
        this.currentChapter = 0;
        this.storyProgress = 0;
        this.initialized = false;
        this.eventBus.emit('narrative:cleanup');
    }
};

// Export for browser
if (typeof window !== 'undefined') {
    window.NeuralNarrativeEngine = NeuralNarrativeEngine;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NeuralNarrativeEngine;
}
