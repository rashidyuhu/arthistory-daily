#!/usr/bin/env bash
# Install Node.js via nvm so you can run npm in this project.
# Run from the project root:  bash scripts/setup-node.sh

set -e

NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
NVM_VERSION="v0.40.1"
NVM_INSTALL_URL="https://raw.githubusercontent.com/nvm-sh/nvm/${NVM_VERSION}/install.sh"

# Already have node?
if command -v node &>/dev/null; then
  echo "Node.js is already installed: $(node --version)"
  echo "npm: $(npm --version)"
  exit 0
fi

# Ensure .zshrc exists so nvm installer can append to it (you may not have one yet)
if [ -n "$HOME" ] && [ ! -f "$HOME/.zshrc" ]; then
  touch "$HOME/.zshrc"
  echo "Created ~/.zshrc"
fi

# Install nvm if missing
if [ ! -f "$NVM_DIR/nvm.sh" ]; then
  echo "Installing nvm (Node Version Manager)..."
  mkdir -p "$NVM_DIR"
  if command -v curl &>/dev/null; then
    curl -o- "$NVM_INSTALL_URL" | bash
  else
    echo "curl is required. Install Node from https://nodejs.org instead."
    exit 1
  fi
fi

# Load nvm in this script
export NVM_DIR
# shellcheck source=/dev/null
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node LTS
if ! command -v node &>/dev/null; then
  echo "Installing Node.js LTS..."
  nvm install --lts
  nvm use --lts
fi

echo ""
echo "Node.js: $(node --version)"
echo "npm:     $(npm --version)"
echo ""
echo "Next steps:"
echo "  1. Load Node in this terminal:  source ~/.nvm/nvm.sh"
echo "     (Or run:  source ~/.zshrc   if you have it)"
echo "  2. In this project run:  npm install && npm start"
echo ""
