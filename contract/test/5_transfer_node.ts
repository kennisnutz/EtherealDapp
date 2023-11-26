import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('Transfer Nodes', function () {
  let etherNodes: Contract;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let realToken: Contract;
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

    await etherNodes.connect(user1).transferNode(user2.address, nodeId);
  });

  it('should update number of nodes owned by sender and recipient', async function () {
    // Transfer the node from user1 to user2
    // await expect(etherNodes.connect(user1).transferNode(user2.address, nodeId)).to.emit(etherNodes, 'NodeTransfer');
    // Check owner, node count, and node ownership
    // expect(await etherNodes.getNode(nodeId)).to.deep.include({ owner: user2.address });

    const user1Nodes = await etherNodes.getNumberOfNodesOwned(user1.address);
    const user2Nodes = await etherNodes.getNumberOfNodesOwned(user2.address);

    expect(Number(ethers.utils.parseEther(ethers.utils.formatUnits(user1Nodes)))).to.equal(0);
    expect(Number(ethers.utils.parseEther(ethers.utils.formatUnits(user2Nodes)))).to.equal(1);
  });

  it('should change ownership of transfered node to recipient addreaa', async function () {
    const ownerOf = await etherNodes.getOwner(nodeId);
    expect(ownerOf).to.equal(user2.address);
  });

  it('should revert when transferring a node not owned', async function () {
    // Try to transfer the node from user1 (Node not owned by caller)
    await expect(etherNodes.connect(user1).transferNode(owner.address, nodeId)).to.be.revertedWith(
      'Node not owned by caller'
    );
  });

  it('Should emit NodeTransfer Event', async function () {
    await expect(etherNodes.connect(user2).transferNode(user1.address, nodeId)).to.emit(etherNodes, 'NodeTransfer');
  });

  // Add more test cases for other error conditions
});
