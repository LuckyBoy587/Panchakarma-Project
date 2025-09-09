@echo off
echo Starting Panchakarma Management System...

echo.
echo Setting up backend...
cd backend
if not exist node_modules (
    echo Installing backend dependencies...
    npm install
)

echo.
echo Setting up frontend...
cd ../frontend
if not exist node_modules (
    echo Installing frontend dependencies...
    npm install
)
echo.
echo Starting backend server...
start cmd /k "npx kill-port 5000 && cd ../backend && npm run dev"

echo.
echo Starting frontend development server...
start cmd /k "npx kill-port 3000 && cd ../frontend && npm run dev -- --host"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.

cd ..
