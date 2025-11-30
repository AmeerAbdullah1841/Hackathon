#!/bin/bash

echo "Setting up local PostgreSQL database for hackathon platform..."
echo ""

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "PostgreSQL is not running. Starting PostgreSQL service..."
    sudo systemctl start postgresql
    sleep 2
fi

# Check again
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "❌ Error: Could not start PostgreSQL."
    echo "Please start PostgreSQL manually:"
    echo "  sudo systemctl start postgresql"
    echo ""
    echo "Or use a cloud database (see LOCAL_SETUP.md)"
    exit 1
fi

echo "✅ PostgreSQL is running"
echo ""

# Create database
echo "Creating database 'hackathon_db'..."
sudo -u postgres psql -c "CREATE DATABASE hackathon_db;" 2>/dev/null || \
psql -U postgres -h localhost -c "CREATE DATABASE hackathon_db;" 2>/dev/null || \
echo "Database might already exist or you need to create it manually"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Your .env.local file is already configured."
echo "Restart your dev server: npm run dev"


