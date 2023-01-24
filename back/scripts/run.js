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

// Helpers
const toWei = (amount) => ethers.utils.parseEther(amount.toString());
const fromWei = (amount) => ethers.utils.formatEther(amount);

const main = async () => {
  await testContract.transferOwnership(
    "0x8fbd94f1ad075b60f0650b929bf0ea461f1c4711"
  );
};
main();
