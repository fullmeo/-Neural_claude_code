/**
 * Neural Bridge Core v1.0
 * Point d'entrée pour intégration innovations → neuralmix_enhanced_fixed.html
 */

class NeuralBridge {
  constructor() {
    this.referenceApp = null;
    this.innovations = new Map();
    this.eventBus = null;
    this.initialized = false;
    this.config = {
      safeMode: true,
      maxMemoryMB: 100,
      enableLogging: true
    };
  }

  /**
   * Initialisation - Détection et connexion à l'app de référence
   */
  async init(referenceApp = window.app) {
    if (this.initialized) {
      console.warn('[NeuralBridge] Already initialized');
      return false;
    }

    // Validation app de référence
    if (!this.validateReferenceApp(referenceApp)) {
      console.error('[NeuralBridge] Invalid reference app');
      return false;
    }

    this.referenceApp = referenceApp;
    
    // Initialiser event bus
    this.eventBus = new NeuralEventBus();
    
    // Injecter hooks non-invasifs
    this.injectHooks();
    
    // Créer UI panel
    this.createInnovationPanel();
    
    this.initialized = true;
    this.log('Neural Bridge initialized successfully');
    
    return true;
  }

  /**
   * Validation sécurisée de l'app de référence
   */
  validateReferenceApp(app) {
    const required = [
      'decks',
      'togglePlay',
      'loadTrack',
      'audioContext',
      'connectToPeer'
    ];

    return required.every(prop => app && typeof app[prop] !== 'undefined');
  }

  /**
   * Injection de hooks non-invasifs dans l'app existante
   */
  injectHooks() {
    const app = this.referenceApp;
    
    // Hook: Track load
    const originalLoadTrack = app.loadTrack;
    app.loadTrack = (deck, file) => {
      const result = originalLoadTrack.call(app, deck, file);
      this.eventBus.emit('track:loaded', { deck, file });
      return result;
    };

    // Hook: Play/Pause toggle
    const originalTogglePlay = app.togglePlay;
    app.togglePlay = (deck) => {
      const result = originalTogglePlay.call(app, deck);
      const deckData = app.decks[deck];
      // Safe check for audioElement existence
      const playing = deckData?.audioElement?.paused === false;
      this.eventBus.emit('audio:toggle', {
        deck,
        playing
      });
      return result;
    };

    // Hook: Crossfader change
    const originalUpdateCrossfader = app.updateCrossfader;
    if (originalUpdateCrossfader) {
      app.updateCrossfader = (value) => {
        const result = originalUpdateCrossfader.call(app, value);
        this.eventBus.emit('mixer:crossfader', { value });
        return result;
      };
    }

    // Hook: P2P connection
    const originalConnectToPeer = app.connectToPeer;
    if (originalConnectToPeer) {
      app.connectToPeer = async (peerId) => {
        const result = await originalConnectToPeer.call(app, peerId);
        this.eventBus.emit('p2p:connected', { peerId });
        return result;
      };
    }

    this.log('Hooks injected successfully');
  }

  /**
   * Enregistrement d'une innovation
   */
  registerInnovation(name, module) {
    if (this.innovations.has(name)) {
      console.warn(`[NeuralBridge] Innovation ${name} already registered`);
      return false;
    }

    // Validation module
    if (!module.init || typeof module.init !== 'function') {
      console.error(`[NeuralBridge] Invalid module ${name}: missing init()`);
      return false;
    }

    this.innovations.set(name, {
      module,
      enabled: false,
      instance: null
    });

    this.log(`Innovation registered: ${name}`);
    return true;
  }

  /**
   * Activation d'une innovation
   */
  async enableInnovation(name) {
    const innovation = this.innovations.get(name);
    if (!innovation) {
      console.error(`[NeuralBridge] Innovation ${name} not found`);
      return false;
    }

    if (innovation.enabled) {
      console.warn(`[NeuralBridge] Innovation ${name} already enabled`);
      return false;
    }

    try {
      // Initialiser module avec contexte bridge
      const context = this.createInnovationContext();
      innovation.instance = await innovation.module.init(context);
      innovation.enabled = true;

      // Émettre événement
      this.eventBus.emit('innovation:enabled', { name });
      this.log(`Innovation enabled: ${name}`);

      return true;

    } catch (error) {
      console.error(`[NeuralBridge] Failed to enable ${name}:`, error);
      return false;
    }
  }

