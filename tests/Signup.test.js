// tests/Signup.test.js

import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import Signup from "../app/(auth)/sign-up";
import { Alert } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getDocs, setDoc, doc, collection } from "firebase/firestore";

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: jest.fn(), // לא נבדק כרגע
  }),
}));

jest.mock("../app/(auth)/firebase", () => ({
  auth: {},
  db: {},
}));

jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  doc: jest.fn(),
  collection: jest.fn(),
}));

jest.spyOn(Alert, "alert");

jest.useFakeTimers();

describe("Signup Screen Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("מציג שגיאה אם שדות ריקים", async () => {
    const { getByText } = render(<Signup />);
    await act(async () => {
      fireEvent.press(getByText("הרשמה"));
    });

    await waitFor(() => {
      expect(getByText("שם מלא הוא שדה חובה")).toBeTruthy();
      expect(getByText("האימייל הוא שדה חובה")).toBeTruthy();
      expect(getByText("הסיסמה היא שדה חובה")).toBeTruthy();
    });
  });

  it("מציג שגיאה אם אימייל לא תקין", async () => {
    const { getByPlaceholderText, getByText } = render(<Signup />);
    fireEvent.changeText(getByPlaceholderText("אימייל"), "invalidemail");
    await act(async () => {
      fireEvent.press(getByText("הרשמה"));
    });

    await waitFor(() => {
      expect(getByText("אנא הזן כתובת אימייל תקינה")).toBeTruthy();
    });
  });

  it("מציג שגיאה אם הסיסמה לא עומדת בדרישות", async () => {
    const { getByPlaceholderText, getByText } = render(<Signup />);
    fireEvent.changeText(getByPlaceholderText("שם מלא"), "Test User");
    fireEvent.changeText(getByPlaceholderText("אימייל"), "test@example.com");
    fireEvent.changeText(getByPlaceholderText("סיסמה"), "abc");
    await act(async () => {
      fireEvent.press(getByText("הרשמה"));
    });

    await waitFor(() => {
      expect(
        getByText(
          "הסיסמה חייבת להכיל לפחות אות גדולה אחת, לפחות סימן מיוחד אחד, ואורך מינימלי של 8 תווים."
        )
      ).toBeTruthy();
    });
  });

  it("מציג שגיאה אם הסיסמאות לא תואמות", async () => {
    const { getByPlaceholderText, getByText } = render(<Signup />);
    fireEvent.changeText(getByPlaceholderText("שם מלא"), "Test User");
    fireEvent.changeText(getByPlaceholderText("אימייל"), "test@example.com");
    fireEvent.changeText(getByPlaceholderText("סיסמה"), "Password1!");
    fireEvent.changeText(getByPlaceholderText("אימות סיסמה"), "Password2!");
    await act(async () => {
      fireEvent.press(getByText("הרשמה"));
    });

    await waitFor(() => {
      expect(getByText("הסיסמאות אינן תואמות")).toBeTruthy();
    });
  });

  it("מציג שגיאה אם המייל כבר קיים במערכת", async () => {
    getDocs.mockResolvedValueOnce({
      forEach: (callback) => {
        callback({ data: () => ({ email: "test@example.com" }) });
      },
    });

    const { getByPlaceholderText, getByText } = render(<Signup />);
    fireEvent.changeText(getByPlaceholderText("שם מלא"), "Test User");
    fireEvent.changeText(getByPlaceholderText("אימייל"), "test@example.com");
    fireEvent.changeText(getByPlaceholderText("סיסמה"), "Password1!");
    fireEvent.changeText(getByPlaceholderText("אימות סיסמה"), "Password1!");

    await act(async () => {
      fireEvent.press(getByText("הרשמה"));
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "שגיאה",
        "האימייל כבר נמצא במערכת"
      );
    });
  });

  it("רישום משתמש חדש מצליח ומציג אנימציה", async () => {
    getDocs.mockResolvedValueOnce({
      forEach: () => {}, // מיילים לא קיימים
    });

    createUserWithEmailAndPassword.mockResolvedValueOnce({
      user: { uid: "newUserId", email: "newuser@example.com" },
    });

    setDoc.mockResolvedValueOnce();

    const { getByPlaceholderText, getByText } = render(<Signup />);

    fireEvent.changeText(getByPlaceholderText("שם מלא"), "New User");
    fireEvent.changeText(getByPlaceholderText("אימייל"), "newuser@example.com");
    fireEvent.changeText(getByPlaceholderText("סיסמה"), "ValidPass1!");
    fireEvent.changeText(getByPlaceholderText("אימות סיסמה"), "ValidPass1!");

    await act(async () => {
      fireEvent.press(getByText("הרשמה"));
      jest.runAllTimers(); // להריץ טיימרים אם יש
    });

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        "newuser@example.com",
        "ValidPass1!"
      );
    });

    const successMessage = await waitFor(() => getByText("נרשמת בהצלחה!"));
    expect(successMessage).toBeTruthy();
  });
});
