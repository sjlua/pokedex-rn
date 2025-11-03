# Packaging Flow Guide

This document provides detailed instructions for packaging and distributing the Pokédex React Native application.

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Build Profiles](#build-profiles)
- [Local Building](#local-building)
- [CI/CD Pipeline](#cicd-pipeline)
- [App Store Submission](#app-store-submission)
- [Troubleshooting](#troubleshooting)

## Overview

This project uses Expo Application Services (EAS) for building native binaries for iOS and Android. EAS handles the complex native build process in the cloud, so you don't need to have Xcode or Android Studio installed locally.

## Prerequisites

### Required
1. **Node.js** (v20 or later)
2. **Expo Account** - Sign up at [expo.dev](https://expo.dev)
3. **EAS CLI** - Install globally:
   ```bash
   npm install -g eas-cli
   ```

### For iOS Builds
- Apple Developer account ($99/year)
- App Store Connect access

### For Android Builds
- Google Play Developer account ($25 one-time fee)

## Build Profiles

The project includes three build profiles configured in `eas.json`:

### Development
- **Purpose**: Testing with development client
- **Distribution**: Internal
- **Output**: 
  - iOS: Debug build
  - Android: APK (Debug)
- **Command**: `npm run build:development`

### Preview
- **Purpose**: Internal testing and QA
- **Distribution**: Internal
- **Output**: 
  - iOS: Simulator build
  - Android: APK
- **Command**: `npm run build:preview`

### Production
- **Purpose**: App Store releases
- **Distribution**: Store
- **Output**: 
  - iOS: IPA for App Store
  - Android: AAB (App Bundle) for Play Store
- **Auto-increment**: Enabled
- **Command**: `npm run build:production`

## Local Building

### First-Time Setup

1. **Log in to Expo**:
   ```bash
   eas login
   ```

2. **Configure the project**:
   ```bash
   eas build:configure
   ```
   This will prompt you to select platforms and create/update `eas.json`.

3. **Generate credentials** (if building for production):
   ```bash
   # For iOS
   eas credentials -p ios
   
   # For Android
   eas credentials -p android
   ```

### Building the App

#### Development Build
```bash
# All platforms
npm run build:development

# iOS only
npm run build:development:ios

# Android only
npm run build:development:android
```

#### Preview Build
```bash
# All platforms
npm run build:preview

# iOS only
npm run build:preview:ios

# Android only
npm run build:preview:android
```

#### Production Build
```bash
# All platforms
npm run build:production

# iOS only
npm run build:production:ios

# Android only
npm run build:production:android
```

### Monitoring Builds

After triggering a build:
1. You'll receive a link to monitor the build progress
2. Visit [expo.dev/accounts/[account]/projects/pokedex/builds](https://expo.dev/accounts) to view all builds
3. Download the build artifact once completed

### Installing Development Builds

#### iOS (Simulator)
```bash
# After the build completes, download and install
eas build:run -p ios --latest
```

#### Android
```bash
# Download the APK and install on device/emulator
eas build:run -p android --latest
```

Or download directly from the Expo dashboard and:
- iOS: Drag .app file to simulator
- Android: `adb install app.apk`

## CI/CD Pipeline

### GitHub Actions Workflows

#### Build Workflow
Located at `.github/workflows/build.yml`

**Purpose**: Manually trigger builds from GitHub Actions

**Usage**:
1. Go to Actions tab in GitHub repository
2. Select "Build App" workflow
3. Click "Run workflow"
4. Choose build profile and platform
5. Click "Run workflow"

**Setup**:
1. Generate an Expo access token:
   ```bash
   eas whoami
   # Visit https://expo.dev/accounts/[account]/settings/access-tokens
   ```
2. Add the token to GitHub repository secrets as `EXPO_TOKEN`:
   - Go to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `EXPO_TOKEN`
   - Value: Your Expo access token

#### PR Checks Workflow
Located at `.github/workflows/pr-check.yml`

**Purpose**: Automatically validate code quality on pull requests

**Checks**:
- ESLint validation
- TypeScript type checking

**Triggers**:
- Pull requests to main/master branch
- Pushes to main/master branch

## App Store Submission

### iOS App Store

1. **Build for production**:
   ```bash
   npm run build:production:ios
   ```

2. **Update submission credentials** in `eas.json`:
   ```json
   {
     "submit": {
       "production": {
         "ios": {
           "appleId": "your-apple-id@example.com",
           "ascAppId": "your-app-store-connect-app-id",
           "appleTeamId": "your-apple-team-id"
         }
       }
     }
   }
   ```

3. **Submit to App Store**:
   ```bash
   npm run submit:production:ios
   ```

4. **Complete App Store Connect setup**:
   - Add app screenshots
   - Write app description
   - Set pricing and availability
   - Submit for review

### Google Play Store

1. **Build for production**:
   ```bash
   npm run build:production:android
   ```

2. **Create a Google Play Service Account**:
   - Go to Google Play Console
   - Setup → API access
   - Create service account
   - Download JSON key file

3. **Update submission credentials** in `eas.json`:
   ```json
   {
     "submit": {
       "production": {
         "android": {
           "serviceAccountKeyPath": "./google-play-service-account.json",
           "track": "internal"
         }
       }
     }
   }
   ```

4. **Submit to Play Store**:
   ```bash
   npm run submit:production:android
   ```

5. **Promote the release**:
   - Go to Google Play Console
   - Promote from internal → alpha → beta → production

### Version Management

- **App version**: Configured in `app.json` under `expo.version`
- **Build number**: Auto-incremented by EAS for production builds
- **Manual version bump**: Update `expo.version` in `app.json` before building

```json
{
  "expo": {
    "version": "1.0.0"
  }
}
```

## Troubleshooting

### Build Failures

**Problem**: Build fails with credential errors
**Solution**: 
```bash
# Clear and regenerate credentials
eas credentials -p ios --clear
eas credentials -p ios
```

**Problem**: Build fails due to dependency issues
**Solution**:
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
```

### iOS Specific Issues

**Problem**: Provisioning profile errors
**Solution**: Let EAS manage credentials automatically, or manually create profiles in Apple Developer portal

**Problem**: Simulator build won't install
**Solution**: Ensure you're using a compatible simulator version (iOS 13+)

### Android Specific Issues

**Problem**: APK won't install on device
**Solution**: Enable "Install from Unknown Sources" in device settings

**Problem**: AAB upload fails to Play Store
**Solution**: Ensure the service account has proper permissions in Play Console

### CI/CD Issues

**Problem**: GitHub Actions build fails with authentication error
**Solution**: 
1. Verify `EXPO_TOKEN` secret is set correctly
2. Generate a new token if expired
3. Ensure the token has build permissions

**Problem**: Build takes too long or times out
**Solution**: Use `--no-wait` flag to trigger build without waiting for completion

## Best Practices

1. **Version Control**:
   - Don't commit sensitive files (service account keys, certificates)
   - Keep `eas.json` in version control (without sensitive data)
   - Use environment variables for secrets

2. **Testing**:
   - Use preview builds for QA testing
   - Test on real devices before production release
   - Use TestFlight (iOS) and internal testing (Android) tracks

3. **Release Process**:
   - Always test preview builds thoroughly
   - Update version number before production builds
   - Keep changelog updated
   - Tag releases in git

4. **Security**:
   - Rotate access tokens regularly
   - Use separate Expo accounts for different environments
   - Enable two-factor authentication on all accounts

## Additional Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy Center](https://play.google.com/about/developer-content-policy/)
- [Expo Forums](https://forums.expo.dev/)
