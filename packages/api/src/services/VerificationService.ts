/**
 * Single Responsibility: Handles verification operations
 */

import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import { IStorageRepository } from '../interfaces/IStorageRepository';
import { VerificationRequest, VerificationResult } from '../types';

export interface IVerificationService {
  verify(request: VerificationRequest): Promise<VerificationResult>;
}

export class VerificationService implements IVerificationService {
  constructor(private readonly storage: IStorageRepository) {}

  async verify(request: VerificationRequest): Promise<VerificationResult> {
    try {
      // Get tree data
      const treeData = await this.storage.getTree(request.treeId);
      if (!treeData) {
        return {
          valid: false,
          error: 'Tree not found'
        };
      }

      // Get user proof
      const userProof = await this.storage.getUserProof(
        request.treeId,
        request.userAddress.toLowerCase()
      );

      if (!userProof) {
        return {
          valid: false,
          error: 'User not found in tree'
        };
      }

      // Verify proof
      const leafData = [
        userProof.userId,
        userProof.email,
        userProof.userAddress,
        userProof.reputation,
        userProof.prePoints,
        userProof.points,
        userProof.cummulativePoints
      ];

      const isValid = StandardMerkleTree.verify(
        treeData.root,
        ['string', 'string', 'address', 'int256', 'uint256', 'uint256', 'uint256'],
        leafData,
        userProof.proof
      );

      if (isValid) {
        return {
          valid: true,
          userData: {
            UserId: userProof.userId,
            Email: userProof.email,
            UserAddress: userProof.userAddress,
            Reputation: userProof.reputation,
            PrePoints: userProof.prePoints,
            Points: userProof.points,
            CummulativePoints: userProof.cummulativePoints
          },
          proof: userProof.proof
        };
      }

      return {
        valid: false,
        error: 'Invalid proof'
      };

    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Verification failed'
      };
    }
  }
}