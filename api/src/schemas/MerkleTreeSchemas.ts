/**
 * JSON Schema definitions for Merkle Tree API endpoints
 */

export const userDataSchema = {
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

export const requestBodySchema = {
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
      items: userDataSchema
    }
  }
};

export const successResponseSchema = {
  type: 'object',
  properties: {
    root: { type: 'string', description: 'Merkle root hash' },
    ipfsHash: { type: 'string', description: 'Mock IPFS hash' },
    createdAt: { type: 'number', description: 'Timestamp' }
  }
};

export const errorResponseSchema = {
  type: 'object',
  properties: {
    error: { type: 'string' }
  }
};

export const fileUploadSchema = {
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

export const generateTreeSchema = {
  tags: ['tree'],
  summary: 'Generate Merkle tree',
  description: 'Takes JSON data, generates Merkle tree and proofs, saves to files, returns root, IPFS hash and createdAt',
  body: requestBodySchema,
  response: {
    200: successResponseSchema,
    400: errorResponseSchema,
    500: errorResponseSchema
  }
};

export const generateTreeFileSchema = {
  tags: ['tree'],
  summary: 'Generate Merkle tree from file',
  description: 'Upload JSON file to generate Merkle tree and proofs',
  ...fileUploadSchema,
  response: {
    200: successResponseSchema,
    400: errorResponseSchema,
    500: errorResponseSchema
  }
};