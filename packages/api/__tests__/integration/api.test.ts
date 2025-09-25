/**
 * Integration tests for the API
 */

import { buildServer } from '../../src/server';
import fs from 'fs/promises';
import path from 'path';

describe('Merkle Tree API Tests', () => {
  let server: any;
  const testDataDir = path.join(process.cwd(), 'data');
  const mockIPFSDir = path.join(process.cwd(), 'mock-ipfs');

  beforeAll(async () => {
    server = await buildServer();
  });

  afterAll(async () => {
    await server.close();

    // Cleanup test data
    try {
      await fs.rm(testDataDir, { recursive: true, force: true });
      await fs.rm(mockIPFSDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('API Workflow', () => {
    const testData = {
      date_generated: 1757808000,
      users_data: [
        {
          UserId: "user1",
          Email: "user1@test.com",
          UserAddress: "0x1234567890123456789012345678901234567890",
          Reputation: "100",
          PrePoints: "50",
          Points: "150",
          CummulativePoints: "200"
        },
        {
          UserId: "user2",
          Email: "user2@test.com",
          UserAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
          Reputation: "200",
          PrePoints: "75",
          Points: "225",
          CummulativePoints: "300"
        }
      ]
    };

    test('Health check should work', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/health'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('ok');
      expect(body.timestamp).toBeGreaterThan(0);
    });

    test('Generate tree should return root, ipfsHash and createdAt', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/generate-tree',
        payload: testData
      });

      if (response.statusCode !== 200) {
        console.log('Error response:', response.body);
      }
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      // Should return exactly these 3 fields
      expect(body).toHaveProperty('root');
      expect(body).toHaveProperty('ipfsHash');
      expect(body).toHaveProperty('createdAt');
      expect(body.createdAt).toBe(testData.date_generated);

      // Validate data types
      expect(typeof body.root).toBe('string');
      expect(typeof body.ipfsHash).toBe('string');
      expect(typeof body.createdAt).toBe('number');

      // Should not have extra fields
      expect(Object.keys(body)).toHaveLength(3);
    });

    test('Generate tree should save data to files', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/generate-tree',
        payload: testData
      });

      expect(response.statusCode).toBe(200);

      // Check that data files were created
      const dataFiles = await fs.readdir(testDataDir);
      expect(dataFiles.some(file => file.startsWith('tree_'))).toBe(true);
      expect(dataFiles.some(file => file.startsWith('claims_'))).toBe(true);

      // Check that IPFS mock file was created
      const ipfsFiles = await fs.readdir(mockIPFSDir);
      expect(ipfsFiles.length).toBeGreaterThan(0);
    });
  });

  describe('Error Cases', () => {
    test('Invalid input format should return 400', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/generate-tree',
        payload: {
          invalid: 'data'
        }
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.message || body.error).toContain('Bad Request');
    });

    test('Empty users_data should return 400', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/generate-tree',
        payload: {
          date_generated: 1757808000,
          users_data: []
        }
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toContain('users_data cannot be empty');
    });

    test('Missing date_generated should return 400', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/generate-tree',
        payload: {
          users_data: [
            {
              UserId: "user1",
              Email: "user1@test.com",
              UserAddress: "0x1234567890123456789012345678901234567890",
              Reputation: "100",
              PrePoints: "50",
              Points: "150",
              CummulativePoints: "200"
            }
          ]
        }
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.message || body.error).toContain('Bad Request');
    });
  });
});