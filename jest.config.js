module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!(expo|expo-asset|expo-font|expo-constants|expo-splash-screen|expo-status-bar|expo-linear-gradient|expo-haptics|expo-random|expo-linking|expo-image-picker|expo-web-browser|expo-blur|expo-system-ui|expo-updates|expo-auth-session|expo-crypto|expo-firebase-app|expo-router|expo-modules-core|firebase|@firebase|react-native|@react-native|@react-navigation|@react-native-community|react-native-svg|@expo|@unimodules)/)",
  ],
  moduleFileExtensions: ["js", "jsx", "json", "ts", "tsx", "mjs"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx|mjs)$": "babel-jest",
  },

  setupFilesAfterEnv: [
    "@testing-library/jest-native/extend-expect",
    "<rootDir>/jest.setup.js",
  ],
};
