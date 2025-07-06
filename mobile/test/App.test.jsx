import React from "react";
import { render } from "@testing-library/react-native";
import Page from "../app/(tabs)/index";

describe("App Main Page", () => {
  it("renders Hello World and subtitle", () => {
    const { getByText } = render(<Page />);
    expect(getByText("Hello World")).toBeTruthy();
    expect(getByText("This is the first page of your app.")).toBeTruthy();
  });
});
