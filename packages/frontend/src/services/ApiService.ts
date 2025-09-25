// Single Responsibility Principle - Handles API communication
import axios from 'axios';
import { IApiService } from './IApiService';
import { UsersDataInput, MerkleTreeResult } from '../types';

export class ApiService implements IApiService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = 'http://127.0.0.1:3000/api') {
    this.baseUrl = baseUrl;
  }

  async generateTree(data: UsersDataInput): Promise<MerkleTreeResult> {
    try {
      const response = await axios.post<MerkleTreeResult>(
        `${this.baseUrl}/generate-tree`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`API Error: ${error.response?.data?.error || error.message}`);
      }
      throw new Error('Failed to generate Merkle tree');
    }
  }
}