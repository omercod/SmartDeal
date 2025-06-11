import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { TouchableOpacity } from "react-native";

import SupportMessagesScreen from "../app/(main)/SupportMessagesScreen";

// חובה: mock לניוויגציה (אחרת קריסה שקטה)
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
  }),
}));

// חובה: mock ל-safe area (אחרת קריסה שקטה)
jest.mock("react-native-safe-area-context", () => {
  const actual = jest.requireActual("react-native-safe-area-context");
  return {
    ...actual,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    SafeAreaProvider: ({ children }) => <>{children}</>,
  };
});

// חובה: mock ל־firebase (מבנה נכון)
const mockGetDocs = jest.fn();
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  getDocs: (...args) => mockGetDocs(...args),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
}));
jest.mock("../app/(auth)/firebase", () => ({
  db: {},
}));

beforeEach(() => {
  mockGetDocs.mockReset();
});

describe("SupportMessagesScreen - בדיקות חכמות", () => {
  it('מציג כותרת "הודעות תמיכה"', async () => {
    mockGetDocs.mockResolvedValueOnce({ docs: [] });
    const { findByText } = render(<SupportMessagesScreen />);
    expect(await findByText("הודעות תמיכה")).toBeTruthy();
  });

  it("מציג Spinner בזמן טעינה", () => {
    mockGetDocs.mockReturnValueOnce(new Promise(() => {}));
    const { getByTestId } = render(<SupportMessagesScreen />);
    expect(getByTestId("loading-spinner")).toBeTruthy();
  });

  // it("מראה הודעה ריקה אם אין הודעות", async () => {
  //   mockGetDocs.mockResolvedValueOnce({ docs: [] });
  //   const { getByText } = render(<SupportMessagesScreen />);
  //   await waitFor(() => {
  //     expect(getByText("לא נמצאו הודעות")).toBeTruthy();
  //   });
  // });

  // it('מציג הודעה אמיתית + תגית "חדש" אם נשלחה לאחרונה', async () => {
  //   const mockDoc = {
  //     id: "1",
  //     data: () => ({
  //       subject: "בדיקת מערכת",
  //       email: "test@example.com",
  //       message: "היי, זו הודעת תמיכה!",
  //       createdAt: { toDate: () => new Date() },
  //     }),
  //   };
  //   mockGetDocs.mockResolvedValueOnce({ docs: [mockDoc] });
  //   const { getByText } = render(<SupportMessagesScreen />);
  //   await waitFor(() => {
  //     expect(getByText("בדיקת מערכת")).toBeTruthy();
  //     expect(getByText("מאת: test@example.com")).toBeTruthy();
  //     expect(getByText("היי, זו הודעת תמיכה!")).toBeTruthy();
  //     expect(getByText("חדש")).toBeTruthy();
  //   });
  // });

  it('מציג את הכותרת "הודעות תמיכה" גם במסך טעינה', () => {
    mockGetDocs.mockReturnValueOnce(new Promise(() => {})); // משאיר את הלואדינג דולק
    const { getByText } = render(<SupportMessagesScreen />);
    expect(getByText("הודעות תמיכה")).toBeTruthy();
  });

  it("מציג Spinner (אינדיקטור טעינה) בזמן טעינה", () => {
    mockGetDocs.mockReturnValueOnce(new Promise(() => {}));
    const { getByTestId } = render(<SupportMessagesScreen />);
    expect(getByTestId("loading-spinner")).toBeTruthy();
  });
  it("בודק שהקומפוננטה נטענת ומציגה את View הראשי", () => {
    mockGetDocs.mockReturnValueOnce(new Promise(() => {})); // שוב, השהייה
    const { getByTestId } = render(<SupportMessagesScreen />);
    expect(getByTestId("main-view")).toBeTruthy();
  });

  it("בודק שיש TouchableOpacity לחזור אחורה", () => {
    mockGetDocs.mockReturnValueOnce(new Promise(() => {}));
    const { UNSAFE_getAllByType } = render(<SupportMessagesScreen />);
    expect(UNSAFE_getAllByType(TouchableOpacity).length).toBeGreaterThan(0);
  });
});
