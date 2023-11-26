import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';

describe('Claim Rewards Function', function () {
  let owner: any;
  let realToken: Contract;
  let claimant: any;
  let hacker: any;
  let etherNode: Contract;
  let nodeTobuy: number;
  let claimantInitBalance;
  let claimTimeBeforeTx: Date;
  let claimTimeAfterTx: Date;
  let nodeId: number;
  let expectedReward: number;

  before(async function () {
    const Token = await ethers.getContractFactory('RealToken');
    const Node = await ethers.getContractFactory('Ethernode');
    realToken = await Token.deploy('Real Token', 'RLT');
    await realToken.deployed();
    etherNode = await Node.deploy(realToken.address);
    await etherNode.deployed();
    [owner, claimant, hacker] = await ethers.getSigners();
    const amountToTransfer = ethers.utils.parseEther('10000000');
    await realToken.connect(owner).transfer(claimant.address, amountToTransfer);
    //Approve real tokens to contract
    const tokensToApprove = ethers.utils.parseEther('10000');
    nodeTobuy = 2;
    realToken.connect(claimant).approve(etherNode.address, tokensToApprove);
    const tx = await etherNode.connect(claimant).buyNode(nodeTobuy);
    tx.wait();
    const numNodes = await etherNode.getNumberOfNodes();
    nodeId = numNodes - 1;

    claimTimeBeforeTx = await etherNode.getLastClaim(0);

    await new Promise((resolve) => setTimeout(resolve, 30 * 1000));
  });

  it('should transfer correct amount of reward tokens to owner', async function () {
    claimantInitBalance = await realToken.balanceOf(claimant.address);

    // const miningRate = await etherNode.getMiningRateById(nodeId);

    const claimTx = await etherNode.connect(claimant).claimReward(nodeId);
    await claimTx.wait();
    claimTimeAfterTx = await etherNode.getLastClaim(nodeId);

    const claimantFinalBalance = await realToken.balanceOf(claimant.address);
  });

  it('should reset the last claim time of the claimed node', async function () {
    expect(Number(claimTimeAfterTx)).to.be.greaterThan(Number(claimTimeBeforeTx));
  });

  it('should not allow claim to non owner', async function () {
    await expect(etherNode.connect(hacker).claimReward(nodeId)).to.be.revertedWith(
      'Only Node owner can  claim rewards'
    );
  });
  it('should emit RewardsClaim  event with correct arguements', async function () {
    expectedReward = await etherNode.getPendingReward(nodeId);

    await expect(etherNode.connect(claimant).claimReward(nodeId)).to.emit(etherNode, 'RewardClaim');
  });
});
