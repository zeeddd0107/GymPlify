/* eslint-disable no-undef */
// __mocks__/firebase/auth.js

export const getAuth = jest.fn(() => ({
  currentUser: null,
}));

export const signInWithEmailAndPassword = jest.fn();
export const signInWithCustomToken = jest.fn();
