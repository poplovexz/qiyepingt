const shell = require('shelljs');

// 获取当前版本号
const getCurrentVersion = () => {
  const result = shell.exec('git describe --tags --abbrev=0', { silent: true });
  return result.code === 0 ? result.stdout.trim() : 'v0.0.0';
};

// 增加版本号
const incrementVersion = (version, position) => {
  version = version.replace('v', '');
  const parts = version.split('.').map(Number);
  
  switch (position) {
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
      parts[2]++;
      break;
  }
  
  return `v${parts.join('.')}`;
};

const position = process.argv[2];

if (position === 'rollback') {
  const result = shell.exec('git checkout $(git describe --tags --abbrev=0)');
  if (result.code === 0) {
    console.log('Successfully rolled back to previous version');
  }
  process.exit(result.code);
}

if (!['major', 'minor', 'patch'].includes(position)) {
  console.error('Usage: node version-control.js {major|minor|patch|rollback}');
  process.exit(1);
}

const currentVersion = getCurrentVersion();
const newVersion = incrementVersion(currentVersion, position);

shell.exec('git add .');
shell.exec(`git commit -m "Release ${newVersion}"`);
shell.exec(`git tag -a ${newVersion} -m "Release ${newVersion}"`);

console.log(`Created new version: ${newVersion}`);