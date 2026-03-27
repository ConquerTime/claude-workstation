#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const scriptPath = path.join(__dirname, '..', 'claude-workstation');

if (!fs.existsSync(scriptPath)) {
  console.error('Error: claude-workstation script not found at', scriptPath);
  process.exit(1);
}

// Ensure the bash script is executable
try {
  fs.chmodSync(scriptPath, 0o755);
} catch (_) {}

const result = spawnSync('bash', [scriptPath, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: process.env,
});

if (result.error) {
  if (result.error.code === 'ENOENT') {
    console.error('Error: bash not found. This tool requires bash.');
  } else {
    console.error('Error:', result.error.message);
  }
  process.exit(1);
}

process.exit(result.status ?? 0);
