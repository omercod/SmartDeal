import React from "react";
import { render } from "@testing-library/react-native";
import AdminPage from "../app/(main)/adminpage";

describe("AdminPage", () => {
  it("מציג את כותרת ניהול משתמשים", () => {
    const { getByText } = render(<AdminPage />);
    expect(getByText("ניהול משתמשים")).toBeTruthy();
  });

  it("מציג את הכפתור 'התנתק'", () => {
    const { getByText } = render(<AdminPage />);
    expect(getByText("התנתק")).toBeTruthy();
  });

  it("מציג את הכפתור 'ביקורות'", () => {
    const { getByText } = render(<AdminPage />);
    expect(getByText("הודעות")).toBeTruthy();
  });

  it("מציג את ההודעה כשהעמוד בטעינה", () => {
    const { getByText } = render(<AdminPage />);
    expect(getByText("טוען משתמשים...")).toBeTruthy();
  });
});
