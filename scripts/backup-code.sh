#!/bin/bash

# 配置信息
BACKUP_DIR="./backup/code"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/code_${DATE}.tar.gz"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 创建代码备份
tar -czf "$BACKUP_FILE" \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.git' \
    --exclude='backup' \
    .

# 只保留最近10个备份
ls -t "$BACKUP_DIR"/code_*.tar.gz | tail -n +11 | xargs -r rm

echo "Code backup completed: $BACKUP_FILE"