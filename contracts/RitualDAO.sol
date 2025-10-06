// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title RitualDAO
 * @dev Decentralized voting system for DJ ritual selection
 * Community curates the prophetic journey through collective voting
 */
contract RitualDAO is Ownable, ReentrancyGuard {

    // Ritual types
    enum RitualType {
        INVOCATION,      // 🌙 Ethereal opening
        REVELATION,      // ⚡ Explosive climax
        TRANSMUTATION,   // 🔮 Transformative journey
        ASCENSION,       // 🌟 Uplifting rise
        MEDITATION       // 🧘 Contemplative closure
    }

    // Proposal structure
    struct Proposal {
        uint256 id;
        string eventName;
        string description;
        uint256 startTime;
        uint256 endTime;
        address creator;
        bool finalized;
        RitualType winner;
        uint256 totalVotingPower;
        mapping(RitualType => uint256) votes;
        mapping(address => bool) hasVoted;
        mapping(address => RitualType) voterChoice;
    }

    // State
    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    mapping(address => uint256) public votingPower;

    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        string eventName,
        address indexed creator,
        uint256 endTime
    );

    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        RitualType ritual,
        uint256 power
    );

    event ProposalFinalized(
        uint256 indexed proposalId,
        RitualType winner,
        uint256 totalVotes
    );

    event VotingPowerUpdated(
        address indexed member,
        uint256 newPower
    );

    /**
     * @dev Create new ritual proposal
     * @param _eventName Name of the event
     * @param _description Description of the ritual selection
     * @param _duration Voting duration in seconds
     */
    function createProposal(
        string memory _eventName,
        string memory _description,
        uint256 _duration
    ) external returns (uint256) {
        require(_duration > 0, "Duration must be positive");
        require(_duration <= 7 days, "Duration too long");

        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];

        proposal.id = proposalId;
        proposal.eventName = _eventName;
        proposal.description = _description;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + _duration;
        proposal.creator = msg.sender;
        proposal.finalized = false;

        emit ProposalCreated(proposalId, _eventName, msg.sender, proposal.endTime);

        return proposalId;
    }

    /**
     * @dev Cast vote on ritual proposal
     * @param _proposalId Proposal ID
     * @param _ritual Chosen ritual type
     */
    function castVote(uint256 _proposalId, RitualType _ritual) external {
        Proposal storage proposal = proposals[_proposalId];

        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!proposal.finalized, "Proposal finalized");
        require(!proposal.hasVoted[msg.sender], "Already voted");

        uint256 power = getVotingPower(msg.sender);
        require(power > 0, "No voting power");

        proposal.votes[_ritual] += power;
        proposal.totalVotingPower += power;
        proposal.hasVoted[msg.sender] = true;
        proposal.voterChoice[msg.sender] = _ritual;

        emit VoteCast(_proposalId, msg.sender, _ritual, power);
    }

    /**
     * @dev Finalize proposal and determine winner
     * @param _proposalId Proposal ID
     */
    function finalizeProposal(uint256 _proposalId) external {
        Proposal storage proposal = proposals[_proposalId];

        require(block.timestamp > proposal.endTime, "Voting not ended");
        require(!proposal.finalized, "Already finalized");

        // Find ritual with most votes
        RitualType winner = RitualType.INVOCATION;
        uint256 maxVotes = 0;

        for (uint i = 0; i < 5; i++) {
            RitualType ritual = RitualType(i);
            if (proposal.votes[ritual] > maxVotes) {
                maxVotes = proposal.votes[ritual];
                winner = ritual;
            }
        }

        proposal.winner = winner;
        proposal.finalized = true;

        emit ProposalFinalized(_proposalId, winner, proposal.totalVotingPower);
    }

    /**
     * @dev Get proposal results
     * @param _proposalId Proposal ID
     */
    function getProposalResults(uint256 _proposalId) external view returns (
        string memory eventName,
        bool finalized,
        RitualType winner,
        uint256[5] memory voteCounts,
        uint256 totalVotingPower
    ) {
        Proposal storage proposal = proposals[_proposalId];

        voteCounts[0] = proposal.votes[RitualType.INVOCATION];
        voteCounts[1] = proposal.votes[RitualType.REVELATION];
        voteCounts[2] = proposal.votes[RitualType.TRANSMUTATION];
        voteCounts[3] = proposal.votes[RitualType.ASCENSION];
        voteCounts[4] = proposal.votes[RitualType.MEDITATION];

        return (
            proposal.eventName,
            proposal.finalized,
            proposal.winner,
            voteCounts,
            proposal.totalVotingPower
        );
    }

    /**
     * @dev Set voting power for member (owner only)
     * In production, this would be based on token holdings
     * @param _member Member address
     * @param _power Voting power amount
     */
    function setVotingPower(address _member, uint256 _power) external onlyOwner {
        votingPower[_member] = _power;
        emit VotingPowerUpdated(_member, _power);
    }

    /**
     * @dev Get voting power for address
     * @param _member Member address
     */
    function getVotingPower(address _member) public view returns (uint256) {
        uint256 power = votingPower[_member];
        return power > 0 ? power : 1; // Minimum 1 vote per address
    }

    /**
     * @dev Check if address has voted
     * @param _proposalId Proposal ID
     * @param _voter Voter address
     */
    function hasVoted(uint256 _proposalId, address _voter) external view returns (bool) {
        return proposals[_proposalId].hasVoted[_voter];
    }

    /**
     * @dev Get voter's choice
     * @param _proposalId Proposal ID
     * @param _voter Voter address
     */
    function getVoterChoice(uint256 _proposalId, address _voter) external view returns (RitualType) {
        require(proposals[_proposalId].hasVoted[_voter], "Voter has not voted");
        return proposals[_proposalId].voterChoice[_voter];
    }
}
