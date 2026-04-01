import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployDEX: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  // 1. 自动从链上抓取之前部署好的代币合约地址
  const balloonToken = await get("BalloonToken");
  const waterToken = await get("WaterToken");

  console.log("🚀 正在部署 DEX 核心流动性池...");

  // 2. 部署 DEX 合约，并把两个代币地址传给它的构造函数
  await deploy("DEX", {
    from: deployer,
    args: [balloonToken.address, waterToken.address],
    log: true,
    autoMine: true,
  });

  const dex = await get("DEX");
  console.log("✅ DEX 部署成功，地址为:", dex.address);
};

export default deployDEX;
deployDEX.tags = ["DEX"];
