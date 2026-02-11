const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with:", deployer.address);
    console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "BNB");

    // Deploy DLAIEscrow
    console.log("\n--- Deploying DLAIEscrow ---");
    const DLAIEscrow = await hre.ethers.getContractFactory("DLAIEscrow");
    const escrow = await DLAIEscrow.deploy(deployer.address); // fee recipient = deployer
    await escrow.waitForDeployment();
    const escrowAddr = await escrow.getAddress();
    console.log("DLAIEscrow deployed to:", escrowAddr);

    // Deploy NFTResume
    console.log("\n--- Deploying NFTResume ---");
    const NFTResume = await hre.ethers.getContractFactory("NFTResume");
    const nftResume = await NFTResume.deploy();
    await nftResume.waitForDeployment();
    const nftAddr = await nftResume.getAddress();
    console.log("NFTResume deployed to:", nftAddr);

    // Summary
    console.log("\n========================================");
    console.log("Deployment Summary");
    console.log("========================================");
    console.log("Network:", hre.network.name);
    console.log("DLAIEscrow:", escrowAddr);
    console.log("NFTResume:", nftAddr);
    console.log("Deployer:", deployer.address);
    console.log("========================================");

    // Save addresses to file for API server
    const fs = require("fs");
    const addresses = {
        network: hre.network.name,
        escrow: escrowAddr,
        nftResume: nftAddr,
        deployer: deployer.address,
        deployedAt: new Date().toISOString()
    };
    fs.writeFileSync("deployed-addresses.json", JSON.stringify(addresses, null, 2));
    console.log("\nAddresses saved to deployed-addresses.json");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
