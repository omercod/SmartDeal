export const initializeApp = jest.fn(() => ({}));
export const getAuth = jest.fn(() => ({
  currentUser: null,
}));
export const initializeAuth = jest.fn();
export const getReactNativePersistence = jest.fn();
export const getFirestore = jest.fn(() => ({}));

export default {
  initializeApp,
};
