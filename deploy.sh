#!/bin/bash

echo "🚀 LikaAI Deployment Script"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist/
echo -e "${GREEN}✅ Clean complete${NC}"
echo ""

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Dependency installation failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 3: Build
echo "🔨 Building for production..."
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build successful${NC}"
echo ""

# Step 4: Check dist folder
echo "📂 Checking build output..."
if [ -d "dist" ]; then
    echo -e "${GREEN}✅ dist/ folder created${NC}"
    echo ""
    echo "📊 Build contents:"
    ls -lh dist/
    echo ""
    echo "📊 Assets:"
    ls -lh dist/assets/
else
    echo -e "${RED}❌ dist/ folder not found${NC}"
    exit 1
fi

echo ""
echo "================================"
echo -e "${GREEN}🎉 BUILD COMPLETE!${NC}"
echo "================================"
echo ""
echo "📁 Your production build is in: ./dist"
echo ""
echo "🚀 Next steps:"
echo "  1. Deploy ./dist folder to your hosting service"
echo "  2. Or run: npm run preview (to test locally)"
echo ""
echo "💡 Deployment options:"
echo "  • Netlify: Drag ./dist folder to netlify.app"
echo "  • Vercel: vercel --prod"
echo "  • Manual: Upload ./dist to any static host"
echo ""
echo -e "${BLUE}📖 See DEPLOYMENT.md for detailed instructions${NC}"
echo ""
