"use strict";
/**
 * Single Responsibility: Handles Merkle tree generation and proof operations
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerkleTreeService = void 0;
const merkle_tree_1 = require("@openzeppelin/merkle-tree");
const crypto_1 = __importDefault(require("crypto"));
class MerkleTreeService {
    storage;
    ipfs;
    constructor(storage, ipfs) {
        this.storage = storage;
        this.ipfs = ipfs;
    }
    async generateTree(input) {
        // Generate unique tree ID
        const treeId = this.generateTreeId();
        // Convert user data to leaf format
        const leaves = input.users_data.map(user => [
            user.UserId,
            user.Email,
            user.UserAddress,
            user.Reputation,
            user.PrePoints,
            user.Points,
            user.CummulativePoints
        ]);
        // Build Merkle tree
        const tree = merkle_tree_1.StandardMerkleTree.of(leaves, ['string', 'string', 'address', 'int256', 'uint256', 'uint256', 'uint256']);
        // Generate claims with proofs for all users
        const claims = {};
        input.users_data.forEach((user, index) => {
            const proof = tree.getProof(index);
            const address = user.UserAddress.toLowerCase();
            claims[address] = {
                userId: user.UserId,
                email: user.Email,
                userAddress: user.UserAddress,
                reputation: user.Reputation,
                prePoints: user.PrePoints,
                points: user.Points,
                cummulativePoints: user.CummulativePoints,
                proof: proof
            };
        });
        // Upload to IPFS (mock for now)
        const ipfsHash = await this.ipfs.upload({
            date_generated: input.date_generated,
            users_data: input.users_data,
            merkle_root: tree.root
        });
        // Create result
        const result = {
            root: tree.root,
            ipfsHash: ipfsHash,
            dateGenerated: input.date_generated,
            totalUsers: input.users_data.length,
            treeId: treeId
        };
        // Persist data
        await this.storage.saveTree(treeId, result);
        await this.storage.saveClaims(treeId, claims);
        return result;
    }
    async getProof(treeId, userAddress) {
        const userProof = await this.storage.getUserProof(treeId, userAddress.toLowerCase());
        return userProof ? userProof.proof : null;
    }
    generateTreeId() {
        return crypto_1.default.randomBytes(16).toString('hex');
    }
}
exports.MerkleTreeService = MerkleTreeService;
//# sourceMappingURL=MerkleTreeService.js.map