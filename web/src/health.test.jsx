// web/src/health.test.jsx
import { render, screen } from "@testing-library/react";
import React from "react";

test("Web test placeholder", () => {
  render(<div>GymPlify Web is working</div>);
  expect(screen.getByText(/GymPlify Web is working/i)).toBeInTheDocument();
});
