/**
 * Dependency injection container
 * Centralizes service instantiation and configuration
 */
import { MerkleTreeController } from './controllers/MerkleTreeController';
export interface Container {
    merkleTreeController: MerkleTreeController;
}
export declare function createContainer(): Container;
//# sourceMappingURL=container.d.ts.map