import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';

describe('Buy Function', function () {
  let owner: any;
  let realToken: Contract;
  let buyer: any;
  let etherNode: Contract;

  before(async function () {
    const Token = await ethers.getContractFactory('RealToken');
    const Node = await ethers.getContractFactory('Ethernode');
    realToken = await Token.deploy('Real Token', 'RLT');
    await realToken.deployed();
    etherNode = await Node.deploy(realToken.address);
    await etherNode.deployed();
    [owner, buyer] = await ethers.getSigners();
    const amountToTransfer = ethers.utils.parseEther('10000000');
    await realToken.connect(owner).transfer(buyer.address, amountToTransfer);

    //Approve real tokens to contract
    const tokensToApprove = ethers.utils.parseEther('10000');
    realToken.connect(buyer).approve(etherNode.address, tokensToApprove);

    await etherNode.connect(buyer).buyNode(2);
    // await etherNode.connect(buyer).buyNode(1);
    // await etherNode.connect(buyer).buyNode(2);
    // const buyerBalance = await realToken.balanceOf(buyer.address);
    // console.log(etherNode.address, Number(ethers.utils.formatUnits(buyerBalance, 18)));
  });

  it('Should add purchased node to buyers nodes list', async function () {
    const currentNodesOwned = await etherNode.getNumberOfNodesOwned(buyer.address);
    expect(currentNodesOwned).to.equal(1);
  });
  it('Should update nuber of nodes in  nodes list', async function () {
    const numberOfNodes = await etherNode.getNumberOfNodes();
    expect(numberOfNodes).to.equal(1);
  });

  it('Should recieve correct amount of tokens for node purchase', async function () {
    const nodePrice = await etherNode.getPrice(2);
    const contractBalance = await realToken.balanceOf(etherNode.address);
    expect(contractBalance).to.equal(nodePrice);
  });

  it('Should set the correct owner address to purchased node', async function () {
    const expectedOwner = await etherNode.getOwner(0);
    expect(expectedOwner).to.equal(buyer.address);
  });

  it('Should not allow purchase of partner node', async function () {
    await expect(etherNode.connect(buyer).buyNode(4)).to.be.revertedWith('Purchase Access restricted');
  });
  it('Should not allow purchase of executive node', async function () {
    await expect(etherNode.connect(buyer).buyNode(5)).to.be.revertedWith('Purchase Access restricted');
  });
  it('Should not allow purchase of founder node', async function () {
    await expect(etherNode.connect(buyer).buyNode(6)).to.be.revertedWith('Purchase Access restricted');
  });
  it('should emit NodePurchase event with correct arguements', async function () {
    const nodeTypeToBuy = 1;
    const price = await etherNode.getPrice(nodeTypeToBuy);
    await expect(etherNode.connect(buyer).buyNode(nodeTypeToBuy))
      .to.emit(etherNode, 'NodePurchase')
      .withArgs(buyer.address, nodeTypeToBuy, price);
  });
});
