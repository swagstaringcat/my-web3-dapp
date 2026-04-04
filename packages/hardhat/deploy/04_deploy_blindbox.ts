import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployBlindBoxNFT: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // 这是一个通用的“神秘盲盒” JSON 文件的 IPFS 链接，我提前为你准备好了
  // 里面只有一张画着问号的箱子图片
  const MYSTERY_BOX_URI = "ipfs://QmZYmH5iDbD6v3U2ixoVAjioSzvWJUvKPdNu3Y1azn232a";

  await deploy("BlindBoxNFT", {
    from: deployer,
    // 传入构造函数的两个参数：拥有者地址、神秘箱子 URI
    args: [deployer, MYSTERY_BOX_URI],
    log: true,
    autoMine: true,
  });
};

export default deployBlindBoxNFT;
deployBlindBoxNFT.tags = ["BlindBoxNFT"];
