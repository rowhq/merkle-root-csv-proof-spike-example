// Main Application Component - Dependency Injection and orchestration
import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { ActionButton } from './components/ActionButton';
import { ApiService } from './services/ApiService';
import { ContractService } from './services/ContractService';
import { IApiService } from './services/IApiService';
import { IContractService } from './services/IContractService';
import { AppState, UsersDataInput } from './types';
import './App.css';

// Configuration - from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL!;
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS!;

function App() {
  const [state, setState] = useState<AppState>({
    isLoading: false,
    error: null,
    merkleResult: null,
    transactionHash: null,
    contractData: null
  });

  const [jsonData, setJsonData] = useState<UsersDataInput | null>(null);
  const [, setWalletConnected] = useState(false);

  // Dependency Injection - services can be easily replaced
  const apiService: IApiService = new ApiService(API_BASE_URL);
  const contractService: IContractService = new ContractService(CONTRACT_ADDRESS);

  const handleFileProcessed = (data: UsersDataInput) => {
    setJsonData(data);
    setState(prev => ({ ...prev, error: null }));
  };

  const handleSubmit = async () => {
    if (!jsonData) {
      setState(prev => ({ ...prev, error: 'Please select a JSON file first' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Step 1: Call API to generate tree
      console.log('Generating Merkle tree...');
      const merkleResult = await apiService.generateTree(jsonData);

      setState(prev => ({
        ...prev,
        merkleResult,
        isLoading: false
      }));

      console.log('Merkle tree generated:', merkleResult);

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate tree'
      }));
    }
  };

  const handleContractUpdate = async () => {
    if (!state.merkleResult) {
      setState(prev => ({ ...prev, error: 'No Merkle tree result to update' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Step 1: Check if wallet is connected
      const connected = await contractService.isWalletConnected();
      if (!connected) {
        await contractService.connectWallet();
        setWalletConnected(true);
      }

      // Step 2: Update contract with Merkle root
      console.log('Updating contract with Merkle root...');
      const transaction = await contractService.updateMerkleRoot(
        state.merkleResult.root,
        state.merkleResult.createdAt
      );

      setState(prev => ({
        ...prev,
        transactionHash: transaction.hash,
        isLoading: false
      }));

      console.log('Transaction submitted:', transaction.hash);

      // Optional: Wait for confirmation
      const receipt = await transaction.wait();
      console.log('Transaction confirmed:', receipt);

      // Refresh contract data after successful update
      await loadContractData();

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update contract'
      }));
    }
  };

  const loadContractData = async () => {
    try {
      console.log('Loading contract data...');
      const contractData = await contractService.getContractData();
      console.log('Contract data loaded:', contractData);
      setState(prev => ({ ...prev, contractData }));
    } catch (error) {
      console.error('Failed to load contract data:', error);
    }
  };

  const resetState = () => {
    setState({
      isLoading: false,
      error: null,
      merkleResult: null,
      transactionHash: null,
      contractData: null
    });
    setJsonData(null);
  };

  // Load contract data on component mount
  React.useEffect(() => {
    loadContractData();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🌳 Merkle Tree Generator</h1>
        <p>Upload JSON data to generate Merkle tree and update smart contract</p>
      </header>

      <main className="App-main">
        <div className="workflow-container">
          {/* Step 1: File Upload */}
          <div className="step">
            <h2>Step 1: Upload JSON File</h2>
            <FileUpload
              onFileProcessed={handleFileProcessed}
              disabled={state.isLoading}
            />
            {jsonData && (
              <div className="success-message">
                ✅ File loaded: {jsonData.users_data.length} users, generated at {new Date(jsonData.date_generated * 1000).toLocaleString()}
              </div>
            )}
          </div>

          {/* Step 2: Generate Tree */}
          <div className="step">
            <h2>Step 2: Generate Merkle Tree</h2>
            <ActionButton
              onClick={handleSubmit}
              disabled={!jsonData || state.isLoading}
              loading={state.isLoading && !state.merkleResult}
            >
              Generate Tree
            </ActionButton>

            {state.merkleResult && (
              <div className="result-card">
                <h3>✅ Tree Generated Successfully!</h3>
                <div className="result-item">
                  <strong>Root:</strong> <code>{state.merkleResult.root}</code>
                </div>
                <div className="result-item">
                  <strong>IPFS Hash:</strong> <code>{state.merkleResult.ipfsHash}</code>
                </div>
                <div className="result-item">
                  <strong>Created At:</strong> {new Date(state.merkleResult.createdAt * 1000).toLocaleString()}
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Update Contract */}
          {state.merkleResult && (
            <div className="step">
              <h2>Step 3: Update Smart Contract</h2>
              <ActionButton
                onClick={handleContractUpdate}
                disabled={state.isLoading}
                loading={state.isLoading && !!state.merkleResult}
                variant="secondary"
              >
                Update Contract
              </ActionButton>

              {state.transactionHash && (
                <div className="success-message">
                  ✅ Transaction submitted: <code>{state.transactionHash}</code>
                </div>
              )}
            </div>
          )}

          {/* Reset Button */}
          {(jsonData || state.merkleResult) && (
            <div className="step">
              <ActionButton onClick={resetState} variant="secondary">
                Reset
              </ActionButton>
            </div>
          )}
        </div>

        {/* Error Display */}
        {state.error && (
          <div className="error-display">
            ❌ {state.error}
          </div>
        )}

        {/* Contract Status Display */}
        {state.contractData && (
          <div className="contract-status">
            <h2>📋 Current Contract State</h2>
            <div className="contract-info">
              <div className="contract-item">
                <strong>Contract Address:</strong> <code>{CONTRACT_ADDRESS}</code>
              </div>
              <div className="contract-item">
                <strong>Current Root:</strong> <code>{state.contractData.merkleRoot}</code>
              </div>
              <div className="contract-item">
                <strong>Last Updated:</strong> {new Date(state.contractData.lastUpdateTimestamp * 1000).toLocaleString()}
              </div>
              <div className="contract-item">
                <strong>Data Generated:</strong> {new Date(state.contractData.dateGenerated * 1000).toLocaleString()}
              </div>
              <div className="contract-item">
                <strong>IPFS Hash:</strong> <code>{state.contractData.dataSourceIPFS}</code>
              </div>
              <button
                onClick={loadContractData}
                className="refresh-button"
                style={{ marginTop: '10px', padding: '5px 10px', cursor: 'pointer' }}
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
