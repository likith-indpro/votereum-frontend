// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VoterVerification
 * @dev Smart contract for verifying voter identities and eligibility
 */
contract VoterVerification is Ownable {
    struct Voter {
        bool isRegistered;
        string name;
        string nationalId; // Stored as a hash in real implementation
        bool isVerified;
        uint256 registrationTime;
    }

    mapping(address => Voter) public voters;
    mapping(string => bool) private usedNationalIds;
    
    uint256 public totalRegisteredVoters;
    uint256 public totalVerifiedVoters;
    
    event VoterRegistered(address indexed voterAddress, string name);
    event VoterVerified(address indexed voterAddress);

    /**
     * @dev Constructor sets the owner of the contract
     */
    constructor(address _owner) {
        // Set the contract owner
        transferOwnership(_owner);
    }

    /**
     * @dev Register a new voter
     * @param _name Voter's full name
     * @param _nationalId Voter's national ID (in a real implementation, this would be hashed)
     */
    function registerVoter(string memory _name, string memory _nationalId) public {
        require(!voters[msg.sender].isRegistered, "Voter already registered");
        require(!usedNationalIds[_nationalId], "National ID already used");
        
        voters[msg.sender] = Voter({
            isRegistered: true,
            name: _name,
            nationalId: _nationalId,
            isVerified: false,
            registrationTime: block.timestamp
        });
        
        usedNationalIds[_nationalId] = true;
        totalRegisteredVoters++;
        
        emit VoterRegistered(msg.sender, _name);
    }
    
    /**
     * @dev Verifies a voter (only callable by owner)
     * @param _voterAddress Address of the voter to verify
     */
    function verifyVoter(address _voterAddress) public onlyOwner {
        require(voters[_voterAddress].isRegistered, "Voter not registered");
        require(!voters[_voterAddress].isVerified, "Voter already verified");
        
        voters[_voterAddress].isVerified = true;
        totalVerifiedVoters++;
        
        emit VoterVerified(_voterAddress);
    }
    
    /**
     * @dev Checks if a voter is verified
     * @param _voterAddress Address of the voter to check
     * @return bool Whether the voter is verified
     */
    function isVoterVerified(address _voterAddress) public view returns (bool) {
        return voters[_voterAddress].isRegistered && voters[_voterAddress].isVerified;
    }
    
    /**
     * @dev Gets voter information
     * @param _voterAddress Address of the voter
     * @return name Voter name
     * @return isRegistered Registration status
     * @return isVerified Verification status
     * @return registrationTime When the voter registered
     */
    function getVoterInfo(address _voterAddress) public view returns (
        string memory name,
        bool isRegistered,
        bool isVerified,
        uint256 registrationTime
    ) {
        Voter memory voter = voters[_voterAddress];
        return (
            voter.name,
            voter.isRegistered,
            voter.isVerified,
            voter.registrationTime
        );
    }
    
    /**
     * @dev Batch verify multiple voters at once (gas optimization)
     * @param _voterAddresses Array of voter addresses to verify
     */
    function batchVerifyVoters(address[] memory _voterAddresses) public onlyOwner {
        for (uint256 i = 0; i < _voterAddresses.length; i++) {
            address voterAddress = _voterAddresses[i];
            
            if (voters[voterAddress].isRegistered && !voters[voterAddress].isVerified) {
                voters[voterAddress].isVerified = true;
                totalVerifiedVoters++;
                
                emit VoterVerified(voterAddress);
            }
        }
    }
}