#!/usr/bin/env node

/**
 * Version bump script for the Pokédex app
 * Usage: node scripts/bump-version.js [major|minor|patch]
 */

const fs = require('fs');
const path = require('path');

const appJsonPath = path.join(__dirname, '..', 'app.json');
const packageJsonPath = path.join(__dirname, '..', 'package.json');

function bumpVersion(version, type = 'patch') {
  const parts = version.split('.').map(Number);
  
  switch (type) {
    case 'major':
      parts[0]++;
      parts[1] = 0;
      parts[2] = 0;
      break;
    case 'minor':
      parts[1]++;
      parts[2] = 0;
      break;
    case 'patch':
    default:
      parts[2]++;
      break;
  }
  
  return parts.join('.');
}

function updateVersion() {
  const bumpType = process.argv[2] || 'patch';
  
  if (!['major', 'minor', 'patch'].includes(bumpType)) {
    console.error('Error: Version bump type must be major, minor, or patch');
    process.exit(1);
  }
  
  // Read app.json
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  const currentVersion = appJson.expo.version;
  const newVersion = bumpVersion(currentVersion, bumpType);
  
  // Update app.json
  appJson.expo.version = newVersion;
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');
  
  // Update package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.version = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  
  console.log(`Version bumped from ${currentVersion} to ${newVersion} (${bumpType})`);
  console.log('Files updated:');
  console.log('  - app.json');
  console.log('  - package.json');
}

updateVersion();
