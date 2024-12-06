# 初始化Git仓库
git init

# 创建.gitignore文件
cat > .gitignore << EOL
# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Production
/dist
/build

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local
.env

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor directories and files
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Backup files
*.bak
backup/
EOL