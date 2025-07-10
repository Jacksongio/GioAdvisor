#!/bin/bash

echo "🚀 Setting up GioAdvisor Backend..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Node.js version $NODE_VERSION detected. Please upgrade to Node.js 18 or higher."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Fix date-fns version conflict
echo "🔧 Fixing date-fns version conflict..."
npm install date-fns@^3.6.0

# Install OpenAI package
echo "🤖 Installing OpenAI SDK..."
npm install openai@^4.67.3

# Create environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating environment file..."
    cp env.template .env.local
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env.local and add your OpenAI API key!"
    echo "   Get your API key from: https://platform.openai.com/api-keys"
    echo ""
else
    echo "✅ Environment file already exists"
fi

# Check if data files exist
if [ ! -f "data/countries.json" ] || [ ! -f "data/conflicts.json" ]; then
    echo "❌ Data files missing! Make sure data/countries.json and data/conflicts.json exist."
    exit 1
fi

echo "✅ Data files found"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local and add your OpenAI API key"
echo "2. Run: npm run dev"
echo "3. Open: http://localhost:3000"
echo ""
echo "📖 For detailed instructions, see BACKEND_SETUP.md" 