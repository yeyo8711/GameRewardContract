require("dotenv").config();
const { ethers } = require("ethers");
const tokenAbi =
  require("../artifacts/contracts/TestToken.sol/TestToken.json").abi;
const testAbi =
  require("../artifacts/contracts/TestContract.sol/TestContract.json").abi;
const addresses = require("../addresses/index.js");
const provider = new ethers.providers.JsonRpcProvider(
  "https://rpc.ankr.com/bsc_testnet_chapel"
);
const wallet = new ethers.Wallet(process.env.PK, provider);
const wallet2 = new ethers.Wallet(process.env.PK2, provider);
const testToken = new ethers.Contract(
  addresses.module.gameTokenAddress,
  tokenAbi,
  wallet
);
const testContract = new ethers.Contract(
  addresses.module.testContractAddress,
  testAbi,
  wallet
);
const testContract2 = new ethers.Contract(
  addresses.module.testContractAddress,
  testAbi,
  wallet2
);

// Helpers
const toWei = (amount) => ethers.utils.parseEther(amount.toString());
const fromWei = (amount) => ethers.utils.formatEther(amount);

const main = async () => {
  /* const tx = await testContract.spawn();
  await tx.wait();
  console.log(tx); */
  /* console.log(
    ethers.utils.formatUnits(await testContract.lives(wallet.address), 0)
  ); */
  await testToken.approve(testContract.address, toWei(50000));
};
main();
