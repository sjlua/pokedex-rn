# Quick Start Guide - Packaging

This is a quick reference for building and deploying the Pokédex app. For detailed instructions, see [PACKAGING.md](./PACKAGING.md).

## Setup (One-time)

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login

# Configure project (if not already done)
eas build:configure
```

## Build Commands

### Development Build
```bash
npm run build:development           # Both platforms
npm run build:development:ios       # iOS only
npm run build:development:android   # Android only
```

### Preview Build (for testing)
```bash
npm run build:preview               # Both platforms
npm run build:preview:ios           # iOS only
npm run build:preview:android       # Android only
```

### Production Build (for app stores)
```bash
npm run build:production            # Both platforms
npm run build:production:ios        # iOS only
npm run build:production:android    # Android only
```

## Version Management

```bash
npm run version:patch    # 1.0.0 -> 1.0.1
npm run version:minor    # 1.0.0 -> 1.1.0
npm run version:major    # 1.0.0 -> 2.0.0
```

## Submit to Stores

```bash
npm run submit:production           # Both stores
npm run submit:production:ios       # App Store only
npm run submit:production:android   # Play Store only
```

## CI/CD (GitHub Actions)

### Setup
1. Generate Expo token: https://expo.dev/accounts/[account]/settings/access-tokens
2. Add to GitHub repository secrets as `EXPO_TOKEN`

### Manual Build Trigger
1. Go to Actions tab in GitHub
2. Select "Build App" workflow
3. Click "Run workflow"
4. Choose profile and platform
5. Click "Run workflow" button

## Troubleshooting

**Build fails with credentials error?**
```bash
eas credentials -p ios --clear
eas credentials -p ios
```

**Need to check build status?**
```bash
eas build:list
```

**Need to download a build?**
```bash
eas build:run -p ios --latest
eas build:run -p android --latest
```

## Resources

- Full documentation: [PACKAGING.md](./PACKAGING.md)
- EAS Build docs: https://docs.expo.dev/build/introduction/
- EAS Submit docs: https://docs.expo.dev/submit/introduction/
