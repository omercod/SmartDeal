import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import SignIn from '../../app/(auth)/sign-in';

// Mock NativeModules
jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  return {
    ...rn,
    NativeModules: {
      ...rn.NativeModules,
      DeviceInfo: {
        getConstants: jest.fn(() => ({})),
      },
    },
  };
});

// Utility to wrap the component with NavigationContainer
const renderWithNavigation = (component) => {
  return render(
    <NavigationContainer>
      {component}
    </NavigationContainer>
  );
};

describe('SignIn Component', () => {
  /**
   * Test Type: Rendering Test
   * Description: This test ensures that the SignIn component is rendered with
   * all the required elements, including email and password fields, and the
   * relevant buttons.
   */
  test('renders the SignIn component', () => {
    const { getByText, getByPlaceholderText } = renderWithNavigation(<SignIn />);

    expect(getByPlaceholderText('אימייל')).toBeTruthy();
    expect(getByPlaceholderText('סיסמה')).toBeTruthy();
    expect(getByText('התחבר')).toBeTruthy();
    expect(getByText('שכחתי סיסמה')).toBeTruthy();
    expect(getByText('התחבר דרך Google')).toBeTruthy();
    expect(getByText('אין לך חשבון?')).toBeTruthy();
  });

  /**
   * Test Type: Interaction Test
   * Description: This test checks if the email input field is updated when text is entered.
   */
  test('updates email input field', () => {
    const { getByPlaceholderText } = renderWithNavigation(<SignIn />);

    const emailInput = getByPlaceholderText('אימייל');
    fireEvent.changeText(emailInput, 'test@example.com');

    expect(emailInput.props.value).toBe('test@example.com');
  });

  /**
   * Test Type: Button Interaction Test
   * Description: This test verifies that the login button can be pressed without errors.
   */
  test('allows pressing the login button', () => {
    const { getByText } = renderWithNavigation(<SignIn />);

    const loginButton = getByText('התחבר');
    fireEvent.press(loginButton);

    // Expectation for now is to confirm no errors; additional logic can be added if needed
    expect(loginButton).toBeTruthy();
  });
});
