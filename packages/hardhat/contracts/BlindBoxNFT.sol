// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract BlindBoxNFT is ERC721, Ownable {
    using Strings for uint256;

    uint256 public nextTokenId;
    string public notRevealedUri;
    string public baseURI;

    // 💡 极客改造 1：记录【Owner是否授权】该盲盒可以被打开
    mapping(uint256 => bool) public isAuthorizedToOpen;

    // 💡 极客改造 2：记录【用户是否已经】亲手打开了这个盲盒
    mapping(uint256 => bool) public hasBeenOpened;

    constructor(
        address initialOwner,
        string memory _notRevealedUri
    ) ERC721("Interactive Blind Box", "IBB") Ownable(initialOwner) {
        notRevealedUri = _notRevealedUri;
    }

    function mint() public {
        uint256 currentTokenId = nextTokenId;
        _mint(msg.sender, currentTokenId);
        nextTokenId++;
    }

    // 👑 老板特权：设置真实的星际数据根目录 (开盒前必须先设置好这个)
    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    // 👑 老板特权 (授权)：老板给特定的 Token ID 颁发“开盒许可证”
    function authorizeOpen(uint256 tokenId) public onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        isAuthorizedToOpen[tokenId] = true;
    }

    // 👤 玩家专属操作 (开箱)：玩家自己花 Gas 费打开属于自己的盲盒！
    function openMyBox(uint256 tokenId) public {
        // 安全防线 1：这必须是你自己的盲盒！
        require(ownerOf(tokenId) == msg.sender, "You do not own this box!");
        // 安全防线 2：老板必须已经给你发了许可证！
        require(isAuthorizedToOpen[tokenId] == true, "Owner has not authorized this box yet!");
        // 安全防线 3：不能重复开箱！
        require(hasBeenOpened[tokenId] == false, "Box is already opened!");

        // 💥 咔嚓！用户亲手扯断封条，盲盒打开！
        hasBeenOpened[tokenId] = true;
    }

    // 🧠 核心重写：现在的查询逻辑针对每一个单独的盲盒
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireOwned(tokenId);

        // 如果这个专属盲盒还没有被用户亲手打开，永远返回带问号的箱子！
        if (hasBeenOpened[tokenId] == false) {
            return notRevealedUri;
        }

        // 如果用户已经开箱了，拼接展示真实的专属图片
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json")) : "";
    }
}
