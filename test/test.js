const {expect} = require("chai");
const {ethers} = require("hardhat");
const { ContractType } = require("hardhat/internal/hardhat-network/stack-traces/model");

describe ("Set rate", function() {
  it("It should set minutely rate", async function() {
    const Contract = await ethers.getContractFactory('Calend3');
    const contract = await Contract.deploy();
    await contract.deployed();

    const tx = await contract.setRate(1000);

    //wait until the transaction is mined
    await tx.wait();

    //verify rate is set correctly
    expect(await contract.getRate()).to.equal(1000);

    //get address
    const [owner, addr1, addr2] = await ethers.getSigners();
    console.log(owner.address);
    console.log(addr1.address);

    await expect(
      contract.connect(addr1).setRate(500)
    ).to.be.revertedWith('Only the owner can set the rate');

  });
});