@echo off
REM University Ticketing System - Setup Script for Windows
REM This script automates the setup process for both backend and frontend

echo ========================================
echo University Ticketing System - Setup
echo ========================================
echo.

REM Check if Python is installed
echo Checking prerequisites...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed. Please install Python 3.9 or higher.
    pause
    exit /b 1
)
echo [OK] Python found

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js 16 or higher.
    pause
    exit /b 1
)
echo [OK] Node.js found

echo.
echo Setting up Backend...
echo --------------------

REM Backend setup
cd backend

REM Create virtual environment
echo Creating Python virtual environment...
python -m venv venv

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating backend .env file...
    copy .env.example .env
    echo [WARNING] Please edit backend\.env with your configuration
) else (
    echo [OK] Backend .env file already exists
)

cd ..

echo.
echo Setting up Frontend...
echo ---------------------

REM Frontend setup
cd frontend

REM Install dependencies
echo Installing Node.js dependencies...
call npm install

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating frontend .env file...
    copy .env.example .env
    echo [WARNING] Please edit frontend\.env with your Firebase configuration
) else (
    echo [OK] Frontend .env file already exists
)

cd ..

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit backend\.env with your MongoDB and Firebase credentials
echo 2. Edit frontend\.env with your Firebase configuration
echo 3. Start the backend: cd backend ^&^& python main.py
echo 4. Start the frontend: cd frontend ^&^& npm start
echo.
echo Optional: Seed demo data with: cd backend ^&^& python seed.py
echo.
echo For more information, see README.md
echo ========================================
echo.
pause
