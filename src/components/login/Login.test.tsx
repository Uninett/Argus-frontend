/**  * @jest-environment jsdom */

import React from "react";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MockAdapter from "axios-mock-adapter";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import {KnownLoginMethodName, LoginMethod} from "../../api/types.d";

import LoginForm from "./Login";
import api from "../../api";
import auth from "../../auth";
import client from "../../api";


const authTokenSpy = jest.spyOn(auth, 'token');
const authIsAuthenticatedSpy = jest.spyOn(auth, 'isAuthenticated');
const getConfiguredLoginMethodsSpy = jest.spyOn(client, 'getConfiguredLoginMethods');

const apiMock = new MockAdapter(api.api);

const CONFIGURED_LOGIN_METHODS_MOCK: { [key: string]: LoginMethod } = {
  [KnownLoginMethodName.DEFAULT]: {
    type: "userpass",
    url: "mock_link_to_userpass",
    name: KnownLoginMethodName.DEFAULT,
  },
  [KnownLoginMethodName.FEIDE]: {
    type: "feide",
    url: "mock_link_to_feide",
    name: KnownLoginMethodName.FEIDE,
  },
};

beforeEach(() => {
  getConfiguredLoginMethodsSpy
      .mockResolvedValue(Object.values(CONFIGURED_LOGIN_METHODS_MOCK) as LoginMethod[]);
})

afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
})

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
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("renders the Login button", () => {
    render(<LoginForm />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders the Link to Feide login when Feide login method is configured", async () => {
    await waitFor(() => {
      render(<LoginForm/>);
    })

    expect(screen.getByRole("link")).toBeInTheDocument();
  });

  it("renders only default login container when the only configured method is userpass", async () => {
    getConfiguredLoginMethodsSpy.mockResolvedValueOnce([
      CONFIGURED_LOGIN_METHODS_MOCK[KnownLoginMethodName.DEFAULT],
    ] as LoginMethod[]);

    await waitFor(() => {
      render(<LoginForm />);
    });

    const defaultLoginContainer = screen.getByTestId("default-login-container");
    expect(defaultLoginContainer).toBeInTheDocument();

    const alternativeLoginText = screen.queryByText("OR");
    const alternativeLoginButtons = screen.queryAllByRole("link");

    expect(alternativeLoginText).toBeNull();
    expect(alternativeLoginButtons.length).toBe(0);
  });
});

describe("Functionality of Components", () => {
  it("updates username input field when user is typing", async () => {
    render(<LoginForm />);

    await userEvent.type(screen.getByRole("textbox"), "user1");

    expect(screen.getByDisplayValue("user1")).toBeInTheDocument();
  });

  it("updates password input field when user is typing", async () => {
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText(/password/i), "password1");

    expect(screen.getByDisplayValue("password1")).toBeInTheDocument();
  });

  it("will redirect to Feide login when link is clicked", async () => {
    await waitFor(() => {
      render(<LoginForm/>);
    })

    expect(screen.getByRole("link")).toHaveAttribute("href",
      CONFIGURED_LOGIN_METHODS_MOCK[KnownLoginMethodName.FEIDE].url);
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

  it("does not display wrong credentials helper text when authentication is valid, but user is not found", async () => {
    apiMock
      .onPost("/api/v1/token-auth/")
      .reply(200, {token: "token"})
      .onGet("/api/v2/auth/user/")
      .reply(400);

    render(<LoginForm/>);

    userEvent.click(screen.getByRole("button"));

    const helperText = screen.queryByText(/wrong username or password/i);
    expect(helperText).toBeNull();
  });

  it("redirects the user when login is successful", async () => {
    authTokenSpy.mockImplementation(() => "token");
    authIsAuthenticatedSpy.mockImplementation(() => true);
    // Create mock for history
    const history = createMemoryHistory();
    history.push("/login");

    apiMock
      .onPost("/api/v1/token-auth/")
      .reply(200, { token: "token" })
      .onGet("/api/v2/auth/user/")
      // eslint-disable-next-line @typescript-eslint/camelcase
      .reply(200, { username: "test", first_name: "test", last_name: "test", email: "test" });

    render(
      <Router history={history}>
        <LoginForm />
      </Router>,
    );

    await userEvent.click(screen.getByRole("button"));

    // Waiting for all promises to resolve
    await new Promise(process.nextTick);

    expect(history.length).toBe(3);
    expect(history.location.pathname).toBe("/");
  });
});
