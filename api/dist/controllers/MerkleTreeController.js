"use strict";
/**
 * HTTP Controller for Merkle tree generation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerkleTreeController = void 0;
class MerkleTreeController {
    merkleTreeService;
    constructor(merkleTreeService) {
        this.merkleTreeService = merkleTreeService;
    }
    async generateTree(request, reply) {
        try {
            let input;
            // Check if it's a multipart form (file upload)
            if (request.isMultipart()) {
                const parts = request.parts();
                for await (const part of parts) {
                    if (part.type === 'file' && part.fieldname === 'file') {
                        const buffer = await part.toBuffer();
                        const jsonString = buffer.toString('utf-8');
                        input = JSON.parse(jsonString);
                        break;
                    }
                }
                if (!input) {
                    return reply.status(400).send({
                        error: 'No file provided or file is invalid'
                    });
                }
            }
            else {
                // Regular JSON body
                input = request.body;
            }
            // Validate input
            if (!input.date_generated || !input.users_data || !Array.isArray(input.users_data)) {
                return reply.status(400).send({
                    error: 'Invalid input format. Expected { date_generated: number, users_data: UserData[] }'
                });
            }
            if (input.users_data.length === 0) {
                return reply.status(400).send({
                    error: 'users_data cannot be empty'
                });
            }
            const result = await this.merkleTreeService.generateTree(input);
            return reply.send({
                root: result.root,
                ipfsHash: result.ipfsHash,
                createdAt: result.dateGenerated
            });
        }
        catch (error) {
            return reply.status(500).send({
                error: error instanceof Error ? error.message : 'Tree generation failed'
            });
        }
    }
}
exports.MerkleTreeController = MerkleTreeController;
//# sourceMappingURL=MerkleTreeController.js.map