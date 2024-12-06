const shell = require('shelljs');
const path = require('path');
const fs = require('fs');
const portable7Zip = require('./portable-7zip');

// 配置信息
const DB_NAME = "enterprise_management";
const BACKUP_DIR = path.join(__dirname, "../backup/database");
const DATE = new Date().toISOString().replace(/[:.]/g, '-');
const BACKUP_FILE = path.join(BACKUP_DIR, `${DB_NAME}_${DATE}.sql`);
const BACKUP_ZIP = `${BACKUP_FILE}.zip`;

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
  // 首先检查便携版
  if (portable7Zip.check7Zip()) {
    return portable7Zip.get7ZipPath();
  }

  // 然后检查环境变量
  if (shell.which('7z')) {
    return '7z';
  }

  // 最后检查常见安装路径
  for (const path of SEVEN_ZIP_PATHS) {
    if (fs.existsSync(path)) {
      return path;
    }
  }

  return null;
};

// 创建备份目录
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// 检查pg_dump是否可用
if (!shell.which('pg_dump')) {
  console.error('错误: 未安装pg_dump');
  shell.exit(1);
}

// 检查7z是否可用
const sevenZipPath = get7ZipPath();
if (!sevenZipPath) {
  console.error('错误: 未找到7-Zip，请确保已安装7-Zip');
  shell.exit(1);
}

// 备份数据库
console.log('正在备份数据库...');
const result = shell.exec(`pg_dump -U postgres -E UTF8 ${DB_NAME} > "${BACKUP_FILE}"`, { encoding: 'utf8' });

if (result.code !== 0) {
  console.error('错误: 数据库备份失败');
  shell.exit(1);
}

// 压缩备份文件
console.log('正在压缩备份文件...');
const zipResult = shell.exec(`"${sevenZipPath}" a "${BACKUP_ZIP}" "${BACKUP_FILE}"`, { encoding: 'utf8' });

if (zipResult.code !== 0) {
  console.error('错误: 压缩备份文件失败');
  shell.exit(1);
}

// 删除未压缩的SQL文件
fs.unlinkSync(BACKUP_FILE);

// 清理旧备份
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

fs.readdirSync(BACKUP_DIR)
  .filter(file => file.endsWith('.sql.zip'))
  .map(file => ({
    name: file,
    time: fs.statSync(path.join(BACKUP_DIR, file)).mtime
  }))
  .filter(file => file.time < thirtyDaysAgo)
  .forEach(file => {
    fs.unlinkSync(path.join(BACKUP_DIR, file.name));
  });

console.log(`数据库备份完成: ${BACKUP_ZIP}`); 