const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const GITHUB_REPO = 'https://github.com/your-username/your-repo.git';  // 需要替换为实际的仓库地址
const tagName = process.argv[2];

// 显示使用说明
if (!tagName) {
  console.error('错误: 未指定备份标签');
  console.log('用法: npm run restore:code <tag_name>');
  console.log('示例: npm run restore:code backup-2024-01-01');
  process.exit(1);
}

async function main() {
  // 确保我们在项目根目录
  process.chdir(PROJECT_ROOT);
  console.log('工作目录:', process.cwd());

  try {
    // 检查是否已克隆仓库
    if (!fs.existsSync(path.join(PROJECT_ROOT, '.git'))) {
      console.log('正在克隆仓库...');
      execSync(`git clone ${GITHUB_REPO} .`, { stdio: 'inherit' });
    }

    // 获取最新的变更
    console.log('正在获取最新的变更...');
    execSync('git fetch --all --tags', { stdio: 'inherit' });

    // 检查标签是否存在
    const tags = execSync('git tag', { encoding: 'utf8' }).split('\n');
    if (!tags.includes(tagName)) {
      console.error('错误: 找不到指定的备份标签');
      console.log('可用的备份标签:');
      tags.filter(tag => tag.startsWith('backup-')).forEach(tag => {
        console.log(`- ${tag}`);
      });
      process.exit(1);
    }

    // 切换到指定标签
    console.log(`正在恢复到标签: ${tagName}`);
    execSync(`git checkout ${tagName}`, { stdio: 'inherit' });

    // 获取提交信息
    const commitInfo = execSync('git log -1 --format="%H|%an|%s"', { encoding: 'utf8' }).trim();
    const [hash, author, message] = commitInfo.split('|');

    console.log('\n备份信息:');
    console.log(`提交: ${hash}`);
    console.log(`作者: ${author}`);
    console.log(`信息: ${message}`);

    // 获取未提交的更改
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      console.log('\n当前有未提交的更改:');
      status.split('\n')
        .filter(line => line.trim())
        .forEach(line => {
          console.log(`  ${line}`);
        });
    }

    console.log('\n代码已成功恢复');
  } catch (err) {
    console.error('错误: 代码恢复失败');
    console.error('错误信息:', err.message);
    process.exit(1);
  }
}

// 执行主函数
main().catch(console.error);