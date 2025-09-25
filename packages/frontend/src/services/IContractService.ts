// Interface Segregation Principle - Contract service interface
import { ContractTransaction } from '../types';

export interface IContractService {
  updateMerkleRoot(merkleRoot: string, dateGenerated: number): Promise<ContractTransaction>;
  isWalletConnected(): Promise<boolean>;
  connectWallet(): Promise<void>;
  getContractData(): Promise<{
    merkleRoot: string;
    lastUpdateTimestamp: number;
    dateGenerated: number;
    dataSourceIPFS: string;
  }>;
}