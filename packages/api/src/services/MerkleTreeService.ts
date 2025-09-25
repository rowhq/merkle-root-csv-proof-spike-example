/**
 * Single Responsibility: Handles Merkle tree generation and proof operations
 */

import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import crypto from 'crypto';
import { IMerkleTreeService } from '../interfaces/IMerkleTreeService';
import { IStorageRepository } from '../interfaces/IStorageRepository';
import { IIPFSService } from '../interfaces/IIPFSService';
import { UsersDataInput, MerkleTreeResult, MerkleProof } from '../types';

export class MerkleTreeService implements IMerkleTreeService {
  constructor(
    private readonly storage: IStorageRepository,
    private readonly ipfs: IIPFSService
  ) {}

  async generateTree(input: UsersDataInput): Promise<MerkleTreeResult> {
    // Generate unique tree ID
    const treeId = this.generateTreeId();

    // Convert user data to leaf format
    const leaves = input.users_data.map(user => [
      user.UserId,
      user.Email,
      user.UserAddress,
      user.Reputation,
      user.PrePoints,
      user.Points,
      user.CummulativePoints
    ]);

    // Build Merkle tree
    const tree = StandardMerkleTree.of(
      leaves,
      ['string', 'string', 'address', 'int256', 'uint256', 'uint256', 'uint256']
    );

    // Generate claims with proofs for all users
    const claims: Record<string, MerkleProof> = {};

    input.users_data.forEach((user, index) => {
      const proof = tree.getProof(index);
      const address = user.UserAddress.toLowerCase();

      claims[address] = {
        userId: user.UserId,
        email: user.Email,
        userAddress: user.UserAddress,
        reputation: user.Reputation,
        prePoints: user.PrePoints,
        points: user.Points,
        cummulativePoints: user.CummulativePoints,
        proof: proof
      };
    });

    // Upload to IPFS (mock for now)
    const ipfsHash = await this.ipfs.upload({
      date_generated: input.date_generated,
      users_data: input.users_data,
      merkle_root: tree.root
    });

    // Create result
    const result: MerkleTreeResult = {
      root: tree.root,
      ipfsHash: ipfsHash,
      dateGenerated: input.date_generated,
      totalUsers: input.users_data.length,
      treeId: treeId
    };

    // Persist data
    await this.storage.saveTree(treeId, result);
    await this.storage.saveClaims(treeId, claims);

    return result;
  }

  async getProof(treeId: string, userAddress: string): Promise<string[] | null> {
    const userProof = await this.storage.getUserProof(treeId, userAddress.toLowerCase());
    return userProof ? userProof.proof : null;
  }

  private generateTreeId(): string {
    return crypto.randomBytes(16).toString('hex');
  }
}