Write-Host "🛠 Starting directory structure fix..." -ForegroundColor Cyan

# Create directories if they don't exist
New-Item -Path "Frontend\src" -ItemType Directory -Force | Out-Null
New-Item -Path "backend" -ItemType Directory -Force | Out-Null

# Check if we have categorization data
if (-Not (Test-Path "file-categories.json")) {
  Write-Host "❌ file-categories.json not found! Please run identify-files.js first." -ForegroundColor Red
  exit 1
}

# Read the JSON file
$categoriesJson = Get-Content -Path "file-categories.json" -Raw | ConvertFrom-Json

# Function to move files
function Move-ProjectFiles {
  param (
    [string]$category,
    [string]$targetDir
  )
  
  $files = $categoriesJson.$category
  
  foreach ($file in $files) {
    # Skip files that don't exist
    if (-Not (Test-Path $file)) {
      Write-Host "Skipping non-existent file: $file" -ForegroundColor Yellow
      continue
    }
    
    # Determine target path
    $filename = Split-Path $file -Leaf
    
    if ($file -match "\/src\/|\\src\\") {
      $subdir = $file -replace "^.*?(\/|\\)src(\/|\\)(.*?)\/[^\/\\]*$", "$3"
      $targetPath = Join-Path -Path $targetDir -ChildPath "src\$subdir"
      New-Item -Path $targetPath -ItemType Directory -Force | Out-Null
      $target = Join-Path -Path $targetPath -ChildPath $filename
    }
    else {
      $target = Join-Path -Path $targetDir -ChildPath $filename
    }
    
    # Create parent directory if it doesn't exist
    New-Item -Path (Split-Path $target -Parent) -ItemType Directory -Force | Out-Null
    
    # Move file
    Write-Host "Moving $file → $target" -ForegroundColor Green
    
    try {
      # Try git move first
      $gitOutput = git mv $file $target 2>&1
      if ($LASTEXITCODE -ne 0) {
        # If git move fails, use regular move
        Move-Item -Path $file -Destination $target -Force
      }
    }
    catch {
      Write-Host "Error moving file: $_" -ForegroundColor Red
    }
  }
}

Write-Host "📦 Moving Frontend files..." -ForegroundColor Cyan
Move-ProjectFiles -category "Frontend" -targetDir "Frontend"

Write-Host "📦 Moving backend files..." -ForegroundColor Cyan
Move-ProjectFiles -category "backend" -targetDir "backend"

Write-Host "⚠️ Files marked as both frontend and backend need manual review." -ForegroundColor Yellow
Write-Host "   See the 'both' category in file-categories.json" -ForegroundColor Yellow

Write-Host "✅ Done! Please review changes with 'git status' before committing." -ForegroundColor Green
