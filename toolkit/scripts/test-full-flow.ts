#!/usr/bin/env tsx

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

/**
 * Script de test completo:
 * 1. Genera merkle tree
 * 2. Despliega contratos en anvil local
 * 3. Actualiza merkle root
 * 4. Verifica claims de prueba
 */

const ANVIL_PRIVATE_KEY = process.env.PRIVATE_KEY;
const ANVIL_RPC = process.env.RPC_URL || "http://127.0.0.1:8545";

let anvilProcess: any = null;

function exec(command: string, description: string) {
  console.log(`\n🔄 ${description}`);
  console.log(`   Command: ${command}`);
  try {
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe',
      env: { ...process.env, PRIVATE_KEY: ANVIL_PRIVATE_KEY }
    });
    console.log(`✅ ${description} - Success`);
    if (output.trim()) {
      console.log(output);
    }
    return output;
  } catch (error: any) {
    console.error(`❌ ${description} - Failed`);
    console.error(error.stdout || error.message);
    process.exit(1);
  }
}

function killExistingAnvil() {
  try {
    // Kill anvil processes by name
    execSync('pkill -f anvil', { stdio: 'pipe' });
    console.log("🔄 Killed existing anvil processes");
  } catch {
    // No anvil processes running by name
  }

  try {
    // Kill any process using port 8545
    const lsofOutput = execSync('lsof -ti:8545', { stdio: 'pipe', encoding: 'utf8' });
    if (lsofOutput.trim()) {
      execSync(`kill -9 ${lsofOutput.trim()}`, { stdio: 'pipe' });
      console.log("🔄 Killed processes using port 8545");
      // Wait a moment for the port to be freed
      execSync('sleep 1', { stdio: 'pipe' });
    }
  } catch {
    // No processes using port 8545
  }
}

async function startAnvil(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log("🔄 Starting anvil...");

    anvilProcess = spawn('anvil', [], {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let output = '';

    anvilProcess.stdout.on('data', (data: Buffer) => {
      output += data.toString();
      if (output.includes('Listening on')) {
        console.log("✅ Anvil started successfully");
        resolve();
      }
    });

    anvilProcess.stderr.on('data', (data: Buffer) => {
      console.error('Anvil error:', data.toString());
    });

    anvilProcess.on('close', (code: number) => {
      if (code !== 0) {
        reject(new Error(`Anvil exited with code ${code}`));
      }
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      reject(new Error('Anvil startup timeout'));
    }, 10000);
  });
}

function setupCleanup() {
  const cleanup = () => {
    if (anvilProcess) {
      console.log("\n🔄 Shutting down anvil...");
      anvilProcess.kill('SIGTERM');
      anvilProcess = null;
    }
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);
}

