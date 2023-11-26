import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('setRefundPercent', function () {
  let etherNodes: Contract;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let realToken: Contract;

  beforeEach(async () => {
    [owner, user1] = await ethers.getSigners();
    const RealToken = await ethers.getContractFactory('RealToken'); // Replace with your ERC20 token contract
    realToken = await RealToken.deploy('Real Token', 'RLT');
    await realToken.deployed();

    const EtherNodes = await ethers.getContractFactory('Ethernode');
    etherNodes = await EtherNodes.deploy(realToken.address);
    await etherNodes.deployed();
  });

  it('Should change the refund percentage', async function () {
    const initialRefundPercent = await etherNodes.getRefundPercent();
    await etherNodes.connect(owner).setRefundPercent(60);
    const finalRefundPercent = await etherNodes.getRefundPercent();
    expect(Number(ethers.utils.formatUnits(finalRefundPercent, 18))).to.be.greaterThan(
      Number(ethers.utils.formatUnits(initialRefundPercent, 18))
    );
  });

  it('Should revert when called by none owner', async function () {
    await expect(etherNodes.connect(user1).setRefundPercent(60)).to.be.reverted;
  });

  it('Should emit RefundPercentChange event', async function () {
    await expect(etherNodes.connect(owner).setRefundPercent(60)).to.emit(etherNodes, 'RefundPercentChange');
  });
});

describe('setPrice', function () {
  let etherNodes: Contract;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let realToken: Contract;

  beforeEach(async () => {
    [owner, user1] = await ethers.getSigners();
    const RealToken = await ethers.getContractFactory('RealToken'); // Replace with your ERC20 token contract
    realToken = await RealToken.deploy('Real Token', 'RLT');
    await realToken.deployed();

    const EtherNodes = await ethers.getContractFactory('Ethernode');
    etherNodes = await EtherNodes.deploy(realToken.address);
    await etherNodes.deployed();
  });

  it('Should change the price of node type', async function () {
    const initialNodePrice = await etherNodes.getPrice(2);
    await etherNodes.connect(owner).setPrice(2, ethers.utils.parseEther('50'));
    const finalNodePrice = await etherNodes.getPrice(2);
    expect(Number(ethers.utils.formatUnits(finalNodePrice, 18))).to.be.greaterThan(
      Number(ethers.utils.formatUnits(initialNodePrice, 18))
    );
  });

  it('Should revert when called by none owner', async function () {
    await expect(etherNodes.connect(user1).setPrice(2, ethers.utils.parseEther('50'))).to.be.reverted;
  });

  it('Should emit PriceChange event', async function () {
    await expect(etherNodes.connect(owner).setPrice(2, ethers.utils.parseEther('50'))).to.emit(
      etherNodes,
      'PriceChange'
    );
  });
});

describe('setMiningRate', function () {
  let etherNodes: Contract;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let realToken: Contract;

  beforeEach(async () => {
    [owner, user1] = await ethers.getSigners();
    const RealToken = await ethers.getContractFactory('RealToken'); // Replace with your ERC20 token contract
    realToken = await RealToken.deploy('Real Token', 'RLT');
    await realToken.deployed();

    const EtherNodes = await ethers.getContractFactory('Ethernode');
    etherNodes = await EtherNodes.deploy(realToken.address);
    await etherNodes.deployed();
  });

  it('Should change the mining rate of node type', async function () {
    const initialMiningRate = await etherNodes.getMiningRateByType(2);
    await etherNodes.connect(owner).setMiningRate(2, ethers.utils.parseEther('1'));
    const finalMiningRate = await etherNodes.getMiningRateByType(2);
    expect(Number(ethers.utils.formatUnits(finalMiningRate, 18))).to.be.greaterThan(
      Number(ethers.utils.formatUnits(initialMiningRate, 18))
    );
  });

  it('Should revert when called by none owner', async function () {
    await expect(etherNodes.connect(user1).setMiningRate(2, ethers.utils.parseEther('50'))).to.be.reverted;
  });

  it('Should emit RateChange event', async function () {
    await expect(etherNodes.connect(owner).setMiningRate(2, ethers.utils.parseEther('50'))).to.emit(
      etherNodes,
      'RateChange'
    );
  });
});
