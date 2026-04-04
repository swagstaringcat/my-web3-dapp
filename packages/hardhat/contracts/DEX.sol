// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DEX {
    IERC20 public balloonToken;
    IERC20 public waterToken;

    uint256 public totalLiquidity; // 总流动性份额

    constructor(address _balloonAddr, address _waterAddr) {
        balloonToken = IERC20(_balloonAddr);
        waterToken = IERC20(_waterAddr);
    }

    // 💡 核心函数：计算交换价格 (滑点计算)
    // 根据 x * y = k 公式计算输入一定数量 inputAmount 后能换出多少 outputAmount
    function price(uint256 inputAmount, uint256 inputReserve, uint256 outputReserve) public pure returns (uint256) {
        uint256 inputAmountWithFee = inputAmount * 997; // 扣除 0.3% 手续费
        uint256 numerator = inputAmountWithFee * outputReserve;
        uint256 denominator = (inputReserve * 1000) + inputAmountWithFee;
        return numerator / denominator;
    }

    // 🚀 初始化池子：第一次向池子注入两种代币
    function init(uint256 balloonAmount, uint256 waterAmount) public returns (uint256) {
        require(totalLiquidity == 0, "DEX: already has liquidity");
        totalLiquidity = balloonAmount; // 初始流动性设为 balloon 数量

        // 将两种代币从你的钱包转入这个 DEX 合约
        require(balloonToken.transferFrom(msg.sender, address(this), balloonAmount), "BAL transfer failed");
        require(waterToken.transferFrom(msg.sender, address(this), waterAmount), "WAT transfer failed");

        return totalLiquidity;
    }

    // 🔄 交换：用 Balloon 换 Water
    function balloonToWater(uint256 balloonInput) public returns (uint256 waterOutput) {
        uint256 balloonReserve = balloonToken.balanceOf(address(this));
        uint256 waterReserve = waterToken.balanceOf(address(this));

        waterOutput = price(balloonInput, balloonReserve, waterReserve);

        require(balloonToken.transferFrom(msg.sender, address(this), balloonInput), "BAL transfer failed");
        require(waterToken.transfer(msg.sender, waterOutput), "WAT transfer failed");
    }

    // 🔄 交换：用 Water 换 Balloon
    function waterToBalloon(uint256 waterInput) public returns (uint256 balloonOutput) {
        uint256 waterReserve = waterToken.balanceOf(address(this));
        uint256 balloonReserve = balloonToken.balanceOf(address(this));

        balloonOutput = price(waterInput, waterReserve, balloonReserve);

        require(waterToken.transferFrom(msg.sender, address(this), waterInput), "WAT transfer failed");
        require(balloonToken.transfer(msg.sender, balloonOutput), "BAL transfer failed");
    }
}
