jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(() => ({})),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
  })),
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
}));

jest.mock("firebase/analytics", () => ({
  getAnalytics: jest.fn(),
  isSupported: jest.fn(() => Promise.resolve(false)),
}));
jest.mock("expo-router", () => ({
  Link: jest.fn().mockImplementation(() => "Link"),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: jest.fn(),
  };
});

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
    }),
  };
});
jest.mock("react-native", () => {
  const rn = jest.requireActual("react-native");
  return {
    ...rn,
    NativeModules: {
      ...rn.NativeModules,
      SettingsManager: {},
    },
  };
});
jest.mock("react-native/Libraries/Settings/Settings", () => ({
  get: jest.fn(),
  set: jest.fn(),
}));
jest.mock("react-native-iphone-x-helper", () => ({
  getStatusBarHeight: jest.fn(() => 20),
}));