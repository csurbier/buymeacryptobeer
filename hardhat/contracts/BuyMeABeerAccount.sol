// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "hardhat/console.sol";
/**
 * @title BuyMeABeerAccount
 * @author csurbier
 * @dev 
 */

contract BuyMeABeerAccount is Ownable,ReentrancyGuard {

  using SafeMath  for uint256;
  using Counters  for Counters.Counter;
 
  Counters.Counter public _accountIds;
  uint256 public totalDonation;
 
  struct Donation {
    address owner; 
    uint256 paid;
    uint256 createdDate;
  }
  struct Account {
    uint256 accountId;
    uint256 balance;
    uint256 createdDate;
    uint256 nbDonations;
    address owner; 
    string name;  
    string website;    
    string description;
    string logo; //Url to logo
    
  }
  
  mapping (address => Account)  accounts;
  mapping (address => mapping(uint256 => Donation)) donations;
  mapping (string => address) reservedNames;

  event NewAccount(address account); 
  event NewDonation(address sender,address account,uint256 amount);
 

   modifier accountExists(address _accountAddress) {
     require(accounts[_accountAddress].owner!=address(0),"Account not existing");
     _;
  }
  function isNameFree(string memory _name) public view returns(bool) {
       if (reservedNames[_name]==address(0)){
            return true;
       }
       else{
        return false;
       }
  }

  function getWalletForName(string memory _name) public view returns(address) {
       return reservedNames[_name] ;
  }

  function createAccount(string memory _name,string memory _website,string memory _description,string memory _logo) public {
    
    require(isNameFree(_name),"Name already exists");
    require(accounts[msg.sender].owner==address(0),"Account already registered");
    
    reservedNames[_name]=msg.sender;
    uint256 id = _accountIds.current();
    Account memory _account;
    _account.accountId = id;
    _account.balance = 0 ;
    _account.nbDonations = 0 ;
    _account.owner = msg.sender;
    _account.name = _name;
    _account.website = _website;
    _account.description = _description;
    _account.logo = _logo;
    _account.createdDate = block.timestamp;
    
    accounts[msg.sender] = _account;
   
    emit NewAccount(msg.sender);
   _accountIds.increment();
  }

  
  function updateAccount(string memory _name,string memory _website,string memory _description,string memory _logo) public accountExists(msg.sender) {
    require(isNameFree(_name),"Name already exists");
    reservedNames[_name]=msg.sender;
    Account storage sAccount = accounts[msg.sender];
    sAccount.name = _name;
    sAccount.website = _website;
    sAccount.description = _description;
    sAccount.logo = _logo;
    accounts[msg.sender] = sAccount;
  }

  function getAccount(address _accountAddress) external view returns (Account memory) {
        return accounts[_accountAddress];
  }

   function getDonations(address _account) external view returns (Donation[] memory) {
        uint totalItemCount = accounts[_account].nbDonations;
 

        Donation[] memory items = new Donation[](totalItemCount);
        for (uint i = 0; i < totalItemCount; i++) {
            Donation memory currentItem = donations[_account][i];
            items[i] = currentItem;
        }
        return items;
  }

 
  function deposit(address _to) external payable accountExists(_to)  {
     accounts[_to].balance = accounts[_to].balance.add(msg.value);
     accounts[_to].nbDonations =  accounts[_to].nbDonations.add(1);
     Donation memory _aDonation ;
     _aDonation.owner = msg.sender;
     _aDonation.paid = msg.value;
     _aDonation.createdDate = block.timestamp;

     uint256 index  = accounts[_to].nbDonations.sub(1);
     donations[_to][index]=_aDonation;
     totalDonation = totalDonation.add(msg.value);
     emit NewDonation(msg.sender,_to,msg.value);
  }

  function withdraw() external accountExists(msg.sender)   nonReentrant{
    require( accounts[msg.sender].balance > 0, "No funds yet");

    uint256 depositedAmount = accounts[msg.sender].balance;
    accounts[msg.sender].balance = 0 ;
    payable(msg.sender).transfer(depositedAmount);
    
  }

}
