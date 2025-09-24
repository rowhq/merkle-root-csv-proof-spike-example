/**
 * Dependency Inversion Principle - Abstraction for storage operations
 */
import { MerkleTreeResult, MerkleProof } from '../types';
export interface IStorageRepository {
    /**
     * Save Merkle tree data
     */
    saveTree(treeId: string, treeData: MerkleTreeResult): Promise<void>;
    /**
     * Save user claims/proofs
     */
    saveClaims(treeId: string, claims: Record<string, MerkleProof>): Promise<void>;
    /**
     * Get tree data by ID
     */
    getTree(treeId: string): Promise<MerkleTreeResult | null>;
    /**
     * Get claims for a tree
     */
    getClaims(treeId: string): Promise<Record<string, MerkleProof> | null>;
    /**
     * Get specific user proof
     */
    getUserProof(treeId: string, userAddress: string): Promise<MerkleProof | null>;
}
//# sourceMappingURL=IStorageRepository.d.ts.map