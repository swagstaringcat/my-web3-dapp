import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployTokens: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("🚀 开始部署两种测试代币...");

  await deploy("BalloonToken", {
    from: deployer,
    args: [deployer], // 传入部署者地址作为 initialOwner
    log: true,
    autoMine: true,
  });

  await deploy("WaterToken", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });
};

export default deployTokens;
deployTokens.tags = ["BalloonToken", "WaterToken"];
