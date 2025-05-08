// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title Voting
 * @dev Smart contract for managing an election with multiple candidates
 */
contract Voting is Ownable, ReentrancyGuard {
    struct Candidate {
        uint256 id;
        string name;
        string party;
        string imageUrl;
        uint256 voteCount;
    }

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint256 votedCandidateId;
    }

    // Election details
    string public electionName;
    string public electionDescription;
    uint256 public startTime;
    uint256 public endTime;
    bool public isActive;

    // Candidate management
    mapping(uint256 => Candidate) public candidates;
    uint256 public candidateCount;

    // Voter management
    mapping(address => Voter) public voters;
    uint256 public totalVotes;

    // Events
    event CandidateAdded(uint256 candidateId, string name, string party);
    event VoteCast(address indexed voter, uint256 candidateId);
    event ElectionStarted(uint256 startTime, uint256 endTime);
    event ElectionEnded(uint256 endTime, uint256 totalVotes);

    /**
     * @dev Constructor sets the election details and owner
     * @param _electionName Name of the election
     * @param _electionDescription Brief description of the election
     * @param _owner Address of the election administrator
     */
    constructor(
        string memory _electionName,
        string memory _electionDescription,
        address _owner
    ) {
        electionName = _electionName;
        electionDescription = _electionDescription;
        isActive = false;
        
        // Transfer ownership to the specified owner
        transferOwnership(_owner);
    }

    /**
     * @dev Adds a new candidate to the election
     * @param _name Name of the candidate
     * @param _party Political party of the candidate
     * @param _imageUrl URL to candidate's image/photo
     */
    function addCandidate(string memory _name, string memory _party, string memory _imageUrl) public onlyOwner {
        require(!isActive, "Cannot add candidate after election has started");
        
        candidateCount++;
        candidates[candidateCount] = Candidate({
            id: candidateCount,
            name: _name,
            party: _party,
            imageUrl: _imageUrl,
            voteCount: 0
        });
        
        emit CandidateAdded(candidateCount, _name, _party);
    }

    /**
     * @dev Registers a voter for the election
     * @param _voter Address of the voter to register
     */
    function registerVoter(address _voter) public onlyOwner {
        require(!voters[_voter].isRegistered, "Voter is already registered");
        
        voters[_voter].isRegistered = true;
        voters[_voter].hasVoted = false;
    }

    /**
     * @dev Starts the election with specified duration
     * @param _durationInMinutes Duration of the election in minutes
     */
    function startElection(uint256 _durationInMinutes) public onlyOwner {
        require(!isActive, "Election has already started");
        require(candidateCount > 1, "Need at least two candidates");
        
        startTime = block.timestamp;
        endTime = startTime + (_durationInMinutes * 1 minutes);
        isActive = true;
        
        emit ElectionStarted(startTime, endTime);
    }

    /**
     * @dev Allows a registered voter to cast their vote
     * @param _candidateId ID of the candidate being voted for
     */
    function castVote(uint256 _candidateId) public nonReentrant {
        require(isActive, "Election is not active");
        require(block.timestamp <= endTime, "Election has ended");
        require(voters[msg.sender].isRegistered, "Voter is not registered");
        require(!voters[msg.sender].hasVoted, "Voter has already voted");
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate ID");
        
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedCandidateId = _candidateId;
        
        candidates[_candidateId].voteCount++;
        totalVotes++;
        
        emit VoteCast(msg.sender, _candidateId);
    }

    /**
     * @dev Ends the election manually (before the scheduled end time)
     */
    function endElection() public onlyOwner {
        require(isActive, "Election is not active");
        
        isActive = false;
        endTime = block.timestamp;
        
        emit ElectionEnded(endTime, totalVotes);
    }

    /**
     * @dev Checks if the election has ended automatically
     * @return bool Whether the election has ended
     */
    function hasEnded() public view returns (bool) {
        return isActive && block.timestamp > endTime;
    }

    /**
     * @dev Gets details about a specific candidate
     * @param _candidateId ID of the candidate
     * @return id Candidate ID
     * @return name Candidate name
     * @return party Candidate party
     * @return imageUrl Candidate photo URL
     * @return voteCount Number of votes for this candidate
     */
    function getCandidate(uint256 _candidateId) public view returns (
        uint256 id,
        string memory name,
        string memory party,
        string memory imageUrl,
        uint256 voteCount
    ) {
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate ID");
        
        Candidate memory candidate = candidates[_candidateId];
        return (
            candidate.id,
            candidate.name,
            candidate.party,
            candidate.imageUrl,
            candidate.voteCount
        );
    }

    /**
     * @dev Gets the election results (all candidates with vote counts)
     * @return ids Array of candidate IDs
     * @return names Array of candidate names
     * @return parties Array of candidate parties
     * @return voteCounts Array of vote counts
     */
    function getElectionResults() public view returns (
        uint256[] memory ids,
        string[] memory names,
        string[] memory parties,
        uint256[] memory voteCounts
    ) {
        ids = new uint256[](candidateCount);
        names = new string[](candidateCount);
        parties = new string[](candidateCount);
        voteCounts = new uint256[](candidateCount);
        
        for (uint256 i = 1; i <= candidateCount; i++) {
            Candidate memory candidate = candidates[i];
            ids[i-1] = candidate.id;
            names[i-1] = candidate.name;
            parties[i-1] = candidate.party;
            voteCounts[i-1] = candidate.voteCount;
        }
        
        return (ids, names, parties, voteCounts);
    }
}