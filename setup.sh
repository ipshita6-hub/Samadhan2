#!/bin/bash

# University Ticketing System - Setup Script
# This script automates the setup process for both backend and frontend

echo "🎓 University Ticketing System - Setup Script"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Python is installed
echo "Checking prerequisites..."
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed. Please install Python 3.9 or higher.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python 3 found${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 16 or higher.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found${NC}"

# Check if MongoDB is running
if ! command -v mongod &> /dev/null; then
    echo -e "${YELLOW}⚠ MongoDB not found. Make sure MongoDB is installed and running.${NC}"
fi

echo ""
echo "Setting up Backend..."
echo "--------------------"

# Backend setup
cd backend

# Create virtual environment
echo "Creating Python virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating backend .env file..."
    cp .env.example .env
    echo -e "${YELLOW}⚠ Please edit backend/.env with your configuration${NC}"
else
    echo -e "${GREEN}✓ Backend .env file already exists${NC}"
fi

cd ..

echo ""
echo "Setting up Frontend..."
echo "---------------------"

# Frontend setup
cd frontend

# Install dependencies
echo "Installing Node.js dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating frontend .env file..."
    cp .env.example .env
    echo -e "${YELLOW}⚠ Please edit frontend/.env with your Firebase configuration${NC}"
else
    echo -e "${GREEN}✓ Frontend .env file already exists${NC}"
fi

cd ..

echo ""
echo "=============================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your MongoDB and Firebase credentials"
echo "2. Edit frontend/.env with your Firebase configuration"
echo "3. Start the backend: cd backend && python main.py"
echo "4. Start the frontend: cd frontend && npm start"
echo ""
echo "Optional: Seed demo data with: cd backend && python seed.py"
echo ""
echo "For more information, see README.md"
echo "=============================================="
