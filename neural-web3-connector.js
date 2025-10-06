/**
 * Neural Web3 Connector - Blockchain Integration
 *
 * Connects DJ Cloudio to Web3 for DAO voting and NFT minting.
 * Supports Ethereum, Polygon, and other EVM-compatible chains.
 *
 * @version 1.0.0
 * @requires neural-event-bus.js
 */

const NeuralWeb3Connector = {
    name: 'Web3 Connector',
    version: '1.0.0',

    // Module state
    initialized: false,
    eventBus: null,

    // Web3 state
    provider: null,
    signer: null,
    connected: false,
    account: null,
    chainId: null,
    balance: '0',

    // Contract addresses (configurable per chain)
    contracts: {
        // Ethereum Mainnet
        1: {
            dao: '0x0000000000000000000000000000000000000000', // TODO: Deploy DAO contract
            nft: '0x0000000000000000000000000000000000000000'  // TODO: Deploy NFT contract
        },
        // Polygon
        137: {
            dao: '0x0000000000000000000000000000000000000000',
            nft: '0x0000000000000000000000000000000000000000'
        },
        // Sepolia (Testnet)
        11155111: {
            dao: '0x0000000000000000000000000000000000000000',
            nft: '0x0000000000000000000000000000000000000000'
        }
    },

    // Supported chains
    chains: {
        1: { name: 'Ethereum', symbol: 'ETH', rpc: 'https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY' },
        137: { name: 'Polygon', symbol: 'MATIC', rpc: 'https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY' },
        11155111: { name: 'Sepolia', symbol: 'SepoliaETH', rpc: 'https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY' }
    },

    /**
     * Initialize Web3 Connector
     */
    async init(context) {
        console.log('[Web3 Connector] Initializing...');

        this.eventBus = context.eventBus;

        // Check for Web3 provider (MetaMask, etc.)
        if (typeof window.ethereum !== 'undefined') {
            console.log('[Web3 Connector] Web3 provider detected');
            this.provider = window.ethereum;
        } else {
            console.warn('[Web3 Connector] No Web3 provider found - features will be limited');
            this.provider = null;
        }

        this.setupEventListeners();

        this.initialized = true;
        console.log('[Web3 Connector] Initialized successfully');

        return { status: 'ready', hasProvider: !!this.provider };
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        if (!this.provider) return;

        // Listen for account changes
        this.provider.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
                this.disconnect();
            } else {
                this.account = accounts[0];
                this.eventBus.emit('web3:account-changed', { account: this.account });
                console.log('[Web3 Connector] Account changed:', this.account);
            }
        });

        // Listen for chain changes
        this.provider.on('chainChanged', (chainId) => {
            this.chainId = parseInt(chainId, 16);
            this.eventBus.emit('web3:chain-changed', { chainId: this.chainId });
            console.log('[Web3 Connector] Chain changed:', this.chainId);
            window.location.reload(); // Recommended by MetaMask
        });

        // Listen for disconnect
        this.provider.on('disconnect', (error) => {
            this.disconnect();
            console.log('[Web3 Connector] Provider disconnected:', error);
        });

        console.log('[Web3 Connector] Event listeners registered');
    },

    /**
     * Connect wallet
     */
    async connectWallet() {
        if (!this.provider) {
            throw new Error('No Web3 provider available. Install MetaMask or similar wallet.');
        }

        try {
            console.log('[Web3 Connector] Requesting wallet connection...');

            // Request account access
            const accounts = await this.provider.request({
                method: 'eth_requestAccounts'
            });

            if (accounts.length === 0) {
                throw new Error('No accounts returned');
            }

            this.account = accounts[0];

            // Get chain ID
            const chainId = await this.provider.request({
                method: 'eth_chainId'
            });
            this.chainId = parseInt(chainId, 16);

            // Get balance
            const balance = await this.provider.request({
                method: 'eth_getBalance',
                params: [this.account, 'latest']
            });
            this.balance = (parseInt(balance, 16) / 1e18).toFixed(4);

            this.connected = true;

            this.eventBus.emit('web3:connected', {
                account: this.account,
                chainId: this.chainId,
                chainName: this.chains[this.chainId]?.name || 'Unknown',
                balance: this.balance
            });

            console.log('[Web3 Connector] ✓ Connected:', this.account);
            console.log('[Web3 Connector] Chain:', this.chains[this.chainId]?.name);
            console.log('[Web3 Connector] Balance:', this.balance, this.chains[this.chainId]?.symbol);

            return {
                account: this.account,
                chainId: this.chainId,
                balance: this.balance
            };

        } catch (error) {
            console.error('[Web3 Connector] Connection failed:', error);
            throw error;
        }
    },

    /**
     * Disconnect wallet
     */
    disconnect() {
        this.connected = false;
        this.account = null;
        this.chainId = null;
        this.balance = '0';

        this.eventBus.emit('web3:disconnected', {});
        console.log('[Web3 Connector] Disconnected');
    },

    /**
     * Switch to specific chain
     */
    async switchChain(chainId) {
        if (!this.provider) {
            throw new Error('No Web3 provider');
        }

        const chainHex = '0x' + chainId.toString(16);

        try {
            await this.provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainHex }]
            });

            console.log('[Web3 Connector] Switched to chain:', chainId);
        } catch (error) {
            // Chain not added, try to add it
            if (error.code === 4902) {
                await this.addChain(chainId);
            } else {
                throw error;
            }
        }
    },

    /**
     * Add new chain to wallet
     */
    async addChain(chainId) {
        const chain = this.chains[chainId];
        if (!chain) {
            throw new Error(`Chain ${chainId} not configured`);
        }

        const chainHex = '0x' + chainId.toString(16);

        await this.provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
                chainId: chainHex,
                chainName: chain.name,
                nativeCurrency: {
                    name: chain.symbol,
                    symbol: chain.symbol,
                    decimals: 18
                },
                rpcUrls: [chain.rpc]
            }]
        });

        console.log('[Web3 Connector] Added chain:', chain.name);
    },

    /**
     * Sign message
     */
    async signMessage(message) {
        if (!this.connected || !this.account) {
            throw new Error('Wallet not connected');
        }

        try {
            const signature = await this.provider.request({
                method: 'personal_sign',
                params: [message, this.account]
            });

            console.log('[Web3 Connector] Message signed');
            return signature;
        } catch (error) {
            console.error('[Web3 Connector] Signing failed:', error);
            throw error;
        }
    },

    /**
     * Get contract instance (simplified without ethers.js)
     */
    getContractAddress(type) {
        if (!this.chainId) {
            throw new Error('Not connected to any chain');
        }

        const address = this.contracts[this.chainId]?.[type];
        if (!address || address === '0x0000000000000000000000000000000000000000') {
            throw new Error(`${type} contract not deployed on chain ${this.chainId}`);
        }

        return address;
    },

    /**
     * Call contract view function (read-only)
     */
    async callContract(contractType, method, params = []) {
        if (!this.provider) {
            throw new Error('No Web3 provider');
        }

        const contractAddress = this.getContractAddress(contractType);

        // This is a simplified implementation
        // In production, use ethers.js or web3.js for proper ABI encoding
        console.log('[Web3 Connector] Calling contract:', contractAddress, method, params);

        // Return mock data for now
        return null;
    },

    /**
     * Send contract transaction
     */
    async sendTransaction(contractType, method, params = [], value = '0') {
        if (!this.connected) {
            throw new Error('Wallet not connected');
        }

        const contractAddress = this.getContractAddress(contractType);

        // This is a simplified implementation
        // In production, use ethers.js or web3.js for proper transaction encoding
        console.log('[Web3 Connector] Sending transaction:', contractAddress, method, params, value);

        const txHash = await this.provider.request({
            method: 'eth_sendTransaction',
            params: [{
                from: this.account,
                to: contractAddress,
                value: value,
                // data: encodedFunctionCall (requires ABI)
            }]
        });

        console.log('[Web3 Connector] Transaction sent:', txHash);
        this.eventBus.emit('web3:transaction-sent', { txHash });

        return txHash;
    },

    /**
     * Get current state
     */
    getState() {
        return {
            initialized: this.initialized,
            connected: this.connected,
            account: this.account,
            chainId: this.chainId,
            chainName: this.chains[this.chainId]?.name || 'Unknown',
            balance: this.balance,
            hasProvider: !!this.provider
        };
    },

    /**
     * Cleanup
     */
    cleanup() {
        console.log('[Web3 Connector] Cleaning up...');

        if (this.provider) {
            this.provider.removeAllListeners();
        }

        this.disconnect();
        this.initialized = false;

        this.eventBus.emit('web3:cleanup');
        console.log('[Web3 Connector] Cleanup complete');
    }
};

// Export for browser
if (typeof window !== 'undefined') {
    window.NeuralWeb3Connector = NeuralWeb3Connector;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NeuralWeb3Connector;
}
