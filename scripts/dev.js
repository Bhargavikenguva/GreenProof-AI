#!/usr/bin/env node
import { spawn } from 'child_process';
import path from 'path';

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';
const rootDir = process.cwd();

console.log('\n======================================================');
console.log('   GREENPROOF AI — STARTING FULL-STACK LOCAL DEV      ');
console.log('======================================================');
console.log('-> Backend API:  http://localhost:5000');
console.log('-> Health Check: http://localhost:5000/api/health');
console.log('-> Frontend:     http://localhost:5173');
console.log('======================================================\n');

// Spawn Server
const serverProc = spawn(`${npmCmd} run dev`, {
  cwd: path.join(rootDir, 'server'),
  stdio: 'inherit',
  shell: true,
});

// Spawn Client
const clientProc = spawn(`${npmCmd} run dev`, {
  cwd: path.join(rootDir, 'client'),
  stdio: 'inherit',
  shell: true,
});

function cleanup() {
  console.log('\nStopping GreenProof AI services...');
  serverProc.kill();
  clientProc.kill();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

serverProc.on('exit', (code) => {
  if (code && code !== 0) {
    console.error(`[Backend] process exited with code ${code}`);
  }
});

clientProc.on('exit', (code) => {
  if (code && code !== 0) {
    console.error(`[Frontend] process exited with code ${code}`);
  }
});
