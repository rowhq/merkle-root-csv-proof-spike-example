/**
 * File-based storage implementation for development
 */
import { IStorageRepository } from '../interfaces/IStorageRepository';
import { MerkleTreeResult, MerkleProof } from '../types';
export declare class FileSystemRepository implements IStorageRepository {
    private readonly dataDir;
    constructor();
    private ensureDataDir;
    saveTree(treeId: string, treeData: MerkleTreeResult): Promise<void>;
    saveClaims(treeId: string, claims: Record<string, MerkleProof>): Promise<void>;
    getTree(treeId: string): Promise<MerkleTreeResult | null>;
    getClaims(treeId: string): Promise<Record<string, MerkleProof> | null>;
    getUserProof(treeId: string, userAddress: string): Promise<MerkleProof | null>;
}
//# sourceMappingURL=FileSystemRepository.d.ts.map