// Interface Segregation Principle - API service interface
import { UsersDataInput, MerkleTreeResult } from '../types';

export interface IApiService {
  generateTree(data: UsersDataInput): Promise<MerkleTreeResult>;
}