#!/bin/bash

# Set the path to the master-code directory (script's own directory)
MASTER_PATH="$(cd "$(dirname "$0")"; pwd)"
PARENT_PATH="$(dirname "$MASTER_PATH")"

# Find all sibling directories of MASTER_PATH
SIBLING_DIRS=($(find "$PARENT_PATH" -mindepth 1 -maxdepth 1 -type d ! -name "$(basename "$MASTER_PATH")"))

# Iterate over all sibling directories
for sibling in "${SIBLING_DIRS[@]}"; do
  # Prompt the user for confirmation to process the directory
  read -p "Do you want to process directory $sibling? (y/n): " dir_choice
  if [[ "$dir_choice" == "y" || "$dir_choice" == "Y" ]]; then
    
    # Iterate over all files in the master-code directory
    for file in "$MASTER_PATH"/*; do
      # Extract filename from the path
      filename=$(basename "$file")
  
      # Ignore files starting with a dot or .clasp.json
      if [[ "$filename" == .* || "$filename" == ".clasp.json" ]]; then
        continue
      fi
  
      # Check if the file exists in the sibling directory
      if [[ -f "$sibling/$filename" ]]; then
        # Compare the file in master-code with the file in the sibling directory
        if ! cmp -s "$file" "$sibling/$filename"; then
          # Files are different
          echo "File $filename is different in $sibling."
  
          # Prompt the user for displaying the diff
          read -p "Do you want to view the diff? (y/n): " diff_choice
          if [[ "$diff_choice" == "y" || "$diff_choice" == "Y" ]]; then
            # Show the diff
            echo "Showing diff between the files:"
            diff "$file" "$sibling/$filename"
          fi
  
          # Prompt the user for confirmation to copy the file
          read -p "Do you want to copy it? (y/n): " copy_choice
          if [[ "$copy_choice" == "y" || "$copy_choice" == "Y" ]]; then
            cp "$file" "$sibling/$filename"
            echo "File $filename copied to $sibling."
          fi
        else
          # Files are the same
          echo "File $filename is the same in $sibling."
        fi
      else
        # File does not exist in the sibling directory
        echo "File $filename does not exist in $sibling."
        
        # Prompt the user for confirmation to copy the file
        read -p "Do you want to copy it? (y/n): " choice
        if [[ "$choice" == "y" || "$choice" == "Y" ]]; then
          cp "$file" "$sibling/$filename"
          echo "File $filename copied to $sibling."
        fi
      fi
    done
  
  else
    echo "Skipping directory $sibling."
  fi
done
