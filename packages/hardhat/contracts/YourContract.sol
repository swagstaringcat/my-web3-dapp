//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
 * It also allows the owner to withdraw the Ether in the contract
 * @author BuidlGuidl
 */
contract YourContract {
    // 1. 去掉了 immutable，这样我们以后才能修改它
    address public owner; 
    string public greeting = "Building Unstoppable Apps!!!";
    bool public premium = false;
    uint256 public totalCounter = 0;
    mapping(address => uint) public userGreetingCounter;

    event GreetingChange(address indexed greetingSetter, string newGreeting, bool premium, uint256 value);
    // 新增：所有权转让事件
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
    owner = msg.sender; 
    }

    modifier isOwner() {
        require(msg.sender == owner, "Not the Owner");
        _;
    }

    // --- 功能 A：存钱与修改文字 ---
    function setGreeting(string memory _newGreeting) public payable {
        require(msg.value >= 0.01 ether, "Minimum 0.01 ETH required");

        greeting = _newGreeting;
        totalCounter += 1;

        if (totalCounter % 10 == 0) {
        uint256 currentBalance = address(this).balance;
        
        // 1. 💡 增加：庄家抽成 5%
        uint256 ownerFee = (currentBalance * 5) / 100;
        (bool feeSuccess, ) = owner.call{value: ownerFee}("");
        require(feeSuccess, "Fee transfer failed");

        // 2. 发放剩余大奖 (95%)
        uint256 prize = address(this).balance; 
        (bool success, ) = msg.sender.call{value: prize}("");
        require(success, "Prize transfer failed");
        
        console.log("Winner prize sent! Fee collected:", ownerFee);
    } else {
        // 普通返现 10%
        uint256 cashback = msg.value / 10;
        (bool success, ) = msg.sender.call{value: cashback}("");
        require(success, "Cashback failed");
    }

    emit GreetingChange(msg.sender, _newGreeting, msg.value > 0, msg.value);
}

    // --- 功能 B：权限转让 (New!) ---
    function transferOwnership(address newOwner) public isOwner {
        require(newOwner != address(0), "New owner is the zero address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    // --- 功能 C：取钱 ---
    function withdraw() public isOwner {
        uint256 amount = address(this).balance;
        require(amount > 0, "No balance to withdraw");
        
        (bool success, ) = owner.call{ value: amount }("");
        require(success, "Failed to send Ether");
    }

    receive() external payable {}
}