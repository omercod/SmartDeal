import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import Signup from '../../app/(auth)/sign-up';

// Wrap the Signup component in NavigationContainer
const renderWithNavigation = (component) => {
  return render(
    <NavigationContainer>
      {component}
    </NavigationContainer>
  );
};

describe('Signup Component', () => {
  // Unit Test
  // This test checks if all input fields and buttons in the Signup component render correctly.
  test('renders the Signup component', () => {
    const { getByText, getByPlaceholderText } = renderWithNavigation(<Signup />);

    // Verify all fields and buttons are displayed
    expect(getByPlaceholderText('שם מלא')).toBeTruthy();
    expect(getByPlaceholderText('אימייל')).toBeTruthy();
    expect(getByPlaceholderText('סיסמה')).toBeTruthy();
    expect(getByPlaceholderText('אימות סיסמה')).toBeTruthy();
    expect(getByText('הרשמה')).toBeTruthy();
  });

  // Integration Test
  // This test verifies that validation messages are shown for empty fields when the user attempts to submit the form.
  test('shows validation error for empty fields', async () => {
    const { getByText } = renderWithNavigation(<Signup />);

    const submitButton = getByText('הרשמה');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText('שם מלא הוא שדה חובה')).toBeTruthy();
      expect(getByText('האימייל הוא שדה חובה')).toBeTruthy();
      expect(getByText('הסיסמה היא שדה חובה')).toBeTruthy();
    });
  });

  // Integration Test
  // This test ensures that an error message is displayed when the entered passwords do not match.
  test('displays error for mismatched passwords', async () => {
    const { getByText, getByPlaceholderText } = renderWithNavigation(<Signup />);

    const passwordInput = getByPlaceholderText('סיסמה');
    const passwordConfirmInput = getByPlaceholderText('אימות סיסמה');
    const submitButton = getByText('הרשמה');

    fireEvent.changeText(passwordInput, 'Password123!');
    fireEvent.changeText(passwordConfirmInput, 'Password123');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText('הסיסמאות אינן תואמות')).toBeTruthy();
    });
  });
});
