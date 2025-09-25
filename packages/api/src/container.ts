/**
 * Dependency injection container
 * Centralizes service instantiation and configuration
 */

import { MerkleTreeController } from './controllers/MerkleTreeController';
import { MerkleTreeService } from './services/MerkleTreeService';
import { FileSystemRepository } from './repositories/FileSystemRepository';
import { MockIPFSService } from './services/MockIPFSService';

export interface Container {
  merkleTreeController: MerkleTreeController;
}

export function createContainer(): Container {
  // Storage layer
  const storage = new FileSystemRepository();

  // External services
  const ipfs = new MockIPFSService();

  // Business logic
  const merkleTreeService = new MerkleTreeService(storage, ipfs);

  // Controllers
  const merkleTreeController = new MerkleTreeController(merkleTreeService);

  return {
    merkleTreeController
  };
}