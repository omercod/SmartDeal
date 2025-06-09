jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  mergeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
}));

jest.mock("firebase/auth", () => ({
  initializeAuth: jest.fn(() => ({})),
  getReactNativePersistence: jest.fn(() => ({})),
  signInWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({ user: { uid: "123", email: "test@example.com" } })
  ),
  sendPasswordResetEmail: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  getDoc: jest.fn().mockResolvedValue({
    exists: () => true,
    data: () => ({ IsAdmin: 0 }),
  }),
  getFirestore: jest.fn(() => ({})),
}));

jest.mock("expo-router", () => ({
  Link: ({ children }) => children,
}));

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock("react-native/Libraries/Alert/Alert", () => ({
  alert: jest.fn(),
}));

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  return {
    MaterialCommunityIcons: (props) =>
      React.createElement("Text", props, "Icon"),
  };
});

jest.mock("expo-font", () => ({
  loadAsync: jest.fn().mockResolvedValue(),
  isLoaded: jest.fn().mockReturnValue(true),
}));
jest.useFakeTimers();
