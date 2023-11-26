import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';

describe('Token contract', function () {
  let owner: any;
  let realToken: Contract;
  let addr1;

  before(async function () {
    const Token = await ethers.getContractFactory('RealToken'); // Replace with your token contract name
    realToken = await Token.deploy('Real Token', 'RLT');
    await realToken.deployed();
    [owner, addr1] = await ethers.getSigners();
  });

  it('Should return the correct token balance', async function () {
    const balanceHex = await realToken.balanceOf(owner.address);
    const balance = Number(ethers.utils.formatUnits(balanceHex, 18));
    expect(balance).to.equal(100000000);
  });

  it('Should have total supply of 100 million tokens', async function () {
    const totalSupply = await realToken.totalSupply();
    expect(Number(ethers.utils.formatUnits(totalSupply, 18))).to.equal(100000000);
  });
});

// describe('Ethereals Contract', function () {
//   it('Deploys correctly', async function () {
//     it('Should deploy correctly ');

//   });
// });
