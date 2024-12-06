const shell = require('shelljs');
const path = require('path');
const fs = require('fs');
const os = require('os');

const DB_NAME = "enterprise_management";
const backupFile = process.argv[2];
const TEMP_DIR = path.join(os.tmpdir(), 'db-restore');

// 显示使用说明
if (!backupFile) {
  console.error('错误: 未指定备份文件');
  console.log('用法: npm run restore:db <backup_file>');
  console.log('示例: npm run restore:db backup/database/enterprise_management_20240101.sql.zip');
  process.exit(1);
}

// 7-Zip可能的安装路径
const SEVEN_ZIP_PATHS = [
  process.env.ProgramFiles + "\\7-Zip\\7z.exe",
  process.env["ProgramFiles(x86)"] + "\\7-Zip\\7z.exe",
  "C:\\Program Files\\7-Zip\\7z.exe",
  "C:\\Program Files (x86)\\7-Zip\\7z.exe",
  "C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\7-Zip\\7z.exe",
  // 如果有自定义安装路径，可以在这里添加
];

// 获取7z可执行文件路径
const get7ZipPath = () => {
  // 首先检查环境变量
  if (shell.which('7z')) {
    return '7z';
  }

  // 然后检查常见安装路径
  for (const path of SEVEN_ZIP_PATHS) {
    if (fs.existsSync(path)) {
      return path;
    }
  }

  return null;
};

// 检查7z是否可用
const sevenZipPath = get7ZipPath();
if (!sevenZipPath) {
  console.error('错误: 未找到7-Zip，请确保已安装7-Zip');
  shell.exit(1);
}

// 尝试不同的路径组合
const possiblePaths = [
  backupFile,
  path.join(process.cwd(), backupFile),
  path.join(__dirname, '..', backupFile)
];

// 查找实际存在的文件路径
const actualPath = possiblePaths.find(p => fs.existsSync(p));

if (!actualPath) {
  console.error('错误: 找不到备份文件');
  console.log('尝试过以下路径:');
  possiblePaths.forEach(p => console.log(`- ${p}`));
  process.exit(1);
}

// 创建临时目录
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// 如果是压缩文件，先解压
if (actualPath.endsWith('.zip')) {
  console.log('正在解压备份文件...');
  const unzipResult = shell.exec(`"${sevenZipPath}" x "${actualPath}" -o"${TEMP_DIR}" -y`, { encoding: 'utf8' });
  
  if (unzipResult.code !== 0) {
    console.error('错误: 解压备份文件失败');
    shell.exit(1);
  }

  // 查找SQL文件
  const sqlFile = fs.readdirSync(TEMP_DIR).find(file => file.endsWith('.sql'));
  if (!sqlFile) {
    console.error('错误: 在压缩文件中找不到SQL��件');
    shell.exit(1);
  }

  console.log('正在恢复数据库...');
  const restoreResult = shell.exec(`psql -U postgres -d ${DB_NAME} < "${path.join(TEMP_DIR, sqlFile)}"`, { encoding: 'utf8' });
  
  if (restoreResult.code !== 0) {
    console.error('错误: 数据库恢复失败');
    shell.exit(1);
  }

  // 清理临时文件
  shell.rm('-rf', TEMP_DIR);
} else {
  console.log('正在恢复数据库...');
  const result = shell.exec(`psql -U postgres -d ${DB_NAME} < "${actualPath}"`, { encoding: 'utf8' });
  
  if (result.code !== 0) {
    console.error('错误: 数据库恢复失败');
    shell.exit(1);
  }
}

console.log('数据库恢复完成'); 