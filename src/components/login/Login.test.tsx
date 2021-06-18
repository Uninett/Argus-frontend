/**  * @jest-environment jsdom-sixteen  */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MockAdapter from "axios-mock-adapter";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";

import LoginForm from "./Login";
import api from "../../api";

const apiMock = new MockAdapter(api.api);
const flushPromises = () => new Promise(setImmediate);

describe("Render LoginForm", () => {
  it("renders the Logo", () => {
    render(<LoginForm />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("renders the Username input field", () => {
    render(<LoginForm />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders the Password input field", () => {
    render(<LoginForm />);

    // Checking label text since password field doesn't have a role
    const password = screen.getAllByText(/password/i);
    expect(password[0]).toBeInTheDocument();
    expect(password[1]).toBeInTheDocument();
  });

  it("renders the Login button", () => {
    render(<LoginForm />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders the Link to Feide", () => {
    render(<LoginForm />);
    expect(screen.getByRole("link")).toBeInTheDocument();
  });
});

describe("Functionality of LoginForm", () => {
  it("displays error message when wrong username or password is provided", async () => {
    apiMock.onPost("/api/v1/token-auth/").reply(400);

    render(<LoginForm />);

    await userEvent.click(screen.getByRole("button"));
    const message = await screen.findByText(/wrong username or password/i);
    expect(message).toBeInTheDocument();
  });

  it("displays error message when authentication is valid, but user is not found", async () => {
    apiMock.onPost("/api/v1/token-auth/").reply(200, { token: "token" }).onGet("/api/v1/auth/user/").reply(404);

    render(<LoginForm />);

    await userEvent.click(screen.getByRole("button"));
    const message = await screen.findByText(/wrong username or password/i);
    expect(message).toBeInTheDocument();
  });

  it("redirects the user when login is successful", async () => {
    // Create mock for history
    const history = createMemoryHistory();
    history.push("/login");

    apiMock
      .onPost("/api/v1/token-auth/")
      .reply(200, { token: "token" })
      .onGet("/api/v1/auth/user/")
      // eslint-disable-next-line @typescript-eslint/camelcase
      .reply(200, { username: "test", first_name: "test", last_name: "test", email: "test" });

    render(
      <Router history={history}>
        <LoginForm />
      </Router>,
    );

    await userEvent.click(screen.getByRole("button"));

    // Waiting for all promises to resolve
    await flushPromises();

    expect(history.length).toBe(3);
    expect(history.location.pathname).toBe("/");
  });
});
