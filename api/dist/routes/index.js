"use strict";
/**
 * Clean route definitions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const container_1 = require("../container");
const MerkleTreeSchemas_1 = require("../schemas/MerkleTreeSchemas");
async function registerRoutes(fastify) {
    // Initialize dependencies
    const container = (0, container_1.createContainer)();
    // Health check endpoint
    fastify.get('/health', async () => {
        return { status: 'ok', timestamp: Date.now() };
    });
    // Generate Merkle tree from JSON data
    fastify.post('/api/generate-tree', {
        schema: MerkleTreeSchemas_1.generateTreeSchema
    }, async (request, reply) => {
        return container.merkleTreeController.generateTree(request, reply);
    });
    // Generate Merkle tree from file upload
    fastify.post('/api/generate-tree-file', {
        schema: MerkleTreeSchemas_1.generateTreeFileSchema
    }, async (request, reply) => {
        return container.merkleTreeController.generateTree(request, reply);
    });
}
//# sourceMappingURL=index.js.map