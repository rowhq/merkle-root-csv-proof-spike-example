/**
 * HTTP Controller for Merkle tree generation
 */
import { IMerkleTreeService } from '../interfaces/IMerkleTreeService';
export declare class MerkleTreeController {
    private readonly merkleTreeService;
    constructor(merkleTreeService: IMerkleTreeService);
    generateTree(request: any, reply: any): Promise<any>;
}
//# sourceMappingURL=MerkleTreeController.d.ts.map