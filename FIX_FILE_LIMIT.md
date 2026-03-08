# Fix "Too Many Open Files" Error - Permanent Solution

## The Problem
macOS has a low default file limit (256) that causes Expo to crash with "EMFILE: too many open files" error.

## Quick Fix (Already Applied)
I've updated your `package.json` so `npm start` automatically increases the limit.

## Permanent System Fix

To fix this permanently on your Mac, run these commands:

### Step 1: Create a plist file
```bash
sudo nano /Library/LaunchDaemons/limit.maxfiles.plist
```

### Step 2: Paste this content:
```xml
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
```

### Step 3: Save and exit (Ctrl+X, then Y, then Enter)

### Step 4: Load the configuration
```bash
sudo launchctl load -w /Library/LaunchDaemons/limit.maxfiles.plist
```

### Step 5: Verify it worked
```bash
launchctl limit maxfiles
```

You should see: `maxfiles    65536           200000`

### Step 6: Restart your computer
This ensures the new limit is applied system-wide.

## Alternative: Just Use the Updated Scripts

If you don't want to do the system fix, the updated `package.json` scripts will work fine. Just use:
- `npm start` - automatically sets limit to 10240
- `npm run start:tunnel` - for tunnel mode with increased limit

## Why This Happens
Expo/Metro bundler watches many files for changes. macOS default limit of 256 is too low for modern development tools.
