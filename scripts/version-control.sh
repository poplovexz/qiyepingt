#!/bin/bash

# 获取当前版本号
CURRENT_VERSION=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")

# 增加版本号函数
increment_version() {
    local version=$1
    local position=$2
    
    # 移除v前缀
    version=${version#v}
    
    # 分割版本号
    local parts=(${version//./ })
    
    # 增加指定位置的版本号
    case $position in
        major)
            ((parts[0]++))
            parts[1]=0
            parts[2]=0
            ;;
        minor)
            ((parts[1]++))
            parts[2]=0
            ;;
        patch)
            ((parts[2]++))
            ;;
    esac
    
    # 重新组合版本号
    echo "v${parts[0]}.${parts[1]}.${parts[2]}"
}

case "$1" in
    major|minor|patch)
        NEW_VERSION=$(increment_version $CURRENT_VERSION $1)
        ;;
    rollback)
        # 回滚到上一个版本
        git checkout $(git describe --tags --abbrev=0)
        exit 0
        ;;
    *)
        echo "Usage: $0 {major|minor|patch|rollback}"
        exit 1
        ;;
esac

# 创建新版本
git add .
git commit -m "Release $NEW_VERSION"
git tag -a $NEW_VERSION -m "Release $NEW_VERSION"

echo "Created new version: $NEW_VERSION"