/**  * @jest-environment jsdom-sixteen  */

import React from "react";
import api from "../../api";
import MockAdapter from "axios-mock-adapter";
import LoginView from "./LoginView";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mocks of critical functions and modules
const apiMock = new MockAdapter(api.api);

afterEach(() => {
  apiMock.reset();
  jest.clearAllMocks();
  jest.resetAllMocks();
});

describe("Login Page: error handling", () => {
  it("should display wrong credentials helper text when user provides wrong credentials", async () => {
    apiMock.onPost("/api/v1/token-auth/").reply(400);

    render(<LoginView />);

    await userEvent.click(screen.getByRole("button"));
    const helperText = await screen.findByText(/wrong username or password/i);

    expect(helperText).toBeInTheDocument();
  });

  it("should not display wrong credentials helper text when network connection fails", async () => {
    apiMock.onAny().networkError();

    render(<LoginView />);

    await userEvent.click(screen.getByRole("button"));

    const helperText = screen.queryByText(/wrong username or password/i);
    expect(helperText).toBeNull();
  });

  it("should not display wrong credentials helper text when request to fetch user fails", async () => {
    apiMock.onGet("/api/v1/auth/user/").reply(404);

    render(<LoginView />);

    await userEvent.click(screen.getByRole("button"));

    const helperText = screen.queryByText(/wrong username or password/i);
    expect(helperText).toBeNull();
  });
});
