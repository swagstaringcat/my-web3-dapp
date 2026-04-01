import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` or `yarn account:import` to import your
    existing PK which will fill DEPLOYER_PRIVATE_KEY_ENCRYPTED in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  // 💡 强行给 owner 充钱到 10,000 ETH (仅限本地网络)
  if (hre.network.name === "localhost" || hre.network.name === "hardhat") {
    await hre.network.provider.send("hardhat_setBalance", [
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      "0x21E19E0C9BAB2400000", // 十六进制的 10,000 ETH
    ]);
    console.log("💰 [本地环境] 已自动为 Owner 充值至 10,000 ETH");
  } else {
    console.log(`🌐 [公共网络] 当前位于 ${hre.network.name}，跳过充值作弊代码，使用真实钱包余额`);
  }

  await deploy("YourContract", {
    from: deployer,
    // args: [deployer],  <-- 把这一行删掉或注释掉
    log: true,
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const yourContract = await hre.ethers.getContract<Contract>("YourContract", deployer);
  console.log("👋 Initial greeting:", await yourContract.greeting());
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["YourContract"];
