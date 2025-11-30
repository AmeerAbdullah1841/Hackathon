#!/bin/bash
echo "Starting PostgreSQL and setting up database..."

# Start PostgreSQL service
echo "1. Starting PostgreSQL service..."
sudo systemctl start postgresql

# Wait a moment for it to start
sleep 2

# Check if it's running
if pg_isready -h localhost > /dev/null 2>&1; then
    echo "✅ PostgreSQL is running"
    
    # Create database
    echo "2. Creating database 'hackathon_db'..."
    sudo -u postgres psql -c "CREATE DATABASE hackathon_db;" 2>/dev/null && echo "✅ Database created" || echo "⚠️  Database might already exist"
    
    echo ""
    echo "✅ Setup complete! Now restart your dev server:"
    echo "   Press Ctrl+C to stop current server, then run: npm run dev"
else
    echo "❌ Failed to start PostgreSQL"
    echo "Please run manually: sudo systemctl start postgresql"
fi
