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

# Repository Structure Fix

If files aren't appearing in their correct directories after a GitHub import, follow these steps:

1. Make sure all files are added to git:
   ```
   git add .
   ```

2. Check which files are tracked vs untracked:
   ```
   ./check-git-status.sh
   ```

3. If needed, manually move files to their correct locations:
   ```
   git mv [source] [destination]
   ```

4. Commit and push your changes:
   ```
   git commit -m "Fix directory structure"
   git push origin main
   ```

Note: If Git is not recognizing changes to your directory structure, you might need to:

1. Ensure you don't have any Git configuration issues
2. Try force adding with `git add -f [directory]/*`
3. Check if any `.gitignore` settings are preventing tracking
