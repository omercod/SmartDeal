import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import ReviewsScreen from "../app/(main)/ReviewsScreen";
import { Alert } from "react-native";

// מוקים
const mockAddDoc = jest.fn(() => Promise.resolve());
const mockDeleteDoc = jest.fn(() => Promise.resolve());

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {
      providerName: "ספק בדיקה",
      providerEmail: "provider@test.com",
      reviewId: "review123",
    },
  }),
}));

jest.mock("../app/(auth)/firebase", () => ({
  auth: {},
  db: {},
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({
    currentUser: { email: "user@test.com" },
  })),
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(() => ({})),
  addDoc: (...args) => mockAddDoc(...args),
  deleteDoc: (...args) => mockDeleteDoc(...args),
  doc: jest.fn(() => ({})),
}));

jest.spyOn(Alert, "alert").mockImplementation(() => {});

describe("ReviewsScreen - בדיקות בסיסיות ו-flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("מציג את הכותרת עם שם הספק", () => {
    const { getByText } = render(<ReviewsScreen />);
    expect(getByText(/השארת ביקורת עבור ספק בדיקה/)).toBeTruthy();
  });

  it("מציג כפתור שלח ביקורת", () => {
    const { getByText } = render(<ReviewsScreen />);
    expect(getByText("שלח ביקורת")).toBeTruthy();
  });

  it("מאפשר להזין טקסט בשדה הביקורת", () => {
    const { getByPlaceholderText } = render(<ReviewsScreen />);
    const input = getByPlaceholderText("כתוב את הביקורת שלך כאן...");
    fireEvent.changeText(input, "בדיקת טקסט חופשי");
    expect(input.props.value).toBe("בדיקת טקסט חופשי");
  });

  it("מאפשר לבחור דירוג כוכבים", () => {
    const { getAllByRole, getByText } = render(<ReviewsScreen />);
    const stars = getAllByRole("button").filter(
      (el) => el.props.testID !== "backButton"
    );
    fireEvent.press(stars[4]);
    expect(getByText("שירות מעולה")).toBeTruthy();
  });

  it("מציג modal תודה לאחר שליחה מוצלחת", async () => {
    const { getByText, getByPlaceholderText } = render(<ReviewsScreen />);
    fireEvent.changeText(
      getByPlaceholderText("כתוב את הביקורת שלך כאן..."),
      "תודה על השירות"
    );
    const button = getByText("שלח ביקורת");
    await act(async () => {
      fireEvent.press(button);
    });
    expect(getByText(/תודה על הביקורת שלך/)).toBeTruthy();
    expect(mockAddDoc).toHaveBeenCalledTimes(1);
    expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
  });

  it("מציג הודעת שגיאה אם אין משתמש מחובר", async () => {
    // משנה את המוק של getAuth שיחזיר שאין currentUser
    require("firebase/auth").getAuth.mockReturnValueOnce({ currentUser: null });
    const { getByText } = render(<ReviewsScreen />);
    const button = getByText("שלח ביקורת");
    await act(async () => {
      fireEvent.press(button);
    });
    expect(Alert.alert).toHaveBeenCalledWith("יש להתחבר כדי לשלוח ביקורת");
  });

  it("שולח דירוג בלי ביקורת (ביקורת לא חובה)", async () => {
    const { getByText } = render(<ReviewsScreen />);
    const button = getByText("שלח ביקורת");
    await act(async () => {
      fireEvent.press(button);
    });
    expect(mockAddDoc).toHaveBeenCalledTimes(1);
    expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
  });
});
