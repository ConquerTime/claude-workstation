'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const configDir = path.join(os.homedir(), '.config', 'claude-workstation');
const configFile = path.join(configDir, 'projects.yaml');

// Skip if config already exists
if (fs.existsSync(configFile)) {
  process.exit(0);
}

const exampleConfig = path.join(__dirname, '..', 'examples', 'projects.yaml');

try {
  fs.mkdirSync(configDir, { recursive: true });
  fs.copyFileSync(exampleConfig, configFile);
  console.log('\nclaude-workstation: created default config at', configFile);
  console.log('Edit it to add your projects, then run: claude-workstation\n');
} catch (err) {
  // Non-fatal: user can create config manually
  console.log('\nclaude-workstation: could not create config at', configFile);
  console.log('Create it manually: cp', exampleConfig, configFile, '\n');
}
