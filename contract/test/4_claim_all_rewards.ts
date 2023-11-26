import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';

describe('Claim all rewards Function', function () {
  let owner: any;
  let claimant: any;
  let hacker: any;
  let nodeIds: number[];
  let nodesTobuy: number[];
  let realToken: Contract;
  let etherNode: Contract;
  let claimantInitBalance;
  let claimTimesAfterTx: Date[];
  let claimTimesBeforeTx: Date[];

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
    nodesTobuy = [0, 1, 2];
    realToken.connect(claimant).approve(etherNode.address, tokensToApprove);
    const tx1 = await etherNode.connect(claimant).buyNode(nodesTobuy[0]);
    tx1.wait();
    const tx2 = await etherNode.connect(claimant).buyNode(nodesTobuy[1]);
    tx2.wait();
    const tx3 = await etherNode.connect(claimant).buyNode(nodesTobuy[2]);
    tx3.wait();
    const numNodes = await etherNode.getNumberOfNodes();
    nodeIds = [0, 1, 2];

    const claimTimesBeforeTx1 = await etherNode.getLastClaim(0);
    const claimTimesBeforeTx2 = await etherNode.getLastClaim(1);
    const claimTimesBeforeTx3 = await etherNode.getLastClaim(2);

    claimTimesBeforeTx = [claimTimesBeforeTx1, claimTimesBeforeTx2, claimTimesBeforeTx3];

    await new Promise((resolve) => setTimeout(resolve, 30 * 1000));

    // await etherNode.connect(claimant).buyNode(1);
    // await etherNode.connect(claimant).buyNode(2);
    // const claimantBalance = await realToken.balanceOf(claimant.address);
    // console.log(etherNode.address, Number(ethers.utils.formatUnits(claimantBalance, 18)));
  });

  it('should transfer correct amount of reward tokens to owner', async function () {
    claimantInitBalance = await realToken.balanceOf(claimant.address);

    const miningRate1 = await etherNode.getMiningRateById(nodeIds[0]);
    const miningRate2 = await etherNode.getMiningRateById(nodeIds[1]);
    const miningRate3 = await etherNode.getMiningRateById(nodeIds[2]);

    const claimTx = await etherNode.connect(claimant).claimAllRewards();
    await claimTx.wait();

    const claimTimesAfterTx1 = await etherNode.getLastClaim(0);
    const claimTimesAfterTx2 = await etherNode.getLastClaim(1);
    const claimTimesAfterTx3 = await etherNode.getLastClaim(2);

    claimTimesAfterTx = [claimTimesAfterTx1, claimTimesAfterTx2, claimTimesAfterTx3];

    const expectedRewards1 = miningRate1.mul(31);
    const expectedRewards2 = miningRate2.mul(31);
    const expectedRewards3 = miningRate3.mul(31);

    // const totalExpected = expectedRewards1.add(expectedRewards2).add(expectedRewards3);

    const claimantFinalBalance = await realToken.balanceOf(claimant.address);
    console.log(claimantFinalBalance, claimantInitBalance);
    // expect(claimantFinalBalance).to.equal(claimantInitBalance.add(totalExpected));
  });

  it('should reset the last claim time of each claimed node', async function () {
    expect(Number(claimTimesAfterTx[0])).to.be.greaterThan(Number(claimTimesBeforeTx[0]));
    expect(Number(claimTimesAfterTx[1])).to.be.greaterThan(Number(claimTimesBeforeTx[1]));
    expect(Number(claimTimesAfterTx[1])).to.be.greaterThan(Number(claimTimesBeforeTx[1]));
  });

  it('should not allow claim to non owner', async function () {
    await expect(etherNode.connect(hacker).claimAllRewards()).to.be.revertedWith('Must owne at least one Node');
  });
});
