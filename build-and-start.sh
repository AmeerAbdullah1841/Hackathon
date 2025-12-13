#!/bin/bash

# Build and start script using Node.js 20 via nvm
set -e

echo "🔧 Activating Node.js 20 via nvm..."

# Try to load nvm from common locations
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
elif [ -s "/usr/local/opt/nvm/nvm.sh" ]; then
  export NVM_DIR="/usr/local/opt/nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# Use .nvmrc if it exists, otherwise use Node 20
if [ -f ".nvmrc" ]; then
  nvm use
else
  nvm use 20 || (nvm install 20 && nvm use 20)
fi

echo "📦 Cleaning previous build..."
rm -rf .next

echo "🔨 Building Next.js application..."
npm run build

echo "✅ Build complete! Starting server on port 3006..."
npm start

