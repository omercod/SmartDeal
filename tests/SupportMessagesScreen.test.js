import React from "react";
import { render } from "@testing-library/react-native";
import SupportMessagesScreen from "../app/(main)/SupportMessagesScreen";

// mocks בסיסיים ל־firebase
const mockGetDocs = jest.fn(() => Promise.resolve({ docs: [] }));

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  getDocs: (...args) => mockGetDocs(...args),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
}));

jest.mock("../app/(auth)/firebase", () => ({
  db: {},
}));

describe("SupportMessagesScreen - בדיקות בסיסיות", () => {
  it("מציג את הכותרת 'הודעות תמיכה'", () => {
    const { getByText } = render(<SupportMessagesScreen />);
    expect(getByText("הודעות תמיכה")).toBeTruthy();
  });

  it("מרנדר מסך הודעות בלי קריסה", () => {
    render(<SupportMessagesScreen />);
  });

  it("מציג Spinner (אינדיקטור טעינה) בזמן טעינה", () => {
    const { getByTestId } = render(<SupportMessagesScreen />);
    expect(getByTestId("loading-spinner")).toBeTruthy();
  });

  it("הרכיב נטען ומוצג על המסך", () => {
    const { toJSON } = render(<SupportMessagesScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it("בודק שיש View עיקרי במסך", () => {
    const { UNSAFE_getByType } = render(<SupportMessagesScreen />);
    expect(UNSAFE_getByType(require("react-native").View)).toBeTruthy();
  });
});
