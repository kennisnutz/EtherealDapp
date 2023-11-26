import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('Create Nodes', function () {
  let etherNodes: Contract;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let realToken: Contract;
  let nodeId: number;

  beforeEach(async () => {
    [owner, user1] = await ethers.getSigners();
    const RealToken = await ethers.getContractFactory('RealToken'); // Replace with your ERC20 token contract
    realToken = await RealToken.deploy('Real Token', 'RLT');
    await realToken.deployed();

    const EtherNodes = await ethers.getContractFactory('Ethernode');
    etherNodes = await EtherNodes.deploy(realToken.address);
    await etherNodes.deployed();

    // Mint some Real tokens to user1 and user2 for testing
    const amountToTransfer = ethers.utils.parseEther('10000000');

    await realToken.connect(owner).transfer(user1.address, amountToTransfer);

    const tokensToApprove = ethers.utils.parseEther('10000');
    nodeId = 0;
  });

  it('should create node correctly', async function () {
    const initialNodeCounter = await etherNodes.getNumberOfNodes();
    const initialNodesOwned = await etherNodes.getNumberOfNodesOwned(owner.address);

    // Create a new node for the owner without charging any Real tokens
    await etherNodes.connect(owner).createNode(0);

    // Check node counter and nodes owned by the owner
    expect(await etherNodes.getNumberOfNodes()).to.equal(initialNodeCounter.add(1));
    expect(await etherNodes.getNumberOfNodesOwned(owner.address)).to.equal(initialNodesOwned.add(1));
  });

  it('should not charge owner any realTokens', async function () {
    const initialOwnerBalance = await realToken.balanceOf(owner.address);

    // Create a new node for the owner without charging any Real tokens
    await etherNodes.connect(owner).createNode(0);

    const finalOwnerBalance = await realToken.balanceOf(owner.address);

    // Owner's balance should remain unchanged
    expect(finalOwnerBalance).to.equal(initialOwnerBalance);
  });
  it('Should allow creation of restricted Nodes', async function () {
    await expect(etherNodes.connect(owner).createNode(5)).to.emit(etherNodes, 'NodeCreation');
  });

  it('should revert when called by non-owner', async function () {
    // Try to create a new node by user1 (non-owner)
    await expect(etherNodes.connect(user1).createNode(0)).to.be.revertedWith('Ownable: caller is not the owner');
  });

  it('should revert when called with none existent node type', async function () {
    // Try to create a new node by user1 (non-owner)
    await expect(etherNodes.connect(owner).createNode(8)).to.be.reverted;
  });

  // Add more test cases if needed
});
