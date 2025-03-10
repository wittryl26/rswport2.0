# RSW Portfolio Application

## Installation

To install all the dependencies for this project, run:

```bash
npm install
```

To install frontend dependencies:

```bash
cd Frontend
npm install
```

## Development

There are multiple ways to run the application:

### Option 1: Using npm scripts

Start the Express.js server:
```bash
npm run dev
```

Serve the entire project from root (includes redirect):
```bash
npm run serve
```

Serve only the frontend (from Frontend directory):
```bash
npm run serve:frontend
```

### Option 2: Using convenience scripts

On Windows:
```
start-server.bat
```

On Unix/Linux/Mac:
```bash
chmod +x ./start-server.sh
./start-server.sh
```

### http-server Configuration Notes

When running http-server directly without specifying a directory, it serves from the current directory (`./`).
The current configuration is:

```
http-server version: 14.1.1
CORS: disabled
Cache: 3600 seconds
Connection Timeout: 120 seconds
Directory Listings: visible
AutoIndex: visible
Serve GZIP Files: false
Serve Brotli Files: false
Default File Extension: none
```

To serve specifically from the Frontend directory, use:
```bash
http-server ./Frontend
```

### Frontend Development Tools

From the Frontend directory:

```bash
# Format code with Prettier
npm run format

# Lint code with ESLint
npm run lint
```

## Production

To start the production server:

```bash
npm start
```
