/**
 * Interface Segregation Principle - Focused interface for Merkle tree operations
 */
import { UsersDataInput, MerkleTreeResult } from '../types';
export interface IMerkleTreeService {
    /**
     * Generate a Merkle tree from user data
     */
    generateTree(input: UsersDataInput): Promise<MerkleTreeResult>;
    /**
     * Get proof for a specific user address
     */
    getProof(treeId: string, userAddress: string): Promise<string[] | null>;
}
//# sourceMappingURL=IMerkleTreeService.d.ts.map