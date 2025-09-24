/**
 * Single Responsibility: Handles Merkle tree generation and proof operations
 */
import { IMerkleTreeService } from '../interfaces/IMerkleTreeService';
import { IStorageRepository } from '../interfaces/IStorageRepository';
import { IIPFSService } from '../interfaces/IIPFSService';
import { UsersDataInput, MerkleTreeResult } from '../types';
export declare class MerkleTreeService implements IMerkleTreeService {
    private readonly storage;
    private readonly ipfs;
    constructor(storage: IStorageRepository, ipfs: IIPFSService);
    generateTree(input: UsersDataInput): Promise<MerkleTreeResult>;
    getProof(treeId: string, userAddress: string): Promise<string[] | null>;
    private generateTreeId;
}
//# sourceMappingURL=MerkleTreeService.d.ts.map