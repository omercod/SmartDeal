import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SignIn from "../app/(auth)/sign-in";
import { Alert } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";

async function checkUserExists(userId) {
  const userDocRef = doc(null, "Users", userId); // null כי getFirestore מוק מוחלף ב-mock
  const userSnap = await getDoc(userDocRef);
  return userSnap.exists();
}

describe("בדיקות Firestore", () => {
  it("בודק קיום משתמש ב־Firestore", async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
    });
    const exists = await checkUserExists("123");
    expect(doc).toHaveBeenCalledWith(null, "Users", "123");
    expect(getDoc).toHaveBeenCalled();
    expect(exists).toBe(true);
  });

  it("בודק מקרה שהמשתמש לא קיים", async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => false,
    });
    const exists = await checkUserExists("999");
    expect(exists).toBe(false);
  });
});

describe("SignIn פונקציונליות ומקרי קצה", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("מציג הודעת שגיאה כשאימייל בפורמט לא חוקי", async () => {
    const { getByPlaceholderText, getByText } = render(<SignIn />);
    fireEvent.changeText(getByPlaceholderText("אימייל"), "notanemail");
    fireEvent.changeText(getByPlaceholderText("סיסמה"), "123456");
    fireEvent.press(getByText("התחבר"));
    await waitFor(() => {
      expect(getByText("אנא הזן כתובת אימייל תקינה")).toBeTruthy();
    });
  });

  it("מציג הודעת שגיאה כשסיסמה ריקה", async () => {
    const { getByPlaceholderText, getByText } = render(<SignIn />);
    fireEvent.changeText(getByPlaceholderText("אימייל"), "test@example.com");
    fireEvent.changeText(getByPlaceholderText("סיסמה"), "");
    fireEvent.press(getByText("התחבר"));
    await waitFor(() => {
      expect(getByText("הסיסמה היא שדה חובה")).toBeTruthy();
    });
  });

  it("מציג התראה כששוכחים להזין אימייל באיפוס סיסמה", async () => {
    const { getByText } = render(<SignIn />);
    fireEvent.press(getByText("שכחתי סיסמה"));
    fireEvent.press(getByText("שלח אימייל לאיפוס סיסמה"));
    expect(Alert.alert).toHaveBeenCalledWith("אנא הזן אימייל לאיפוס סיסמה");
  });

  it("מציג התראה כשמוזן אימייל לא תקין לאיפוס סיסמה", async () => {
    const { getByText, getByPlaceholderText } = render(<SignIn />);
    fireEvent.press(getByText("שכחתי סיסמה"));
    fireEvent.changeText(
      getByPlaceholderText("הזן את האימייל שלך"),
      "invalidemail"
    );
    fireEvent.press(getByText("שלח אימייל לאיפוס סיסמה"));
    expect(Alert.alert).toHaveBeenCalledWith("אנא הזן כתובת אימייל חוקית.");
  });

  it("קורא ל־signInWithEmailAndPassword עם האימייל והסיסמה שהוזנו", async () => {
    const { getByPlaceholderText, getByText } = render(<SignIn />);
    fireEvent.changeText(getByPlaceholderText("אימייל"), "test@example.com");
    fireEvent.changeText(getByPlaceholderText("סיסמה"), "123456");
    fireEvent.press(getByText("התחבר"));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(), // auth instance (מוק)
        "test@example.com",
        "123456"
      );
    });
  });
});
