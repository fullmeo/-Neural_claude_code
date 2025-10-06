const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying DJ Cloudio Prophetic Contracts...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString(), "\n");

  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId, "\n");

  // Deploy RitualDAO
  console.log("📜 Deploying RitualDAO...");
  const RitualDAO = await hre.ethers.getContractFactory("RitualDAO");
  const ritualDAO = await RitualDAO.deploy();
  await ritualDAO.waitForDeployment();
  const ritualDAOAddress = await ritualDAO.getAddress();
  console.log("✓ RitualDAO deployed to:", ritualDAOAddress, "\n");

  // Deploy PropheticSessionNFT
  console.log("🎨 Deploying PropheticSessionNFT...");
  const PropheticSessionNFT = await hre.ethers.getContractFactory("PropheticSessionNFT");
  const sessionNFT = await PropheticSessionNFT.deploy();
  await sessionNFT.waitForDeployment();
  const sessionNFTAddress = await sessionNFT.getAddress();
  console.log("✓ PropheticSessionNFT deployed to:", sessionNFTAddress, "\n");

  // Setup initial configuration
  console.log("⚙️ Setting up initial configuration...");

  // Set voting power for deployer (for testing)
  const tx1 = await ritualDAO.setVotingPower(deployer.address, 100);
  await tx1.wait();
  console.log("✓ Deployer voting power set to 100\n");

  // Summary
  console.log("=" .repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=" .repeat(60));
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId);
  console.log("Deployer:", deployer.address);
  console.log("\nContracts:");
  console.log("  RitualDAO:", ritualDAOAddress);
  console.log("  PropheticSessionNFT:", sessionNFTAddress);
  console.log("=" .repeat(60), "\n");

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    contracts: {
      RitualDAO: ritualDAOAddress,
      PropheticSessionNFT: sessionNFTAddress
    },
    timestamp: new Date().toISOString()
  };

  const fs = require("fs");
  const deploymentPath = `./deployments/${network.name}-${network.chainId}.json`;

  // Create deployments directory if it doesn't exist
  if (!fs.existsSync("./deployments")) {
    fs.mkdirSync("./deployments");
  }

  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", deploymentPath, "\n");

  // Update neural-web3-connector.js with addresses
  console.log("📝 Update neural-web3-connector.js with these addresses:");
  console.log(`
  contracts: {
    ${network.chainId}: {
      dao: '${ritualDAOAddress}',
      nft: '${sessionNFTAddress}'
    }
  }
  `);

  // Verification instructions
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\n🔍 To verify contracts, run:");
    console.log(`npx hardhat verify --network ${network.name} ${ritualDAOAddress}`);
    console.log(`npx hardhat verify --network ${network.name} ${sessionNFTAddress}`);
  }

  console.log("\n✅ Deployment complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
