import { expect } from "chai";
import { ethers } from "hardhat";
// 引入合约类型以便于有智能提示
import { BlindBoxNFT } from "../typechain-types";

describe("📦 盲盒合约自动化测试 (BlindBoxNFT)", function () {
  // 定义全局变量，方便在不同测试用例中调用
  let blindBox: BlindBoxNFT;
  let owner: any;
  let player1: any;

  const MYSTERY_URI = "ipfs://mystery-box-uri";
  const REAL_BASE_URI = "ipfs://real-data-uri/";

  // 1. 在所有测试开始前，先在本地内存里部署一个全新的合约
  before(async () => {
    // 获取测试用的虚拟账号（owner 是老板，player1 是玩家）
    [owner, player1] = await ethers.getSigners();

    // 获取合约工厂并部署
    const BlindBoxFactory = await ethers.getContractFactory("BlindBoxNFT");
    blindBox = (await BlindBoxFactory.deploy(owner.address, MYSTERY_URI)) as BlindBoxNFT;
    await blindBox.waitForDeployment();
  });

  // --------------------------------------------------------
  // 🟢 测试用例 1：玩家是否能正常铸造盲盒？
  // --------------------------------------------------------
  it("1. 玩家应该能成功铸造盲盒，且初始看到的是神秘箱子链接", async function () {
    // 玩家 1 调用 mint
    await blindBox.connect(player1).mint();

    // 检查玩家 1 的余额是否变成了 1
    expect(await blindBox.balanceOf(player1.address)).to.equal(1n);

    // 检查 Token 0 的所有者是不是玩家 1
    expect(await blindBox.ownerOf(0)).to.equal(player1.address);

    // 检查此时读取的 URI 是不是问号箱子
    expect(await blindBox.tokenURI(0)).to.equal(MYSTERY_URI);
  });

  // --------------------------------------------------------
  // 🔴 测试用例 2：安全拦截测试 (未授权开箱)
  // --------------------------------------------------------
  it("2. 如果老板未授权，玩家强行开箱应该被合约拦截报错", async function () {
    // 玩家 1 强行调用 openMyBox(0)，预期合约会抛出错误 "Owner has not authorized..."
    await expect(blindBox.connect(player1).openMyBox(0)).to.be.revertedWith("Owner has not authorized this box yet!");
  });

  // --------------------------------------------------------
  // 🟢 测试用例 3：完整的双边互动开箱流程
  // --------------------------------------------------------
  it("3. 老板设置数据并授权后，玩家可以成功开箱并看到真实数据", async function () {
    // 第一步：老板设置真实的 BaseURI
    await blindBox.connect(owner).setBaseURI(REAL_BASE_URI);

    // 第二步：老板给 0 号盲盒授权
    await blindBox.connect(owner).authorizeOpen(0);

    // 检查授权状态是否变为了 true
    expect(await blindBox.isAuthorizedToOpen(0)).to.equal(true);

    // 第三步：玩家 1 终于可以成功开启自己的盲盒了！
    await blindBox.connect(player1).openMyBox(0);

    // 检查盲盒物理开启状态是否变为了 true
    expect(await blindBox.hasBeenOpened(0)).to.equal(true);

    // 终极检查：此时的 URI 应该拼接成了真实的星际坐标！
    expect(await blindBox.tokenURI(0)).to.equal(`${REAL_BASE_URI}0.json`);
  });
});
