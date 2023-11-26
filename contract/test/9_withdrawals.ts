import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('Erc20 Withdrawal', function () {
  let etherNode: Contract;
  let realToken: Contract;
  let testToken: Contract;
  let owner: SignerWithAddress;
  let nonOwner: SignerWithAddress;

  before(async function () {
    [owner, nonOwner] = await ethers.getSigners();

    const Ethernode = await ethers.getContractFactory('Ethernode');
    const RealToken = await ethers.getContractFactory('RealToken');
    realToken = await RealToken.deploy('Real Token', 'RLT');
    await realToken.deployed();

    const TestToken = await ethers.getContractFactory('RealToken');
    testToken = await TestToken.deploy('Test Token', 'TLT');
    await testToken.deployed();

    etherNode = await Ethernode.deploy(realToken.address);
    await etherNode.deployed();

    await realToken.connect(owner).transfer(nonOwner.address, ethers.utils.parseEther('100000'));
    await realToken.connect(owner).transfer(etherNode.address, ethers.utils.parseEther('100000'));
  });

  it('should transfer the specified amount of ERC20 tokens to the caller', async function () {
    const hexBalance = await realToken.balanceOf(owner.address);
    const initialBalance = Number(ethers.utils.formatEther(hexBalance));
    const amountToWithdraw = ethers.utils.parseEther('1000');

    await etherNode.connect(owner).withdrawERC20(realToken.address, amountToWithdraw);
    const finalBalance = await realToken.balanceOf(owner.address);
    expect(Number(ethers.utils.formatEther(finalBalance))).to.be.equal(
      initialBalance + Number(ethers.utils.formatEther(amountToWithdraw))
    );
  });

  it('should emit Erc20Withdrawal event', async function () {
    const amountToWithdraw = ethers.utils.parseEther('1000');
    await expect(etherNode.connect(owner).withdrawERC20(realToken.address, amountToWithdraw)).to.emit(
      etherNode,
      'Erc20Withdrawal'
    );
  });

  it('should revert when the ERC20 token balance of the contract is 0', async function () {
    const withdrawalAmount = ethers.utils.parseEther('20');
    await expect(etherNode.connect(owner).withdrawERC20(testToken.address, withdrawalAmount)).to.be.revertedWith(
      'Insufficient balance'
    );
  });

  it('should revert when called with an amount greater than the ERC20 token balance of the contract', async function () {
    await testToken.connect(owner).transfer(etherNode.address, ethers.utils.parseEther('10'));
    const withdrawalAmount = ethers.utils.parseEther('20');
    await expect(etherNode.connect(owner).withdrawERC20(testToken.address, withdrawalAmount)).to.be.revertedWith(
      'Insufficient balance'
    );
  });

  it('should revert when called with zero amount', async function () {
    const withdrawalAmount = ethers.constants.Zero;
    await expect(etherNode.connect(owner).withdrawERC20(realToken.address, withdrawalAmount)).to.be.revertedWith(
      'Amount must be greater than 0'
    );
  });

  it('should revert when called by a user that is not the owner', async function () {
    const withdrawalAmount = ethers.utils.parseEther('20');
    await expect(etherNode.connect(nonOwner).withdrawERC20(realToken.address, withdrawalAmount)).to.be.revertedWith(
      'Ownable: caller is not the owner'
    );
  });
});

describe('ETH Withdrawal', function () {
  let etherNode: Contract;
  let realToken: Contract;
  let owner: SignerWithAddress;
  let nonOwner: SignerWithAddress;
  let initialBalance: any;

  before(async function () {
    [owner, nonOwner] = await ethers.getSigners();

    const Ethernode = await ethers.getContractFactory('Ethernode');
    const RealToken = await ethers.getContractFactory('RealToken');

    realToken = await RealToken.deploy('Real Token', 'RLT');
    await realToken.deployed();
    etherNode = await Ethernode.deploy(realToken.address);
    await etherNode.deployed();
  });

  it('should transfer the specified amount of ETH to the caller', async function () {
    await owner.sendTransaction({ to: etherNode.address, value: ethers.utils.parseEther('10') });
    initialBalance = await ethers.provider.getBalance(owner.address);

    const withdrawalAmount = ethers.utils.parseEther('1');
    const tx = await etherNode.connect(owner).withdrawEther(withdrawalAmount);

    const transactionReceipt = await ethers.provider.waitForTransaction(tx.hash);

    const newBalance = await ethers.provider.getBalance(owner.address);

    const expectedBal = initialBalance.add(withdrawalAmount).sub(transactionReceipt.gasUsed);

    expect(Number(ethers.utils.formatEther(newBalance))).to.be.closeTo(
      Number(ethers.utils.formatEther(expectedBal)),
      258052000000
    );
  });

  it('should revert when the ETH balance of the contract is 0', async function () {
    const withdrawalAmount = ethers.utils.parseEther('9');
    const tx = await etherNode.connect(owner).withdrawEther(withdrawalAmount);

    await ethers.provider.waitForTransaction(tx.hash);
    await expect(etherNode.connect(owner).withdrawEther(withdrawalAmount)).to.be.revertedWith('Insufficient balance');
  });

  it('should revert when called with an amount greater than the ETH balance of the contract', async function () {
    const initialBalance = await ethers.provider.getBalance(etherNode.address);
    const withdrawalAmount = initialBalance.add(ethers.utils.parseEther('1'));

    await expect(etherNode.connect(owner).withdrawEther(withdrawalAmount)).to.be.revertedWith('Insufficient balance');
  });

  it('should revert when called with zero amount', async function () {
    const withdrawalAmount = ethers.constants.Zero;
    await expect(etherNode.connect(owner).withdrawEther(withdrawalAmount)).to.be.revertedWith(
      'Amount must be greater than 0'
    );
  });

  it('should revert when called by a user that is not the owner', async function () {
    const withdrawalAmount = ethers.utils.parseEther('1');
    await expect(etherNode.connect(nonOwner).withdrawEther(withdrawalAmount)).to.be.revertedWith(
      'Ownable: caller is not the owner'
    );
  });
});
