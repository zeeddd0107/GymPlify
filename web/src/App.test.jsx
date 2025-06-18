import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  test("renders login heading", () => {
    render(<App />);
    expect(screen.getByText(/GymPlify Login/i)).toBeInTheDocument();
  });
});
