require("@testing-library/jest-native");

// Mock for AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  mergeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
}));

// Mock for Firebase Auth
jest.mock("firebase/auth", () => ({
  initializeAuth: jest.fn(() => ({})),
  getReactNativePersistence: jest.fn(() => ({})),
  getAuth: jest.fn(() => ({
    currentUser: { uid: "123", email: "test@example.com" },
  })),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: {} })),
  sendPasswordResetEmail: jest.fn(),
  signOut: jest.fn(() => Promise.resolve()),
}));

// Mock for Firestore
jest.mock("firebase/firestore", () => {
  return {
    collection: jest.fn(() => "collection-mock"),
    getDocs: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    addDoc: jest.fn(),
    doc: jest.fn(),
    deleteDoc: jest.fn(),
    getFirestore: jest.fn(),
  };
});

// Mock for expo-router
jest.mock("expo-router", () => ({
  Link: ({ children }) => children,
}));

// Mock for react-navigation
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useFocusEffect: (callback) => {
    callback();
  },
}));

// Mock for Alert
jest.mock("react-native/Libraries/Alert/Alert", () => ({
  alert: jest.fn(),
}));

// Mock for vector icons
jest.mock("react-native-vector-icons/MaterialCommunityIcons", () => "Icon");

// Mock for expo-font
jest.mock("expo-font", () => ({
  loadAsync: jest.fn().mockResolvedValue(),
  isLoaded: jest.fn().mockReturnValue(true),
}));

// Set up fake timers
jest.useFakeTimers();
