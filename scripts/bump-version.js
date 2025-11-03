#!/usr/bin/env node

/**
 * Version bump script for the Pokédex app
 * Usage: node scripts/bump-version.js [major|minor|patch]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

function checkGitStatus() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      console.error('Error: Working directory has uncommitted changes.');
      console.error('Please commit or stash your changes before bumping the version.');
      process.exit(1);
    }
  } catch (error) {
    console.warn('Warning: Could not check git status. Proceeding anyway...');
  }
}

function bumpAndUpdateVersion() {
  const bumpType = process.argv[2] || 'patch';
  
  if (!['major', 'minor', 'patch'].includes(bumpType)) {
    console.error('Error: Version bump type must be major, minor, or patch');
    console.error('Usage: node scripts/bump-version.js [major|minor|patch]');
    process.exit(1);
  }
  
  // Check for uncommitted changes
  checkGitStatus();
  
  try {
    // Read app.json
    const appJsonContent = fs.readFileSync(appJsonPath, 'utf8');
    const appJson = JSON.parse(appJsonContent);
    
    if (!appJson.expo || !appJson.expo.version) {
      console.error('Error: app.json does not contain expo.version');
      process.exit(1);
    }
    
    const currentVersion = appJson.expo.version;
    const newVersion = bumpVersion(currentVersion, bumpType);
    
    // Update app.json
    appJson.expo.version = newVersion;
    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');
    
    // Update package.json
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);
    packageJson.version = newVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    
    console.log(`✓ Version bumped from ${currentVersion} to ${newVersion} (${bumpType})`);
    console.log('Files updated:');
    console.log('  - app.json');
    console.log('  - package.json');
  } catch (error) {
    console.error('Error:', error.message);
    if (error.code === 'ENOENT') {
      console.error('Could not find required file:', error.path);
    } else if (error instanceof SyntaxError) {
      console.error('Invalid JSON format in configuration file');
    }
    process.exit(1);
  }
}

bumpAndUpdateVersion();
