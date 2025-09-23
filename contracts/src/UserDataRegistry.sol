// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title UserDataRegistry
 * @notice On-chain registry to verify and retrieve user data using Merkle proofs
 * @dev Uses merkle tree to verify user reputation, points, and other data
 */
contract UserDataRegistry is Ownable {
    bytes32 public merkleRoot;
    uint256 public lastUpdateTimestamp;
    uint256 public dateGenerated; // Timestamp when the data was originally generated
    string public dataSourceIPFS; // Optional IPFS hash for full data

    // Struct to represent user data
    struct UserData {
        string userId; // Unique user identifier
        string email; // User email
        address userAddress; // EVM address
        int256 reputation; // Reputation score (-100 to 100)
        uint256 prePoints; // Points before calculation
        uint256 points; // Current points
        uint256 cumulativePoints; // Total cumulative points
    }

    // Events
    event MerkleRootUpdated(bytes32 indexed newRoot, uint256 timestamp, uint256 dateGenerated);
    event UserDataVerified(address indexed userAddress, string userId, int256 reputation, uint256 cumulativePoints);
    event DataSourceUpdated(string ipfsHash);

    constructor(bytes32 _merkleRoot) Ownable(msg.sender) {
        merkleRoot = _merkleRoot;
        lastUpdateTimestamp = block.timestamp;
        dateGenerated = block.timestamp; // Default to current time if not specified
        dataSourceIPFS = "QmTemporaryHashPlaceholder123456789abcdef"; // Hardcoded placeholder
    }

    /**
     * @notice Updates the merkle root with new user data snapshot (owner only)
     * @param _merkleRoot New merkle root
     * @param _dateGenerated Timestamp when the original data was generated
     */
    function updateMerkleRoot(bytes32 _merkleRoot, uint256 _dateGenerated) external onlyOwner {
        merkleRoot = _merkleRoot;
        lastUpdateTimestamp = block.timestamp;
        dateGenerated = _dateGenerated;
        emit MerkleRootUpdated(_merkleRoot, block.timestamp, _dateGenerated);
    }

    /**
     * @notice Updates the merkle root with new user data snapshot (owner only) - legacy function
     * @param _merkleRoot New merkle root
     */
    function updateMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
        lastUpdateTimestamp = block.timestamp;
        emit MerkleRootUpdated(_merkleRoot, block.timestamp, dateGenerated);
    }

    /**
     * @notice Updates the IPFS hash for the full data source (owner only)
     * @param _ipfsHash IPFS hash of the complete user data
     */
    function updateDataSource(string calldata _ipfsHash) external onlyOwner {
        dataSourceIPFS = _ipfsHash;
        emit DataSourceUpdated(_ipfsHash);
    }

    /**
     * @notice Verify user data against the merkle tree
     * @param userData Complete user data structure
     * @param proof Merkle proof
     * @return valid Whether the data is valid according to the merkle tree
     */
    function verifyUserData(UserData calldata userData, bytes32[] calldata proof) public view returns (bool valid) {
        // Validate reputation range
        if (userData.reputation < -100 || userData.reputation > 100) return false;

        bytes32 leaf = keccak256(
            abi.encodePacked(
                keccak256(
                    abi.encode(
                        userData.userId,
                        userData.email,
                        userData.userAddress,
                        userData.reputation,
                        userData.prePoints,
                        userData.points,
                        userData.cumulativePoints
                    )
                )
            )
        );

        return MerkleProof.verify(proof, merkleRoot, leaf);
    }

    /**
     * @notice Get verified user reputation
     * @param userData User data to verify
     * @param proof Merkle proof
     * @return reputation User's reputation score (reverts if invalid)
     */
    function getVerifiedReputation(UserData calldata userData, bytes32[] calldata proof)
        external
        view
        returns (int256 reputation)
    {
        require(verifyUserData(userData, proof), "Invalid user data proof");
        require(userData.userAddress == msg.sender || msg.sender == owner(), "Unauthorized");
        return userData.reputation;
    }

    /**
     * @notice Get verified cumulative points
     * @param userData User data to verify
     * @param proof Merkle proof
     * @return cumulativePoints User's total cumulative points (reverts if invalid)
     */
    function getVerifiedCumulativePoints(UserData calldata userData, bytes32[] calldata proof)
        external
        view
        returns (uint256 cumulativePoints)
    {
        require(verifyUserData(userData, proof), "Invalid user data proof");
        require(userData.userAddress == msg.sender || msg.sender == owner(), "Unauthorized");
        return userData.cumulativePoints;
    }

    /**
     * @notice Get all verified user data (only callable by user themselves or owner)
     * @param userData User data to verify
     * @param proof Merkle proof
     * @return verified Full user data if valid
     */
    function getVerifiedUserData(UserData calldata userData, bytes32[] calldata proof)
        external
        view
        returns (UserData memory verified)
    {
        require(verifyUserData(userData, proof), "Invalid user data proof");
        require(userData.userAddress == msg.sender || msg.sender == owner(), "Unauthorized");
        return userData;
    }

    /**
     * @notice Emit event for verified user data (useful for off-chain indexing)
     * @param userData User data to verify and log
     * @param proof Merkle proof
     */
    function logVerifiedUser(UserData calldata userData, bytes32[] calldata proof) external {
        require(verifyUserData(userData, proof), "Invalid user data proof");
        require(userData.userAddress == msg.sender, "Can only log own data");

        emit UserDataVerified(userData.userAddress, userData.userId, userData.reputation, userData.cumulativePoints);
    }

    /**
     * @notice Check if user meets minimum reputation requirement
     * @param userData User data to verify
     * @param proof Merkle proof
     * @param minReputation Minimum reputation required
     * @return meets Whether user meets the requirement
     */
    function meetsReputationRequirement(UserData calldata userData, bytes32[] calldata proof, int256 minReputation)
        external
        view
        returns (bool meets)
    {
        if (!verifyUserData(userData, proof)) return false;
        return userData.reputation >= minReputation;
    }

    /**
     * @notice Check if user meets minimum points requirement
     * @param userData User data to verify
     * @param proof Merkle proof
     * @param minPoints Minimum cumulative points required
     * @return meets Whether user meets the requirement
     */
    function meetsPointsRequirement(UserData calldata userData, bytes32[] calldata proof, uint256 minPoints)
        external
        view
        returns (bool meets)
    {
        if (!verifyUserData(userData, proof)) return false;
        return userData.cumulativePoints >= minPoints;
    }

    /**
     * @notice Get the timestamp of last data update
     */
    function getLastUpdateTime() external view returns (uint256) {
        return lastUpdateTimestamp;
    }

    /**
     * @notice Check how old the current data is
     */
    function getDataAge() external view returns (uint256) {
        return block.timestamp - lastUpdateTimestamp;
    }

    /**
     * @notice Get the timestamp when the data was originally generated
     */
    function getDateGenerated() external view returns (uint256) {
        return dateGenerated;
    }

    /**
     * @notice Get the IPFS hash of the data source
     */
    function getDataSourceIPFS() external view returns (string memory) {
        return dataSourceIPFS;
    }

    /**
     * @notice Get all registry metadata
     * @return root Current merkle root
     * @return lastUpdate Timestamp of last update
     * @return generated Timestamp when data was generated
     * @return ipfsHash IPFS hash of data source
     */
    function getRegistryInfo()
        external
        view
        returns (bytes32 root, uint256 lastUpdate, uint256 generated, string memory ipfsHash)
    {
        return (merkleRoot, lastUpdateTimestamp, dateGenerated, dataSourceIPFS);
    }
}
