#!/bin/bash

# Configuration
LOG_DIR="logs"
LOG_FILE="$LOG_DIR/dev.log"
APP_NAME="Life-OS"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create logs directory if it doesn't exist
if [ ! -d "$LOG_DIR" ]; then
    mkdir "$LOG_DIR"
    echo -e "${YELLOW}Created $LOG_DIR directory.${NC}"
fi

# Clean up old logs (optional)
# > "$LOG_FILE"

echo -e "${BLUE}🚀 Starting $APP_NAME Development Environment...${NC}"

# Run npm run dev in the background
nohup npm run dev > "$LOG_FILE" 2>&1 &
APP_PID=$!

echo -e "${GREEN}✅ Application started in background (PID: $APP_PID)${NC}"
echo -e "${BLUE}📊 Streaming logs below (Ctrl+C to stop tailing without killing the app):${NC}"
echo "----------------------------------------------------------------"

# Tail the logs
tail -f "$LOG_FILE"
