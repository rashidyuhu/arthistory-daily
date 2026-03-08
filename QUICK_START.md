# 🚀 Quick Start Guide - ArtHistory Daily

**Follow these steps in order. Don't skip any!**

---

## STEP 1: Install Node.js (5 minutes)

1. Go to: **https://nodejs.org/**
2. Click the **big green "Download" button**
3. Install it (just click Next, Next, Next)
4. **Restart your computer**

**Test it worked:**
- Open Terminal (Mac) or Command Prompt (Windows)
- Type: `node --version`
- Press Enter
- You should see a number like `v20.x.x`

✅ **If you see a number, you're done with Step 1!**

---

## STEP 2: Install App Dependencies (2 minutes)

1. Open Terminal/Command Prompt
2. Type this (copy and paste):
   ```bash
   cd /Users/rashidakrim/Documents/_PP/Yuhu/YuhuDaily/arthistory
   ```
3. Press Enter
4. Type this:
   ```bash
   npm install
   ```
5. Press Enter
6. **Wait 2-5 minutes** (it's downloading stuff)

✅ **When you see "added X packages", you're done!**

---

## STEP 3: Get Artwork Data (3 minutes)

1. Still in Terminal, type:
   ```bash
   npm run process-data
   ```
2. Press Enter
3. **Wait 1-2 minutes** (it's downloading from National Gallery)

✅ **When you see "Success! Processed X artworks", you're done!**

**Check:** Look in your project folder for `data/artworks.json` - it should exist now.

---

## STEP 4: Upload to Your Website (5 minutes)

1. **Find the file:** `data/artworks.json` in your project folder
2. **Upload it** to: `https://yuhu.no/dailyarthistory/artworks.json`
   - Use your website's file manager (FTP, cPanel, etc.)
   - Make sure the file is named exactly `artworks.json`
3. **Test it:** Open `https://yuhu.no/dailyarthistory/artworks.json` in a web browser
   - You should see text that starts with `[{`

✅ **If you see JSON text in your browser, you're done!**

---

## STEP 5: Test the App (2 minutes)

1. In Terminal, type:
   ```bash
   npm start
   ```
2. Press Enter
3. **You'll see a QR code**
4. **On your iPhone:**
   - Install "Expo Go" app (free from App Store)
   - Open Expo Go
   - Tap "Scan QR Code"
   - Point camera at the QR code
   - App will load!

✅ **If the app opens and shows an artwork, you're done!**

---

## 🎉 That's It!

Your app is now working! Every day it will show a different artwork from the National Gallery of Art.

---

## ❌ If Something Goes Wrong

### "Command not found: node"
→ **Fix:** Install Node.js (Step 1) and restart computer

### "Cannot find module"
→ **Fix:** Run `npm install` again (Step 2)

### "Failed to fetch artworks" in app
→ **Fix:** 
1. Check that `artworks.json` is uploaded to your website
2. Open the URL in browser to test
3. Make sure URL in `src/services/useArtworks.ts` is correct

### QR code won't scan
→ **Fix:** Make sure phone and computer are on same WiFi

---

## 📚 More Help

- **Full guide:** See `SETUP_GUIDE.md`
- **App Store:** See `APP_STORE_CHECKLIST.md`
- **Privacy:** See `PRIVACY_POLICY.md`

---

## ✅ Final Checklist

Before you're done, make sure:
- [ ] Node.js installed (`node --version` works)
- [ ] Dependencies installed (`npm install` completed)
- [ ] `artworks.json` exists in `data/` folder
- [ ] `artworks.json` uploaded to your website
- [ ] Can open JSON URL in browser and see data
- [ ] App runs and shows artwork (`npm start` works)

**All checked? You're ready to go! 🎨**
