#!/bin/bash

echo "🚀 Starting Firebase Robot Shabbat App..."
echo "-----------------------------------"

# Navigate to Firebase client directory
cd client-firebase

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Start the development server
echo "🔥 Starting Firebase app on port 5173..."
npm run dev -- --port 5173 --host 0.0.0.0
