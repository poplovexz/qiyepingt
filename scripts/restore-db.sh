#!/bin/bash

# 检查参数
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 backup_file"
    exit 1
fi

BACKUP_FILE=$1
DB_NAME="enterprise_management"

# 检查备份文件是否存在
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup file not found: $BACKUP_FILE"
    exit 1
fi

# 如果是压缩文件，先解压
if [[ "$BACKUP_FILE" == *.gz ]]; then
    gunzip -c "$BACKUP_FILE" | psql -U postgres -d "$DB_NAME"
else
    psql -U postgres -d "$DB_NAME" < "$BACKUP_FILE"
fi

echo "Database restore completed"