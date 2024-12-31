module.exports = {
  preset: "react-native",
  transform: {
    "^.+\\.(js|jsx|ts|tsx|mjs)$": "babel-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|@react-native-community|expo|@expo|@react-navigation|@firebase|react-native-vector-icons|react-native-gesture-handler|react-native-dropdown-picker|react-native-keyboard-aware-scroll-view|react-native-iphone-x-helper)/)",
  ],
  moduleNameMapper: {
    "react-native-iphone-x-helper":
      "<rootDir>/__mocks__/react-native-iphone-x-helper.js",
    "^.+\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/__mocks__/fileMock.js",
    "^@/(.*)$": "<rootDir>/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest-setup.js"],
};
