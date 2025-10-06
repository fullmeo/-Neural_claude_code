/**
 * 🌐 Neural Web3 Real Connector
 *
 * REAL Web3 integration with ethers.js for DJ Cloudio
 * Replaces mock implementation with actual blockchain interactions
 */

// Import ethers from CDN (in HTML) or use: import { ethers } from 'ethers';
// For now, assumes ethers is loaded globally

class NeuralWeb3Real {
    constructor(eventBus) {
        this.eventBus = eventBus;

        // State
        this.provider = null;
        this.signer = null;
        this.account = null;
        this.chainId = null;
        this.connected = false;

        // Contracts
        this.contracts = {
            dao: null,
            nft: null
        };

        // Contract addresses (will be set after deployment)
        this.addresses = {
            dao: null,  // Set after deployment
            nft: null   // Set after deployment
        };

        // ABIs (loaded from compiled contracts)
        this.abis = {
            dao: null,
            nft: null
        };

        console.log('[NeuralWeb3Real] ⚡ Initialized with ethers.js');
    }

    /**
     * Load contract ABIs from JSON files
     */
    async loadABIs() {
        try {
            // Load RitualDAO ABI
            const daoResponse = await fetch('./contracts/artifacts/contracts/RitualDAO.sol/RitualDAO.json');
            const daoArtifact = await daoResponse.json();
            this.abis.dao = daoArtifact.abi;

            // Load PropheticSessionNFT ABI
            const nftResponse = await fetch('./contracts/artifacts/contracts/PropheticSessionNFT.sol/PropheticSessionNFT.json');
            const nftArtifact = await nftResponse.json();
            this.abis.nft = nftArtifact.abi;

            console.log('[NeuralWeb3Real] ✅ ABIs loaded successfully');
            return true;
        } catch (error) {
            console.error('[NeuralWeb3Real] ❌ Failed to load ABIs:', error);
            this.eventBus.emit('web3:error', {
                action: 'loadABIs',
                error: error.message
            });
            return false;
        }
    }

    /**
     * Set contract addresses (after deployment)
     */
    setContractAddresses(daoAddress, nftAddress) {
        this.addresses.dao = daoAddress;
        this.addresses.nft = nftAddress;
        console.log('[NeuralWeb3Real] 📝 Contract addresses set:', this.addresses);
    }

    /**
     * Connect wallet (MetaMask)
     */
    async connectWallet() {
        try {
            // Check if MetaMask is installed
            if (typeof window.ethereum === 'undefined') {
                throw new Error('MetaMask is not installed. Please install MetaMask to use Web3 features.');
            }

            console.log('[NeuralWeb3Real] 🔗 Connecting to MetaMask...');

            // Create provider
            this.provider = new ethers.BrowserProvider(window.ethereum);

            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.account = accounts[0];

            // Get signer
            this.signer = await this.provider.getSigner();

            // Get network
            const network = await this.provider.getNetwork();
            this.chainId = Number(network.chainId);

            // Get balance
            const balance = await this.provider.getBalance(this.account);
            const balanceEth = ethers.formatEther(balance);

            this.connected = true;

            console.log('[NeuralWeb3Real] ✅ Wallet connected:', {
                account: this.account,
                chainId: this.chainId,
                balance: balanceEth
            });

            // Initialize contracts if addresses are set
            if (this.addresses.dao && this.addresses.nft) {
                await this.initializeContracts();
            }

            // Listen to account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                this.handleAccountsChanged(accounts);
            });

            // Listen to chain changes
            window.ethereum.on('chainChanged', (chainId) => {
                window.location.reload(); // Recommended by MetaMask
            });

            this.eventBus.emit('web3:connected', {
                account: this.account,
                chainId: this.chainId,
                balance: balanceEth,
                network: this.getNetworkName(this.chainId)
            });

