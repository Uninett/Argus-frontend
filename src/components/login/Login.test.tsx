import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MockAdapter from "axios-mock-adapter";

import LoginForm from "./Login";
import api from "../../api";

const mock = new MockAdapter(api.api);

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

describe("Unsuccessful login", () => {
  it("renders Logo", async () => {
    mock.onPost("/api/v1/token-auth/").reply(400);

    render(<LoginForm />);

    await userEvent.click(screen.getByRole("button"));

    const message = await screen.findByText(/Wrong username or password/);

    screen.debug();
  });
});
