import React from 'react';
import { render } from '@testing-library/react-native';
import App from './App';

test('renders welcome message', () => {
  const { getByText } = render(<App />);
  expect(getByText('Welcome to React Native')).toBeTruthy();
});
