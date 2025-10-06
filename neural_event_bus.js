/**
 * Neural Event Bus v1.0
 * Communication sécurisée inter-modules
 */

class NeuralEventBus {
  constructor() {
    this.listeners = new Map();
    this.messageQueue = [];
    this.maxQueueSize = 100;
    this.enableLogging = false;
  }

  /**
   * Enregistrer un listener
   */
  on(event, callback) {
    if (typeof callback !== 'function') {
      console.error('[EventBus] Callback must be a function');
      return () => {};
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    this.listeners.get(event).push(callback);

    // Retourner fonction de cleanup
    return () => this.off(event, callback);
  }

  /**
   * Enregistrer un listener one-time
   */
  once(event, callback) {
    const wrapper = (data) => {
      callback(data);
      this.off(event, wrapper);
    };
    return this.on(event, wrapper);
  }

  /**
   * Désinscrire un listener
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return;

    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    
    if (index > -1) {
      callbacks.splice(index, 1);
    }

    // Cleanup si plus de listeners
    if (callbacks.length === 0) {
      this.listeners.delete(event);
    }
  }

  /**
   * Émettre un événement
   */
  emit(event, data = {}) {
    // Validation événement
    if (!this.validateEvent(event, data)) {
      console.error('[EventBus] Invalid event:', event);
      return false;
    }

    // Log si activé
    if (this.enableLogging) {
      console.log(`[EventBus] ${event}:`, data);
    }

    // Ajouter à la queue
    this.addToQueue(event, data);

    // Appeler listeners
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[EventBus] Error in listener for ${event}:`, error);
        }
      });
    }

    return true;
  }

  /**
   * Validation des événements
   */
  validateEvent(event, data) {
    // Event doit être string non-vide
    if (typeof event !== 'string' || event.trim() === '') {
      return false;
    }

    // Data doit être sérialisable
    try {
      JSON.stringify(data);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Ajouter à la queue d'événements
   */
  addToQueue(event, data) {
    this.messageQueue.push({
      event,
      data,
      timestamp: Date.now()
    });

    // Limiter taille queue
    if (this.messageQueue.length > this.maxQueueSize) {
      this.messageQueue.shift();
    }
  }

  /**
   * Récupérer historique événements
   */
  getHistory(event = null, limit = 10) {
    let history = [...this.messageQueue];

    if (event) {
      history = history.filter(msg => msg.event === event);
    }

    return history.slice(-limit);
  }

  /**
   * Nettoyer tous les listeners
   */
  clear() {
    this.listeners.clear();
    this.messageQueue = [];
  }

  /**
   * Statistiques
   */
  getStats() {
    const stats = {
      totalEvents: this.listeners.size,
      totalListeners: 0,
      queueSize: this.messageQueue.length,
      events: {}
    };

    this.listeners.forEach((callbacks, event) => {
      stats.totalListeners += callbacks.length;
      stats.events[event] = callbacks.length;
    });

    return stats;
  }
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NeuralEventBus;
}

// Événements prédéfinis pour référence
const NEURAL_EVENTS = {
  // Audio events
  TRACK_LOADED: 'track:loaded',
  AUDIO_TOGGLE: 'audio:toggle',
  AUDIO_PLAYING: 'audio:playing',
  AUDIO_STOPPED: 'audio:stopped',
  STEM_CHANGED: 'stem:changed',
  BPM_DETECTED: 'bpm:detected',
  
  // Mixer events
  CROSSFADER: 'mixer:crossfader',
  VOLUME_CHANGED: 'mixer:volume',
  EFFECT_TOGGLED: 'mixer:effect',
  
  // P2P events
  PEER_CONNECTED: 'p2p:connected',
  PEER_DISCONNECTED: 'p2p:disconnected',
  DATA_RECEIVED: 'p2p:data',
  
  // Innovation events
  INNOVATION_ENABLED: 'innovation:enabled',
  INNOVATION_DISABLED: 'innovation:disabled',
  AI_ANALYSIS_COMPLETE: 'ai:analysis',
  BLOCKCHAIN_MINTED: 'blockchain:mint',
  METAVERSE_UPDATED: 'metaverse:update',
  
  // Reference app events
  REF_STATE_CHANGED: 'ref:state',
  REF_ERROR: 'ref:error'
};

if (typeof window !== 'undefined') {
  window.NEURAL_EVENTS = NEURAL_EVENTS;
}
