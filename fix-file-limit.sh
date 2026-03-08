#!/bin/bash
# Fix for "too many open files" error on macOS

# Increase file limit for current session
ulimit -n 4096

# For permanent fix, add to ~/.zshrc or ~/.bash_profile:
# ulimit -n 4096

echo "File limit increased to 4096"
echo "To make permanent, add 'ulimit -n 4096' to your ~/.zshrc file"
