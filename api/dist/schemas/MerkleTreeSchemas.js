"use strict";
/**
 * JSON Schema definitions for Merkle Tree API endpoints
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTreeFileSchema = exports.generateTreeSchema = exports.fileUploadSchema = exports.errorResponseSchema = exports.successResponseSchema = exports.requestBodySchema = exports.userDataSchema = void 0;
exports.userDataSchema = {
    type: 'object',
    properties: {
        UserId: { type: 'string' },
        Email: { type: 'string' },
        UserAddress: { type: 'string' },
        Reputation: { type: 'string' },
        PrePoints: { type: 'string' },
        Points: { type: 'string' },
        CummulativePoints: { type: 'string' }
    }
};
exports.requestBodySchema = {
    type: 'object',
    required: ['date_generated', 'users_data'],
    properties: {
        date_generated: {
            type: 'number',
            description: 'Timestamp when data was generated'
        },
        users_data: {
            type: 'array',
            description: 'Array of user data objects',
            items: exports.userDataSchema
        }
    }
};
exports.successResponseSchema = {
    type: 'object',
    properties: {
        root: { type: 'string', description: 'Merkle root hash' },
        ipfsHash: { type: 'string', description: 'Mock IPFS hash' },
        createdAt: { type: 'number', description: 'Timestamp' }
    }
};
exports.errorResponseSchema = {
    type: 'object',
    properties: {
        error: { type: 'string' }
    }
};
exports.fileUploadSchema = {
    consumes: ['multipart/form-data'],
    requestBody: {
        content: {
            'multipart/form-data': {
                schema: {
                    type: 'object',
                    properties: {
                        file: {
                            type: 'string',
                            format: 'binary',
                            description: 'JSON file containing the tree data'
                        }
                    },
                    required: ['file']
                }
            }
        }
    }
};
exports.generateTreeSchema = {
    tags: ['tree'],
    summary: 'Generate Merkle tree',
    description: 'Takes JSON data, generates Merkle tree and proofs, saves to files, returns root, IPFS hash and createdAt',
    body: exports.requestBodySchema,
    response: {
        200: exports.successResponseSchema,
        400: exports.errorResponseSchema,
        500: exports.errorResponseSchema
    }
};
exports.generateTreeFileSchema = {
    tags: ['tree'],
    summary: 'Generate Merkle tree from file',
    description: 'Upload JSON file to generate Merkle tree and proofs',
    ...exports.fileUploadSchema,
    response: {
        200: exports.successResponseSchema,
        400: exports.errorResponseSchema,
        500: exports.errorResponseSchema
    }
};
//# sourceMappingURL=MerkleTreeSchemas.js.map