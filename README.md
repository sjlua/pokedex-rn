# Pokédex
This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app), with React Native. I made this app to learn how React Native and Expo work.

All Pokémon names and references used belong to Nintendo and The Pokémon Company Inc. I do not claim ownership over any IP related to Pokémon.

## Credits
This app was based on [Code with Beto](https://youtu.be/BUXnASp_WyQ)'s tutorial.

## Get started
The following are the (mostly) standard instructions for an Expo project.
1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Building and Packaging

This project uses [EAS (Expo Application Services)](https://docs.expo.dev/build/introduction/) for building native binaries.

### Prerequisites
- Install EAS CLI globally: `npm install -g eas-cli`
- Log in to your Expo account: `eas login`

### Build Profiles

Three build profiles are available:

1. **Development** - For testing with development builds
   ```bash
   npm run build:development
   ```

2. **Preview** - For internal testing and QA
   ```bash
   npm run build:preview
   ```

3. **Production** - For app store releases
   ```bash
   npm run build:production
   ```

You can also build for specific platforms:
- iOS only: `npm run build:preview:ios`
- Android only: `npm run build:preview:android`

### Submitting to App Stores

To submit a production build to the app stores:
```bash
npm run submit:production
```

Before submitting, update the credentials in `eas.json` under the `submit.production` section.

### CI/CD

GitHub Actions workflows are configured for automated builds:
- **Build Workflow** - Manually triggered from the Actions tab to build the app
- **PR Checks** - Automatically runs linting and type checking on pull requests

To use the Build workflow, add your Expo access token as a repository secret named `EXPO_TOKEN`.

### Version Management

The app version is configured in `app.json`. When building for production, EAS will automatically increment the build number.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.