  /**
   * Désactivation d'une innovation
   */
  async disableInnovation(name) {
    const innovation = this.innovations.get(name);
    if (!innovation || !innovation.enabled) {
      return false;
    }

    try {
      // Cleanup si méthode disponible
      if (innovation.instance?.cleanup) {
        await innovation.instance.cleanup();
      }

      innovation.enabled = false;
      innovation.instance = null;

      this.eventBus.emit('innovation:disabled', { name });
      this.log(`Innovation disabled: ${name}`);

      return true;

    } catch (error) {
      console.error(`[NeuralBridge] Failed to disable ${name}:`, error);
      return false;
    }
  }

  /**
   * Création contexte sécurisé pour innovations
   */
  createInnovationContext() {
    return {
      // Accès contrôlé à l'audio
      audioContext: this.referenceApp.audioContext,
      
      // Accès aux decks (lecture seule)
      getDecks: () => ({ ...this.referenceApp.decks }),
      
      // Event bus pour communication
      eventBus: this.eventBus,
      
      // Envoyer données vers référence
      sendToReference: (event, data) => {
        this.eventBus.emit(`ref:${event}`, data);
      },
      
      // Storage limité
      storage: {
        get: (key) => localStorage.getItem(`neural_${key}`),
        set: (key, value) => localStorage.setItem(`neural_${key}`, value)
      }
    };
  }

  /**
   * Création UI panel pour innovations
   */
  createInnovationPanel() {
    const panel = document.createElement('div');
    panel.id = 'neural-innovations-panel';
    panel.className = 'neural-panel';
    panel.innerHTML = `
      <style>
        .neural-panel {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: rgba(0,0,0,0.8);
          border: 1px solid #00ffff;
          border-radius: 8px;
          padding: 15px;
          z-index: 10000;
          min-width: 200px;
        }
        .neural-panel h3 {
          color: #00ffff;
          margin: 0 0 10px 0;
          font-size: 14px;
        }
        .neural-toggle {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 8px 0;
        }
        .neural-toggle label {
          color: white;
          font-size: 12px;
          flex: 1;
        }
        .neural-switch {
          width: 40px;
          height: 20px;
          background: #555;
          border-radius: 10px;
          cursor: pointer;
          position: relative;
          transition: background 0.3s;
        }
        .neural-switch.active {
          background: #00ffff;
        }
        .neural-switch::after {
          content: '';
          position: absolute;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          top: 2px;
          left: 2px;
          transition: left 0.3s;
        }
        .neural-switch.active::after {
          left: 22px;
        }
      </style>
      <h3>Neural Innovations</h3>
      <div id="neural-toggles"></div>
    `;

    document.body.appendChild(panel);
    this.updateInnovationToggles();
  }

  /**
   * Mise à jour toggles UI
   */
  updateInnovationToggles() {
    const container = document.getElementById('neural-toggles');
    if (!container) return;

    container.innerHTML = '';

    this.innovations.forEach((innovation, name) => {
      const toggle = document.createElement('div');
      toggle.className = 'neural-toggle';
      toggle.innerHTML = `
        <label>${name}</label>
        <div class="neural-switch ${innovation.enabled ? 'active' : ''}" 
             data-innovation="${name}"></div>
      `;

      const switchEl = toggle.querySelector('.neural-switch');
      switchEl.addEventListener('click', () => {
        if (innovation.enabled) {
          this.disableInnovation(name);
        } else {
          this.enableInnovation(name);
        }
        this.updateInnovationToggles();
      });

      container.appendChild(toggle);
    });
  }

  /**
   * Communication avec référence
   */
  sendToReference(event, data) {
    this.eventBus.emit(`ref:${event}`, data);
  }

  receiveFromReference(event, callback) {
    this.eventBus.on(event, callback);
  }

  /**
   * État global
   */
  getState() {
    return {
      initialized: this.initialized,
      innovations: Array.from(this.innovations.entries()).map(([name, inn]) => ({
        name,
        enabled: inn.enabled
      })),
      referenceApp: this.referenceApp ? 'connected' : 'disconnected'
    };
  }

  /**
   * Logging
   */
  log(message) {
    if (this.config.enableLogging) {
      console.log(`[NeuralBridge] ${message}`);
    }
  }
}

// Instance globale
window.NeuralBridge = new NeuralBridge();

// Export pour modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NeuralBridge;
}
