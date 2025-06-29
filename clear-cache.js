// Cache Clearing Utility Script
// Run this script to clear various types of cache

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🧹 Cache Clearing Utility for Coffee Shop POS');
console.log('===============================================');

// Function to delete directory recursively
function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folderPath);
    console.log(`✅ Deleted: ${folderPath}`);
  } else {
    console.log(`ℹ️  Not found: ${folderPath}`);
  }
}

// Clear Node.js cache
function clearNodeCache() {
  console.log('\n🔄 Clearing Node.js cache...');
  
  // Clear require cache
  Object.keys(require.cache).forEach(key => {
    delete require.cache[key];
  });
  console.log('✅ Node.js require cache cleared');
}

// Clear npm cache
function clearNpmCache() {
  console.log('\n📦 Clearing npm cache...');
  const { execSync } = require('child_process');
  
  try {
    execSync('npm cache clean --force', { stdio: 'inherit' });
    console.log('✅ npm cache cleared');
  } catch (error) {
    console.log('❌ Failed to clear npm cache:', error.message);
  }
}

// Clear Electron cache directories
function clearElectronCache() {
  console.log('\n⚡ Clearing Electron cache...');
  
  const platform = os.platform();
  let electronCachePaths = [];
  
  if (platform === 'win32') {
    const appData = process.env.APPDATA;
    electronCachePaths = [
      path.join(appData, 'coffee-pos-system'),
      path.join(appData, 'Electron'),
      path.join(os.homedir(), 'AppData', 'Local', 'coffee-pos-system'),
      path.join(os.homedir(), 'AppData', 'Local', 'Electron')
    ];
  } else if (platform === 'darwin') {
    electronCachePaths = [
      path.join(os.homedir(), 'Library', 'Application Support', 'coffee-pos-system'),
      path.join(os.homedir(), 'Library', 'Application Support', 'Electron'),
      path.join(os.homedir(), 'Library', 'Caches', 'coffee-pos-system'),
      path.join(os.homedir(), 'Library', 'Caches', 'Electron')
    ];
  } else {
    electronCachePaths = [
      path.join(os.homedir(), '.config', 'coffee-pos-system'),
      path.join(os.homedir(), '.config', 'Electron'),
      path.join(os.homedir(), '.cache', 'coffee-pos-system'),
      path.join(os.homedir(), '.cache', 'Electron')
    ];
  }
  
  electronCachePaths.forEach(cachePath => {
    deleteFolderRecursive(cachePath);
  });
}

// Clear build cache
function clearBuildCache() {
  console.log('\n🏗️  Clearing build cache...');
  
  const buildPaths = [
    'dist',
    'dist-electron',
    'node_modules/.cache',
    'node_modules/.vite',
    '.vite'
  ];
  
  buildPaths.forEach(buildPath => {
    deleteFolderRecursive(buildPath);
  });
}

// Main execution
async function main() {
  try {
    clearNodeCache();
    clearNpmCache();
    clearElectronCache();
    clearBuildCache();
    
    console.log('\n🎉 Cache clearing completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: npm install');
    console.log('2. Run: npm run build');
    console.log('3. Run: npm run dev (for web) or npm run electron-dev (for desktop)');
    
  } catch (error) {
    console.error('❌ Error during cache clearing:', error);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { clearNodeCache, clearNpmCache, clearElectronCache, clearBuildCache };