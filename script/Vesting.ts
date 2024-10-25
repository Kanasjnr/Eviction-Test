import { ethers } from "hardhat";
import hre from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // ********** Token Deployment ****

  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy("Kanas", "KAN");

  await token.waitForDeployment();

  console.log("Token deployed to:", token.target);

  // ********** TokenVesting Deployment ****

  const TokenVesting = await ethers.getContractFactory("TokenVesting");
  const tokenVesting = await TokenVesting.deploy(token.target);

  await tokenVesting.waitForDeployment();
  console.log("TokenVesting deployed to:", tokenVesting.target);

  // ********** Mint Tokens ****

  const mintAmount = ethers.parseEther("1000000"); 
  console.log("Minting", ethers.formatEther(mintAmount), "KAN tokens");

  
  const mintTx = await token.connect(deployer).mint(deployer.address, mintAmount);
  await mintTx.wait();
  console.log("Tokens minted successfully");

 // ********** Transfer Tokens to Vesting Contract ****

 const transferAmount = ethers.parseEther("100000"); 
 console.log("Transferring", ethers.formatEther(transferAmount), "KAN tokens to vesting contract");

 const transferTx = await token.transfer(tokenVesting.target, transferAmount);
 await transferTx.wait();
 console.log("Tokens transferred to vesting contract successfully");

  // ********** Add Beneficiary ****

  const [beneficiary] = await ethers.getSigners();
  console.log("Adding beneficiary:", beneficiary.address);

  const startTime = Math.floor(Date.now() / 1000) + 60;
  const duration = 365 * 24 * 60 * 60;
  const totalAmount = ethers.parseEther("10000");

  const tx = await tokenVesting.addBeneficiary(
    beneficiary.address,
    startTime,
    duration,
    totalAmount
  );
  await tx.wait();
  console.log("Beneficiary added successfully");

  // ********** Adding More Time ****

  const timeAdded = startTime + duration;

  await time.increaseTo(timeAdded);

  console.log("Time Added successfully");

  // #### Claim vested tokens for the beneficiary #####

  console.log("Claiming vested tokens for beneficiary");
  const claimTx = await tokenVesting.connect(beneficiary).claimTokens();
  await claimTx.wait();
  console.log("Vested tokens claimed successfully");

  // ####### Checking beneficiaryBalance #####

  const beneficiaryBalance = await token.balanceOf(beneficiary.address);
  console.log("Beneficiary's token balance:", ethers.formatEther(beneficiaryBalance), "KAN");

  // ####### Checking Vesting Contract Balance #####

  const vestingContractBalance = await token.balanceOf(tokenVesting.target);
  console.log("Vesting contract's token balance:", ethers.formatEther(vestingContractBalance), "KAN");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });