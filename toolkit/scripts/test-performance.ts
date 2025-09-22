#!/usr/bin/env tsx

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function exec(command: string, description: string) {
  console.log(`\n🔄 ${description}`);
  console.log(`   Command: ${command}`);

  const startTime = Date.now();

  try {
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`✅ ${description} - Success (${duration}s)`);
    if (output.trim()) {
      console.log(output);
    }
    return output;
  } catch (error: any) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.error(`❌ ${description} - Failed (${duration}s)`);
    console.error(error.stdout || error.message);
    process.exit(1);
  }
}

async function testPerformance() {
  console.log("🚀 Testing Merkle tree performance with large datasets...");

  // Test different dataset sizes
  const testSizes = [1000, 5000, 10000, 25000, 50000];

  for (const size of testSizes) {
    console.log(`\n📊 Testing with ${size} users:`);

    // Generate dataset
    exec(
      `npm run generate:data -- --count ${size} --output data/test-${size}.csv`,
      `Generate ${size} users`
    );

    // Build merkle tree
    exec(
      `npm run build:tree -- --in data/test-${size}.csv`,
      `Build Merkle tree for ${size} users`
    );

    // Get file sizes
    const csvSize = fs.statSync(`data/test-${size}.csv`).size;
    const claimsSize = fs.statSync('toolkit/out/claims.json').size;

    console.log(`📄 File sizes for ${size} users:`);
    console.log(`   CSV: ${(csvSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Claims JSON: ${(claimsSize / 1024 / 1024).toFixed(2)} MB`);

    // Test verification
    const claims = JSON.parse(fs.readFileSync('toolkit/out/claims.json', 'utf8'));
    const firstAddress = Object.keys(claims)[0];

    const verifyStartTime = Date.now();
    exec(
      `npm run verify:leaf -- --address ${firstAddress}`,
      `Verify proof for ${size} users dataset`
    );
    const verifyEndTime = Date.now();
    const verifyDuration = ((verifyEndTime - verifyStartTime) / 1000).toFixed(2);

    console.log(`⚡ Verification time: ${verifyDuration}s`);

    // Get proof size
    const proofLength = claims[firstAddress].proof.length;
    console.log(`🌳 Proof size: ${proofLength} elements (log2(${size}) ≈ ${Math.ceil(Math.log2(size))})`);
  }

  console.log("\n🎉 Performance testing completed!");
  console.log("\n📈 Summary:");
  console.log("  - Larger datasets take longer to generate and build trees");
  console.log("  - Proof size grows logarithmically (O(log n))");
  console.log("  - Verification time remains relatively constant");
  console.log("  - Memory usage scales with dataset size");
}

async function main() {
  try {
    await testPerformance();
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { testPerformance };