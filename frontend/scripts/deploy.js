// We import the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import pkg from 'hardhat';
const { ethers } = pkg;
import fs from "fs";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract factory for VotereumFactory
  const VotereumFactory = await ethers.getContractFactory("VotereumFactory");
  
  console.log("Deploying VotereumFactory...");
  const votereumFactory = await VotereumFactory.deploy();
  await votereumFactory.waitForDeployment();
  
  console.log("VotereumFactory deployed to:", await votereumFactory.getAddress());

  // Optional: Deploy VoterVerification contract directly
  const VoterVerification = await ethers.getContractFactory("VoterVerification");
  console.log("Deploying VoterVerification...");
  
  // Get the deployer address to use as owner
  const [deployer] = await ethers.getSigners();
  const voterVerification = await VoterVerification.deploy(deployer.address);
  
  await voterVerification.waitForDeployment();
  console.log("VoterVerification deployed to:", await voterVerification.getAddress());

  // Create a sample election to demonstrate the factory working
  console.log("Creating a sample election via factory...");
  const createElectionTx = await votereumFactory.createElection(
    "Sample Election 2025",
    "A demo election created during deployment"
  );
  
  // Wait for the transaction to be mined
  await createElectionTx.wait();
  
  // Get the address of the created election
  const electionCount = await votereumFactory.getElectionCount();
  const deployedElections = await votereumFactory.getDeployedElections();
  const sampleElectionAddress = deployedElections[0];
  
  console.log("Sample election created at address:", sampleElectionAddress);
  console.log("Total elections deployed:", electionCount.toString());
  
  // Save the contract addresses to a file for easy access from the frontend
  const contractAddresses = {
    VotereumFactory: await votereumFactory.getAddress(),
    VoterVerification: await voterVerification.getAddress(),
    SampleElection: sampleElectionAddress
  };
  
  fs.writeFileSync(
    "contract-addresses.json",
    JSON.stringify(contractAddresses, null, 2)
  );
  console.log("Contract addresses saved to contract-addresses.json");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});