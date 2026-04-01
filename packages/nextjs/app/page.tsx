"use client";

import { useEffect, useState } from "react";
import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
// 💡 引入了 formatEther
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
// 💡 引入了交换图标 ArrowsRightLeftIcon
import { ArrowsRightLeftIcon, PhotoIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";
// 💡 引入了 useDeployedContractInfo
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  // ==========================================
  // 🎨 NFT 模块逻辑
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

  // 区分一下 Mint 的 loading 状态
  const { writeContractAsync: mintNFT, isPending: isMintLoading } = useScaffoldWriteContract("MyNFT");

  // ==========================================
  // 🦄 DEX 模块逻辑
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
  // 📺 页面渲染
  // ==========================================
  return (
    <div className="flex items-center flex-col grow pt-10 pb-20 px-4">
      {/* --- 顶部钱包状态 --- */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          Web3 全栈大本营
        </h1>
        <div className="flex justify-center items-center space-x-2 bg-base-200 p-2 rounded-xl inline-flex">
          <p className="font-medium m-0">My Wallet:</p>
          <Address address={connectedAddress} />
        </div>
      </div>

      {/* --- 💡 终极微调：让控制台横过来 (flex-row) --- */}
      <div className="flex flex-col lg:flex-row gap-10 w-full max-w-6xl justify-center items-start">
        {/* 🎨 左侧：NFT Mint 交互卡片 (紫色边框) */}
        <div className="flex flex-col bg-base-100 shadow-2xl p-8 rounded-3xl border-4 border-primary items-center w-full max-w-md">
          <RocketLaunchIcon className="h-16 w-16 text-primary mb-4" />
          <h2 className="text-2xl font-bold">MyNFT Project</h2>

          <div className="bg-secondary text-secondary-content px-6 py-2 rounded-full my-6 font-mono text-xl">
            Minted: {nextTokenId?.toString() || "0"} / 1000
          </div>

          <button
            className={`btn btn-primary btn-lg w-full ${isMintLoading ? "loading" : ""}`}
            disabled={isMintLoading}
            onClick={async () => {
              try {
                await mintNFT({
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

        {/* 🦄 右侧：DeFi Swap 交易卡片 (青色边框) */}
        <div className="flex flex-col bg-base-100 shadow-2xl p-8 rounded-3xl border-4 border-secondary items-center w-full max-w-md">
          <ArrowsRightLeftIcon className="h-16 w-16 text-secondary mb-4" />
          <h2 className="text-2xl font-bold mb-6">DeFi Swap</h2>

          {/* 资产显示区 */}
          <div className="w-full mb-6 bg-base-200 p-4 rounded-2xl shadow-inner">
            <h3 className="font-bold text-sm mb-2 text-center opacity-70">我的钱包余额</h3>
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

          {/* 交易输入区 */}
          <div className="form-control w-full mb-6">
            <label className="label">
              <span className="label-text font-bold">支付数量 (BAL)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="0.0"
                className="input input-bordered input-secondary w-full text-xl pr-16 h-14"
                value={sellAmount}
                onChange={e => setSellAmount(e.target.value)}
              />
              <button
                className="absolute right-2 top-1.5 btn btn-sm btn-ghost text-secondary"
                onClick={() => setSellAmount("10")}
              >
                MAX
              </button>
            </div>
          </div>

          {/* 操作按钮区 */}
          <div className="flex flex-col gap-3 w-full">
            <button
              className={`btn btn-accent w-full rounded-xl ${isApproving ? "loading" : ""}`}
              onClick={handleApprove}
              disabled={!sellAmount || isApproving}
            >
              1. 授权 DEX 使用 BAL
            </button>
            <button
              className={`btn btn-secondary w-full rounded-xl ${isSwapping ? "loading" : ""}`}
              onClick={handleSwap}
              disabled={!sellAmount || isSwapping}
            >
              2. 执行交换 (Swap)
            </button>
          </div>
        </div>
      </div>

      {/* --- 底部：我的 NFT 画廊区域 --- */}
      {myBalance && myBalance > 0n && (
        <div className="mt-20 w-full max-w-5xl px-8 border-t-2 border-base-300 pt-10">
          <div className="flex items-center justify-center gap-2 mb-8">
            <PhotoIcon className="h-8 w-8 text-secondary" />
            <h3 className="text-3xl font-bold text-center">我的 NFT 藏品 ({myBalance.toString()})</h3>
          </div>

          <div className="flex flex-wrap gap-8 justify-center">
            {Array.from({ length: Number(myBalance) }).map((_, index) => (
              <div
                key={index}
                className="card w-64 bg-base-200 shadow-xl border border-secondary hover:scale-105 transition-transform"
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
                  <div className="badge badge-success mt-2">已拥有</div>
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
