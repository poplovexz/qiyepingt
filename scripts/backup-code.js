const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置信息
const PROJECT_ROOT = path.resolve(__dirname, '..');
const GITHUB_REPO = 'git@github.com:poplovexz/enterprise-management.git';  // 使用 SSH 认证

// 获取Git信息函数
function getGitInfo() {
  const gitInfo = {
    branch: '',
    commit: '',
    tag: '',
    status: [],
    timestamp: new Date().toISOString()
  };

  try {
    // 获取当前分支
    gitInfo.branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();

    // 获取最后提交
    const commitInfo = execSync('git log -1 --format="%H|%an|%s"', { encoding: 'utf8' }).trim();
    const [hash, author, message] = commitInfo.split('|');
    gitInfo.commit = { hash, author, message };

    // 获取最近标签
    try {
      gitInfo.tag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
    } catch (err) {
      // 如果没有标签，忽略错误
    }

    // 获取未提交的更改
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    gitInfo.status = status
      .split('\n')
      .filter(line => line.trim())
      .map(line => ({
        status: line.slice(0, 2).trim(),
        file: line.slice(3).trim()
      }));
  } catch (err) {
    console.warn('警告: 获取Git信息失败', err.message);
  }

  return gitInfo;
}

async function main() {
  // 确保我们在项目根目录
  process.chdir(PROJECT_ROOT);
  console.log('工作目录:', process.cwd());

  try {
    // 检查是否已初始化Git仓库
    if (!fs.existsSync(path.join(PROJECT_ROOT, '.git'))) {
      console.log('正在初始化Git仓库...');
      execSync('git init', { stdio: 'inherit' });
      execSync(`git remote add origin ${GITHUB_REPO}`, { stdio: 'inherit' });
    }

    // 获取Git信息
    const gitInfo = getGitInfo();
    
    // 创建备份提交
    console.log('正在创建备份提交...');
    
    // 添加所有更改
    execSync('git add .', { stdio: 'inherit' });
    
    // 创建提交
    const date = new Date().toISOString().replace(/[:.]/g, '-');
    execSync(`git commit -m "Backup: ${date}"`, { stdio: 'inherit' });
    
    // 推送到远程仓库
    console.log('正在推送到GitHub...');
    execSync('git push origin master', { stdio: 'inherit' });
    
    // 创建标签
    const tagName = `backup-${date}`;
    execSync(`git tag -a ${tagName} -m "Backup: ${date}"`, { stdio: 'inherit' });
    execSync(`git push origin ${tagName}`, { stdio: 'inherit' });

    console.log('代码已成功备份到GitHub');
    console.log(`分支: ${gitInfo.branch}`);
    console.log(`提交: ${gitInfo.commit.hash}`);
    console.log(`标签: ${tagName}`);
  } catch (err) {
    console.error('错误: 代码备份失败');
    console.error('错误信息:', err.message);
    process.exit(1);
  }
}

// 执行主函数
main().catch(console.error);