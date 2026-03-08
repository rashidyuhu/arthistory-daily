# 🎨 ArtHistory Daily - Simple Setup Guide

**Don't worry if you're not technical!** This guide will walk you through everything step by step.

---

## 📋 What You Need First

Before starting, make sure you have:
- ✅ A computer (Mac, Windows, or Linux)
- ✅ Internet connection
- ✅ About 30 minutes of time

---

## 🚀 STEP 1: Install Node.js (One-Time Setup)

**What is Node.js?** It's a tool that lets you run JavaScript programs on your computer.

1. Go to: https://nodejs.org/
2. Click the big green button that says "Download Node.js (LTS)"
3. Install it (just click "Next" on everything)
4. **Restart your computer** after installing

**How to check if it worked:**
- Open Terminal (Mac) or Command Prompt (Windows)
- Type: `node --version`
- Press Enter
- You should see a version number like `v20.x.x`

---

## 📦 STEP 2: Install App Dependencies

**What this does:** Downloads all the code libraries your app needs.

1. Open Terminal (Mac) or Command Prompt (Windows)
2. Navigate to your project folder:
   ```bash
   cd /Users/rashidakrim/Documents/_PP/Yuhu/YuhuDaily/arthistory
   ```
3. Install everything:
   ```bash
   npm install
   ```
4. Wait for it to finish (might take 2-5 minutes)

**You'll know it worked when:** You see "added X packages" at the end.

---

## 📥 STEP 3: Get Artwork Data from National Gallery

**What this does:** Downloads artwork information from the National Gallery of Art and converts it to the format your app needs.

### Option A: Automatic (Recommended)

1. Make sure you're in the project folder (same as Step 2)
2. Run the processing script:
   ```bash
   node scripts/process-nga-data.js
   ```
3. Wait for it to finish (might take 1-2 minutes)
4. You should see: "✅ Success! Processed X artworks"
5. A file will be created at: `data/artworks.json`

### Option B: Manual (If automatic doesn't work)

1. Go to: https://github.com/NationalGalleryOfArt/opendata
2. Click on the `data` folder
3. Download `objects.csv`
4. Save it in your project folder as `data/objects.csv`
5. Then run: `node scripts/process-nga-data.js`

---

## 🌐 STEP 4: Upload JSON to Your Website

**What this does:** Makes the artwork data available online so your app can download it.

You mentioned your endpoint is: `https://yuhu.no/dailyarthistory/artworks.json`

1. **Find the file:** Look for `data/artworks.json` in your project folder
2. **Upload it:** Use your website's file manager (FTP, cPanel, or whatever you use)
3. **Upload to:** `https://yuhu.no/dailyarthistory/artworks.json`
4. **Test it:** Open that URL in a web browser - you should see JSON text

**Don't have a website yet?** You can:
- Use GitHub Pages (free)
- Use Netlify (free)
- Use any web hosting service

---

## ✅ STEP 5: Verify Your Endpoint is Set

**What this does:** Makes sure your app knows where to get the data.

1. Open the file: `src/services/useArtworks.ts`
2. Check line 5 - it should say:
   ```typescript
   const ARTWORKS_ENDPOINT = 'https://yuhu.no/dailyarthistory/artworks.json';
   ```
3. If it's different, change it to match your website URL

---

## 🧪 STEP 6: Test the App

**What this does:** Runs your app so you can see if everything works.

1. Make sure you're in the project folder
2. Run:
   ```bash
   npm start
   ```
3. You'll see a QR code in the terminal
4. **On your iPhone:**
   - Install "Expo Go" app from App Store (free)
   - Open Expo Go
   - Scan the QR code
   - Your app will load!

**Problems?**
- If QR code won't scan: Make sure phone and computer are on same WiFi
- If app won't load: Check that your `artworks.json` file is accessible online
- If you see errors: Check the terminal for error messages

---

## 📱 STEP 7: Prepare for App Store (Later)

**When you're ready to publish:**

### Legal Requirements (Already Done ✅)
- ✅ Attribution to National Gallery of Art (already in your app)
- ✅ CC0 License (free to use commercially)
- ✅ No user data collection (your app is read-only)

### What You Need to Do:

1. **Create App Icons:**
   - Create `assets/icon.png` (1024x1024 pixels)
   - Create `assets/splash.png` (splash screen image)

2. **Build for iOS:**
   ```bash
   npx eas-cli build --platform ios
   ```
   (You'll need an Expo account - free at expo.dev)

3. **Submit to App Store:**
   - Use Apple's App Store Connect
   - Fill out app description
   - Upload your build
   - Wait for review (usually 1-3 days)

---

## 🆘 Troubleshooting

### "Command not found: node"
- **Problem:** Node.js isn't installed or not in your PATH
- **Fix:** Reinstall Node.js and restart your computer

### "Cannot find module"
- **Problem:** Dependencies aren't installed
- **Fix:** Run `npm install` again

### "Failed to fetch artworks"
- **Problem:** Your JSON file isn't accessible online
- **Fix:** 
  1. Check that `artworks.json` is uploaded to your website
  2. Open the URL in a browser to test
  3. Make sure the URL in `useArtworks.ts` matches exactly

### "No artworks available"
- **Problem:** JSON file is empty or malformed
- **Fix:** 
  1. Check `data/artworks.json` exists and has content
  2. Re-run the processing script
  3. Check the JSON is valid (use jsonlint.com)

---

## 📞 Need Help?

If you get stuck:
1. Check the error message in Terminal
2. Make sure you followed each step
3. Try running commands again
4. Check that all files are in the right places

---

## ✅ Checklist

Before testing, make sure:
- [ ] Node.js is installed (`node --version` works)
- [ ] Dependencies are installed (`npm install` completed)
- [ ] `artworks.json` file exists in `data/` folder
- [ ] `artworks.json` is uploaded to your website
- [ ] URL in `useArtworks.ts` matches your website
- [ ] You can open the JSON URL in a browser and see data

---

## 🎉 You're Done!

Once everything is set up:
- Your app will show one artwork per day
- All users see the same artwork globally
- Artworks come from National Gallery of Art (legal and free!)
- Ready for App Store submission

**Good luck!** 🚀
