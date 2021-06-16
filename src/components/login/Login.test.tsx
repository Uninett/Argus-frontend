import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LoginForm from "./Login";

describe("Render login page", () => {
  it("renders Logo", () => {
    render(<LoginForm />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("renders Username input field", () => {
    render(<LoginForm />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  //TODO: Add password field

  it("renders Login button", () => {
    render(<LoginForm />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders Link to Feide", () => {
    render(<LoginForm />);
    expect(screen.getByRole("link")).toBeInTheDocument();
  });
});
