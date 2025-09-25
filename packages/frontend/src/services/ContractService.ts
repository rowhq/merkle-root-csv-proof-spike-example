// Single Responsibility Principle - Handles smart contract interactions
import { ethers } from 'ethers';
import { IContractService } from './IContractService';
import { ContractTransaction } from '../types';

// Contract ABI - essential functions
const CONTRACT_ABI = [
  {
    "type": "function",
    "name": "updateMerkleRoot",
    "inputs": [
      {"name": "_merkleRoot", "type": "bytes32"},
      {"name": "_dateGenerated", "type": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "hasRole",
    "inputs": [
      {"name": "role", "type": "bytes32"},
      {"name": "account", "type": "address"}
    ],
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "UPDATER_ROLE",
    "inputs": [],
    "outputs": [{"name": "", "type": "bytes32"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getRegistryInfo",
    "inputs": [],
    "outputs": [
      {"name": "root", "type": "bytes32"},
      {"name": "lastUpdate", "type": "uint256"},
      {"name": "generated", "type": "uint256"},
      {"name": "ipfsHash", "type": "string"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "merkleRoot",
    "inputs": [],
    "outputs": [{"name": "", "type": "bytes32"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "lastUpdateTimestamp",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "dateGenerated",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "dataSourceIPFS",
    "inputs": [],
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "view"
  }
];

export class ContractService implements IContractService {
  private readonly contractAddress: string;

  constructor(contractAddress: string) {
    this.contractAddress = contractAddress;
  }

  async isWalletConnected(): Promise<boolean> {
    if (!window.ethereum) {
      return false;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      return accounts.length > 0;
    } catch {
      return false;
    }
  }

  async connectWallet(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    } catch (error) {
      throw new Error('Failed to connect wallet');
    }
  }

  async updateMerkleRoot(merkleRoot: string, dateGenerated: number): Promise<ContractTransaction> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        this.contractAddress,
        CONTRACT_ABI,
        signer
      );

      const transaction = await contract.updateMerkleRoot(merkleRoot, dateGenerated);

      return {
        hash: transaction.hash,
        wait: () => transaction.wait()
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Contract call failed: ${error.message}`);
      }
      throw new Error('Contract call failed');
    }
  }

  async getContractData(): Promise<{
    merkleRoot: string;
    lastUpdateTimestamp: number;
    dateGenerated: number;
    dataSourceIPFS: string;
  }> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    try {
      // Use a JSON RPC provider as fallback for read-only calls
      let provider;
      try {
        console.log('Trying BrowserProvider...');
        provider = new ethers.BrowserProvider(window.ethereum);
        console.log('BrowserProvider created successfully');
      } catch (browserError) {
        console.log('BrowserProvider failed, trying JsonRpcProvider...', browserError);
        // Fallback to JSON RPC provider for read-only operations
        provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
        console.log('JsonRpcProvider created');
      }

      const contract = new ethers.Contract(
        this.contractAddress,
        CONTRACT_ABI,
        provider
      );

      console.log('Calling getRegistryInfo...');
      const registryInfo = await contract.getRegistryInfo();
      console.log('getRegistryInfo result:', registryInfo);

      return {
        merkleRoot: registryInfo[0],
        lastUpdateTimestamp: Number(registryInfo[1]),
        dateGenerated: Number(registryInfo[2]),
        dataSourceIPFS: registryInfo[3]
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to read contract data: ${error.message}`);
      }
      throw new Error('Failed to read contract data');
    }
  }
}

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}