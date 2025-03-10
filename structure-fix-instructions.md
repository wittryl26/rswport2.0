# Fixing Empty Frontend and Backend Directories

If GitHub imported your repositories with empty `Frontend` and `backend` directories, follow these steps to fix the structure:

## Automated Approach

1. **Run the file identification script** to see which files should go where:
   ```bash
   node identify-files.js
   ```
   This will analyze your files and suggest which ones belong in Frontend vs backend.

2. **Run the fix-directory-structure script** to automatically move files:
   ```bash
   # On Unix/Linux/Mac
   chmod +x ./fix-directory-structure.sh
   ./fix-directory-structure.sh
   
   # On Windows (using Git Bash)
   ./fix-directory-structure.sh
   ```

3. **Verify** the changes look correct before committing:
   ```bash
   git status
   ```

4. **Commit and push** the fixed structure:
   ```bash
   git add .
   git commit -m "Fix Frontend and backend directory structure"
   git push origin main
   ```

## Manual Approach

If the automated scripts don't work perfectly for your case:

1. **Create any missing directories** if needed:
   ```bash
   mkdir -p Frontend/src
   mkdir -p backend/routes
   # etc.
   ```

2. **Move files manually** to correct locations:
   ```bash
   # Move frontend files
   git mv index.html Frontend/
   git mv src/components/* Frontend/src/components/
   
   # Move backend files
   git mv server.js backend/
   git mv routes/* backend/routes/
   ```

3. **Commit and push** your changes:
   ```bash
   git add .
   git commit -m "Fix directory structure"
   git push origin main
   ```

## Common Structure Guidelines

### Frontend Directory Structure
```
Frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── assets/
├── src/
│   ├── components/
│   ├── pages/
│   ├── styles/
│   └── App.js
├── package.json
└── README.md
```

### Backend Directory Structure
```
backend/
├── server.js
├── app.js
├── routes/
├── controllers/
├── models/
├── config/
├── middleware/
├── package.json
└── README.md
```
