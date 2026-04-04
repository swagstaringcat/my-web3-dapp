"use client";

import { useEffect, useState } from "react";
import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
// 💡 引入了新的图标 CubeTransparentIcon 用于盲盒
import { ArrowsRightLeftIcon, PhotoIcon, RocketLaunchIcon, CubeTransparentIcon } from "@heroicons/react/24/outline";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  // ==========================================
  // 🎨 原有 NFT 模块逻辑 (MyNFT)
  // ==========================================
  const { data: nextTokenId } = useScaffoldReadContract({
    contractName: "MyNFT",
    functionName: "nextTokenId",
  });

  const { data: myBalance } = useScaffoldReadContract({
    contractName: "MyNFT",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: tokenURI } = useScaffoldReadContract({
    contractName: "MyNFT",
    functionName: "tokenURI",
    args: [0n],
  });

  const [nftMetadata, setNftMetadata] = useState<any>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (tokenURI) {
        try {
          const response = await fetch(tokenURI);
          const data = await response.json();
          setNftMetadata(data);
        } catch (err) {
          console.error("解析 IPFS JSON 失败:", err);
        }
      }
    };
    fetchMetadata();
  }, [tokenURI]);

  const resolveImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("ipfs://")) {
      return url.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
    }
    return url;
  };

  // 💡 注意这里：为了防止冲突，我们将写入函数重命名为 mintMyNFT
  const { writeContractAsync: mintMyNFT, isPending: isMintLoading } = useScaffoldWriteContract("MyNFT");

  // ==========================================
  // 🦄 原有 DEX 模块逻辑
  // ==========================================
  const [sellAmount, setSellAmount] = useState("");
  const { data: dexContract } = useDeployedContractInfo("DEX");

  const { data: balBalance } = useScaffoldReadContract({
    contractName: "BalloonToken",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: watBalance } = useScaffoldReadContract({
    contractName: "WaterToken",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  // 💡 注意这里：分别为 Balloon 和 DEX 重命名写入函数
  const { writeContractAsync: writeBalloon, isPending: isApproving } = useScaffoldWriteContract("BalloonToken");
  const { writeContractAsync: writeDex, isPending: isSwapping } = useScaffoldWriteContract("DEX");

  const handleApprove = async () => {
    if (!dexContract?.address || !sellAmount) return;
    try {
      await writeBalloon({
        functionName: "approve",
        args: [dexContract.address, parseEther(sellAmount)],
      });
    } catch (e) {
      console.error("授权失败", e);
    }
  };

  const handleSwap = async () => {
    if (!sellAmount) return;
    try {
      await writeDex({
        functionName: "balloonToWater",
        args: [parseEther(sellAmount)],
      });
    } catch (e) {
      console.error("交换失败", e);
    }
  };

  // ==========================================
  // 📦 新增：盲盒 (BlindBox) 模块逻辑
  // ==========================================
  const [targetId, setTargetId] = useState("0");
  
  // 💡 注意这里：重命名为 writeBlindBox
  const { writeContractAsync: writeBlindBox } = useScaffoldWriteContract("BlindBoxNFT");

  const { data: bbURI } = useScaffoldReadContract({
    contractName: "BlindBoxNFT",
    functionName: "tokenURI",
    args: [BigInt(targetId || "0")],
  });

  const { data: isAuthorized } = useScaffoldReadContract({
    contractName: "BlindBoxNFT",
    functionName: "isAuthorizedToOpen",
    args: [BigInt(targetId || "0")],
  });

  const { data: hasOpened } = useScaffoldReadContract({
    contractName: "BlindBoxNFT",
    functionName: "hasBeenOpened",
    args: [BigInt(targetId || "0")],
  });

  // ==========================================
  // 📺 页面渲染
  // ==========================================
  return (
    <div className="flex items-center flex-col grow pt-10 pb-20 px-4">
      {/* --- 顶部：宇宙大本营标题 --- */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
          Web3 全栈大本营
        </h1>
        <div className="flex justify-center items-center space-x-2 bg-base-200 p-2 rounded-xl inline-flex shadow-sm">
          <p className="font-medium m-0 opacity-80">指挥官终端:</p>
          <Address address={connectedAddress} />
        </div>
      </div>

      {/* --- 第一层：基础双核 (NFT + DEX) --- */}
      <div className="flex flex-col md:flex-row justify-center items-stretch gap-10 w-full max-w-5xl mx-auto mb-16">
        
        {/* 左侧：普通 NFT Mint 卡片 */}
        <div className="flex-1 flex flex-col bg-base-100 shadow-xl hover:shadow-2xl transition-all p-8 rounded-3xl border-2 border-primary items-center w-full">
          <RocketLaunchIcon className="h-16 w-16 text-primary mb-4" />
          <h2 className="text-2xl font-bold">标准 NFT 工厂</h2>
          <div className="bg-primary/20 text-primary px-6 py-2 rounded-full my-6 font-mono text-xl">
            Minted: {nextTokenId?.toString() || "0"} / 1000
          </div>
          {/* 将按钮推到底部对齐 */}
          <div className="mt-auto w-full">
            <button
              className={`btn btn-primary btn-lg w-full ${isMintLoading ? "loading" : ""}`}
              disabled={isMintLoading}
              onClick={async () => {
                try {
                  await mintMyNFT({
                    functionName: "mint",
                    value: parseEther("0.01"),
                  });
                } catch (err) {
                  console.error(err);
                }
              }}
            >
              {isMintLoading ? "Minting..." : "Mint (0.01 ETH)"}
            </button>
          </div>
        </div>

        {/* 右侧：DEX 交易卡片 */}
        <div className="flex-1 flex flex-col bg-base-100 shadow-xl hover:shadow-2xl transition-all p-8 rounded-3xl border-2 border-secondary items-center w-full">
          <ArrowsRightLeftIcon className="h-16 w-16 text-secondary mb-4" />
          <h2 className="text-2xl font-bold mb-6">DeFi 兑换核心</h2>
          <div className="w-full mb-6 bg-base-200 p-4 rounded-2xl shadow-inner">
            <h3 className="font-bold text-sm mb-2 text-center opacity-70">资产雷达</h3>
            <div className="flex justify-between items-center mb-1">
              <span className="text-lg">🎈 BAL</span>
              <span className="font-mono text-lg font-bold">
                {balBalance ? parseFloat(formatEther(balBalance)).toFixed(2) : "0.00"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg">💧 WAT</span>
              <span className="font-mono text-lg font-bold text-secondary">
                {watBalance ? parseFloat(formatEther(watBalance)).toFixed(2) : "0.00"}
              </span>
            </div>
          </div>
          <div className="form-control w-full mb-6">
            <div className="relative">
              <input
                type="number"
                placeholder="支付数量 (BAL)"
                className="input input-bordered input-secondary w-full text-lg pr-16 h-12"
                value={sellAmount}
                onChange={e => setSellAmount(e.target.value)}
              />
              <button
                className="absolute right-2 top-1 btn btn-sm btn-ghost text-secondary"
                onClick={() => setSellAmount("10")}
              >
                MAX
              </button>
            </div>
          </div>
          {/* 将按钮推到底部对齐 */}
          <div className="mt-auto flex flex-col gap-3 w-full">
            <button
              className={`btn btn-accent w-full rounded-xl ${isApproving ? "loading" : ""}`}
              onClick={handleApprove}
              disabled={!sellAmount || isApproving}
            >
              1. 授权 DEX 调度资金
            </button>
            <button
              className={`btn btn-secondary w-full rounded-xl ${isSwapping ? "loading" : ""}`}
              onClick={handleSwap}
              disabled={!sellAmount || isSwapping}
            >
              2. 执行原子交换 (Swap)
            </button>
          </div>
        </div>
      </div>

      {/* --- 第二层：极客粉盲盒专属展区 --- */}
      <div className="w-full max-w-5xl bg-gray-900 border-2 border-pink-500/50 rounded-3xl p-8 md:p-12 shadow-[0_0_40px_rgba(236,72,153,0.15)] mb-16">
        <div className="flex flex-col items-center mb-8">
          <CubeTransparentIcon className="h-16 w-16 text-pink-500 mb-2 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 tracking-wider">
            盲盒交互枢纽
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-8 w-full">
          {/* 盲盒铸造区 */}
          <div className="flex-1 bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-pink-500/50 transition-all">
            <h3 className="text-xl font-bold mb-4 text-pink-400">1. 获取神秘盲盒</h3>
            <p className="text-gray-400 mb-6 text-sm">部署至 Sepolia 网络的互动式盲盒。铸造后需等待 Owner 授权方可拆封。</p>
            <button
              className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-lg tracking-widest shadow-lg shadow-pink-500/25 active:scale-95 transition-all"
              onClick={async () => {
                try {
                  await writeBlindBox({ functionName: "mint" });
                } catch (e) {
                  console.error("盲盒铸造失败", e);
                }
              }}
            >
              ✦ 铸造盲盒 ✦
            </button>
          </div>

          {/* 盲盒验货与开启区 */}
          <div className="flex-1 bg-gray-800 rounded-2xl p-6 border border-gray-700 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold mb-4 text-purple-400">2. 验货与拆封</h3>
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="number"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  placeholder="ID"
                  className="w-20 bg-gray-900 border border-purple-500/50 rounded-lg p-2 text-white text-center focus:outline-none"
                />
                <span className="text-sm text-gray-400">输入待操作的 Token ID</span>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-3 mb-6 font-mono text-xs">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-500">最高权限授权:</span>
                  <span className={isAuthorized ? "text-green-400 font-bold" : "text-red-400"}>
                    {isAuthorized ? "🟢 已放行" : "🔴 锁定中"}
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-500">物理开箱状态:</span>
                  <span className={hasOpened ? "text-pink-400 font-bold" : "text-gray-500"}>
                    {hasOpened ? "🎉 已销毁封条" : "📦 完好"}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-800 truncate">
                  <span className="text-gray-500">当前元数据链接: </span>
                  <span className={hasOpened ? "text-purple-300" : "text-gray-400"}>{bbURI || "..."}</span>
                </div>
              </div>
            </div>

            <button
              disabled={!isAuthorized || hasOpened}
              className={`w-full py-3 rounded-xl font-black text-lg tracking-wider transition-all ${
                isAuthorized && !hasOpened
                  ? "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] animate-pulse"
                  : "bg-gray-700 text-gray-500 cursor-not-allowed"
              }`}
              onClick={async () => {
                try {
                  await writeBlindBox({ functionName: "openMyBox", args: [BigInt(targetId)] });
                } catch (e) {
                  console.error("开箱失败", e);
                }
              }}
            >
              {hasOpened ? "盲盒已开启" : "⚡ 亲手拆封 ⚡"}
            </button>
          </div>
        </div>
      </div>

      {/* --- 第三层：我的 NFT 画廊区域 --- */}
      {myBalance && myBalance > 0n && (
        <div className="w-full max-w-6xl px-8 border-t-2 border-base-300 pt-10">
          <div className="flex items-center justify-center gap-2 mb-8">
            <PhotoIcon className="h-8 w-8 text-secondary" />
            <h3 className="text-3xl font-bold text-center">我的战利品画廊 ({myBalance.toString()})</h3>
          </div>

          <div className="flex flex-wrap gap-8 justify-center">
            {Array.from({ length: Number(myBalance) }).map((_, index) => (
              <div
                key={index}
                className="card w-64 bg-base-200 shadow-xl border border-secondary hover:-translate-y-2 transition-transform"
              >
                <figure className="px-4 pt-4">
                  {nftMetadata?.image ? (
                    <img
                      src={resolveImageUrl(nftMetadata.image)}
                      alt={nftMetadata.name || "NFT Image"}
                      className="rounded-xl shadow-sm"
                    />
                  ) : (
                    <div className="w-full h-48 bg-base-300 animate-pulse rounded-xl flex items-center justify-center">
                      <span className="text-sm font-mono opacity-50">加载宇宙数据中...</span>
                    </div>
                  )}
                </figure>
                <div className="card-body items-center text-center p-5">
                  <h2 className="card-title text-xl font-mono text-primary">{nftMetadata?.name || "未知代号"}</h2>
                  <div className="badge badge-success mt-2">已确权</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;