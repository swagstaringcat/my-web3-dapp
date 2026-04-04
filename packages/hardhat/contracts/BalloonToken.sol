// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BalloonToken is ERC20, Ownable {
    // 部署时，直接给部署者（也就是你）发送 1000 个代币作为初始资金
    constructor(address initialOwner) ERC20("BalloonToken", "BAL") Ownable(initialOwner) {
        // 注意：ERC20 默认有 18 位小数，所以 1000 个代币要乘以 10**18
        _mint(msg.sender, 1000 * 10 ** decimals());
    }

    // 💡 终极修改：去掉了 onlyOwner！现在你的新钱包可以直接给自己印钞了！
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
