const { expect } = require("chai");
const { ethers } = require("hardhat");

// Helpers
const toWei = (amount) => ethers.utils.parseEther(amount.toString());
const fromWei = (amount) => ethers.utils.formatEther(amount);

describe("Rewards Contract", function () {
  // Declare Signers  and contracts
  let deployer,
    account1,
    account2,
    account3,
    account4,
    account5,
    account6,
    account7,
    account8,
    creatorAccount,
    devAccount,
    TokenContract,
    RewardContract;
  it("Deploys both contracts and confirms ownership", async function () {
    [
      deployer,
      account1,
      account2,
      account3,
      account4,
      account5,
      account6,
      account7,
      account8,
      creatorAccount,
      devAccount,
    ] = await hre.ethers.getSigners();

    const TestToken = await ethers.getContractFactory("TestToken");
    TokenContract = await TestToken.deploy();

    const TestContract = await ethers.getContractFactory("TestContract");
    RewardContract = await TestContract.deploy(
      TokenContract.address,
      devAccount.address
    );

    expect(await TokenContract.owner()).to.equal(deployer.address);
    expect(await RewardContract.owner()).to.equal(deployer.address);
  });
  it("Transfers game tokens to reward contract", async function () {
    expect(await TokenContract.balanceOf(RewardContract.address)).to.equals(0);
    await TokenContract.connect(deployer).transfer(
      RewardContract.address,
      toWei(1000000)
    );
    expect(await TokenContract.balanceOf(RewardContract.address)).to.equals(
      toWei(1000000)
    );
  });

  it("Checks Fee Struct", async function () {
    const feeStruct = await RewardContract.gameFees();
    expect(feeStruct.lifeCost).to.equal(1000);
    expect(feeStruct.killValue).to.equal(750);
    expect(feeStruct.headShotValue).to.equal(800);
    expect(feeStruct.burnFee).to.equal(40);
    expect(feeStruct.creatorFee).to.equal(40);
    expect(feeStruct.devFee).to.equal(120);
    expect(feeStruct.devAddress).to.equal(devAccount.address);
  });
  it("Spawn Function", async function () {
    await TokenContract.connect(deployer).transfer(
      account1.address,
      toWei(1000)
    );
    await TokenContract.connect(account1).approve(
      RewardContract.address,
      toWei(1000)
    );
    await RewardContract.connect(account1).spawn();
    await TokenContract.connect(deployer).transfer(
      account2.address,
      toWei(1000)
    );
    await TokenContract.connect(account2).approve(
      RewardContract.address,
      toWei(1000)
    );
    await RewardContract.connect(account2).spawn();
    await TokenContract.connect(deployer).transfer(
      account3.address,
      toWei(1000)
    );
    await TokenContract.connect(account3).approve(
      RewardContract.address,
      toWei(1000)
    );
    await RewardContract.connect(account3).spawn();

    expect(await RewardContract.spawns(account1.address)).to.equal(1);
  });

  it("Distribute Rewards Function", async function () {
    const player2 = [account2.address, 1, 1, 0, creatorAccount.address];
    const player3 = [account3.address, 1, 2, 1, creatorAccount.address];
    await RewardContract.connect(deployer).distributeRewards([
      player2,
      player3,
    ]);
    expect(await RewardContract.spawns(account2.address)).to.equal(0);
    expect(await RewardContract.rewardsToClaim(account2.address)).to.equal(750);

    expect(await RewardContract.devFeeToClaim()).to.equal(240);
    expect(
      await RewardContract.creatorFeeToClaim(creatorAccount.address)
    ).to.equal(80);
    const deadAddress = await RewardContract.deadAddress();
    expect(await TokenContract.balanceOf(deadAddress)).to.equal(toWei(80));
  });
  it("Claim Rewards Function", async function () {
    // Player 2 has 1 spawn and 1 kill 0 headshots
    await RewardContract.connect(account2).playerClaim();
    expect(await TokenContract.balanceOf(account2.address)).to.equal(
      toWei(750)
    );
    // Player 3 has 1 spawn and 2 kill 1 headshots
    await RewardContract.connect(account3).playerClaim();
    expect(await TokenContract.balanceOf(account3.address)).to.equal(
      toWei(1550)
    );
    // Creator has two rewards pending so 2 x 40 tokens
    await RewardContract.connect(creatorAccount).creatorFeeClaim();
    expect(await TokenContract.balanceOf(creatorAccount.address)).to.equal(
      toWei(80)
    );
    // Dev has two rewards pending so 2 x 120 tokens
    await RewardContract.connect(devAccount).devFeeClaim();
    expect(await TokenContract.balanceOf(devAccount.address)).to.equal(
      toWei(240)
    );
  });
});
