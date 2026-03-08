# Troubleshooting Guide

## Connection Timeout Error

If you see "The request timed out" in Expo Go:

### Solution 1: Use Tunnel Mode (Easiest - Works on Any Network)

1. **Stop the current server** (press `Ctrl+C` in Terminal)
2. **Start with tunnel mode:**
   ```bash
   npm start -- --tunnel
   ```
3. **Wait for new QR code** (might take 30-60 seconds)
4. **Scan the new QR code** with Expo Go

**Note:** Tunnel mode is slower but works even if phone and computer are on different networks.

### Solution 2: Same WiFi Network (Faster)

1. **Make sure:**
   - Your iPhone and computer are on the **same WiFi network**
   - Both are connected (not using mobile data on phone)
2. **Restart Expo:**
   ```bash
   npm start -- --clear
   ```
3. **Scan QR code again**

### Solution 3: Check Firewall

**On Mac:**
1. Go to System Settings → Network → Firewall
2. Make sure Expo/Node is allowed
3. Or temporarily disable firewall to test

**On Windows:**
1. Windows Defender → Firewall settings
2. Allow Node.js through firewall

### Solution 4: Use IP Address Directly

1. **Find your computer's IP address:**
   - Mac: System Settings → Network → WiFi → Details → IP Address
   - Or in Terminal: `ifconfig | grep "inet "`
2. **In Terminal, press `s`** when Expo is running
3. **Select "Enter URL manually"**
4. **Type:** `exp://YOUR_IP_ADDRESS:8081`
   - Replace YOUR_IP_ADDRESS with the IP you found
   - Example: `exp://192.168.1.100:8081`

### Solution 5: Restart Everything

1. **Close Expo Go app** on your phone
2. **Stop Expo server** (`Ctrl+C`)
3. **Restart:**
   ```bash
   npm start -- --clear
   ```
4. **Open Expo Go** and scan QR code again

---

## Other Common Errors

### "Failed to fetch artworks"

**Problem:** App can't download artwork data

**Fix:**
1. Check that `artworks.json` is uploaded to your website
2. Test the URL in a browser: `https://yuhu.no/dailyarthistory/artworks.json`
3. Make sure the URL in `src/services/useArtworks.ts` is correct

### "No artworks available"

**Problem:** JSON file is empty or wrong format

**Fix:**
1. Run the data processing script again:
   ```bash
   npm run process-data
   ```
2. Check `data/artworks.json` exists and has content
3. Re-upload to your website

### App crashes on startup

**Problem:** Code error or missing dependency

**Fix:**
1. Check Terminal for error messages
2. Make sure all dependencies installed:
   ```bash
   npm install
   ```
3. Clear cache and restart:
   ```bash
   npm start -- --clear
   ```

---

## Still Having Issues?

1. **Check Terminal output** - Error messages will tell you what's wrong
2. **Try tunnel mode** - Most reliable connection method
3. **Restart everything** - Computer, phone, WiFi router
4. **Check Expo Go version** - Update from App Store if needed
