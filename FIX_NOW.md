# Fix "Too Many Open Files" - Do This Now

## Quick Fix (Try This First)

I've created a `metro.config.js` file that should help. Try starting the app again:

```bash
npm start
```

## If That Doesn't Work - Permanent Fix

You need to run this command in Terminal. It will ask for your Mac password:

### Step 1: Create the system file
Copy and paste this ENTIRE block into Terminal:

```bash
sudo tee /Library/LaunchDaemons/limit.maxfiles.plist > /dev/null << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>limit.maxfiles</string>
    <key>ProgramArguments</key>
    <array>
      <string>launchctl</string>
      <string>limit</string>
      <string>maxfiles</string>
      <string>65536</string>
      <string>200000</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>ServiceIPC</key>
    <false/>
  </dict>
</plist>
EOF
```

Press Enter, then type your Mac password when asked.

### Step 2: Load the configuration
```bash
sudo launchctl load -w /Library/LaunchDaemons/limit.maxfiles.plist
```

Press Enter, type password again.

### Step 3: Restart your computer
This is required for the change to take effect.

### Step 4: Verify it worked
After restart, run:
```bash
launchctl limit maxfiles
```

You should see: `maxfiles    65536           200000`

### Step 5: Start Expo
```bash
npm start
```

It should work now!

## Alternative: Use Watchman (If Above Doesn't Work)

Install Watchman which handles file watching better:

```bash
brew install watchman
```

Then try `npm start` again.
