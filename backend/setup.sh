#!/bin/bash

# Panchakarma Backend Setup Script

echo "Setting up Panchakarma Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "MySQL is not installed. Please install MySQL first."
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Create uploads directory
echo "Creating uploads directory..."
mkdir -p uploads

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "Please edit the .env file with your MySQL database credentials and JWT secret."
    echo "Then run: npm run dev"
else
    echo ".env file already exists."
    echo "Starting development server..."
    npm run dev
fi

echo "Setup complete!"
echo "Make sure to:"
echo "1. Create a MySQL database named 'panchakarma_db'"
echo "2. Update the .env file with your MySQL database credentials"
echo "3. Run the database schema: mysql -u root -p panchakarma_db < ../database/schema.sql"
echo "4. Start the server: npm run dev"
