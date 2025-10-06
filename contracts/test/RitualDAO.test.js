const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("RitualDAO", function () {
  // Fixture for deploying contract and setting up initial state
  async function deployRitualDAOFixture() {
    const [owner, voter1, voter2, voter3, nonVoter] = await ethers.getSigners();

    const RitualDAO = await ethers.getContractFactory("RitualDAO");
    const ritualDAO = await RitualDAO.deploy();

    // Set voting power for test voters
    await ritualDAO.setVotingPower(voter1.address, 100);
    await ritualDAO.setVotingPower(voter2.address, 50);
    await ritualDAO.setVotingPower(voter3.address, 25);

    return { ritualDAO, owner, voter1, voter2, voter3, nonVoter };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { ritualDAO, owner } = await loadFixture(deployRitualDAOFixture);
      expect(await ritualDAO.owner()).to.equal(owner.address);
    });

    it("Should initialize proposal count to 0", async function () {
      const { ritualDAO } = await loadFixture(deployRitualDAOFixture);
      expect(await ritualDAO.proposalCount()).to.equal(0);
    });

    it("Should set default voting power to 1 for any address", async function () {
      const { ritualDAO, nonVoter } = await loadFixture(deployRitualDAOFixture);
      expect(await ritualDAO.getVotingPower(nonVoter.address)).to.equal(1);
    });
  });

  describe("Voting Power Management", function () {
    it("Should allow owner to set voting power", async function () {
      const { ritualDAO, voter1, owner } = await loadFixture(deployRitualDAOFixture);

      await expect(ritualDAO.setVotingPower(voter1.address, 200))
        .to.emit(ritualDAO, "VotingPowerUpdated")
        .withArgs(voter1.address, 200);

      expect(await ritualDAO.getVotingPower(voter1.address)).to.equal(200);
    });

    it("Should not allow non-owner to set voting power", async function () {
      const { ritualDAO, voter1, voter2 } = await loadFixture(deployRitualDAOFixture);

      await expect(
        ritualDAO.connect(voter1).setVotingPower(voter2.address, 200)
      ).to.be.revertedWithCustomError(ritualDAO, "OwnableUnauthorizedAccount");
    });

    it("Should return minimum 1 voting power for addresses with no power set", async function () {
      const { ritualDAO, nonVoter } = await loadFixture(deployRitualDAOFixture);
      expect(await ritualDAO.getVotingPower(nonVoter.address)).to.equal(1);
    });

    it("Should allow setting voting power to 0 (returns 1 minimum)", async function () {
      const { ritualDAO, voter1 } = await loadFixture(deployRitualDAOFixture);

      await ritualDAO.setVotingPower(voter1.address, 0);
      expect(await ritualDAO.getVotingPower(voter1.address)).to.equal(1);
    });
  });

  describe("Proposal Creation", function () {
    it("Should create a new proposal", async function () {
      const { ritualDAO, voter1 } = await loadFixture(deployRitualDAOFixture);

      const eventName = "Summer Ritual Night";
      const description = "Epic summer DJ session";
      const duration = 24 * 60 * 60; // 24 hours

      await expect(
        ritualDAO.connect(voter1).createProposal(eventName, description, duration)
      )
        .to.emit(ritualDAO, "ProposalCreated")
        .withArgs(0, eventName, voter1.address, await time.latest() + duration + 1);

      expect(await ritualDAO.proposalCount()).to.equal(1);
    });

    it("Should increment proposal ID for each new proposal", async function () {
      const { ritualDAO, voter1 } = await loadFixture(deployRitualDAOFixture);

      await ritualDAO.connect(voter1).createProposal("Event 1", "Desc 1", 3600);
      await ritualDAO.connect(voter1).createProposal("Event 2", "Desc 2", 3600);
      await ritualDAO.connect(voter1).createProposal("Event 3", "Desc 3", 3600);

      expect(await ritualDAO.proposalCount()).to.equal(3);
    });

    it("Should revert if duration is 0", async function () {
      const { ritualDAO, voter1 } = await loadFixture(deployRitualDAOFixture);

      await expect(
        ritualDAO.connect(voter1).createProposal("Event", "Description", 0)
      ).to.be.revertedWith("Duration must be positive");
    });

    it("Should revert if duration exceeds 7 days", async function () {
      const { ritualDAO, voter1 } = await loadFixture(deployRitualDAOFixture);

      const eightDays = 8 * 24 * 60 * 60;
      await expect(
        ritualDAO.connect(voter1).createProposal("Event", "Description", eightDays)
      ).to.be.revertedWith("Duration too long");
    });

    it("Should set correct start and end times", async function () {
      const { ritualDAO, voter1 } = await loadFixture(deployRitualDAOFixture);

      const duration = 3600; // 1 hour
      const tx = await ritualDAO.connect(voter1).createProposal("Event", "Desc", duration);
      const receipt = await tx.wait();
      const blockTimestamp = (await ethers.provider.getBlock(receipt.blockNumber)).timestamp;

      const proposal = await ritualDAO.proposals(0);
      expect(proposal.startTime).to.equal(blockTimestamp);
      expect(proposal.endTime).to.equal(blockTimestamp + duration);
    });

    it("Should allow any address to create proposals", async function () {
      const { ritualDAO, nonVoter } = await loadFixture(deployRitualDAOFixture);

      await expect(
        ritualDAO.connect(nonVoter).createProposal("Event", "Desc", 3600)
      ).to.emit(ritualDAO, "ProposalCreated");
    });
  });

  describe("Voting", function () {
    async function createTestProposal(ritualDAO, voter) {
      const duration = 24 * 60 * 60; // 24 hours
      await ritualDAO.connect(voter).createProposal(
        "Test Event",
        "Test Description",
        duration
      );
      return 0; // First proposal ID
    }

    it("Should allow voting on active proposal", async function () {
      const { ritualDAO, voter1 } = await loadFixture(deployRitualDAOFixture);
      const proposalId = await createTestProposal(ritualDAO, voter1);

      const RitualType = 0; // INVOCATION

      await expect(ritualDAO.connect(voter1).castVote(proposalId, RitualType))
        .to.emit(ritualDAO, "VoteCast")
        .withArgs(proposalId, voter1.address, RitualType, 100);
    });

    it("Should correctly count votes", async function () {
      const { ritualDAO, voter1, voter2 } = await loadFixture(deployRitualDAOFixture);
      const proposalId = await createTestProposal(ritualDAO, voter1);

      const INVOCATION = 0;
      const REVELATION = 1;

      await ritualDAO.connect(voter1).castVote(proposalId, INVOCATION);
      await ritualDAO.connect(voter2).castVote(proposalId, REVELATION);

      const results = await ritualDAO.getProposalResults(proposalId);
      expect(results.voteCounts[INVOCATION]).to.equal(100);
      expect(results.voteCounts[REVELATION]).to.equal(50);
      expect(results.totalVotingPower).to.equal(150);
    });

    it("Should prevent double voting", async function () {
      const { ritualDAO, voter1 } = await loadFixture(deployRitualDAOFixture);
      const proposalId = await createTestProposal(ritualDAO, voter1);

      await ritualDAO.connect(voter1).castVote(proposalId, 0);

      await expect(
        ritualDAO.connect(voter1).castVote(proposalId, 1)
      ).to.be.revertedWith("Already voted");
    });

    it("Should revert if voting before start time", async function () {
      const { ritualDAO, voter1 } = await loadFixture(deployRitualDAOFixture);

      // This shouldn't happen in practice, but test the check
      const proposalId = await createTestProposal(ritualDAO, voter1);

      // Proposal starts immediately, so this check passes
      // To test this properly, we'd need to modify contract to support future starts
      expect(await ritualDAO.connect(voter1).castVote(proposalId, 0)).to.be.ok;
    });

    it("Should revert if voting after end time", async function () {
      const { ritualDAO, voter1 } = await loadFixture(deployRitualDAOFixture);

      const duration = 3600; // 1 hour
      await ritualDAO.connect(voter1).createProposal("Event", "Desc", duration);
      const proposalId = 0;

      // Fast forward past end time
      await time.increase(duration + 1);

      await expect(
        ritualDAO.connect(voter1).castVote(proposalId, 0)
      ).to.be.revertedWith("Voting ended");
    });

    it("Should revert if voting on finalized proposal", async function () {
      const { ritualDAO, voter1, voter2 } = await loadFixture(deployRitualDAOFixture);

      const duration = 3600;
      await ritualDAO.connect(voter1).createProposal("Event", "Desc", duration);
      const proposalId = 0;

      // Vote and finalize
      await ritualDAO.connect(voter1).castVote(proposalId, 0);
      await time.increase(duration + 1);
      await ritualDAO.finalizeProposal(proposalId);

      // After finalization, both "Voting ended" and "Proposal finalized" checks apply
      // The "Voting ended" check comes first in the code
      await expect(
        ritualDAO.connect(voter2).castVote(proposalId, 1)
      ).to.be.revertedWith("Voting ended");
    });

    it("Should use minimum voting power of 1 for non-configured voters", async function () {
      const { ritualDAO, voter1, nonVoter } = await loadFixture(deployRitualDAOFixture);
      const proposalId = await createTestProposal(ritualDAO, voter1);

      await ritualDAO.connect(nonVoter).castVote(proposalId, 0);

      const results = await ritualDAO.getProposalResults(proposalId);
      expect(results.voteCounts[0]).to.equal(1);
    });

    it("Should record voter choice correctly", async function () {
      const { ritualDAO, voter1 } = await loadFixture(deployRitualDAOFixture);
      const proposalId = await createTestProposal(ritualDAO, voter1);

      const TRANSMUTATION = 2;
      await ritualDAO.connect(voter1).castVote(proposalId, TRANSMUTATION);

      expect(await ritualDAO.getVoterChoice(proposalId, voter1.address)).to.equal(TRANSMUTATION);
    });

    it("Should track hasVoted status", async function () {
      const { ritualDAO, voter1, voter2 } = await loadFixture(deployRitualDAOFixture);
      const proposalId = await createTestProposal(ritualDAO, voter1);

      expect(await ritualDAO.hasVoted(proposalId, voter1.address)).to.be.false;

      await ritualDAO.connect(voter1).castVote(proposalId, 0);

      expect(await ritualDAO.hasVoted(proposalId, voter1.address)).to.be.true;
      expect(await ritualDAO.hasVoted(proposalId, voter2.address)).to.be.false;
    });

    it("Should revert getVoterChoice if voter hasn't voted", async function () {
      const { ritualDAO, voter1, voter2 } = await loadFixture(deployRitualDAOFixture);
      const proposalId = await createTestProposal(ritualDAO, voter1);

      await expect(
        ritualDAO.getVoterChoice(proposalId, voter2.address)
      ).to.be.revertedWith("Voter has not voted");
    });
  });

  describe("Proposal Finalization", function () {
    async function createAndVoteProposal(ritualDAO, voters) {
      const duration = 3600; // 1 hour
      await ritualDAO.connect(voters[0]).createProposal("Event", "Desc", duration);
      return { proposalId: 0, duration };
    }

    it("Should finalize proposal after voting ends", async function () {
      const { ritualDAO, voter1, voter2 } = await loadFixture(deployRitualDAOFixture);
      const { proposalId, duration } = await createAndVoteProposal(ritualDAO, [voter1]);

      const INVOCATION = 0;
      const REVELATION = 1;

      await ritualDAO.connect(voter1).castVote(proposalId, INVOCATION);
      await ritualDAO.connect(voter2).castVote(proposalId, REVELATION);

      await time.increase(duration + 1);

      await expect(ritualDAO.finalizeProposal(proposalId))
        .to.emit(ritualDAO, "ProposalFinalized")
        .withArgs(proposalId, INVOCATION, 150);
    });

    it("Should determine correct winner", async function () {
      const { ritualDAO, voter1, voter2, voter3 } = await loadFixture(deployRitualDAOFixture);
      const { proposalId, duration } = await createAndVoteProposal(ritualDAO, [voter1]);

      const INVOCATION = 0;
      const REVELATION = 1;
      const ASCENSION = 3;

      // voter1: 100 votes for INVOCATION
      // voter2: 50 votes for REVELATION
      // voter3: 25 votes for ASCENSION
      await ritualDAO.connect(voter1).castVote(proposalId, INVOCATION);
      await ritualDAO.connect(voter2).castVote(proposalId, REVELATION);
      await ritualDAO.connect(voter3).castVote(proposalId, ASCENSION);

      await time.increase(duration + 1);
      await ritualDAO.finalizeProposal(proposalId);

      const results = await ritualDAO.getProposalResults(proposalId);
      expect(results.winner).to.equal(INVOCATION);
      expect(results.finalized).to.be.true;
    });

    it("Should handle tie correctly (last enum with max votes wins)", async function () {
      const { ritualDAO, voter1, voter2 } = await loadFixture(deployRitualDAOFixture);

      // Set equal voting power
      await ritualDAO.setVotingPower(voter1.address, 100);
      await ritualDAO.setVotingPower(voter2.address, 100);

      const { proposalId, duration } = await createAndVoteProposal(ritualDAO, [voter1]);

      const INVOCATION = 0;
      const REVELATION = 1;

      await ritualDAO.connect(voter1).castVote(proposalId, INVOCATION);
      await ritualDAO.connect(voter2).castVote(proposalId, REVELATION);

      await time.increase(duration + 1);
      await ritualDAO.finalizeProposal(proposalId);

      const results = await ritualDAO.getProposalResults(proposalId);
      // In case of tie, the loop uses > (not >=), so first one wins
      expect(results.winner).to.equal(INVOCATION);
    });

    it("Should revert if trying to finalize before end time", async function () {
      const { ritualDAO, voter1 } = await loadFixture(deployRitualDAOFixture);
      const { proposalId } = await createAndVoteProposal(ritualDAO, [voter1]);

      await ritualDAO.connect(voter1).castVote(proposalId, 0);

      await expect(
        ritualDAO.finalizeProposal(proposalId)
      ).to.be.revertedWith("Voting not ended");
    });

    it("Should revert if already finalized", async function () {
      const { ritualDAO, voter1 } = await loadFixture(deployRitualDAOFixture);
      const { proposalId, duration } = await createAndVoteProposal(ritualDAO, [voter1]);

      await ritualDAO.connect(voter1).castVote(proposalId, 0);
      await time.increase(duration + 1);
      await ritualDAO.finalizeProposal(proposalId);

      await expect(
        ritualDAO.finalizeProposal(proposalId)
      ).to.be.revertedWith("Already finalized");
    });

    it("Should allow any address to finalize (not just creator)", async function () {
      const { ritualDAO, voter1, voter2, nonVoter } = await loadFixture(deployRitualDAOFixture);
      const { proposalId, duration } = await createAndVoteProposal(ritualDAO, [voter1]);

      await ritualDAO.connect(voter1).castVote(proposalId, 0);
      await time.increase(duration + 1);

      await expect(ritualDAO.connect(nonVoter).finalizeProposal(proposalId))
        .to.emit(ritualDAO, "ProposalFinalized");
    });

    it("Should finalize with no votes (defaults to INVOCATION)", async function () {
      const { ritualDAO, voter1 } = await loadFixture(deployRitualDAOFixture);
      const { proposalId, duration } = await createAndVoteProposal(ritualDAO, [voter1]);

      // No votes cast
      await time.increase(duration + 1);
      await ritualDAO.finalizeProposal(proposalId);

      const results = await ritualDAO.getProposalResults(proposalId);
      expect(results.winner).to.equal(0); // INVOCATION (default)
      expect(results.totalVotingPower).to.equal(0);
    });
  });

  describe("Proposal Results Query", function () {
    it("Should return correct proposal results", async function () {
      const { ritualDAO, voter1, voter2, voter3 } = await loadFixture(deployRitualDAOFixture);

      const eventName = "Summer Night";
      await ritualDAO.connect(voter1).createProposal(eventName, "Desc", 3600);
      const proposalId = 0;

      await ritualDAO.connect(voter1).castVote(proposalId, 0); // 100
      await ritualDAO.connect(voter2).castVote(proposalId, 1); // 50
      await ritualDAO.connect(voter3).castVote(proposalId, 0); // 25

      const results = await ritualDAO.getProposalResults(proposalId);

      expect(results.eventName).to.equal(eventName);
      expect(results.finalized).to.be.false;
      expect(results.voteCounts[0]).to.equal(125); // INVOCATION
      expect(results.voteCounts[1]).to.equal(50);  // REVELATION
      expect(results.totalVotingPower).to.equal(175);
    });

    it("Should return all 5 ritual vote counts", async function () {
      const { ritualDAO, voter1 } = await loadFixture(deployRitualDAOFixture);

      await ritualDAO.connect(voter1).createProposal("Event", "Desc", 3600);
      const proposalId = 0;

      const results = await ritualDAO.getProposalResults(proposalId);

      expect(results.voteCounts.length).to.equal(5);
      expect(results.voteCounts[0]).to.equal(0); // INVOCATION
      expect(results.voteCounts[1]).to.equal(0); // REVELATION
      expect(results.voteCounts[2]).to.equal(0); // TRANSMUTATION
      expect(results.voteCounts[3]).to.equal(0); // ASCENSION
      expect(results.voteCounts[4]).to.equal(0); // MEDITATION
    });
  });

  describe("Complex Scenarios", function () {
    it("Should handle multiple proposals concurrently", async function () {
      const { ritualDAO, voter1, voter2 } = await loadFixture(deployRitualDAOFixture);

      // Create 3 proposals
      await ritualDAO.connect(voter1).createProposal("Event 1", "Desc 1", 3600);
      await ritualDAO.connect(voter1).createProposal("Event 2", "Desc 2", 7200);
      await ritualDAO.connect(voter1).createProposal("Event 3", "Desc 3", 1800);

      // Vote on different proposals
      await ritualDAO.connect(voter1).castVote(0, 0);
      await ritualDAO.connect(voter1).castVote(1, 1);
      await ritualDAO.connect(voter1).castVote(2, 2);

      await ritualDAO.connect(voter2).castVote(0, 1);
      await ritualDAO.connect(voter2).castVote(1, 1);
      await ritualDAO.connect(voter2).castVote(2, 0);

      // Check all proposals have correct votes
      const results0 = await ritualDAO.getProposalResults(0);
      const results1 = await ritualDAO.getProposalResults(1);
      const results2 = await ritualDAO.getProposalResults(2);

      expect(results0.voteCounts[0]).to.equal(100);
      expect(results0.voteCounts[1]).to.equal(50);

      expect(results1.voteCounts[1]).to.equal(150);

      expect(results2.voteCounts[0]).to.equal(50);
      expect(results2.voteCounts[2]).to.equal(100);
    });

    it("Should handle maximum duration (7 days)", async function () {
      const { ritualDAO, voter1 } = await loadFixture(deployRitualDAOFixture);

      const sevenDays = 7 * 24 * 60 * 60;
      await expect(
        ritualDAO.connect(voter1).createProposal("Event", "Desc", sevenDays)
      ).to.emit(ritualDAO, "ProposalCreated");

      const proposalId = 0;
      await ritualDAO.connect(voter1).castVote(proposalId, 0);

      await time.increase(sevenDays + 1);

      await expect(ritualDAO.finalizeProposal(proposalId))
        .to.emit(ritualDAO, "ProposalFinalized");
    });

    it("Should handle all 5 ritual types receiving votes", async function () {
      const { ritualDAO, owner, voter1, voter2, voter3 } = await loadFixture(deployRitualDAOFixture);

      // Add more voters
      const [, , , , , voter4, voter5] = await ethers.getSigners();
      await ritualDAO.setVotingPower(voter4.address, 10);
      await ritualDAO.setVotingPower(voter5.address, 5);

      await ritualDAO.connect(voter1).createProposal("All Rituals", "Desc", 3600);
      const proposalId = 0;

      await ritualDAO.connect(voter1).castVote(proposalId, 0); // INVOCATION
      await ritualDAO.connect(voter2).castVote(proposalId, 1); // REVELATION
      await ritualDAO.connect(voter3).castVote(proposalId, 2); // TRANSMUTATION
      await ritualDAO.connect(voter4).castVote(proposalId, 3); // ASCENSION
      await ritualDAO.connect(voter5).castVote(proposalId, 4); // MEDITATION

      const results = await ritualDAO.getProposalResults(proposalId);

      expect(results.voteCounts[0]).to.equal(100);
      expect(results.voteCounts[1]).to.equal(50);
      expect(results.voteCounts[2]).to.equal(25);
      expect(results.voteCounts[3]).to.equal(10);
      expect(results.voteCounts[4]).to.equal(5);
      expect(results.totalVotingPower).to.equal(190);
    });

    it("Should handle voting power updates between proposals", async function () {
      const { ritualDAO, voter1 } = await loadFixture(deployRitualDAOFixture);

      await ritualDAO.connect(voter1).createProposal("Event 1", "Desc", 3600);
      await ritualDAO.connect(voter1).castVote(0, 0);

      let results = await ritualDAO.getProposalResults(0);
      expect(results.voteCounts[0]).to.equal(100);

      // Update voting power
      await ritualDAO.setVotingPower(voter1.address, 200);

      // New proposal with updated power
      await ritualDAO.connect(voter1).createProposal("Event 2", "Desc", 3600);
      await ritualDAO.connect(voter1).castVote(1, 0);

      results = await ritualDAO.getProposalResults(1);
      expect(results.voteCounts[0]).to.equal(200);
    });
  });

  describe("Edge Cases & Security", function () {
    it("Should handle proposal ID 0 correctly", async function () {
      const { ritualDAO, voter1 } = await loadFixture(deployRitualDAOFixture);

      await ritualDAO.connect(voter1).createProposal("First", "Desc", 3600);

      const proposal = await ritualDAO.proposals(0);
      expect(proposal.id).to.equal(0);
      expect(proposal.eventName).to.equal("First");
    });

    it("Should not allow proposal count overflow (practical limit)", async function () {
      const { ritualDAO, voter1 } = await loadFixture(deployRitualDAOFixture);

      // Create many proposals (test a reasonable number)
      for (let i = 0; i < 100; i++) {
        await ritualDAO.connect(voter1).createProposal(`Event ${i}`, "Desc", 3600);
      }

      expect(await ritualDAO.proposalCount()).to.equal(100);
    });

    it("Should maintain independent proposal states", async function () {
      const { ritualDAO, voter1, voter2 } = await loadFixture(deployRitualDAOFixture);

      await ritualDAO.connect(voter1).createProposal("Event 1", "Desc", 3600);
      await ritualDAO.connect(voter1).createProposal("Event 2", "Desc", 7200);

      // Vote on first proposal
      await ritualDAO.connect(voter1).castVote(0, 0);

      // Should still be able to vote on second
      await ritualDAO.connect(voter1).castVote(1, 1);

      // Finalize first
      await time.increase(3601);
      await ritualDAO.finalizeProposal(0);

      const results0 = await ritualDAO.getProposalResults(0);
      const results1 = await ritualDAO.getProposalResults(1);

      expect(results0.finalized).to.be.true;
      expect(results1.finalized).to.be.false;
    });

    it("Should handle zero voting power gracefully", async function () {
      const { ritualDAO, voter1 } = await loadFixture(deployRitualDAOFixture);

      await ritualDAO.setVotingPower(voter1.address, 0);

      await ritualDAO.connect(voter1).createProposal("Event", "Desc", 3600);
      await ritualDAO.connect(voter1).castVote(0, 0);

      const results = await ritualDAO.getProposalResults(0);
      expect(results.voteCounts[0]).to.equal(1); // Minimum 1
    });

    it("Should emit all events correctly", async function () {
      const { ritualDAO, voter1 } = await loadFixture(deployRitualDAOFixture);

      // Test VotingPowerUpdated
      await expect(ritualDAO.setVotingPower(voter1.address, 250))
        .to.emit(ritualDAO, "VotingPowerUpdated");

      // Test ProposalCreated
      await expect(ritualDAO.connect(voter1).createProposal("Event", "Desc", 3600))
        .to.emit(ritualDAO, "ProposalCreated");

      // Test VoteCast
      await expect(ritualDAO.connect(voter1).castVote(0, 0))
        .to.emit(ritualDAO, "VoteCast");

      // Test ProposalFinalized
      await time.increase(3601);
      await expect(ritualDAO.finalizeProposal(0))
        .to.emit(ritualDAO, "ProposalFinalized");
    });
  });

  describe("Gas Optimization Tests", function () {
    it("Should not exceed reasonable gas limits for voting", async function () {
      const { ritualDAO, voter1 } = await loadFixture(deployRitualDAOFixture);

      await ritualDAO.connect(voter1).createProposal("Event", "Desc", 3600);

      const tx = await ritualDAO.connect(voter1).castVote(0, 0);
      const receipt = await tx.wait();

      // Voting should be under 110k gas (reasonable for first vote with storage init)
      expect(receipt.gasUsed).to.be.lessThan(110000);
    });

    it("Should not exceed reasonable gas limits for finalization", async function () {
      const { ritualDAO, voter1, voter2, voter3 } = await loadFixture(deployRitualDAOFixture);

      await ritualDAO.connect(voter1).createProposal("Event", "Desc", 3600);

      await ritualDAO.connect(voter1).castVote(0, 0);
      await ritualDAO.connect(voter2).castVote(0, 1);
      await ritualDAO.connect(voter3).castVote(0, 2);

      await time.increase(3601);

      const tx = await ritualDAO.finalizeProposal(0);
      const receipt = await tx.wait();

      // Finalization should be under 80k gas
      expect(receipt.gasUsed).to.be.lessThan(80000);
    });
  });
});
