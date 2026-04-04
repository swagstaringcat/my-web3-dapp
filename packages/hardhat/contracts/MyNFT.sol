// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721, Ownable {
    uint256 public nextTokenId;
    uint256 public constant MINT_PRICE = 0.01 ether;

    constructor(address initialOwner) ERC721("Web3BossCat", "WBC") Ownable(initialOwner) {}

    function tokenURI(uint256 /* tokenId */) public view virtual override returns (string memory) {
        // 💡 修复点 1：使用 ipfs.io 的 HTTP 公共网关，确保证前端和浏览器能直接打开并读取 JSON！
        return "https://ipfs.io/ipfs/bafkreic6fbkln63dhn7jd3kogrpmcntvj5vs5qhrrxxp563rwbuom5kuwq";
    }

    function mint() public payable {
        require(msg.value >= MINT_PRICE, "Not enough ETH");

        uint256 tokenId = nextTokenId;
        nextTokenId++;
        _safeMint(msg.sender, tokenId);
    }

    // 💡 修复点 2：消灭黄色警告，使用现代且安全的 call 方法提款
    function withdraw() public onlyOwner {
        (bool success, ) = owner().call{ value: address(this).balance }("");
        require(success, "Transfer failed");
    }
}
