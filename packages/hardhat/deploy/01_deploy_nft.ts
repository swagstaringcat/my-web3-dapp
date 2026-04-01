import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

const deployMyNFT: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("🚀 正在部署 NFT 合约，部署者:", deployer);

  await deploy("MyNFT", {
    from: deployer,
    // 💡 构造函数参数：第一个参数是 ERC721 的名字，第二个是符号，第三个是 Owner
    // 注意：MyNFT.sol 的 constructor(address initialOwner) 只需要一个参数
    args: [deployer],
    log: true,
    autoMine: true,
  });

  // 获取合约实例用于确认
  const myNFT = await hre.ethers.getContract<Contract>("MyNFT", deployer);
  console.log("✅ NFT 合约已部署到:", await myNFT.getAddress());
};

export default deployMyNFT;

// 给脚本加个标签，方便以后单独运行：yarn deploy --tags MyNFT
deployMyNFT.tags = ["MyNFT"];
