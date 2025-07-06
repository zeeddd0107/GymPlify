import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App.jsx";

describe("App", () => {
  it("renders GymPlify title", () => {
    render(<App />);
    expect(screen.getByText("GymPlify")).toBeInTheDocument();
  });

  it("renders login form", () => {
    render(<App />);
    expect(screen.getByText("Sign In")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your password"),
    ).toBeInTheDocument();
  });
});
