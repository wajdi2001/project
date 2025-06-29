#!/bin/bash

# Coffee Shop POS - Deployment Script
# This script builds and deploys the application

set -e

echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed - dist directory not found."
    exit 1
fi

echo "✅ Build completed successfully!"

# Deploy to Netlify (if netlify-cli is installed)
if command -v netlify &> /dev/null; then
    echo "🌐 Deploying to Netlify..."
    netlify deploy --prod --dir=dist
    echo "✅ Deployment completed!"
else
    echo "ℹ️  Netlify CLI not found. Install it with: npm install -g netlify-cli"
    echo "ℹ️  Then run: netlify deploy --prod --dir=dist"
fi

echo "🎉 Deployment process finished!"