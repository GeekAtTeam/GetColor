#!/bin/bash

# GetColor 插件打包脚本
# 使用方法: ./build.sh

echo "🚀 开始打包 GetColor 插件..."

# 进入 source 目录
cd source

# 创建版本号变量
VERSION=$(grep '"version"' manifest.json | cut -d'"' -f4)
echo "📦 当前版本: $VERSION"

# 打包插件
zip -r "../GetColor-v${VERSION}.zip" . -x "*.DS_Store"

# 返回上级目录
cd ..

echo "✅ 打包完成: GetColor-v${VERSION}.zip"
echo "📁 文件位置: $(pwd)/GetColor-v${VERSION}.zip"
