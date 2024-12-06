#!/bin/bash

# 配置信息
DB_NAME="enterprise_management"
BACKUP_DIR="./backup/database"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${DATE}.sql"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 备份数据库
pg_dump -U postgres "$DB_NAME" > "$BACKUP_FILE"

# 压缩备份文件
gzip "$BACKUP_FILE"

# 只保留最近30天的备份
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete

echo "Database backup completed: ${BACKUP_FILE}.gz"