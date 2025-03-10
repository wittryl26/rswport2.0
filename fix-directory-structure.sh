#!/bin/bash

echo "🛠 Starting directory structure fix..."

# Create directories if they don't exist
mkdir -p Frontend/src
mkdir -p backend

# Check if we have categorization data
if [ ! -f "file-categories.json" ]; then
  echo "❌ file-categories.json not found! Please run identify-files.js first."
  exit 1
fi

# Function to move files using git
move_files() {
  category=$1
  target_dir=$2
  
  # Use jq to extract the array for the category if available, or use grep/cut as fallback
  if command -v jq &> /dev/null; then
    files=$(jq -r ".$category[]" file-categories.json)
  else
    # Start/end pattern to extract the array from the JSON
    start_pattern="\"$category\": ["
    end_pattern="],"
    # Extract array content using grep and sed (simplified approach)
    files=$(grep -A 100 "$start_pattern" file-categories.json | grep -B 100 "$end_pattern" | grep "\"" | sed 's/[",]//g' | sed 's/^[ \t]*//')
  fi
  
  # Handle each file
  echo "$files" | while read -r file; do
    # Skip empty lines
    [ -z "$file" ] && continue
    
    # Skip files that don't exist
    [ ! -f "$file" ] && echo "Skipping non-existent file: $file" && continue
    
    # Determine target path
    filename=$(basename "$file")
    if [[ "$file" == *"/src/"* ]]; then
      subdir=$(echo "$file" | grep -o "/src/.*" | sed 's/\/[^\/]*$//')
      mkdir -p "$target_dir$subdir"
      target="$target_dir$subdir/$filename"
    else
      target="$target_dir/$filename"
    }
    
    # Create parent directory if it doesn't exist
    mkdir -p "$(dirname "$target")"
    
    # Move file
    echo "Moving $file → $target"
    git mv "$file" "$target" 2>/dev/null || mv "$file" "$target"
  done
}

echo "📦 Moving Frontend files..."
move_files "Frontend" "Frontend"

echo "📦 Moving backend files..."
move_files "backend" "backend"

echo "⚠️ Files marked as both frontend and backend need manual review."
echo "   See the 'both' category in file-categories.json"

echo "✅ Done! Please review changes with 'git status' before committing."
