require('@nomicfoundation/hardhat-toolbox');
require('hardhat-deploy');

module.exports = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  },
  networks: {
    local: {
      url: 'http://127.0.0.1:8545',
      chainId: 31337,
      accounts: {
        mnemonic: 'test test test test test test test test test test test junk',
        count: 20
      }
    }
  },
  namedAccounts: {
    deployer: { default: 0 },
    alice: { default: 1 },
    bob: { default: 2 },
    treasury: { default: 3 }
  }
};
