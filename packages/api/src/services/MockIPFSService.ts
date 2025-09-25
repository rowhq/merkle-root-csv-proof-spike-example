/**
 * Mock IPFS service for development - can be replaced with real IPFS implementation
 */

import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { IIPFSService } from '../interfaces/IIPFSService';

export class MockIPFSService implements IIPFSService {
  private readonly mockDir = path.join(process.cwd(), 'mock-ipfs');

  constructor() {
    // Directory will be created on first upload
  }

  private async ensureMockDir(): Promise<void> {
    try {
      await fs.access(this.mockDir);
    } catch {
      await fs.mkdir(this.mockDir, { recursive: true });
    }
  }

  async upload(data: any): Promise<string> {
    // Ensure directory exists
    await this.ensureMockDir();

    // Generate mock IPFS hash (QmHash format)
    const hash = 'Qm' + crypto.createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex')
      .substring(0, 44);

    // Store in mock directory
    const filePath = path.join(this.mockDir, `${hash}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    return hash;
  }

  async retrieve(hash: string): Promise<any> {
    try {
      const filePath = path.join(this.mockDir, `${hash}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Failed to retrieve data for hash: ${hash}`);
    }
  }
}