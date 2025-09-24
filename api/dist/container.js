"use strict";
/**
 * Dependency injection container
 * Centralizes service instantiation and configuration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContainer = createContainer;
const MerkleTreeController_1 = require("./controllers/MerkleTreeController");
const MerkleTreeService_1 = require("./services/MerkleTreeService");
const FileSystemRepository_1 = require("./repositories/FileSystemRepository");
const MockIPFSService_1 = require("./services/MockIPFSService");
function createContainer() {
    // Storage layer
    const storage = new FileSystemRepository_1.FileSystemRepository();
    // External services
    const ipfs = new MockIPFSService_1.MockIPFSService();
    // Business logic
    const merkleTreeService = new MerkleTreeService_1.MerkleTreeService(storage, ipfs);
    // Controllers
    const merkleTreeController = new MerkleTreeController_1.MerkleTreeController(merkleTreeService);
    return {
        merkleTreeController
    };
}
//# sourceMappingURL=container.js.map