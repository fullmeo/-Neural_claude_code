/**
 * Neural State Manager - Phase 4A: State Persistence
 *
 * Provides comprehensive state management including:
 * - IndexedDB local storage
 * - Session snapshots
 * - History tracking
 * - Auto-save functionality
 * - State restoration
 * - Conflict resolution
 *
 * @version 1.0.0
 * @requires neural-event-bus.js
 */

const NeuralStateManager = {
    name: 'State Manager',
    version: '1.0.0',

    // Module state
    initialized: false,
    eventBus: null,
    db: null,

    // Configuration
    config: {
        dbName: 'NeuralMixDB',
        dbVersion: 1,
        autoSave: true,
        autoSaveInterval: 30000, // 30 seconds
        maxHistorySize: 50,
        maxSnapshots: 10
    },

    // Runtime state
    currentSession: null,
    autoSaveTimer: null,
    stateCache: new Map(),

    /**
     * Initialize the State Manager
     * @param {Object} context - Bridge context
     * @returns {Promise<Object>} Init status
     */
    async init(context) {
        console.log('[State Manager] Initializing...');

        this.eventBus = context.eventBus;

        try {
            // Initialize IndexedDB
            await this.initDatabase();

            // Load or create session
            await this.initializeSession();

            // Setup auto-save
            if (this.config.autoSave) {
                this.startAutoSave();
            }

            // Listen to state change events
            this.setupEventListeners();

            this.initialized = true;
            console.log('[State Manager] Initialized successfully');

            return {
                status: 'ready',
                features: ['persistence', 'snapshots', 'history', 'auto-save']
            };

        } catch (error) {
            console.error('[State Manager] Initialization failed:', error);
            return { status: 'error', error: error.message };
        }
    },

    /**
     * Initialize IndexedDB database
     * @private
     */
    async initDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.config.dbName, this.config.dbVersion);

            request.onerror = () => {
                reject(new Error('Failed to open IndexedDB'));
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('[State Manager] Database opened successfully');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Sessions store
                if (!db.objectStoreNames.contains('sessions')) {
                    const sessionsStore = db.createObjectStore('sessions', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    sessionsStore.createIndex('timestamp', 'timestamp', { unique: false });
                    sessionsStore.createIndex('name', 'name', { unique: false });
                }

                // Snapshots store
                if (!db.objectStoreNames.contains('snapshots')) {
                    const snapshotsStore = db.createObjectStore('snapshots', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    snapshotsStore.createIndex('sessionId', 'sessionId', { unique: false });
                    snapshotsStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                // History store
                if (!db.objectStoreNames.contains('history')) {
                    const historyStore = db.createObjectStore('history', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    historyStore.createIndex('sessionId', 'sessionId', { unique: false });
                    historyStore.createIndex('timestamp', 'timestamp', { unique: false });
                    historyStore.createIndex('type', 'type', { unique: false });
                }

                // Settings store
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }

                console.log('[State Manager] Database schema created');
            };
        });
    },

    /**
     * Initialize or load session
     * @private
     */
    async initializeSession() {
        // Try to load last session
        const lastSession = await this.getLastSession();

        if (lastSession) {
            this.currentSession = lastSession;
            console.log('[State Manager] Restored session:', lastSession.id);
        } else {
            // Create new session
            this.currentSession = await this.createSession('Default Session');
            console.log('[State Manager] Created new session:', this.currentSession.id);
        }

        this.eventBus.emit('state:session-loaded', this.currentSession);
    },

    /**
     * Setup event listeners for state changes
     * @private
     */
    setupEventListeners() {
        // Track track loads
        this.eventBus.on('audio:track:loaded', (data) => {
            this.recordHistory('track_loaded', data);
        });

        // Track analysis results
        this.eventBus.on('ai:analysis:complete', (data) => {
            this.recordHistory('ai_analysis', data);
            this.updateSessionState('lastAnalysis', data);
        });

        // Track transitions
        this.eventBus.on('transition:completed', (data) => {
            this.recordHistory('transition', data);
        });

        // Track mixer changes
        this.eventBus.on('mixer:crossfader', (data) => {
            this.updateSessionState('crossfader', data.value);
        });

        console.log('[State Manager] Event listeners registered');
    },

    /**
     * Create a new session
     * @param {string} name - Session name
     * @returns {Promise<Object>} Session object
     */
    async createSession(name = 'Untitled Session') {
        const session = {
            name,
            timestamp: Date.now(),
            state: {
                decks: { a: null, b: null },
                crossfader: 0.5,
                effects: {},
                analysis: {}
            },
            metadata: {
                version: this.version,
                browser: navigator.userAgent,
                created: new Date().toISOString()
            }
        };

        const id = await this.saveSession(session);
        session.id = id;

        this.eventBus.emit('state:session-created', session);
        return session;
    },

    /**
     * Save session to database
     * @param {Object} session - Session object
     * @returns {Promise<number>} Session ID
     */
    async saveSession(session) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['sessions'], 'readwrite');
            const store = transaction.objectStore('sessions');

            const request = session.id
                ? store.put(session)
                : store.add(session);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error('Failed to save session'));
            };
        });
    },

    /**
     * Load session by ID
     * @param {number} sessionId - Session ID
     * @returns {Promise<Object|null>} Session object
     */
    async loadSession(sessionId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['sessions'], 'readonly');
            const store = transaction.objectStore('sessions');
            const request = store.get(sessionId);

            request.onsuccess = () => {
                resolve(request.result || null);
            };

            request.onerror = () => {
                reject(new Error('Failed to load session'));
            };
        });
    },

    /**
     * Get last session
     * @returns {Promise<Object|null>} Session object
     */
    async getLastSession() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['sessions'], 'readonly');
            const store = transaction.objectStore('sessions');
            const index = store.index('timestamp');
            const request = index.openCursor(null, 'prev');

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                resolve(cursor ? cursor.value : null);
            };

            request.onerror = () => {
                reject(new Error('Failed to get last session'));
            };
        });
    },

    /**
     * Get all sessions
     * @returns {Promise<Array>} Array of sessions
     */
    async getAllSessions() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['sessions'], 'readonly');
            const store = transaction.objectStore('sessions');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error('Failed to get sessions'));
            };
        });
    },

    /**
     * Delete session
     * @param {number} sessionId - Session ID
     * @returns {Promise<void>}
     */
    async deleteSession(sessionId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['sessions'], 'readwrite');
            const store = transaction.objectStore('sessions');
            const request = store.delete(sessionId);

            request.onsuccess = () => {
                this.eventBus.emit('state:session-deleted', sessionId);
                resolve();
            };

            request.onerror = () => {
                reject(new Error('Failed to delete session'));
            };
        });
    },

    /**
     * Update session state
     * @param {string} key - State key
     * @param {*} value - State value
     */
    updateSessionState(key, value) {
        if (!this.currentSession) return;

        // Update state
        const keys = key.split('.');
        let target = this.currentSession.state;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!target[keys[i]]) target[keys[i]] = {};
            target = target[keys[i]];
        }

        target[keys[keys.length - 1]] = value;

        // Cache for auto-save
        this.stateCache.set(key, {
            value,
            timestamp: Date.now()
        });

        this.eventBus.emit('state:updated', { key, value });
    },

    /**
     * Get session state
     * @param {string} key - State key
     * @returns {*} State value
     */
    getSessionState(key) {
        if (!this.currentSession) return null;

        const keys = key.split('.');
        let value = this.currentSession.state;

        for (const k of keys) {
            if (value === undefined || value === null) return null;
            value = value[k];
        }

        return value;
    },

    /**
     * Create snapshot of current state
     * @param {string} label - Snapshot label
     * @returns {Promise<number>} Snapshot ID
     */
    async createSnapshot(label = 'Manual Snapshot') {
        if (!this.currentSession) {
            throw new Error('No active session');
        }

        const snapshot = {
            sessionId: this.currentSession.id,
            label,
            timestamp: Date.now(),
            state: JSON.parse(JSON.stringify(this.currentSession.state))
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['snapshots'], 'readwrite');
            const store = transaction.objectStore('snapshots');
            const request = store.add(snapshot);

            request.onsuccess = () => {
                console.log('[State Manager] Snapshot created:', request.result);
                this.eventBus.emit('state:snapshot-created', snapshot);

                // Cleanup old snapshots
                this.cleanupSnapshots();

                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error('Failed to create snapshot'));
            };
        });
    },

    /**
     * Restore state from snapshot
     * @param {number} snapshotId - Snapshot ID
     * @returns {Promise<void>}
     */
    async restoreSnapshot(snapshotId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['snapshots'], 'readonly');
            const store = transaction.objectStore('snapshots');
            const request = store.get(snapshotId);

            request.onsuccess = () => {
                const snapshot = request.result;

                if (!snapshot) {
                    reject(new Error('Snapshot not found'));
                    return;
                }

                // Restore state
                this.currentSession.state = JSON.parse(JSON.stringify(snapshot.state));

                console.log('[State Manager] Snapshot restored:', snapshotId);
                this.eventBus.emit('state:snapshot-restored', snapshot);

                resolve();
            };

            request.onerror = () => {
                reject(new Error('Failed to restore snapshot'));
            };
        });
    },

    /**
     * Get snapshots for current session
     * @returns {Promise<Array>} Array of snapshots
     */
    async getSessionSnapshots() {
        if (!this.currentSession) return [];

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['snapshots'], 'readonly');
            const store = transaction.objectStore('snapshots');
            const index = store.index('sessionId');
            const request = index.getAll(this.currentSession.id);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error('Failed to get snapshots'));
            };
        });
    },

    /**
     * Cleanup old snapshots
     * @private
     */
    async cleanupSnapshots() {
        const snapshots = await this.getSessionSnapshots();

        if (snapshots.length > this.config.maxSnapshots) {
            // Sort by timestamp
            snapshots.sort((a, b) => a.timestamp - b.timestamp);

            // Delete oldest
            const toDelete = snapshots.slice(0, snapshots.length - this.config.maxSnapshots);

            const transaction = this.db.transaction(['snapshots'], 'readwrite');
            const store = transaction.objectStore('snapshots');

            toDelete.forEach(snapshot => {
                store.delete(snapshot.id);
            });

            console.log(`[State Manager] Cleaned up ${toDelete.length} old snapshots`);
        }
    },

    /**
     * Record history entry
     * @param {string} type - Event type
     * @param {Object} data - Event data
     */
    async recordHistory(type, data) {
        if (!this.currentSession) return;

        const entry = {
            sessionId: this.currentSession.id,
            type,
            data,
            timestamp: Date.now()
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['history'], 'readwrite');
            const store = transaction.objectStore('history');
            const request = store.add(entry);

            request.onsuccess = () => {
                // Cleanup old history
                this.cleanupHistory();
                resolve();
            };

            request.onerror = () => {
                console.warn('[State Manager] Failed to record history');
                resolve(); // Don't reject, history is non-critical
            };
        });
    },

    /**
     * Get session history
     * @param {number} limit - Max entries
     * @returns {Promise<Array>} History entries
     */
    async getSessionHistory(limit = 100) {
        if (!this.currentSession) return [];

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['history'], 'readonly');
            const store = transaction.objectStore('history');
            const index = store.index('sessionId');
            const request = index.getAll(this.currentSession.id);

            request.onsuccess = () => {
                let results = request.result;
                // Sort by timestamp descending
                results.sort((a, b) => b.timestamp - a.timestamp);
                // Limit results
                results = results.slice(0, limit);
                resolve(results);
            };

            request.onerror = () => {
                reject(new Error('Failed to get history'));
            };
        });
    },

    /**
     * Cleanup old history entries
     * @private
     */
    async cleanupHistory() {
        const history = await this.getSessionHistory(this.config.maxHistorySize + 50);

        if (history.length > this.config.maxHistorySize) {
            // Delete oldest entries
            const toDelete = history.slice(this.config.maxHistorySize);

            const transaction = this.db.transaction(['history'], 'readwrite');
            const store = transaction.objectStore('history');

            toDelete.forEach(entry => {
                store.delete(entry.id);
            });
        }
    },

    /**
     * Start auto-save timer
     * @private
     */
    startAutoSave() {
        this.autoSaveTimer = setInterval(() => {
            this.autoSaveSession();
        }, this.config.autoSaveInterval);

        console.log(`[State Manager] Auto-save enabled (${this.config.autoSaveInterval}ms)`);
    },

    /**
     * Stop auto-save timer
     * @private
     */
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
            console.log('[State Manager] Auto-save disabled');
        }
    },

    /**
     * Auto-save current session
     * @private
     */
    async autoSaveSession() {
        if (!this.currentSession) return;

        try {
            await this.saveSession(this.currentSession);
            console.log('[State Manager] Auto-saved session:', this.currentSession.id);
            this.eventBus.emit('state:auto-saved', {
                sessionId: this.currentSession.id,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('[State Manager] Auto-save failed:', error);
        }
    },

    /**
     * Export session data
     * @param {number} sessionId - Session ID
     * @returns {Promise<Object>} Export data
     */
    async exportSession(sessionId) {
        const session = await this.loadSession(sessionId);
        const snapshots = await this.getSessionSnapshots();
        const history = await this.getSessionHistory();

        return {
            session,
            snapshots,
            history,
            exportedAt: Date.now(),
            version: this.version
        };
    },

    /**
     * Import session data
     * @param {Object} data - Import data
     * @returns {Promise<number>} New session ID
     */
    async importSession(data) {
        // Validate data
        if (!data.session || !data.version) {
            throw new Error('Invalid import data');
        }

        // Remove old ID
        delete data.session.id;

        // Create session
        const sessionId = await this.saveSession(data.session);

        console.log('[State Manager] Session imported:', sessionId);
        this.eventBus.emit('state:session-imported', { sessionId });

        return sessionId;
    },

    /**
     * Get current state
     * @returns {Object} State object
     */
    getState() {
        return {
            initialized: this.initialized,
            currentSession: this.currentSession?.id || null,
            autoSave: this.config.autoSave,
            cacheSize: this.stateCache.size
        };
    },

    /**
     * Cleanup module
     */
    async cleanup() {
        console.log('[State Manager] Cleaning up...');

        // Stop auto-save
        this.stopAutoSave();

        // Final save
        if (this.currentSession) {
            await this.saveSession(this.currentSession);
        }

        // Close database
        if (this.db) {
            this.db.close();
        }

        this.stateCache.clear();
        this.initialized = false;

        console.log('[State Manager] Cleanup complete');
    }
};

// Export for browser
if (typeof window !== 'undefined') {
    window.NeuralStateManager = NeuralStateManager;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NeuralStateManager;
}
