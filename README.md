# Local Launchpad

Local Launchpad is a lightweight developer tool designed to manage and orchestrate your local projects from a single centralized dashboard. It recursively scans your development directory for projects identified by a `.launchpad` configuration file and provides a modern web interface to start, stop, and access them.

![Local Launchpad Dashboard](assets/dashboard-preview.png)

## Features

-   **Auto-Discovery**: Recursively scans your workspace to find projects with a `.launchpad` configuration file.
-   **Centralized Control**: specific Start and stop tasks/servers for any project from one dashboard.
-   **Real-time Feedback**: View the running status and port usage of your applications.
-   **Web Dashboard**: A modern, responsive UI built with React and Tailwind CSS.
-   **Quick Access**: Open project applications directly in your browser.

## Tech Stack

-   **Frontend**: React (Vite), TypeScript, Tailwind CSS, Lucide Icons.
-   **Backend**: Node.js, Express, Socket.io (for real-time updates), Chokidar (file watching).
-   **Tooling**: Concurrently (for running multiple services).

## Prerequisites

-   Node.js (v16+ recommended)
-   npm

## Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd local-launchpad
    ```

2.  Install dependencies for the root, server, and client:
    ```bash
    npm run install:all
    ```

## Usage

### Starting the Application

To run both the server and the client concurrently in development mode:

```bash
npm run dev
```

-   **Frontend**: Accessible at `http://localhost:5173` (default Vite port).
-   **Backend**: Runs on `http://localhost:3000` (or configured port).

### Configuring Your Projects

To make a project visible to Local Launchpad, add a `.launchpad` file to the root of that project. This file can contain a single project configuration or an array of multiple configurations (useful for monorepos or multi-service projects).

**Example `.launchpad` (Single project):**

```json
{
  "name": "My app",
  "port": 4200,
  "startCommand": "npm run start:my-app",
  "color": "blue",
  "category": "Web Applications"
}
```

**Example `.launchpad` (Multiple projects):**

```json
[
  {
    "name": "Frontend",
    "port": 3000,
    "startCommand": "npm run dev",
    "category": "Project X"
  },
  {
    "name": "Backend",
    "port": 4000,
    "startCommand": "npm run server",
    "category": "Project X"
  }
]
```

| Field | Description | Type |
| :--- | :--- | :--- |
| `name` | Display name of the project. | `string` |
| `port` | The port the application runs on (used for linking and status checks). | `number` |
| `startCommand` | The command to start the application (e.g., `npm start`). | `string` |
| `color` | Visual accent color for the project card (e.g., `blue`, `red`). | `string` |
| `category` | Optional category to group multiple launchers together. | `string` |

## Root configuration

Launchpad reads a root config file `launchpad.config.json` at the repository root to determine where to scan for projects.

- `projectsRoot`: Path (relative to this repo) where Launchpad will recursively search for projects containing a `.launchpad` file.

Example `launchpad.config.json`:

```json
{
  "projectsRoot": "../"
}
```

If you keep your projects outside this repository, set `projectsRoot` accordingly (e.g., `"../"` to look one level up, or a specific subfolder like `"../workspace"`).

## Project Structure

```text
local-launchpad/
├── client/           # React frontend application
├── server/           # Node.js/Express backend
├── scripts/          # Helper scripts
├── package.json      # Root configuration and workspaces scripts
├── project.md        # Project goals and core logic documentation
└── README.md         # Project documentation
```

## Development

-   **Server**: Located in `server/`. Run `npm run dev` inside this folder to start the backend with nodemon.
-   **Client**: Located in `client/`. Run `npm run dev` inside this folder to start the Vite dev server.
