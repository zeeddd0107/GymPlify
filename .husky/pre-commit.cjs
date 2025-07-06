#!/usr/bin/env node

const { execSync } = require('child_process');

try {
  execSync('npm run lint:all', { stdio: 'inherit' });
} catch (e) {
  process.exit(1);
} 