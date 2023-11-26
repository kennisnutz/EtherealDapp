import { ethers, run } from 'hardhat';

// import deployer from '../.secret';

async function main() {
  const RealToken = await ethers.getContractFactory('RealToken');
  const realtToken = await RealToken.deploy('Real Token Test3', 'RLTT3');
  await realtToken.deployed();

  console.log('Real Token successfully contract deployed at: ', realtToken.address);

  const Ethernode = await ethers.getContractFactory('Ethernode');
  const etherNode = await Ethernode.deploy(realtToken.address);

  console.log('EtherNode contract successfully deployed at: ', etherNode.address);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
