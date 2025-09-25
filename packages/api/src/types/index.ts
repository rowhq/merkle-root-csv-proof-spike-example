/**
 * Domain Types - Pure data structures with no behavior
 */

export interface UserData {
  UserId: string;
  Email: string;
  UserAddress: string;
  Reputation: number;
  PrePoints: number;
  Points: number;
  CummulativePoints: number;
}

export interface UsersDataInput {
  date_generated: number;
  users_data: UserData[];
}

export interface MerkleTreeResult {
  root: string;
  ipfsHash: string;
  dateGenerated: number;
  totalUsers: number;
  treeId: string;
}

export interface MerkleProof {
  userId: string;
  email: string;
  userAddress: string;
  reputation: number;
  prePoints: number;
  points: number;
  cummulativePoints: number;
  proof: string[];
}

export interface VerificationRequest {
  userAddress: string;
  treeId: string;
}

export interface VerificationResult {
  valid: boolean;
  userData?: UserData;
  proof?: string[];
  error?: string;
}