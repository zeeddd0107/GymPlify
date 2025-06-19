/* eslint-disable no-undef */
// App.test.jsx
import React from "react"; // ✅ Required for JSX
import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("./firebase");
jest.mock("firebase/auth");

test("renders login/register heading", () => {
  render(<App />);
  expect(screen.getByRole("heading")).toHaveTextContent(
    /GymPlify (Login|Register)/,
  );
});
