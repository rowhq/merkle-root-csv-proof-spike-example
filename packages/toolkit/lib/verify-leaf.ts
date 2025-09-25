#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';

interface VerifyOptions {
  address: string;
  claimsFile?: string;
  manifestFile?: string;
}

function parseArgs(): VerifyOptions {
  const args = process.argv.slice(2);

  let address = '';
  let claimsFile = '';
  let manifestFile = '';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--address' || arg === '-a') {
      address = args[++i];
    } else if (arg === '--claims' || arg === '-c') {
      claimsFile = args[++i];
    } else if (arg === '--manifest' || arg === '-m') {
      manifestFile = args[++i];
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Usage: tsx verify-leaf.ts --address <address> [options]

Options:
  --address, -a <address>   User address to verify (required)
  --claims, -c <path>       Claims JSON file (default: toolkit/out/claims.json)
  --manifest, -m <path>     Manifest JSON file (default: toolkit/out/manifest.json)
  --help, -h               Show this help message

Examples:
  tsx verify-leaf.ts --address 0x1234567890123456789012345678901234567890
  tsx verify-leaf.ts -a 0x1234... --claims custom-claims.json
      `);
      process.exit(0);
    }
  }

  if (!address) {
    throw new Error('Address is required. Use --address <address>');
  }

  // Set defaults if not provided
  if (!claimsFile) {
    claimsFile = path.resolve(__dirname, '../out/claims.json');
  }

  if (!manifestFile) {
    manifestFile = path.resolve(__dirname, '../out/manifest.json');
  }

  return { address: address.toLowerCase(), claimsFile, manifestFile };
}

function loadFiles(options: VerifyOptions) {
  // Check if files exist
  if (!fs.existsSync(options.claimsFile!)) {
    throw new Error(`Claims file not found: ${options.claimsFile}`);
  }

  if (!fs.existsSync(options.manifestFile!)) {
    throw new Error(`Manifest file not found: ${options.manifestFile}`);
  }

  // Load claims
  const claimsContent = fs.readFileSync(options.claimsFile!, 'utf8');
  const claims = JSON.parse(claimsContent);

  // Load manifest
  const manifestContent = fs.readFileSync(options.manifestFile!, 'utf8');
  const manifest = JSON.parse(manifestContent);

  return { claims, manifest };
}

function verifyUserData(address: string, claims: any, manifest: any) {
  console.log(`🔍 Verifying user data for address: ${address}`);

  // Check if address exists in claims
  if (!claims[address]) {
    throw new Error(`Address not found in claims: ${address}`);
  }

  const userClaim = claims[address];

  console.log(`📋 User data found:`);
  console.log(`   User ID: ${userClaim.userId}`);
  console.log(`   Email: ${userClaim.email}`);
  console.log(`   Address: ${userClaim.userAddress}`);
  console.log(`   Reputation: ${userClaim.reputation}`);
  console.log(`   Pre-points: ${userClaim.prePoints}`);
  console.log(`   Points: ${userClaim.points}`);
  console.log(`   Cumulative points: ${userClaim.cummulativePoints}`);
  console.log(`   Proof length: ${userClaim.proof.length}`);

  // Reconstruct the leaf data in the same format used to build the tree
  const leafData = [
    userClaim.userId,
    userClaim.email,
    userClaim.userAddress,
    userClaim.reputation,
    userClaim.prePoints,
    userClaim.points,
    userClaim.cummulativePoints
  ];

  console.log(`🌿 Leaf data: [${leafData.join(', ')}]`);

  // Verify the proof against the manifest root
  const isValid = StandardMerkleTree.verify(
    manifest.rootHash,
    manifest.leafEncoding,
    leafData,
    userClaim.proof
  );

  return { isValid, userClaim, leafData };
}

async function main() {
  try {
    const options = parseArgs();

    console.log(`🚀 Verifying leaf for address: ${options.address}`);
    console.log(`📁 Claims file: ${options.claimsFile}`);
    console.log(`📁 Manifest file: ${options.manifestFile}`);

    // Load data files
    const { claims, manifest } = loadFiles(options);

    console.log(`📊 Loaded manifest:`);
    console.log(`   Root hash: ${manifest.rootHash}`);
    console.log(`   Total users: ${manifest.totalUsers}`);
    console.log(`   Created: ${manifest.timestamp}`);

    // Verify the user data
    const { isValid, userClaim } = verifyUserData(options.address, claims, manifest);

    if (isValid) {
      console.log(`✅ VERIFICATION SUCCESSFUL`);
      console.log(`   The user data and proof are valid against the Merkle root`);
      console.log(`   Root: ${manifest.rootHash}`);
    } else {
      console.log(`❌ VERIFICATION FAILED`);
      console.log(`   The proof does not validate against the Merkle root`);
      process.exit(1);
    }

    console.log(`\n🔗 Contract verification data:`);
    console.log(`   userData: (${JSON.stringify(userClaim.userId)},${JSON.stringify(userClaim.email)},${userClaim.userAddress},${userClaim.reputation},${userClaim.prePoints},${userClaim.points},${userClaim.cummulativePoints})`);
    console.log(`   proof: [${userClaim.proof.map((p: string) => `"${p}"`).join(',')}]`);

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { verifyUserData, loadFiles };