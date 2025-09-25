/**
 * Clean route definitions
 */

import { createContainer } from '../container';
import { generateTreeSchema, generateTreeFileSchema } from '../schemas/MerkleTreeSchemas';

export async function registerRoutes(fastify: any) {
  // Initialize dependencies
  const container = createContainer();

  // Health check endpoint
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: Date.now() };
  });

  // Generate Merkle tree from JSON data
  fastify.post('/api/generate-tree', {
    schema: generateTreeSchema
  }, async (request: any, reply: any) => {
    return container.merkleTreeController.generateTree(request, reply);
  });

  // Generate Merkle tree from file upload
  fastify.post('/api/generate-tree-file', {
    schema: generateTreeFileSchema
  }, async (request: any, reply: any) => {
    return container.merkleTreeController.generateTree(request, reply);
  });
}