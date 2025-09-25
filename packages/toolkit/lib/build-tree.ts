#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import { keccak256 } from 'keccak256';

interface UserData {
  userId: string;
  email: string;
  userAddress: string;
  reputation: number;
  prePoints: number;
  points: number;
  cummulativePoints: number;
}

interface BuildOptions {
  input: string;
  output?: string;
}

function parseArgs(): BuildOptions {
  const args = process.argv.slice(2);

  let input = '';
  let output = '';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--in' || arg === '-i') {
      input = args[++i];
    } else if (arg === '--out' || arg === '-o') {
      output = args[++i];
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Usage: tsx build-tree.ts --in <input.csv|input.json> [--out <output-dir>]

Options:
  --in, -i <path>      Input file path (CSV or JSON format, required)
  --out, -o <path>     Output directory (default: toolkit/out)
  --help, -h           Show this help message

Supported input formats:
  - CSV: UserId,Email,UserAddress,Reputation,PrePoints,Points,CummulativePoints
  - JSON: {"date_generated": timestamp, "users_data": [...]}

The script will generate:
  - merkle-root.txt    Root hash of the Merkle tree
  - claims.json        User data and proofs by address
  - manifest.json      Tree metadata and configuration
      `);
      process.exit(0);
    }
  }

  if (!input) {
    throw new Error('Input file is required. Use --in <file.csv|file.json>');
  }

  if (!output) {
    output = path.resolve(__dirname, '../out');
  }

  return { input, output };
}

function parseInput(filePath: string): { users: UserData[], dateGenerated?: number } {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const fileExtension = path.extname(filePath).toLowerCase();

  if (fileExtension === '.json') {
    // Handle new JSON structure
    const jsonData = JSON.parse(fileContent);

    if (jsonData.users_data && jsonData.date_generated) {
      // New JSON structure
      const users = jsonData.users_data.map((record: any) => ({
        userId: record.UserId,
        email: record.Email,
        userAddress: record.UserAddress,
        reputation: record.Reputation,
        prePoints: record.PrePoints,
        points: record.Points,
        cummulativePoints: record.CummulativePoints
      }));

      return { users, dateGenerated: jsonData.date_generated };
    } else {
      // Legacy JSON array format
      const users = jsonData.map((record: any) => ({
        userId: record.UserId || record.userId,
        email: record.Email || record.email,
        userAddress: record.UserAddress || record.userAddress,
        reputation: record.Reputation || record.reputation,
        prePoints: record.PrePoints || record.prePoints,
        points: record.Points || record.points,
        cummulativePoints: record.CummulativePoints || record.cummulativePoints || record.CumulativePoints
      }));

      return { users };
    }
  } else {
    // Handle CSV format
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    const users = records.map((record: any) => ({
      userId: record.UserId || record.userId,
      email: record.Email || record.email,
      userAddress: record.UserAddress || record.userAddress,
      reputation: parseInt(record.Reputation || record.reputation),
      prePoints: parseInt(record.PrePoints || record.prePoints),
      points: parseInt(record.Points || record.points),
      cummulativePoints: parseInt(record.CummulativePoints || record.cummulativePoints || record.CumulativePoints)
    }));

    return { users };
  }
}

function buildMerkleTree(users: UserData[]) {
  console.log(`🔄 Building Merkle tree for ${users.length} users...`);

  // Convert user data to the format expected by the contract
  const leaves = users.map(user => [
    user.userId,
    user.email,
    user.userAddress,
    user.reputation,
    user.prePoints,
    user.points,
    user.cummulativePoints
  ]);

  console.log(`📋 Sample leaf data:`, leaves[0]);

  // Build the merkle tree
  const tree = StandardMerkleTree.of(leaves, ['string', 'string', 'address', 'int256', 'uint256', 'uint256', 'uint256']);

  console.log(`✅ Merkle tree built with ${tree.root} root`);

  return { tree, leaves };
}

function generateClaims(tree: StandardMerkleTree<any[]>, users: UserData[]) {
  const claims: { [address: string]: any } = {};

  for (const [i, user] of users.entries()) {
    // Get the proof for this user's data
    const proof = tree.getProof(i);

    claims[user.userAddress.toLowerCase()] = {
      ...user,
      proof: proof
    };
  }

  return claims;
}

function saveOutput(options: BuildOptions, tree: StandardMerkleTree<any[]>, claims: any, users: UserData[], dateGenerated?: number) {
  // Ensure output directory exists
  if (!fs.existsSync(options.output!)) {
    fs.mkdirSync(options.output!, { recursive: true });
  }

  // Save merkle root
  const rootFile = path.join(options.output!, 'merkle-root.txt');
  fs.writeFileSync(rootFile, tree.root, 'utf8');

  // Save claims (user data + proofs)
  const claimsFile = path.join(options.output!, 'claims.json');
  fs.writeFileSync(claimsFile, JSON.stringify(claims, null, 2), 'utf8');

  // Save manifest with metadata
  const manifest = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    rootHash: tree.root,
    dateGenerated: dateGenerated,
    totalUsers: users.length,
    inputFile: options.input,
    leafEncoding: ['string', 'string', 'address', 'int256', 'uint256', 'uint256', 'uint256'],
    description: 'Merkle tree for user data verification'
  };

  const manifestFile = path.join(options.output!, 'manifest.json');
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2), 'utf8');

  console.log(`📁 Output saved to: ${options.output}`);
  console.log(`   - merkle-root.txt (${tree.root.length} chars)`);
  console.log(`   - claims.json (${Object.keys(claims).length} addresses)`);
  console.log(`   - manifest.json (metadata)`);
}

async function main() {
  try {
    const options = parseArgs();

    console.log(`🚀 Building Merkle tree from: ${options.input}`);

    // Check if input file exists
    if (!fs.existsSync(options.input)) {
      throw new Error(`Input file not found: ${options.input}`);
    }

    const startTime = Date.now();

    // Parse input data (CSV or JSON)
    console.log(`🔄 Parsing input data...`);
    const { users, dateGenerated } = parseInput(options.input);

    if (users.length === 0) {
      throw new Error('No user data found in input file');
    }

    console.log(`📊 Loaded ${users.length} users`);

    // Build merkle tree
    const { tree } = buildMerkleTree(users);

    // Generate claims with proofs
    console.log(`🔄 Generating proofs for all users...`);
    const claims = generateClaims(tree, users);

    // Save all output files
    saveOutput(options, tree, claims, users, dateGenerated);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`✅ Merkle tree generation completed in ${duration}s`);
    console.log(`🌳 Root: ${tree.root}`);
    console.log(`👥 Users: ${users.length}`);
    console.log(`📁 Output: ${options.output}`);

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { parseInput, buildMerkleTree, generateClaims };