<div align="center">
  <img src="https://github.com/user-attachments/assets/7bafa8f4-8443-4095-8bea-5c88cff61593" alt="Web3 Full-Stack Hub" width="800" style="border-radius: 12px;"/>

  <h1>🚀 Web3 全栈大本营 (Web3 Full-Stack Hub)</h1>
  
  <p>这是一个由 <b><a href="https://github.com/swagstaringcat">swagstaringcat</a></b> 独立开发的全栈去中心化应用（DApp）。</p>
  <p>基于当前最先进的 <b>Scaffold-ETH 2</b> 框架构建，集成了自动化的 NFT 工厂、DeFi 流动性兑换（DEX），以及一套极其硬核的“双边互动式”盲盒机制。本项目展示了从 Solidity 底层智能合约开发、自动化安全测试，到 React/Next.js 前端交互与区块链状态同步的完整全栈闭环。</p>
</div>

---

## 🌟 核心硬核架构 (Core Features)

### 📦 1. 终极互动盲盒 (Interactive Reveal NFT)

<p align="center">
  <img src="https://github.com/user-attachments/assets/d1bee5dc-cd15-4216-b58b-eb252710378d" alt="Blind Box Interaction" width="600" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);"/>
</p>

突破了传统全网统一开盒的无聊体验，设计了极具仪式感的**“授权-开启”双边互动机制**：
- **权限与数据隔离**：铸造初期所有权盲盒指向统一的 IPFS 占位符。
- **单体授权 (Authorize)**：拥有最高权限的 Owner 可针对特定 Token ID 注入真实的星际坐标数据，并下发开启许可。
- **玩家拆封 (Reveal)**：前端 UI 根据链上状态实时反馈。获取授权的玩家需亲自支付 Gas 费调用 `openMyBox` 函数，销毁封条，完成极其刺激的开箱体验。

### 🦄 2. DeFi 原子交换核心 (DEX Swap)
- **多资产发行**：独立部署了 `BalloonToken` (BAL) 和 `WaterToken` (WAT) 两种 ERC-20 资产。
- **流动性兑换**：实现了前端“一键授权 (Approve) + 交换 (Swap)”的无缝 DeFi 体验。

### 🏭 3. 动态 NFT 工厂
<p align="center">
  <img src="https://github.com/user-attachments/assets/390a395f-4908-410d-96b9-5b0e3bf534e0" alt="NFT Gallery" width="600" style="border-radius: 8px;"/>
</p>
- 编写了标准的 ERC-721 合约。
- 前端自动监听并渲染个人战利品画廊 (NFT Gallery)，实现所见即所得。

---

## 🛠️ 技术栈 (Tech Stack)

- **智能合约**: Solidity (`^0.8.20`), OpenZeppelin, Hardhat (附带 Chai 自动化测试, 覆盖率验证)
- **前端架构**: Next.js (React), Tailwind CSS, DaisyUI
- **Web3 通信**: Wagmi, Viem, Scaffold-ETH 2 Hooks
- **工程化标准**: 严格的 ESLint 审计, Prettier 自动化排版, GitHub Actions CI/CD 流水线

---

## 💻 本地极客部署 (Quick Start)

如果你想在本地复现这座大本营，请按以下步骤操作：

1. **克隆代码库并安装现代依赖 (需要启用 Corepack)**:
   ```bash
   git clone [https://github.com/swagstaringcat/my-web3-dapp.git](https://github.com/swagstaringcat/my-web3-dapp.git)
   cd my-web3-dapp
   yarn install
启动本地虚拟节点:

yarn chain
在第二个终端，部署全套合约:

yarn deploy
在第三个终端，启动前端控制台:

yarn start
访问 http://localhost:3000 即可接管大本营！