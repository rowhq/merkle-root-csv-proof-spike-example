#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';
import { parseInput, buildMerkleTree, generateClaims } from '../lib/build-tree';

async function benchmarkFormat(inputFile: string, format: string) {
  console.log(`\n📊 Benchmarking ${format} format: ${inputFile}`);

  const fileSize = fs.statSync(inputFile).size;
  console.log(`📁 File size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);

  // 1. Parsing phase
  const parseStart = performance.now();
  const { users, dateGenerated } = parseInput(inputFile);
  const parseEnd = performance.now();
  const parseTime = ((parseEnd - parseStart) / 1000).toFixed(2);
  console.log(`⚡ Parsing time: ${parseTime}s`);

  // 2. Tree building phase
  const treeStart = performance.now();
  const { tree } = buildMerkleTree(users);
  const treeEnd = performance.now();
  const treeTime = ((treeEnd - treeStart) / 1000).toFixed(2);
  console.log(`🌳 Tree building time: ${treeTime}s`);

  // 3. Claims generation phase (proofs for all users)
  const claimsStart = performance.now();
  const claims = generateClaims(tree, users);
  const claimsEnd = performance.now();
  const claimsTime = ((claimsEnd - claimsStart) / 1000).toFixed(2);
  console.log(`🔐 Claims/proofs generation time: ${claimsTime}s`);

  const totalTime = ((claimsEnd - parseStart) / 1000).toFixed(2);
  console.log(`📈 Total time: ${totalTime}s`);

  // Memory usage
  const memUsed = process.memoryUsage();
  console.log(`💾 Memory usage: ${(memUsed.heapUsed / 1024 / 1024).toFixed(2)} MB`);

  return {
    format,
    fileSize: (fileSize / 1024 / 1024).toFixed(2),
    parseTime: parseFloat(parseTime),
    treeTime: parseFloat(treeTime),
    claimsTime: parseFloat(claimsTime),
    totalTime: parseFloat(totalTime),
    memoryMB: parseFloat((memUsed.heapUsed / 1024 / 1024).toFixed(2))
  };
}

async function main() {
  console.log('🚀 50k Users Performance Benchmark');
  console.log('==================================');

  const results = [];

  // Test CSV format
  if (fs.existsSync('data/test-users-50000.csv')) {
    const csvResult = await benchmarkFormat('data/test-users-50000.csv', 'CSV');
    results.push(csvResult);
  } else {
    console.log('⚠️  CSV file not found, skipping...');
  }

  // Test JSON format
  if (fs.existsSync('data/test-50000.json')) {
    const jsonResult = await benchmarkFormat('data/test-50000.json', 'JSON');
    results.push(jsonResult);
  } else {
    console.log('⚠️  JSON file not found, skipping...');
  }

  // Summary comparison
  if (results.length === 2) {
    console.log('\n📊 PERFORMANCE COMPARISON SUMMARY');
    console.log('=====================================');
    console.table(results);

    const [csv, json] = results;

    console.log('\n🏁 WINNER ANALYSIS:');
    console.log('-------------------');

    // Parsing
    const parseFaster = csv.parseTime < json.parseTime ? 'CSV' : 'JSON';
    const parseDiff = Math.abs(csv.parseTime - json.parseTime).toFixed(2);
    console.log(`⚡ Parsing: ${parseFaster} is ${parseDiff}s faster`);

    // Tree building
    const treeFaster = csv.treeTime < json.treeTime ? 'CSV' : 'JSON';
    const treeDiff = Math.abs(csv.treeTime - json.treeTime).toFixed(2);
    console.log(`🌳 Tree Building: ${treeFaster} is ${treeDiff}s faster`);

    // Claims generation
    const claimsFaster = csv.claimsTime < json.claimsTime ? 'CSV' : 'JSON';
    const claimsDiff = Math.abs(csv.claimsTime - json.claimsTime).toFixed(2);
    console.log(`🔐 Claims Generation: ${claimsFaster} is ${claimsDiff}s faster`);

    // Total
    const totalFaster = csv.totalTime < json.totalTime ? 'CSV' : 'JSON';
    const totalDiff = Math.abs(csv.totalTime - json.totalTime).toFixed(2);
    const totalPercent = ((totalDiff / Math.max(csv.totalTime, json.totalTime)) * 100).toFixed(1);
    console.log(`\n🏆 OVERALL: ${totalFaster} is ${totalDiff}s faster (${totalPercent}% improvement)`);
  }
}

if (require.main === module) {
  main().catch(console.error);
}