async function main() {
  console.log("🚀 Starting full flow test...");

  // Setup cleanup handlers
  setupCleanup();

  // Kill any existing anvil processes and start fresh
  killExistingAnvil();

  // Start anvil
  await startAnvil();

  // Wait a bit for anvil to be fully ready
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 1. Generate merkle tree
  exec("pnpm run build:tree -- --in data/input.csv", "Generate merkle tree");

  // Read merkle root
  const merkleRootFile = path.join(process.cwd(), 'toolkit', 'out', 'merkle-root.txt');
  const merkleRoot = fs.readFileSync(merkleRootFile, 'utf8').trim();
  console.log(`📋 Merkle Root: ${merkleRoot}`);

  // 2. Deploy UserDataRegistry contract
  const deployOutput = exec(
    `forge script contracts/script/DeployUserDataRegistry.s.sol:DeployUserDataRegistry --rpc-url ${ANVIL_RPC} --broadcast --unlocked --sender 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`,
    "Deploy UserDataRegistry"
  );

  // Extract registry address from deployment output
  const registryMatch = deployOutput.match(/UserDataRegistry deployed at: (0x[a-fA-F0-9]{40})/);

  if (!registryMatch) {
    console.error("❌ Could not extract registry address from deployment");
    process.exit(1);
  }

  const registryAddress = registryMatch[1];

  console.log(`📋 Registry Address: ${registryAddress}`);

  // 3. Update merkle root in registry
  exec(
    `forge script contracts/script/UpdateRegistryRoot.s.sol:UpdateRegistryRoot --sig "run(address,bytes32)" ${registryAddress} ${merkleRoot} --rpc-url ${ANVIL_RPC} --broadcast --unlocked --sender 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`,
    "Update registry merkle root"
  );

  // 4. Test claim verification
  const claimsFile = path.join(process.cwd(), 'toolkit', 'out', 'claims.json');
  const claims = JSON.parse(fs.readFileSync(claimsFile, 'utf8'));

  // Get first claim for testing
  const firstAddress = Object.keys(claims)[0];
  const firstClaim = claims[firstAddress];

  console.log(`\n🧪 Testing claim for address: ${firstAddress}`);
  console.log(`   User ID: ${firstClaim.userId}`);
  console.log(`   Email: ${firstClaim.email}`);
  console.log(`   Reputation: ${firstClaim.reputation}`);
  console.log(`   Points: ${firstClaim.points}`);
  console.log(`   Cumulative Points: ${firstClaim.cummulativePoints}`);
  console.log(`   Proof length: ${firstClaim.proof.length}`);

  // Verify the claim locally first
  exec(
    `pnpm run verify:leaf -- --address ${firstAddress}`,
    "Verify claim locally"
  );

  // Test UserDataRegistry contract functions
  console.log("\n🔗 Testing on-chain verification with UserDataRegistry...");

  // Build the user data tuple for cast command
  const userData = `(${JSON.stringify(firstClaim.userId)},${JSON.stringify(firstClaim.email)},${firstAddress},${firstClaim.reputation},${firstClaim.prePoints},${firstClaim.points},${firstClaim.cummulativePoints})`;
  const proofArray = `[${firstClaim.proof.map((p: string) => `"${p}"`).join(',')}]`;

  // Test verifyUserData function
  const verifyCommand = `cast call ${registryAddress} "verifyUserData((string,string,address,int256,uint256,uint256,uint256),bytes32[])" "${userData}" "${proofArray}" --rpc-url ${ANVIL_RPC}`;

  const verifyResult = exec(verifyCommand, "Test verifyUserData on contract");

  if (verifyResult.trim() === "0x0000000000000000000000000000000000000000000000000000000000000001") {
    console.log("✅ On-chain verification: USER DATA VALID");
  } else {
    console.log("❌ On-chain verification: USER DATA INVALID");
    console.log("Result:", verifyResult.trim());
  }

  // Test meetsReputationRequirement (checking if reputation >= 0)
  const reputationCommand = `cast call ${registryAddress} "meetsReputationRequirement((string,string,address,int256,uint256,uint256,uint256),bytes32[],int256)" "${userData}" "${proofArray}" 0 --rpc-url ${ANVIL_RPC}`;

  const reputationResult = exec(reputationCommand, "Test reputation requirement");

  if (reputationResult.trim() === "0x0000000000000000000000000000000000000000000000000000000000000001") {
    console.log(`✅ Reputation check: User meets requirement (reputation ${firstClaim.reputation} >= 0)`);
  } else {
    console.log(`❌ Reputation check: User does not meet requirement`);
  }

  console.log("\n🎉 Full flow test completed successfully!");
  console.log("\n📋 Summary:");
  console.log(`   Registry: ${registryAddress}`);
  console.log(`   Merkle Root: ${merkleRoot}`);
  console.log(`   Test Address: ${firstAddress}`);
  console.log(`   Test User ID: ${firstClaim.userId}`);
  console.log(`   Test Email: ${firstClaim.email}`);
  console.log(`   Test Points: ${firstClaim.points}`);
  console.log(`   Test Reputation: ${firstClaim.reputation}`);

  console.log("\n🔧 Next steps:");
  console.log(`   1. Query user reputation: cast call ${registryAddress} "getVerifiedReputation((string,string,address,int256,uint256,uint256,uint256),bytes32[])" "${userData}" "${proofArray}" --rpc-url ${ANVIL_RPC}`);
  console.log(`   2. Query cumulative points: cast call ${registryAddress} "getVerifiedCumulativePoints((string,string,address,int256,uint256,uint256,uint256),bytes32[])" "${userData}" "${proofArray}" --rpc-url ${ANVIL_RPC}`);
  console.log(`   3. Check reputation threshold: cast call ${registryAddress} "meetsReputationRequirement((string,string,address,int256,uint256,uint256,uint256),bytes32[],int256)" "${userData}" "${proofArray}" <min_reputation> --rpc-url ${ANVIL_RPC}`);

  // Cleanup and exit
  if (anvilProcess) {
    console.log("\n🔄 Shutting down anvil...");
    anvilProcess.kill('SIGTERM');
    anvilProcess = null;
  }

  console.log("✅ Test completed and cleaned up!");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  // Ensure cleanup on error
  if (anvilProcess) {
    console.log("\n🔄 Shutting down anvil due to error...");
    anvilProcess.kill('SIGTERM');
  }
  process.exit(1);
});