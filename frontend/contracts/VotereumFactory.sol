// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Voting.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VotereumFactory
 * @dev A factory contract that deploys new Voting contracts for different elections
 */
contract VotereumFactory is Ownable {
    // Store all deployed elections
    address[] public deployedElections;
    
    // Track elections created by specific administrators
    mapping(address => address[]) public adminElections;
    
    // Events
    event ElectionCreated(address electionAddress, string electionName, address admin);

    /**
     * @dev Constructor sets the contract owner
     */
    constructor() {
        // Ownable constructor is called implicitly with msg.sender as owner
    }

    /**
     * @dev Creates a new election with the specified parameters
     * @param _electionName Name of the election
     * @param _electionDescription Brief description of the election
     * @return The address of the newly created Voting contract
     */
    function createElection(
        string memory _electionName, 
        string memory _electionDescription
    ) public returns (address) {
        address electionAdmin = msg.sender;
        
        // Deploy a new Voting contract with the caller as admin
        Voting newElection = new Voting(
            _electionName,
            _electionDescription,
            electionAdmin
        );
        
        // Add to our tracking arrays
        deployedElections.push(address(newElection));
        adminElections[electionAdmin].push(address(newElection));
        
        emit ElectionCreated(address(newElection), _electionName, electionAdmin);
        
        return address(newElection);
    }

    /**
     * @dev Gets all elections deployed by this factory
     * @return Array of election contract addresses
     */
    function getDeployedElections() public view returns (address[] memory) {
        return deployedElections;
    }
    
    /**
     * @dev Gets all elections created by a specific admin
     * @param _admin Address of the admin
     * @return Array of election contract addresses created by this admin
     */
    function getAdminElections(address _admin) public view returns (address[] memory) {
        return adminElections[_admin];
    }
    
    /**
     * @dev Gets the total number of elections created
     * @return Total number of elections
     */
    function getElectionCount() public view returns (uint256) {
        return deployedElections.length;
    }
}