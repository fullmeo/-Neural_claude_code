// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PropheticSessionNFT
 * @dev NFT contract for minting DJ Cloudio prophetic sessions
 * Each session is a unique on-chain artefact with complete metadata
 */
contract PropheticSessionNFT is ERC721, ERC721URIStorage, Ownable {
    constructor() ERC721("DJ Cloudio Prophetic Session", "PROPHECY") Ownable(msg.sender) {}

    uint256 private _tokenIdCounter;

    // Session metadata structure
    struct SessionMetadata {
        string sessionId;
        address dj;
        uint256 timestamp;
        uint256 duration;
        uint16 totalTracks;
        uint16 totalTransitions;
        uint16 totalRituals;
        string storyArc;
        bool propheticMode;
        string ipfsHash;
    }

    // Mappings
    mapping(uint256 => SessionMetadata) public sessionData;
    mapping(string => uint256) public sessionIdToTokenId;
    mapping(address => uint256[]) public djSessions;

    // Events
    event SessionMinted(
        uint256 indexed tokenId,
        string sessionId,
        address indexed dj,
        address indexed recipient,
        string ipfsHash
    );

    event SessionUpdated(
        uint256 indexed tokenId,
        string newIpfsHash
    );

    /**
     * @dev Mint a new session NFT
     * @param _recipient Address to receive the NFT
     * @param _sessionId Unique session identifier
     * @param _duration Session duration in seconds
     * @param _totalTracks Total tracks played
     * @param _totalTransitions Total transitions executed
     * @param _totalRituals Total rituals performed
     * @param _storyArc Narrative arc name
     * @param _propheticMode Whether prophetic mode was active
     * @param _ipfsHash IPFS hash of full metadata
     * @param _tokenURI Token URI (IPFS URL)
     */
    function mintSession(
        address _recipient,
        string memory _sessionId,
        uint256 _duration,
        uint16 _totalTracks,
        uint16 _totalTransitions,
        uint16 _totalRituals,
        string memory _storyArc,
        bool _propheticMode,
        string memory _ipfsHash,
        string memory _tokenURI
    ) external returns (uint256) {
        require(sessionIdToTokenId[_sessionId] == 0, "Session already minted");
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        // Mint NFT
        _safeMint(_recipient, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        // Store session data
        sessionData[tokenId] = SessionMetadata({
            sessionId: _sessionId,
            dj: msg.sender,
            timestamp: block.timestamp,
            duration: _duration,
            totalTracks: _totalTracks,
            totalTransitions: _totalTransitions,
            totalRituals: _totalRituals,
            storyArc: _storyArc,
            propheticMode: _propheticMode,
            ipfsHash: _ipfsHash
        });

        sessionIdToTokenId[_sessionId] = tokenId;
        djSessions[msg.sender].push(tokenId);

        emit SessionMinted(tokenId, _sessionId, msg.sender, _recipient, _ipfsHash);

        return tokenId;
    }

    /**
     * @dev Update session metadata (only by DJ)
     * Allows updating IPFS hash for metadata corrections
     * @param _tokenId Token ID
     * @param _newIpfsHash New IPFS hash
     * @param _newTokenURI New token URI
     */
    function updateSessionMetadata(
        uint256 _tokenId,
        string memory _newIpfsHash,
        string memory _newTokenURI
    ) external {
        SessionMetadata storage session = sessionData[_tokenId];
        require(session.dj == msg.sender, "Only DJ can update");
        require(bytes(_newIpfsHash).length > 0, "IPFS hash required");

        session.ipfsHash = _newIpfsHash;
        _setTokenURI(_tokenId, _newTokenURI);

        emit SessionUpdated(_tokenId, _newIpfsHash);
    }

    /**
     * @dev Get session metadata
     * @param _tokenId Token ID
     */
    function getSessionMetadata(uint256 _tokenId) external view returns (
        string memory sessionId,
        address dj,
        uint256 timestamp,
        uint256 duration,
        uint16 totalTracks,
        uint16 totalTransitions,
        uint16 totalRituals,
        string memory storyArc,
        bool propheticMode,
        string memory ipfsHash
    ) {
        SessionMetadata memory session = sessionData[_tokenId];
        return (
            session.sessionId,
            session.dj,
            session.timestamp,
            session.duration,
            session.totalTracks,
            session.totalTransitions,
            session.totalRituals,
            session.storyArc,
            session.propheticMode,
            session.ipfsHash
        );
    }

    /**
     * @dev Get all sessions by DJ
     * @param _dj DJ address
     */
    function getDJSessions(address _dj) external view returns (uint256[] memory) {
        return djSessions[_dj];
    }

    /**
     * @dev Get token ID by session ID
     * @param _sessionId Session ID
     */
    function getTokenIdBySessionId(string memory _sessionId) external view returns (uint256) {
        uint256 tokenId = sessionIdToTokenId[_sessionId];
        require(tokenId != 0 || keccak256(bytes(sessionData[0].sessionId)) == keccak256(bytes(_sessionId)), "Session not found");
        return tokenId;
    }

    /**
     * @dev Get total minted sessions
     */
    function totalSessions() external view returns (uint256) {
        return _tokenIdCounter;
    }

    // Override functions required by Solidity
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