            return {
                account: this.account,
                chainId: this.chainId,
                balance: balanceEth
            };

        } catch (error) {
            console.error('[NeuralWeb3Real] ❌ Connection failed:', error);
            this.eventBus.emit('web3:error', {
                action: 'connectWallet',
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Initialize contract instances
     */
    async initializeContracts() {
        try {
            if (!this.abis.dao || !this.abis.nft) {
                await this.loadABIs();
            }

            if (!this.signer) {
                throw new Error('Wallet not connected');
            }

            // Initialize DAO contract
            if (this.addresses.dao) {
                this.contracts.dao = new ethers.Contract(
                    this.addresses.dao,
                    this.abis.dao,
                    this.signer
                );
                console.log('[NeuralWeb3Real] ✅ DAO contract initialized');
            }

            // Initialize NFT contract
            if (this.addresses.nft) {
                this.contracts.nft = new ethers.Contract(
                    this.addresses.nft,
                    this.abis.nft,
                    this.signer
                );
                console.log('[NeuralWeb3Real] ✅ NFT contract initialized');
            }

            this.eventBus.emit('web3:contracts:ready', {
                dao: !!this.contracts.dao,
                nft: !!this.contracts.nft
            });

        } catch (error) {
            console.error('[NeuralWeb3Real] ❌ Contract initialization failed:', error);
            this.eventBus.emit('web3:error', {
                action: 'initializeContracts',
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Handle account changes
     */
    handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            // User disconnected wallet
            this.disconnect();
        } else if (accounts[0] !== this.account) {
            // User switched account
            this.account = accounts[0];
            console.log('[NeuralWeb3Real] 🔄 Account changed:', this.account);
            this.eventBus.emit('web3:account:changed', { account: this.account });
            window.location.reload(); // Reload to reinitialize with new account
        }
    }

    /**
     * Disconnect wallet
     */
    disconnect() {
        this.provider = null;
        this.signer = null;
        this.account = null;
        this.chainId = null;
        this.connected = false;
        this.contracts.dao = null;
        this.contracts.nft = null;

        console.log('[NeuralWeb3Real] 🔌 Wallet disconnected');
        this.eventBus.emit('web3:disconnected', {});
    }

    /**
     * Get network name from chain ID
     */
    getNetworkName(chainId) {
        const networks = {
            1: 'Ethereum Mainnet',
            8453: 'Base Mainnet',
            84532: 'Base Sepolia',
            11155111: 'Sepolia',
            137: 'Polygon',
            80001: 'Mumbai'
        };
        return networks[chainId] || `Unknown (${chainId})`;
    }

    /**
     * Check if on correct network
     */
    async checkNetwork(expectedChainId = 84532) { // Default to Base Sepolia
        if (this.chainId !== expectedChainId) {
            try {
                // Try to switch network
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: ethers.toQuantity(expectedChainId) }],
                });
                return true;
            } catch (switchError) {
                // Network doesn't exist, try to add it
                if (switchError.code === 4902 && expectedChainId === 84532) {
                    await this.addBaseSepoliaNetwork();
                    return true;
                }
                throw switchError;
            }
        }
        return true;
    }

    /**
     * Add Base Sepolia network to MetaMask
     */
    async addBaseSepoliaNetwork() {
        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: '0x14a34', // 84532 in hex
                    chainName: 'Base Sepolia',
                    nativeCurrency: {
                        name: 'Ethereum',
                        symbol: 'ETH',
                        decimals: 18
                    },
                    rpcUrls: ['https://sepolia.base.org'],
                    blockExplorerUrls: ['https://sepolia.basescan.org']
                }]
            });
            console.log('[NeuralWeb3Real] ✅ Base Sepolia network added');
        } catch (error) {
            console.error('[NeuralWeb3Real] ❌ Failed to add network:', error);
            throw error;
        }
    }

    /**
     * DAO: Create Ritual Proposal
     */
    async createRitualProposal(eventName, votingDuration = 86400) {
        try {
            if (!this.contracts.dao) {
                throw new Error('DAO contract not initialized');
            }

            console.log('[NeuralWeb3Real] 📝 Creating proposal:', eventName);

            const tx = await this.contracts.dao.createRitualProposal(
                eventName,
                votingDuration
            );

            console.log('[NeuralWeb3Real] ⏳ Waiting for confirmation...');
            const receipt = await tx.wait();

            // Extract proposal ID from events
            const event = receipt.logs.find(log => {
                try {
                    const parsed = this.contracts.dao.interface.parseLog(log);
                    return parsed.name === 'ProposalCreated';
                } catch {
                    return false;
                }
            });

            const proposalId = event ? Number(this.contracts.dao.interface.parseLog(event).args[0]) : 0;

            console.log('[NeuralWeb3Real] ✅ Proposal created:', proposalId);

            this.eventBus.emit('dao:proposal:created', {
                proposalId,
                eventName,
                txHash: receipt.hash
            });

            return { proposalId, txHash: receipt.hash };

        } catch (error) {
            console.error('[NeuralWeb3Real] ❌ Create proposal failed:', error);
            this.eventBus.emit('web3:error', {
                action: 'createRitualProposal',
                error: error.message
            });
            throw error;
        }
    }

    /**
     * DAO: Cast Vote
     */
    async castVote(proposalId, ritualId) {
        try {
            if (!this.contracts.dao) {
                throw new Error('DAO contract not initialized');
            }

            console.log('[NeuralWeb3Real] 🗳️ Casting vote:', { proposalId, ritualId });

            const tx = await this.contracts.dao.castVote(proposalId, ritualId);

            console.log('[NeuralWeb3Real] ⏳ Waiting for confirmation...');
            const receipt = await tx.wait();

            console.log('[NeuralWeb3Real] ✅ Vote cast successfully');

            this.eventBus.emit('dao:vote:cast', {
                proposalId,
                ritualId,
                txHash: receipt.hash
            });

            return { txHash: receipt.hash };

        } catch (error) {
            console.error('[NeuralWeb3Real] ❌ Cast vote failed:', error);
            this.eventBus.emit('web3:error', {
                action: 'castVote',
                error: error.message
            });
            throw error;
        }
    }

    /**
     * DAO: Finalize Proposal
     */
    async finalizeProposal(proposalId) {
        try {
            if (!this.contracts.dao) {
                throw new Error('DAO contract not initialized');
            }

            console.log('[NeuralWeb3Real] 🏁 Finalizing proposal:', proposalId);

            const tx = await this.contracts.dao.finalizeProposal(proposalId);

            console.log('[NeuralWeb3Real] ⏳ Waiting for confirmation...');
            const receipt = await tx.wait();

            // Extract winning ritual from events
            const event = receipt.logs.find(log => {
                try {
                    const parsed = this.contracts.dao.interface.parseLog(log);
                    return parsed.name === 'ProposalFinalized';
                } catch {
                    return false;
                }
            });

            const winningRitual = event ? Number(this.contracts.dao.interface.parseLog(event).args[1]) : 0;

            console.log('[NeuralWeb3Real] ✅ Proposal finalized. Winner:', winningRitual);

            this.eventBus.emit('dao:proposal:finalized', {
                proposalId,
                winningRitual,
                txHash: receipt.hash
            });

            return { winningRitual, txHash: receipt.hash };

        } catch (error) {
            console.error('[NeuralWeb3Real] ❌ Finalize proposal failed:', error);
            this.eventBus.emit('web3:error', {
                action: 'finalizeProposal',
                error: error.message
            });
            throw error;
        }
    }

    /**
     * NFT: Mint Session
     */
    async mintSession(sessionMetadata) {
        try {
            if (!this.contracts.nft) {
                throw new Error('NFT contract not initialized');
            }

            console.log('[NeuralWeb3Real] 🎨 Minting session NFT:', sessionMetadata.sessionId);

            const tx = await this.contracts.nft.mintSession(
                sessionMetadata.recipient || this.account,
                sessionMetadata.sessionId,
                sessionMetadata.duration,
                sessionMetadata.totalTracks,
                sessionMetadata.totalTransitions,
                sessionMetadata.totalRituals,
                sessionMetadata.storyArc,
                sessionMetadata.propheticMode,
                sessionMetadata.ipfsHash,
                sessionMetadata.tokenURI
            );

            console.log('[NeuralWeb3Real] ⏳ Waiting for confirmation...');
            const receipt = await tx.wait();

            // Extract token ID from events
            const event = receipt.logs.find(log => {
                try {
                    const parsed = this.contracts.nft.interface.parseLog(log);
                    return parsed.name === 'SessionMinted';
                } catch {
                    return false;
                }
            });

            const tokenId = event ? Number(this.contracts.nft.interface.parseLog(event).args[0]) : 0;

            console.log('[NeuralWeb3Real] ✅ Session NFT minted. Token ID:', tokenId);

            this.eventBus.emit('nft:minted', {
                tokenId,
                sessionId: sessionMetadata.sessionId,
                txHash: receipt.hash
            });

            return { tokenId, txHash: receipt.hash };

        } catch (error) {
            console.error('[NeuralWeb3Real] ❌ Mint session failed:', error);
            this.eventBus.emit('web3:error', {
                action: 'mintSession',
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Get proposal details
     */
    async getProposal(proposalId) {
        try {
            if (!this.contracts.dao) {
                throw new Error('DAO contract not initialized');
            }

            const proposal = await this.contracts.dao.proposals(proposalId);

            return {
                eventName: proposal.eventName,
                creator: proposal.creator,
                startTime: Number(proposal.startTime),
                endTime: Number(proposal.endTime),
                executed: proposal.executed,
                winningRitual: Number(proposal.winningRitual)
            };

        } catch (error) {
            console.error('[NeuralWeb3Real] ❌ Get proposal failed:', error);
            throw error;
        }
    }

    /**
     * Get session metadata
     */
    async getSessionMetadata(tokenId) {
        try {
            if (!this.contracts.nft) {
                throw new Error('NFT contract not initialized');
            }

            const metadata = await this.contracts.nft.getSessionMetadata(tokenId);

            return {
                sessionId: metadata[0],
                dj: metadata[1],
                timestamp: Number(metadata[2]),
                duration: Number(metadata[3]),
                totalTracks: Number(metadata[4]),
                totalTransitions: Number(metadata[5]),
                totalRituals: Number(metadata[6]),
                storyArc: metadata[7],
                propheticMode: metadata[8],
                ipfsHash: metadata[9]
            };

        } catch (error) {
            console.error('[NeuralWeb3Real] ❌ Get session metadata failed:', error);
            throw error;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NeuralWeb3Real;
}
