module.exports = async ({ deployments, getNamedAccounts }) => {
  const { log } = deployments;
  const { deployer } = await getNamedAccounts();
  log('Deploy placeholder using deployer: ' + deployer);
};

module.exports.tags = ['all'];
