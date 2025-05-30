#!/bin/bash

echo "🔧 Setting up BleakAI for local testing..."

# Build the library first
echo "📦 Building the library..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

# Link the library globally
echo "🔗 Linking library globally..."
npm link

if [ $? -ne 0 ]; then
    echo "❌ Failed to link library. Please check for errors."
    exit 1
fi

echo "✅ BleakAI is now linked globally!"
echo ""
echo "📋 Next steps:"
echo "1. Navigate to your test project directory"
echo "2. Run: npm link bleakai"
echo "3. Start development mode: npm run dev (in this library directory)"
echo "4. Make changes and they'll be reflected in your test project"
echo ""
echo "🔄 To unlink later:"
echo "  In your test project: npm unlink bleakai && npm install"
echo "  In this directory: npm unlink" 