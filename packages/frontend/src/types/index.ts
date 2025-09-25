// Domain types for the application

export interface UserData {
  UserId: string;
  Email: string;
  UserAddress: string;
  Reputation: string;
  PrePoints: string;
  Points: string;
  CummulativePoints: string;
}

export interface UsersDataInput {
  date_generated: number;
  users_data: UserData[];
}

export interface MerkleTreeResult {
  root: string;
  ipfsHash: string;
  createdAt: number;
}

export interface ContractTransaction {
  hash: string;
  wait: () => Promise<ContractReceipt>;
}

export interface ContractReceipt {
  transactionHash: string;
  blockNumber: number;
  status: number;
}

export interface ContractData {
  merkleRoot: string;
  lastUpdateTimestamp: number;
  dateGenerated: number;
  dataSourceIPFS: string;
}

export interface AppState {
  isLoading: boolean;
  error: string | null;
  merkleResult: MerkleTreeResult | null;
  transactionHash: string | null;
  contractData: ContractData | null;
}