const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Votereum Contracts", function () {
  let VotereumFactory;
  let votereumFactory;
  let VoterVerification;
  let voterVerification;
  let Voting;
  let voting;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // Get the contract factories
    VotereumFactory = await ethers.getContractFactory("VotereumFactory");
    VoterVerification = await ethers.getContractFactory("VoterVerification");
    Voting = await ethers.getContractFactory("Voting");
    
    // Get signers (accounts)
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    
    // Deploy the contracts
    votereumFactory = await VotereumFactory.deploy();
    await votereumFactory.waitForDeployment();
    
    voterVerification = await VoterVerification.deploy(owner.address);
    await voterVerification.waitForDeployment();
  });

  describe("VotereumFactory", function () {
    it("Should deploy factory with the correct owner", async function () {
      expect(await votereumFactory.owner()).to.equal(owner.address);
    });

    it("Should create a new election", async function () {
      const tx = await votereumFactory.createElection("Test Election", "This is a test election");
      await tx.wait();
      
      const electionCount = await votereumFactory.getElectionCount();
      expect(electionCount).to.equal(1);
      
      const deployedElections = await votereumFactory.getDeployedElections();
      expect(deployedElections.length).to.equal(1);
      
      // Get the created election contract
      const electionAddress = deployedElections[0];
      const election = await Voting.attach(electionAddress);
      
      expect(await election.electionName()).to.equal("Test Election");
      expect(await election.electionDescription()).to.equal("This is a test election");
      expect(await election.owner()).to.equal(owner.address);
    });

    it("Should track elections by admin", async function () {
      // Create an election as owner
      await (await votereumFactory.createElection("Election 1", "Owner Election")).wait();
      
      // Create another election as addr1
      await (await votereumFactory.connect(addr1).createElection("Election 2", "Addr1 Election")).wait();
      
      const ownerElections = await votereumFactory.getAdminElections(owner.address);
      expect(ownerElections.length).to.equal(1);
      
      const addr1Elections = await votereumFactory.getAdminElections(addr1.address);
      expect(addr1Elections.length).to.equal(1);
      
      const totalElections = await votereumFactory.getElectionCount();
      expect(totalElections).to.equal(2);
    });
  });

  describe("VoterVerification", function () {
    it("Should register a voter", async function () {
      await voterVerification.connect(addr1).registerVoter("John Doe", "12345");
      
      const [name, isRegistered, isVerified] = await voterVerification.getVoterInfo(addr1.address);
      
      expect(name).to.equal("John Doe");
      expect(isRegistered).to.equal(true);
      expect(isVerified).to.equal(false);
      expect(await voterVerification.totalRegisteredVoters()).to.equal(1);
    });

    it("Should verify a voter", async function () {
      await voterVerification.connect(addr1).registerVoter("John Doe", "12345");
      await voterVerification.verifyVoter(addr1.address);
      
      const [, , isVerified] = await voterVerification.getVoterInfo(addr1.address);
      expect(isVerified).to.equal(true);
      expect(await voterVerification.totalVerifiedVoters()).to.equal(1);
      expect(await voterVerification.isVoterVerified(addr1.address)).to.equal(true);
    });

    it("Should not allow duplicate registrations", async function () {
      await voterVerification.connect(addr1).registerVoter("John Doe", "12345");
      
      await expect(
        voterVerification.connect(addr1).registerVoter("John Doe Again", "67890")
      ).to.be.revertedWith("Voter already registered");
      
      await expect(
        voterVerification.connect(addr2).registerVoter("Jane Doe", "12345")
      ).to.be.revertedWith("National ID already used");
    });
  });

  describe("Voting", function () {
    let electionAddress;
    let election;
    
    beforeEach(async function () {
      // Create a new election through the factory
      const tx = await votereumFactory.createElection("Test Voting", "Testing the voting contract");
      await tx.wait();
      
      // Get the election address
      const deployedElections = await votereumFactory.getDeployedElections();
      electionAddress = deployedElections[0];
      
      // Attach to the contract
      election = await Voting.attach(electionAddress);
      
      // Add candidates to the election
      await election.addCandidate("Candidate 1", "Party A", "http://example.com/image1.jpg");
      await election.addCandidate("Candidate 2", "Party B", "http://example.com/image2.jpg");
      
      // Register voters
      await election.registerVoter(addr1.address);
      await election.registerVoter(addr2.address);
    });
    
    it("Should add candidates correctly", async function () {
      const [id, name, party, imageUrl] = await election.getCandidate(1);
      
      expect(id).to.equal(1);
      expect(name).to.equal("Candidate 1");
      expect(party).to.equal("Party A");
      expect(imageUrl).to.equal("http://example.com/image1.jpg");
      expect(await election.candidateCount()).to.equal(2);
    });
    
    it("Should start an election", async function () {
      await election.startElection(60); // 60 minutes duration
      
      expect(await election.isActive()).to.equal(true);
      
      const startTime = await election.startTime();
      const endTime = await election.endTime();
      
      expect(endTime - startTime).to.equal(60 * 60); // 60 minutes in seconds
    });
    
    it("Should allow voting and count votes", async function () {
      await election.startElection(60);
      
      // Cast votes
      await election.connect(addr1).castVote(1);
      await election.connect(addr2).castVote(2);
      
      // Check vote counts
      const [, , , , voteCount1] = await election.getCandidate(1);
      const [, , , , voteCount2] = await election.getCandidate(2);
      
      expect(voteCount1).to.equal(1);
      expect(voteCount2).to.equal(1);
      expect(await election.totalVotes()).to.equal(2);
      
      // Check voter status
      expect((await election.voters(addr1.address)).hasVoted).to.equal(true);
      expect((await election.voters(addr1.address)).votedCandidateId).to.equal(1);
    });
    
    it("Should not allow double voting", async function () {
      await election.startElection(60);
      
      await election.connect(addr1).castVote(1);
      
      await expect(
        election.connect(addr1).castVote(2)
      ).to.be.revertedWith("Voter has already voted");
    });
    
    it("Should end the election and produce results", async function () {
      await election.startElection(60);
      
      // Cast votes
      await election.connect(addr1).castVote(1);
      await election.connect(addr2).castVote(2);
      
      // End election manually
      await election.endElection();
      
      expect(await election.isActive()).to.equal(false);
      
      // Get results
      const [ids, names, parties, voteCounts] = await election.getElectionResults();
      
      expect(ids.length).to.equal(2);
      expect(voteCounts[0]).to.equal(1);
      expect(voteCounts[1]).to.equal(1);
    });
  });
});