const hre = require("hardhat");
const addresses = require("../addresses/index.js");

async function main() {
  const TestToken = await hre.ethers.getContractFactory("TestToken");
  const testToken = await TestToken.deploy();

  await testToken.deployed();

  const TestContract = await hre.ethers.getContractFactory("TestContract");
  const testContract = await TestContract.deploy(
    testToken.address,
    
    addresses.module.devWallet
  );

  await testContract.deployed();

  console.log(`TestContract deployed to ${testContract.address}`);
  console.log(`TestToken deployed to ${testToken.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
