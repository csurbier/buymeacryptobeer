// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  // https://docs.alchemy.com/alchemy/tutorials/hello-world-smart-contract/interacting-with-a-smart-contract
  // const contract = require("../artifacts/contracts/QueezmeSale.sol/QueezmeSale.json");
 
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  // Set up an ethers contract, representing our deployed instance
  
  // console.log(myClubs)
  let [account0, account1] = await ethers.getSigners()
  
  console.log(account0.address)
  console.log(account1.address)
   
   
  const contractFactory = await ethers.getContractFactory("BuyMeABeerAccount");
  const contract = await contractFactory.attach("");
  

}
function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
