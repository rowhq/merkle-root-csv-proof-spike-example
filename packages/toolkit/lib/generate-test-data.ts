#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

interface GenerateOptions {
  count: number;
  output: string;
  format: 'csv' | 'json';
}

function generateRandomAddress(): string {
  // Generate a valid EVM address more efficiently
  const addressBytes = randomBytes(20);
  return '0x' + addressBytes.toString('hex');
}

function generateRandomEmail(userId: string): string {
  const domains = ['example.com', 'test.org', 'demo.net', 'sample.co', 'users.app'];
  const domain = domains[Math.floor(Math.random() * domains.length)];

  // Create more realistic email patterns
  const prefixes = ['user', 'test', 'demo', 'member', 'account'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

  return `${prefix}.${userId}@${domain}`;
}

function generateRandomReputation(): number {
  // Generate reputation between -100 and 100, with slight bias toward positive
  const random = Math.random();
  if (random < 0.7) {
    // 70% chance of positive reputation (0 to 100)
    return Math.floor(Math.random() * 101);
  } else {
    // 30% chance of negative reputation (-100 to -1)
    return Math.floor(Math.random() * 100) - 100;
  }
}

function generateUserData(index: number) {
  const userId = `user_${String(index).padStart(6, '0')}`;
  const email = generateRandomEmail(userId);
  const userAddress = generateRandomAddress();
  const reputation = generateRandomReputation();

  // Generate realistic point values
  const basePoints = Math.floor(Math.random() * 1000) + 50; // 50-1050
  const prePoints = Math.max(0, basePoints - Math.floor(Math.random() * 200)); // Previous points
  const points = basePoints + Math.floor(Math.random() * 100); // Current points
  const cumulativePoints = points + Math.floor(Math.random() * 2000) + 100; // Total cumulative

  return {
    userId,
    email,
    userAddress,
    reputation,
    prePoints,
    points,
    cumulativePoints
  };
}

function generateCSV(count: number): string {
  const headers = 'UserId,Email,UserAddress,Reputation,PrePoints,Points,CummulativePoints\n';

  let csv = headers;

  for (let i = 1; i <= count; i++) {
    const user = generateUserData(i);
    csv += `${user.userId},${user.email},${user.userAddress},${user.reputation},${user.prePoints},${user.points},${user.cumulativePoints}\n`;

    // Progress indicator for large datasets
    if (i % 10000 === 0) {
      console.log(`Generated ${i} users...`);
    }
  }

  return csv;
}

function generateJSON(count: number): string {
  const users = [];

  for (let i = 1; i <= count; i++) {
    const userData = generateUserData(i);
    // Rename to match the expected structure
    users.push({
      UserId: userData.userId,
      Email: userData.email,
      UserAddress: userData.userAddress,
      Reputation: userData.reputation,
      PrePoints: userData.prePoints,
      Points: userData.points,
      CummulativePoints: userData.cumulativePoints
    });

    // Progress indicator for large datasets
    if (i % 10000 === 0) {
      console.log(`Generated ${i} users...`);
    }
  }

  const jsonStructure = {
    date_generated: Math.floor(Date.now() / 1000), // UTC timestamp
    users_data: users
  };

  return JSON.stringify(jsonStructure, null, 2);
}

function parseArgs(): GenerateOptions {
  const args = process.argv.slice(2);

  let count = 50000; // Default to 50k
  let output = '';
  let format: 'csv' | 'json' = 'csv';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--count' || arg === '-c') {
      count = parseInt(args[++i]);
      if (isNaN(count) || count <= 0) {
        throw new Error('Count must be a positive number');
      }
    } else if (arg === '--output' || arg === '-o') {
      output = args[++i];
    } else if (arg === '--format' || arg === '-f') {
      const formatArg = args[++i];
      if (formatArg !== 'csv' && formatArg !== 'json') {
        throw new Error('Format must be either "csv" or "json"');
      }
      format = formatArg;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Usage: tsx generate-test-data.ts [options]

Options:
  --count, -c <number>     Number of users to generate (default: 50000)
  --output, -o <path>      Output file path (default: data/test-users-{count}.csv)
  --format, -f <format>    Output format: csv or json (default: csv)
  --help, -h              Show this help message

Examples:
  tsx generate-test-data.ts                           # Generate 50k users in CSV
  tsx generate-test-data.ts --count 1000             # Generate 1k users
  tsx generate-test-data.ts --format json            # Generate in JSON format
  tsx generate-test-data.ts --output custom.csv      # Custom output file
      `);
      process.exit(0);
    }
  }

  // Set default output if not provided
  if (!output) {
    const projectRoot = path.resolve(__dirname, '../..');
    output = path.join(projectRoot, 'data', `test-users-${count}.${format}`);
  }

  return { count, output, format };
}

async function main() {
  try {
    const options = parseArgs();

    console.log(`🚀 Generating ${options.count} test users...`);
    console.log(`📁 Output: ${options.output}`);
    console.log(`📋 Format: ${options.format.toUpperCase()}`);

    const startTime = Date.now();

    // Ensure output directory exists
    const outputDir = path.dirname(options.output);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    let content: string;
    if (options.format === 'csv') {
      content = generateCSV(options.count);
    } else {
      content = generateJSON(options.count);
    }

    // Write to file
    fs.writeFileSync(options.output, content, 'utf8');

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`✅ Successfully generated ${options.count} users in ${duration}s`);
    console.log(`📄 File size: ${(content.length / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📁 Output file: ${options.output}`);

    // Show some sample data
    const lines = content.split('\n');
    console.log('\n📋 Sample data (first 3 entries):');
    console.log(lines.slice(0, Math.min(4, lines.length)).join('\n'));

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { generateUserData, generateCSV, generateJSON };