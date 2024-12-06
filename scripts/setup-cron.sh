#!/bin/bash

# 添加每日数据库备份任务（每天凌晨3点）
(crontab -l 2>/dev/null; echo "0 3 * * * $(pwd)/scripts/backup-db.sh") | crontab -

# 添加每周代码备份任务（每周日凌晨4点）
(crontab -l 2>/dev/null; echo "0 4 * * 0 $(pwd)/scripts/backup-code.sh") | crontab -