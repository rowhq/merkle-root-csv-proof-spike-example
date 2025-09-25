/**
 * File-based storage implementation for development
 */

import fs from 'fs/promises';
import path from 'path';
import { IStorageRepository } from '../interfaces/IStorageRepository';
import { MerkleTreeResult, MerkleProof } from '../types';

export class FileSystemRepository implements IStorageRepository {
  private readonly dataDir = path.join(process.cwd(), 'data');

  constructor() {
    this.ensureDataDir();
  }

  private async ensureDataDir(): Promise<void> {
    try {
      await fs.access(this.dataDir);
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true });
    }
  }

  async saveTree(treeId: string, treeData: MerkleTreeResult): Promise<void> {
    const filePath = path.join(this.dataDir, `tree_${treeId}.json`);
    await fs.writeFile(filePath, JSON.stringify(treeData, null, 2));
  }

  async saveClaims(treeId: string, claims: Record<string, MerkleProof>): Promise<void> {
    const filePath = path.join(this.dataDir, `claims_${treeId}.json`);
    await fs.writeFile(filePath, JSON.stringify(claims, null, 2));
  }

  async getTree(treeId: string): Promise<MerkleTreeResult | null> {
    try {
      const filePath = path.join(this.dataDir, `tree_${treeId}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async getClaims(treeId: string): Promise<Record<string, MerkleProof> | null> {
    try {
      const filePath = path.join(this.dataDir, `claims_${treeId}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async getUserProof(treeId: string, userAddress: string): Promise<MerkleProof | null> {
    const claims = await this.getClaims(treeId);
    return claims ? claims[userAddress.toLowerCase()] || null : null;
  }
}