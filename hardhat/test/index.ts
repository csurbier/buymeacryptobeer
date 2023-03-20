import assert from "assert";
import { expect } from "chai";
import { ethers,upgrades } from "hardhat";


describe("BuyMeABeerAccount", function () {
  
  let contract:any;
 
  beforeEach(async function () {
    const [owner, addr1,founder1,founder2,founder3] = await ethers.getSigners();
    const BuyMeABeerAccountFactory = await ethers.getContractFactory("BuyMeABeerAccount",owner);
     contract = await BuyMeABeerAccountFactory.deploy();
  });
 
  
  it('create account and check account existing) ', async function () {
    const [owner, account1, account2, account3] = await ethers.getSigners();
    
    expect(await contract.connect(account1).createAccount("ChrisBcn","https://www.developpeur-web3.fr/","my web3 website", "")).to.emit(contract, "NewAccount").withArgs(account1.address);
    await expect(contract.connect(account1).createAccount("ChrisBcn2","https://www.developpeur-web3.fr/","my web3 website", "")).to.be.revertedWith("Account already registered");
    await expect( contract.connect(account1).updateAccount("ChrisBcn","https://www.developpeur-web3.fr/","my web3 website", "")).to.be.revertedWith("Name already exists");
    await expect( contract.connect(account2).createAccount("ChrisBcn","https://www.developpeur-web3.fr/","my web3 website", "")).to.be.revertedWith("Name already exists");
  });

  it('create account and update) ', async function () {
    const [owner, account1, account2, account3] = await ethers.getSigners();
    
    expect(await contract.connect(account1).createAccount("ChrisBcn","https://www.developpeur-web3.fr/","my web3 website", "")).to.emit(contract, "NewAccount").withArgs(account1.address);
    await expect(contract.connect(account1).updateAccount("ChrisBcnUpdate","https://www.developpeur-web3.fr/","my web3 website", ""));
    let memberAccount1 = await contract.connect(account1).getAccount(account1.address)
    expect(memberAccount1.name).to.eq("ChrisBcnUpdate");
    // Account not existing
    await expect(contract.connect(account2).updateAccount("ChrisBcnUpdate","https://www.developpeur-web3.fr/","my web3 website", "")).to.be.revertedWith("Account not existing");
    
    //TRy to update not my account
    expect(await contract.connect(account2).createAccount("Account2","https://www.developpeur-web3.fr/","my web3 website", "")).to.emit(contract, "NewAccount").withArgs(account2.address);
    
    await expect(contract.connect(account2).updateAccount("Account2bis","https://www.idevotion.fr/","my web3 website", "")) 
    let memberAccount2 = await contract.connect(account2).getAccount(account2.address)
    expect(memberAccount2.website).to.eq("https://www.idevotion.fr/");
    let address = await contract.connect(account1).getWalletForName("ChrisBcnUpdate")
   
    expect(address).to.eq(account1.address);
  });

  it('try to deposit) ', async function () {
    const [owner, account1, account2, account3] = await ethers.getSigners();
    await expect(contract.connect(account3).deposit(account1.address,{ value: ethers.utils.parseEther("15")})).to.be.revertedWith("Account not existing");
    // create account 1
    expect(await contract.connect(account1).createAccount("ChrisBcn","https://www.developpeur-web3.fr/","my web3 website", "")).to.emit(contract, "NewAccount").withArgs(account1.address);
    // Create account 2
    expect(await contract.connect(account2).createAccount("Account2","https://www.developpeur-web3.fr/","my web3 website", "")).to.emit(contract, "NewAccount").withArgs(account2.address);
    // Send money to account 1
    expect(await contract.connect(account3).deposit(account1.address,{ value: ethers.utils.parseEther("15")})).to.emit(contract, "NewDonation").withArgs(account3.address,account1.address,ethers.utils.parseEther("15"));
    // Send money to account 1
    expect(await contract.connect(account3).deposit(account1.address,{ value: ethers.utils.parseEther("35")})).to.emit(contract, "NewDonation").withArgs(account3.address,account1.address,ethers.utils.parseEther("35"));
    // Send money to account 2
    expect(await contract.connect(account3).deposit(account2.address,{ value: ethers.utils.parseEther("10")})).to.emit(contract, "NewDonation").withArgs(account3.address,account2.address,ethers.utils.parseEther("10"));
 
    // Check donations for account1 and account2 
    let memberAccount1 = await contract.connect(account1).getAccount(account1.address)
    let balanceExpected = ethers.utils.parseEther("50")
    expect(memberAccount1.balance).to.eq(balanceExpected);
    let memberAccount2 = await contract.connect(account2).getAccount(account2.address)
    balanceExpected = ethers.utils.parseEther("10")
    expect(memberAccount2.balance).to.eq(balanceExpected);
  
    let donationsAccount1 = await contract.getDonations(account1.address);
    expect(donationsAccount1.length).to.eq(2);
    let donationsAccount2 = await contract.getDonations(account2.address);
    expect(donationsAccount2.length).to.eq(1);
    
    // check total donations 
    let totalDonations = await contract.totalDonation();
    expect(totalDonations).to.eq(ethers.utils.parseEther("60"));
  });

  it('try to withdraw) ', async function () {
    const [owner, account1, account2, account3] = await ethers.getSigners();
    await expect(contract.connect(account3).deposit(account1.address,{ value: ethers.utils.parseEther("15")})).to.be.revertedWith("Account not existing");
    // create account 1
    expect(await contract.connect(account1).createAccount("ChrisBcn","https://www.developpeur-web3.fr/","my web3 website", "")).to.emit(contract, "NewAccount").withArgs(account1.address);
    await expect(contract.connect(account1).withdraw()).to.be.revertedWith("No funds yet");
    
    // Create account 2
    expect(await contract.connect(account2).createAccount("Account2","https://www.developpeur-web3.fr/","my web3 website", "")).to.emit(contract, "NewAccount").withArgs(account2.address);
    // Send money to account 1
    expect(await contract.connect(account3).deposit(account1.address,{ value: ethers.utils.parseEther("15")})).to.emit(contract, "NewDonation").withArgs(account3.address,account1.address,ethers.utils.parseEther("15"));
    // Send money to account 1
    expect(await contract.connect(account3).deposit(account1.address,{ value: ethers.utils.parseEther("35")})).to.emit(contract, "NewDonation").withArgs(account3.address,account1.address,ethers.utils.parseEther("35"));
    // Send money to account 2
    expect(await contract.connect(account3).deposit(account2.address,{ value: ethers.utils.parseEther("10")})).to.emit(contract, "NewDonation").withArgs(account3.address,account2.address,ethers.utils.parseEther("10"));
 
    // Check donations for account1 and account2 
    let memberAccount1 = await contract.connect(account1).getAccount(account1.address)
    let balanceExpected = ethers.utils.parseEther("50")
    expect(memberAccount1.balance).to.eq(balanceExpected);
    let memberAccount2 = await contract.connect(account2).getAccount(account2.address)
    balanceExpected = ethers.utils.parseEther("10")
    expect(memberAccount2.balance).to.eq(balanceExpected);
  
    let donationsAccount1 = await contract.getDonations(account1.address);
    expect(donationsAccount1.length).to.eq(2);
    let donationsAccount2 = await contract.getDonations(account2.address);
    expect(donationsAccount2.length).to.eq(1);
    
    //Widraw account 1
    let accountBalanceBefore =  await ethers.provider.getBalance(account1.address);
    await contract.connect(account1).withdraw();
    memberAccount1 = await contract.connect(account1).getAccount(account1.address)
    balanceExpected = ethers.utils.parseEther("0")
    expect(memberAccount1.balance).to.eq(balanceExpected);
    // check money is now on account1
    let accountBalanceAfter =  await ethers.provider.getBalance(account1.address);
    let difference = Number(accountBalanceAfter) - Number(accountBalanceBefore);
    
    if (difference < Number(ethers.utils.parseEther("40"))){
        assert.fail("Balance not changed");
    }
    //Try to withdraw again
    await expect(contract.connect(account1).withdraw()).to.be.revertedWith("No funds yet");
   
    await expect(contract.connect(account3).withdraw()).to.be.revertedWith("Account not existing");

      //Widraw account 2
      accountBalanceBefore =  await ethers.provider.getBalance(account2.address);
      await contract.connect(account2).withdraw();
      memberAccount2 = await contract.connect(account2).getAccount(account2.address)
      balanceExpected = ethers.utils.parseEther("0")
      expect(memberAccount2.balance).to.eq(balanceExpected);
      // check money is now on account2
       accountBalanceAfter =  await ethers.provider.getBalance(account2.address);
       difference = Number(accountBalanceAfter) - Number(accountBalanceBefore);
      
      if (difference < Number(ethers.utils.parseEther("9"))){
          assert.fail("Balance not changed");
      }
  });
  
})

