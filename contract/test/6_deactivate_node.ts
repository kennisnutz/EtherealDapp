import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('Deactivate Nodes', function () {
  let etherNodes: Contract;
  let realToken: Contract;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let nodeId: number;

  beforeEach(async () => {
    [owner, user1, user2] = await ethers.getSigners();
    const RealToken = await ethers.getContractFactory('RealToken'); // Replace with your ERC20 token contract
    realToken = await RealToken.deploy('Real Token', 'RLT');
    await realToken.deployed();

    const EtherNodes = await ethers.getContractFactory('Ethernode');
    etherNodes = await EtherNodes.deploy(realToken.address);
    await etherNodes.deployed();

    // Mint some Real tokens to user1 and user2 for testing
    const amountToTransfer = ethers.utils.parseEther('10000000');

    await realToken.connect(owner).transfer(user1.address, amountToTransfer);
    await realToken.connect(owner).transfer(user2.address, amountToTransfer);

    const tokensToApprove = ethers.utils.parseEther('10000');
    await realToken.connect(user1).approve(etherNodes.address, tokensToApprove);
    await etherNodes.connect(user1).buyNode(0);
    nodeId = 0;
  });

  it('should update number of nodes owned caller and owner of node', async function () {
    await etherNodes.connect(user1).deactivateNode(nodeId);
    const newOwner = await etherNodes.getOwner(nodeId);

    expect(newOwner).to.equal(ethers.constants.AddressZero);
    const user1Nodes = await etherNodes.getNumberOfNodesOwned(user1.address);
    expect(user1Nodes).to.equal(0);
  });

  it('should revert when caller is not owner', async function () {
    await etherNodes.connect(user1).buyNode(1);
    const nodeId = 1;
    await expect(etherNodes.connect(user2).deactivateNode(nodeId)).to.be.revertedWith('Caller is not owner');
  });

  it('should revert when node does not exist', async function () {
    nodeId = 2;
    await expect(etherNodes.connect(user1).deactivateNode(nodeId)).to.be.revertedWith('Node does not exist');
  });

  it('should emit NodeDeativation event', async function () {
    const tokensToApprove = ethers.utils.parseEther('10000');
    await realToken.connect(user2).approve(etherNodes.address, tokensToApprove);
    await etherNodes.connect(user2).buyNode(1);
    nodeId = 1;
    await expect(etherNodes.connect(user2).deactivateNode(nodeId)).to.emit(etherNodes, 'NodeDeativation');
  });

  it('should refund 50% of the amount paid', async function () {
    const initialBalance = await realToken.balanceOf(user1.address);

    // Purchase a node for user1
    await etherNodes.connect(user1).buyNode(0);
    nodeId = 1;

    // Deactivate the node for user1
    await etherNodes.connect(user1).deactivateNode(nodeId);

    const finalBalance = await realToken.balanceOf(user1.address);
    const refundAmount = initialBalance.sub(finalBalance);
    const nodePrice = await etherNodes.getPrice(0);

    const expectedRefund = ethers.utils.parseEther(ethers.utils.formatUnits(nodePrice)).div(2);
    expect(refundAmount).to.equal(expectedRefund);
  });

  // Add more test cases if needed
});
