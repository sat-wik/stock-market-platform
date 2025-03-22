#!/bin/bash

# Store the script's directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Function to kill background processes on script exit
cleanup() {
    echo "\nStopping servers..."
    if [ ! -z "$backend_pid" ]; then
        echo "Stopping backend (PID: $backend_pid)"
        kill $backend_pid 2>/dev/null
    fi
    if [ ! -z "$frontend_pid" ]; then
        echo "Stopping frontend (PID: $frontend_pid)"
        kill $frontend_pid 2>/dev/null
    fi
    exit
}

# Set up trap
trap cleanup SIGINT SIGTERM EXIT

# Check if ports are already in use
if lsof -i:3000 >/dev/null || lsof -i:3001 >/dev/null; then
    echo "Error: Ports 3000 or 3001 are already in use"
    echo "Killing existing processes..."
    lsof -ti:3000,3001 | xargs kill -9 2>/dev/null
    sleep 2
fi

# Start backend server
echo "Starting backend server..."
cd "$SCRIPT_DIR/backend"
DEBUG=* npm run dev &
backend_pid=$!

# Wait for backend to start and check if it's running
sleep 3
if ! kill -0 $backend_pid 2>/dev/null; then
    echo "Error: Backend server failed to start"
    cleanup
    exit 1
fi
echo "Backend server started successfully (PID: $backend_pid)"

# Start frontend server
echo "\nStarting frontend server..."
cd "$SCRIPT_DIR/frontend"
PORT=3000 BROWSER=none npm start &
frontend_pid=$!

# Wait for frontend to start and check if it's running
sleep 3
if ! kill -0 $frontend_pid 2>/dev/null; then
    echo "Error: Frontend server failed to start"
    cleanup
    exit 1
fi
echo "Frontend server started successfully (PID: $frontend_pid)"

echo "\nAll servers started successfully!"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:3001"

# Wait for both processes
wait $backend_pid $frontend_pid
