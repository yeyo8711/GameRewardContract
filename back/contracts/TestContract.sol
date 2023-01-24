// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract TestContract is ReentrancyGuard, Ownable {
    IERC20 public gameToken;
    uint256 public devFeeToClaim;
    address public constant deadAddress =
        0x000000000000000000000000000000000000dEaD;
    address server;

    struct Fees {
        uint256 lifeCost;
        uint256 killValue;
        uint256 headShotValue;
        uint256 burnFee;
        uint256 creatorFee;
        uint256 devFee;
        address devAddress;
    }

    struct Rewards {
        address player;
        uint256 spawns;
        uint256 kills;
        uint256 headShots;
        address creatorAddress;
    }

    mapping(address => uint256) public spawns;
    mapping(address => uint256) public rewardsToClaim;
    mapping(address => uint256) public creatorFeeToClaim;

    Fees public gameFees;

    event SpawnDeposit(address _player);

    constructor(address _gameToken, address _devAddress) {
        gameToken = IERC20(_gameToken);
        gameFees.lifeCost = 1000;
        gameFees.killValue = 750;
        gameFees.headShotValue = 800;
        gameFees.burnFee = 40;
        gameFees.creatorFee = 40;
        gameFees.devFee = 120;

        gameFees.devAddress = _devAddress;

        server = msg.sender;
    }

    function spawn() public returns (bool depositSuccesfull) {
        require(
            gameToken.transferFrom(
                msg.sender,
                address(this),
                gameFees.lifeCost * 10 ** 18
            )
        );
        spawns[msg.sender] += 1;

        emit SpawnDeposit(msg.sender);
        return true;
    }

    function distributeRewards(Rewards[] memory playerArray) external {
        require(msg.sender == server, "Only server can call this function!");
        Fees memory fees = gameFees;
        // Adds up the amount to be burned and then sends to deadAddress at the end of the loop
        uint256 amountToBurn;

        for (uint256 i; i < playerArray.length; i++) {
            uint256 payout = (playerArray[i].kills * fees.killValue) +
                ((fees.headShotValue - fees.killValue) *
                    playerArray[i].headShots);

            rewardsToClaim[playerArray[i].player] += payout;
            amountToBurn += playerArray[i].spawns * fees.burnFee;
            devFeeToClaim += playerArray[i].spawns * fees.devFee;
            creatorFeeToClaim[playerArray[i].creatorAddress] +=
                playerArray[i].spawns *
                fees.creatorFee;
            spawns[playerArray[i].player] = 0;
        }
        // Burns tokens
        gameToken.transfer(deadAddress, amountToBurn * 10 ** 18);
    }

    function playerClaim() external nonReentrant {
        uint256 amount = rewardsToClaim[msg.sender] * 10 ** 18;
        require(amount > 0, "Nothing to claim...");
        rewardsToClaim[msg.sender] = 0;
        bool success = gameToken.transfer(msg.sender, amount);
        require(success, "Transfer Failed");
    }

    function creatorFeeClaim() external nonReentrant {
        uint256 amount = creatorFeeToClaim[msg.sender] * 10 ** 18;
        require(amount > 0, "Nothing to claim..");
        creatorFeeToClaim[msg.sender] = 0;
        bool success = gameToken.transfer(msg.sender, amount);
        require(success, "Transfer Failed");
    }

    function devFeeClaim() external nonReentrant {
        uint256 amount = devFeeToClaim * 10 ** 18;
        require(msg.sender == gameFees.devAddress);
        require(devFeeToClaim > 0, "Nothing to claim..");
        devFeeToClaim = 0;
        bool success = gameToken.transfer(gameFees.devAddress, amount);
        require(success, "Transfer Failed");
    }

    // Getters & Setters

    function updateServerAddress(address _newServer) external onlyOwner {
        server = _newServer;
    }

    function updateFees (Fees memory _newFees) external onlyOwner{
        gameFees = _newFees;
    }
}
