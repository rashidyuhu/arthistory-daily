# App Store Submission Checklist

## ✅ Legal & Compliance (All Good!)

- [x] **License**: CC0 (Creative Commons Zero) - ✅ Commercial use allowed
- [x] **Attribution**: Included in app (About section) ✅
- [x] **Privacy Policy**: Created (see PRIVACY_POLICY.md) ✅
- [x] **No User Data**: App is read-only, no data collection ✅
- [x] **No Tracking**: No analytics or tracking services ✅

## 📱 App Store Requirements

### Before Submission:

- [ ] **App Icons**: Create `assets/icon.png` (1024x1024px)
- [ ] **Splash Screen**: Create `assets/splash.png`
- [ ] **App Description**: Write description for App Store
- [ ] **Screenshots**: Take screenshots of your app (required)
- [ ] **Privacy Policy URL**: Host PRIVACY_POLICY.md online and add URL
- [ ] **Support URL**: Optional but recommended
- [ ] **Age Rating**: Should be 4+ (no objectionable content)

### App Store Description Template:

```
ArtHistory Daily

Discover a new masterpiece every day from the National Gallery of Art's collection.

FEATURES:
• One artwork per day, same for all users globally
• Beautiful 3D flip card interface
• Detailed artwork information
• Open Access collection - all artworks are public domain

Artworks provided by the National Gallery of Art (USA), Open Access.
Data source: https://github.com/NationalGalleryOfArt/opendata

No login required. No data collection. Just art.
```

### Keywords (for App Store search):

```
art, art history, daily art, museum, gallery, painting, artwork, education, culture, national gallery
```

## 🚀 Building for App Store

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo

```bash
eas login
```

(Create free account at https://expo.dev if needed)

### Step 3: Configure Build

```bash
eas build:configure
```

### Step 4: Build for iOS

```bash
eas build --platform ios
```

This will:
- Create an iOS app file (.ipa)
- Take 10-20 minutes
- Give you a download link when done

### Step 5: Submit to App Store

```bash
eas submit --platform ios
```

Or manually:
1. Download the .ipa file from EAS
2. Use Xcode or Transporter app
3. Upload to App Store Connect
4. Submit for review

## 📋 App Store Connect Checklist

When submitting:

- [ ] App name: "ArtHistory Daily"
- [ ] Category: Education or Entertainment
- [ ] Age rating: 4+
- [ ] Privacy policy URL: [Your hosted privacy policy]
- [ ] Support URL: Optional
- [ ] Description: Use template above
- [ ] Keywords: Use keywords above
- [ ] Screenshots: At least 3 required (iPhone sizes)
- [ ] App icon: 1024x1024px
- [ ] Version number: 1.0.0

## ⚠️ Important Notes

1. **Test First**: Make sure app works perfectly before submitting
2. **Review Guidelines**: Read Apple's App Review Guidelines
3. **Rejection Reasons**: Common reasons for rejection:
   - Broken links
   - Crashes
   - Missing privacy policy
   - Incomplete information

4. **Review Time**: Usually 1-3 days, sometimes longer

## 🎉 After Approval

Once approved:
- Your app will be live on the App Store
- Users can download and install
- You can update it anytime with new versions

## 📞 Need Help?

- Expo Documentation: https://docs.expo.dev
- Apple App Store Connect: https://appstoreconnect.apple.com
- EAS Build Docs: https://docs.expo.dev/build/introduction/
