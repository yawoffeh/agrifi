// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";

/**
 * @title AgriFi - Green Yield Finance
 * @dev A DeFi platform for agricultural financing through crop tokenization
 *
 * Notes:
 * - Each crop token (id) has its own metadata URI (use IPFS) via ERC1155URIStorage.
 * - Contract deployer becomes owner (Ownable(initialOwner) required by OZ v5+).
 * - Payments are accepted as ETH (msg.value) for simplicity; consider ERC20 stablecoin integration later.
 */
contract AgriFi is ERC1155URIStorage, Ownable, ReentrancyGuard, IERC1155Receiver {
    using Counters for Counters.Counter;

    Counters.Counter private _cropIdCounter;

    // Structs
    struct Farmer {
        address farmerAddress;
        string ensName;
        string name;
        string location;
        uint256 reputationScore;
        bool isRegistered;
        uint256[] cropIds;
    }

    struct CropToken {
        uint256 id;
        address farmer;
        string cropType;
        string variety;
        uint256 totalSupply;
        uint256 pricePerToken; // in wei (if using ETH payments)
        uint256 harvestDate; // unix timestamp
        uint256 carbonCredits;
        bool isActive;
        uint256 totalInvested;
        // investments mapping must only be used via storage reference
        mapping(address => uint256) investments;
    }

    struct CropView {
        address farmer;
        string cropType;
        string variety;
        uint256 totalSupply;
        uint256 pricePerToken;
        uint256 harvestDate;
        uint256 carbonCredits;
        bool isActive;
        uint256 totalInvested;
        string metadataURI;
    }


    struct Investment {
        uint256 cropId;
        uint256 amount; // token amount invested
        uint256 timestamp;
        bool claimed;
    }

    // State variables
    mapping(address => Farmer) public farmers;
    mapping(uint256 => CropToken) private cropTokens; // storage-only for mapping-in-struct
    mapping(address => Investment[]) public investorHistory;
    mapping(address => uint256) public investorRewards; // placeholder if you want rewards ledger

    address[] public registeredFarmers;
    uint256[] public activeCrops;

    // Platform fee (percentage, e.g., 5 => 5%)
    uint256 public platformFeePct = 5;

    // Events
    event FarmerRegistered(address indexed farmer, string ensName, string name);
    event CropTokenized(uint256 indexed cropId, address indexed farmer, string cropType, uint256 totalSupply, string metadataURI);
    event InvestmentMade(uint256 indexed cropId, address indexed investor, uint256 tokenAmount, uint256 paidAmount);
    event HarvestCompleted(uint256 indexed cropId, uint256 actualYield);
    event RewardsDistributed(uint256 indexed cropId, uint256 totalRewards);
    event PlatformFeeUpdated(uint256 newFeePct);

    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155, IERC165) returns (bool) {
        return super.supportsInterface(interfaceId);
    }


    /**
     * @dev Constructor
     * Pass an empty base URI because we will set per-token URIs via ERC1155URIStorage._setURI(tokenId, uri)
     * Ownable in newer OZ versions expects an initialOwner.
     */
    constructor() ERC1155("") Ownable(msg.sender) {}

    /**
     * @dev Register a new farmer
     */
    function registerFarmer(
        string memory _ensName,
        string memory _name,
        string memory _location
    ) external {
        require(!farmers[msg.sender].isRegistered, "Farmer already registered");

        Farmer storage f = farmers[msg.sender];
        f.farmerAddress = msg.sender;
        f.ensName = _ensName;
        f.name = _name;
        f.location = _location;
        f.reputationScore = 100; // starting reputation
        f.isRegistered = true;

        registeredFarmers.push(msg.sender);

        emit FarmerRegistered(msg.sender, _ensName, _name);
    }

    /**
     * @dev Create a new crop token with per-token metadata URI (e.g., ipfs://CID/metadata.json)
     * NOTE: _metadataURI should be a full URI (ipfs://... or https://...) and will be set for the new token id.
     */
    function tokenizeCrop(
        string memory _cropType,
        string memory _variety,
        uint256 _totalSupply,
        uint256 _pricePerToken,
        uint256 _harvestDate,
        uint256 _carbonCredits,
        string memory _metadataURI
    ) external returns (uint256) {
        require(farmers[msg.sender].isRegistered, "Farmer not registered");
        require(_totalSupply > 0, "Supply > 0");
        require(_pricePerToken > 0, "Price > 0");
        require(bytes(_metadataURI).length > 0, "Metadata URI required");

        _cropIdCounter.increment();
        uint256 newCropId = _cropIdCounter.current();

        // initialize storage struct with mapping
        CropToken storage newCrop = cropTokens[newCropId];
        newCrop.id = newCropId;
        newCrop.farmer = msg.sender;
        newCrop.cropType = _cropType;
        newCrop.variety = _variety;
        newCrop.totalSupply = _totalSupply;
        newCrop.pricePerToken = _pricePerToken;
        newCrop.harvestDate = _harvestDate;
        newCrop.carbonCredits = _carbonCredits;
        newCrop.isActive = true;
        newCrop.totalInvested = 0;

        // Add crop id to farmer and active list
        farmers[msg.sender].cropIds.push(newCropId);
        activeCrops.push(newCropId);

        // Mint tokens to the contract (held for sale)
        _mint(address(this), newCropId, _totalSupply, "");

        // Set per-token metadata URI (ERC1155URIStorage)
        _setURI(newCropId, _metadataURI);

        emit CropTokenized(newCropId, msg.sender, _cropType, _totalSupply, _metadataURI);

        return newCropId;
    }

    /**
     * @dev Invest in a crop token by sending ETH (msg.value)
     * - _tokenAmount is number of tokens buyer wants to buy
     * - Price computed as tokenAmount * pricePerToken
     */
    function investInCrop(uint256 _cropId, uint256 _tokenAmount) external payable nonReentrant {
        require(_tokenAmount > 0, "Token amount > 0");
        CropToken storage crop = cropTokens[_cropId];
        require(crop.isActive, "Crop not active");

        uint256 totalCost = _tokenAmount * crop.pricePerToken;
        require(msg.value >= totalCost, "Insufficient ETH sent");

        uint256 available = balanceOf(address(this), _cropId);
        require(available >= _tokenAmount, "Not enough tokens available");

        // Transfer tokens from contract to investor
        // internal call is fine because contract is operator of its own balance
        _safeTransferFrom(address(this), msg.sender, _cropId, _tokenAmount, "");

        // Update crop investments mapping and totals
        crop.investments[msg.sender] += _tokenAmount;
        crop.totalInvested += totalCost;

        // Record investor history
        investorHistory[msg.sender].push(Investment({
            cropId: _cropId,
            amount: _tokenAmount,
            timestamp: block.timestamp,
            claimed: false
        }));

        // Compute platform fee and forward funds to farmer
        uint256 platformFee = (totalCost * platformFeePct) / 100;
        uint256 farmerPayment = totalCost - platformFee;

        // keep platform fee in contract balance; send farmer share
        (bool sentToFarmer, ) = payable(crop.farmer).call{value: farmerPayment}("");
        require(sentToFarmer, "Failed to send funds to farmer");

        // Refund any excess payment
        if (msg.value > totalCost) {
            (bool refunded, ) = payable(msg.sender).call{value: msg.value - totalCost}("");
            require(refunded, "Refund failed");
        }

        emit InvestmentMade(_cropId, msg.sender, _tokenAmount, totalCost);
    }

    /**
     * @dev Complete harvest and update reputation + disable further investments
     * - Only the farmer can call this after harvestDate
     */
    function completeHarvest(uint256 _cropId, uint256 _actualYield) external {
        CropToken storage crop = cropTokens[_cropId];
        require(crop.farmer == msg.sender, "Only farmer can complete harvest");
        require(crop.isActive, "Crop not active");
        require(block.timestamp >= crop.harvestDate, "Harvest date not reached");

        crop.isActive = false;

        uint256 expectedYield = crop.totalSupply;
        // Avoid division by zero
        uint256 performanceRatio = expectedYield == 0 ? 0 : (_actualYield * 100) / expectedYield;

        // Update farmer reputation based on performance
        if (performanceRatio >= 100) {
            farmers[msg.sender].reputationScore += 10;
        } else if (performanceRatio >= 80) {
            farmers[msg.sender].reputationScore += 5;
        } else {
            // subtract 5 but do not underflow
            if (farmers[msg.sender].reputationScore > 5) {
                farmers[msg.sender].reputationScore -= 5;
            } else {
                farmers[msg.sender].reputationScore = 0;
            }
        }

        emit HarvestCompleted(_cropId, _actualYield);
        emit RewardsDistributed(_cropId, crop.totalInvested);
    }

    /**
     * @dev Get farmer information (exposed as a view)
     */
    function getFarmer(address _farmerAddress) external view returns (
        string memory ensName,
        string memory name,
        string memory location,
        uint256 reputationScore,
        bool isRegistered,
        uint256[] memory cropIds
    ) {
        Farmer storage farmer = farmers[_farmerAddress];
        return (
            farmer.ensName,
            farmer.name,
            farmer.location,
            farmer.reputationScore,
            farmer.isRegistered,
            farmer.cropIds
        );
    }

    /**
     * @dev Get crop token metadata and numeric fields
     * Note: investments mapping cannot be returned directly here, use getInvestment()
     */
    function getCropToken(uint256 _cropId) external view returns (CropView memory) {
        CropToken storage crop = cropTokens[_cropId];
        return CropView({
            farmer: crop.farmer,
            cropType: crop.cropType,
            variety: crop.variety,
            totalSupply: crop.totalSupply,
            pricePerToken: crop.pricePerToken,
            harvestDate: crop.harvestDate,
            carbonCredits: crop.carbonCredits,
            isActive: crop.isActive,
            totalInvested: crop.totalInvested,
            metadataURI: uri(_cropId)
        });
    }


    /**
     * @dev Get investor's investment (token amount) in a specific crop
     */
    function getInvestment(uint256 _cropId, address _investor) external view returns (uint256) {
        CropToken storage crop = cropTokens[_cropId];
        return crop.investments[_investor];
    }

    /**
     * @dev Get all active crops
     */
    function getActiveCrops() external view returns (uint256[] memory) {
        return activeCrops;
    }

    /**
     * @dev Get all registered farmers
     */
    function getRegisteredFarmers() external view returns (address[] memory) {
        return registeredFarmers;
    }

    /**
     * @dev Get investor history (list of Investment structs)
     */
    function getInvestorHistory(address _investor) external view returns (Investment[] memory) {
        return investorHistory[_investor];
    }

    /**
     * @dev Withdraw platform fees (owner only)
     */
    function withdrawFees() external onlyOwner {
        uint256 bal = address(this).balance;
        require(bal > 0, "No fees to withdraw");
        (bool success, ) = payable(owner()).call{value: bal}("");
        require(success, "Withdraw failed");
    }

    /**
     * @dev Update metadata URI for a token (owner-only, in case you need to change)
     */
    function setTokenURI(uint256 tokenId, string memory newuri) external onlyOwner {
        _setURI(tokenId, newuri);
    }

    /**
     * @dev Update platform fee percent (owner only)
     */
    function setPlatformFeePct(uint256 newPct) external onlyOwner {
        require(newPct <= 100, "Invalid fee");
        platformFeePct = newPct;
        emit PlatformFeeUpdated(newPct);
    }
}
