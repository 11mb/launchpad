# Project: Local Launchpad (The "New-Creation" Dashboard)

## 1. Goal
Create a lightweight CLI and Web Dashboard tool that recursively scans my local development directory for projects, identifies them via a specific configuration file, and provides a GUI to start/stop them and open them in the browser.

## 2. Core Logic

### The Marker File: `.launchpad`
The app should look for a file named `.launchpad` (JSON format) in project roots. 
If found, that folder is considered a "Project."

**Example `.launchpad` content:**
```json
{
  "name": "Smart Manager",
  "port": 4200,
  "startCommand": "npm run start:smart-manager",
  "color": "blue" 
}
