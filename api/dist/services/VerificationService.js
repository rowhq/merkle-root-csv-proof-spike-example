"use strict";
/**
 * Single Responsibility: Handles verification operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationService = void 0;
const merkle_tree_1 = require("@openzeppelin/merkle-tree");
class VerificationService {
    storage;
    constructor(storage) {
        this.storage = storage;
    }
    async verify(request) {
        try {
            // Get tree data
            const treeData = await this.storage.getTree(request.treeId);
            if (!treeData) {
                return {
                    valid: false,
                    error: 'Tree not found'
                };
            }
            // Get user proof
            const userProof = await this.storage.getUserProof(request.treeId, request.userAddress.toLowerCase());
            if (!userProof) {
                return {
                    valid: false,
                    error: 'User not found in tree'
                };
            }
            // Verify proof
            const leafData = [
                userProof.userId,
                userProof.email,
                userProof.userAddress,
                userProof.reputation,
                userProof.prePoints,
                userProof.points,
                userProof.cummulativePoints
            ];
            const isValid = merkle_tree_1.StandardMerkleTree.verify(treeData.root, ['string', 'string', 'address', 'int256', 'uint256', 'uint256', 'uint256'], leafData, userProof.proof);
            if (isValid) {
                return {
                    valid: true,
                    userData: {
                        UserId: userProof.userId,
                        Email: userProof.email,
                        UserAddress: userProof.userAddress,
                        Reputation: userProof.reputation,
                        PrePoints: userProof.prePoints,
                        Points: userProof.points,
                        CummulativePoints: userProof.cummulativePoints
                    },
                    proof: userProof.proof
                };
            }
            return {
                valid: false,
                error: 'Invalid proof'
            };
        }
        catch (error) {
            return {
                valid: false,
                error: error instanceof Error ? error.message : 'Verification failed'
            };
        }
    }
}
exports.VerificationService = VerificationService;
//# sourceMappingURL=VerificationService.js.map