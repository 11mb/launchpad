#!/bin/bash

# Configuration
LABEL="com.williamhollebrandse.launchpad"
PLIST_NAME="$LABEL.plist"
DEST_DIR="$HOME/Library/LaunchAgents"
DEST_PATH="$DEST_DIR/$PLIST_NAME"

# Detect paths
PROJECT_DIR="$(pwd)"
NODE_PATH="/Users/williamhollebrandse/.nvm/versions/node/v20.19.6/bin/node"
NPM_PATH="/Users/williamhollebrandse/.nvm/versions/node/v20.19.6/bin/npm"

# Ensure log directory exists
mkdir -p "$PROJECT_DIR/.logs"

echo "Installing Launch Agent for Launchpad..."
echo "Project Path: $PROJECT_DIR"
echo "NPM Path: $NPM_PATH"

# Create plist content
cat <<EOF > "$PROJECT_DIR/$PLIST_NAME"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>$LABEL</string>
    <key>ProgramArguments</key>
    <array>
        <string>$NPM_PATH</string>
        <string>run</string>
        <string>dev</string>
    </array>
    <key>WorkingDirectory</key>
    <string>$PROJECT_DIR</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$HOME/.nvm/versions/node/v20.19.6/bin</string>
        <key>HOME</key>
        <string>$HOME</string>
    </dict>
    <key>StandardOutPath</key>
    <string>$PROJECT_DIR/.logs/launchpad.out.log</string>
    <key>StandardErrorPath</key>
    <string>$PROJECT_DIR/.logs/launchpad.err.log</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
EOF

# Move to LaunchAgents
mkdir -p "$DEST_DIR"
cp "$PROJECT_DIR/$PLIST_NAME" "$DEST_PATH"
rm "$PROJECT_DIR/$PLIST_NAME"

# Load the agent
# Unload first to ignore 'service already loaded' error on update
launchctl unload "$DEST_PATH" 2>/dev/null
launchctl load "$DEST_PATH"

echo "Success! Launchpad agent installed at $DEST_PATH"
echo "Logs will be available in $PROJECT_DIR/.logs/"
echo "You can check status with: launchctl list | grep launchpad"
