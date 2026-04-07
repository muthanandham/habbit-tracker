#!/bin/bash

# Configuration
PORTS=("5173" "5000")
APP_NAME="Life-OS"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}⏹️  Stopping $APP_NAME Development Environment...${NC}"

for PORT in "${PORTS[@]}"
do
    PID=$(lsof -t -i:"$PORT")
    if [ -n "$PID" ]; then
        echo -e "${BLUE}Found process on port $PORT (PID: $PID). Killing...${NC}"
        kill -9 "$PID" 2>/dev/null
        echo -e "${GREEN}✅ Terminated process on port $PORT${NC}"
    else
        echo -e "Port $PORT is already free."
    fi
done

echo -e "${GREEN}🎉 Cleanup complete. $APP_NAME stopped.${NC}"
