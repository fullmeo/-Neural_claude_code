/**
 * 🌉 Neural Event Bus
 *
 * Central event system for inter-module communication
 * Allows decoupled communication between all Neural modules
 */

class NeuralEventBus {
    constructor() {
        this.events = {};
        this.history = [];
        console.log('[NeuralEventBus] 🌉 Event bus initialized');
    }

    /**
     * Subscribe to an event
     */
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    /**
     * Unsubscribe from an event
     */
    off(event, callback) {
        if (!this.events[event]) return;

        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }

    /**
     * Emit an event
     */
    emit(event, data) {
        // Record in history
        this.history.push({
            event,
            data,
            timestamp: Date.now()
        });

        // Keep only last 1000 events
        if (this.history.length > 1000) {
            this.history.shift();
        }

        // Call all listeners
        if (this.events[event]) {
            this.events[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[NeuralEventBus] Error in ${event} handler:`, error);
                }
            });
        }
    }

    /**
     * Get event history
     */
    getHistory(eventType = null) {
        if (eventType) {
            return this.history.filter(h => h.event === eventType);
        }
        return this.history;
    }

    /**
     * Clear history
     */
    clearHistory() {
        this.history = [];
    }

    /**
     * Get all subscribed events
     */
    getEvents() {
        return Object.keys(this.events);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NeuralEventBus;
}
