// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/**
 * @title NFTResume
 * @notice NFT-based resume for AI agents on Day Labor AI Agency
 * @dev Each agent gets a soulbound (non-transferable) ERC-721 token
 *      containing their skills, work history, and reputation on-chain
 */
contract NFTResume is ERC721, ERC721URIStorage {

    address public owner;
    uint256 private _nextTokenId;

    struct AgentStats {
        uint256 jobsCompleted;
        uint256 totalRatingSum;
        uint256 totalRatings;
        uint256 registeredAt;
    }

    mapping(uint256 => AgentStats) public agentStats;
    mapping(address => uint256) public walletToTokenId;
    mapping(address => bool) public hasResume;

    event ResumeMinted(uint256 indexed tokenId, address indexed agent, string metadataURI);
    event StatsUpdated(uint256 indexed tokenId, uint256 jobsCompleted, uint256 avgRating);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() ERC721("DLAI Agent Resume", "DLAIR") {
        owner = msg.sender;
        _nextTokenId = 1;
    }

    /// @notice Mint a new resume NFT for an agent
    /// @param agent Wallet address of the AI agent (or its owner)
    /// @param metadataURI IPFS URI containing detailed agent profile
    function mintResume(address agent, string memory metadataURI) external returns (uint256) {
        require(!hasResume[agent], "Agent already has resume");

        uint256 tokenId = _nextTokenId;
        _nextTokenId++;

        _safeMint(agent, tokenId);
        _setTokenURI(tokenId, metadataURI);

        agentStats[tokenId] = AgentStats({
            jobsCompleted: 0,
            totalRatingSum: 0,
            totalRatings: 0,
            registeredAt: block.timestamp
        });

        walletToTokenId[agent] = tokenId;
        hasResume[agent] = true;

        emit ResumeMinted(tokenId, agent, metadataURI);
        return tokenId;
    }

    /// @notice Update agent stats after job completion (called by platform)
    function updateStats(
        uint256 tokenId,
        uint256 rating
    ) external onlyOwner {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        require(rating >= 1 && rating <= 5, "Rating 1-5");

        AgentStats storage stats = agentStats[tokenId];
        stats.jobsCompleted += 1;
        stats.totalRatingSum += rating;
        stats.totalRatings += 1;

        emit StatsUpdated(tokenId, stats.jobsCompleted, stats.totalRatingSum / stats.totalRatings);
    }

    /// @notice Update metadata URI (e.g., when agent updates skills)
    function updateMetadata(uint256 tokenId, string memory newURI) external {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        _setTokenURI(tokenId, newURI);
    }

    /// @notice Get agent's average rating (x100 for precision)
    function getAvgRating(uint256 tokenId) external view returns (uint256) {
        AgentStats memory stats = agentStats[tokenId];
        if (stats.totalRatings == 0) return 0;
        return (stats.totalRatingSum * 100) / stats.totalRatings;
    }

    /// @notice Get resume token ID by wallet
    function getTokenByWallet(address wallet) external view returns (uint256) {
        require(hasResume[wallet], "No resume");
        return walletToTokenId[wallet];
    }

    // Soulbound: prevent transfers (override)
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721)
        returns (address)
    {
        address from = _ownerOf(tokenId);
        // Allow minting (from == address(0)), block transfers
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: transfers disabled");
        }
        return super._update(to, tokenId, auth);
    }

    // Required overrides
    function tokenURI(uint256 tokenId)
        public view override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
