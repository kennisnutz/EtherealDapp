import { task, HardhatUserConfig } from 'hardhat/config';
import '@typechain/hardhat';
import '@nomiclabs/hardhat-waffle';
import '@nomicfoundation/hardhat-verify';

import deployer from './.secret';

// const BSC_RPC = 'https://bsc-dataseed.binance.org/';
const BSC_RPC = 'https://bsc-dataseed1.defibit.io/';
const BSC_Tetsnet_RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545/';

const ARB_RPC = 'https://arb1.arbitrum.io/rpc';
const ARB_Tetsnet_RPC = 'https://goerli-rollup.arbitrum.io/rpc';

const ETH_RPC = `https://eth-mainnet.alchemyapi.io/v2/${deployer.ALCHEMY_MIANNET_API_KEY}`;
const ETH_Tetsnet_RPC = `https://eth-goerli.g.alchemy.com/v2/${deployer.ALCHEMY_TESTNET_API_KEY}`;

// const POLYGON_RPC = '';
// const POLYGON_Tetsnet_RPC = '';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.0',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      // loggingEnabled: true,

      accounts: {
        accountsBalance: '100000000000000000000', // 1 mil ether
      },
    },
    //BINANCE SMART CHAIN
    bscTestnet: {
      url: BSC_Tetsnet_RPC,
      chainId: 0x61,
      accounts: [deployer.private],
    },
    bscMainnet: {
      url: BSC_RPC,
      chainId: 0x38,
      accounts: [deployer.private],
    },
    //ARBITRUM
    arbTestnet: {
      url: ARB_Tetsnet_RPC,
      chainId: 421613,
      accounts: [deployer.private],
    },
    arbMainnet: {
      url: ARB_RPC,
      chainId: 42161,
      accounts: [deployer.private],
    },

    // ETHEREUM
    ethTestnet: {
      url: ETH_Tetsnet_RPC,
      chainId: 5,
      accounts: [deployer.private],
    },
    ethMainnet: {
      url: ETH_RPC,
      chainId: 42161,
      accounts: [deployer.private],
    },
  },
  mocha: {
    timeout: 40000,
  },
  etherscan: {
    apiKey: {
      ethMainnet: deployer.ETHERSCAN_API_KEY,
      bscMainnet: deployer.BSCSCAN_API_KEY,
      arbMainnet: deployer.ARBISCAN_API_KEY,
      ethTestnet: deployer.ETHERSCAN_API_KEY,
    },
    customChains: [
      {
        network: 'arbMainnet',
        chainId: 42161,
        urls: {
          apiURL: 'https://api.arbiscan.io/api',
          browserURL: 'https://arbiscan.io/',
        },
      },
      {
        network: 'bscMainnet',
        chainId: 0x38,
        urls: {
          apiURL: 'https://api.bscscan.com/api',
          browserURL: 'https://bscscan.com/',
        },
      },
      {
        network: 'ethTestnet',
        chainId: 5,
        urls: {
          apiURL: 'https://api-goerli.etherscan.io/api',
          browserURL: 'https://goerli.etherscan.io',
        },
      },
    ],
  },
};

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = config;
