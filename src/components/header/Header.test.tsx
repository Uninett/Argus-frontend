import {render, screen, within} from "@testing-library/react";
import React from "react";
import Header from "./Header";
import {MemoryRouter} from "react-router-dom";
import userEvent from "@testing-library/user-event";


describe("Render Header", () => {
  it("renders the Logo, both image and link", () => {
    render(
      <MemoryRouter>
        <Header/>
      </MemoryRouter>
    );
    expect(screen.getByRole('img', {name: /argus logo/i})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /argus logo/i})).toBeInTheDocument();
  });

  it("renders the Incidents button", () => {
    render(
      <MemoryRouter>
        <Header/>
      </MemoryRouter>
    );
    expect(screen.getByRole('button', {name: 'Incidents'})).toBeInTheDocument();
  });

  it("renders the Timeslots button", () => {
    render(
      <MemoryRouter>
        <Header/>
      </MemoryRouter>
    );
    expect(screen.getByRole('button', {name: /timeslots/i})).toBeInTheDocument();
  });

  it("renders the Profiles button", () => {
    render(
      <MemoryRouter>
        <Header/>
      </MemoryRouter>
    );
    expect(screen.getByRole('button', {name: /profiles/i})).toBeInTheDocument();
  });

  it("renders the user menu button", () => {
    render(
      <MemoryRouter>
        <Header/>
      </MemoryRouter>
    );
    expect(screen.getByRole('button', {name: /user menu/i})).toBeInTheDocument();
  });

  it("renders only 2 default user menu items", () => {
    render(
      <MemoryRouter>
        <Header/>
      </MemoryRouter>
    );

    // Open user menu
    userEvent.click(screen.getByRole('button', {name: /user menu/i}));
    const userMenu = screen.getByRole('menu')
    expect(userMenu).toBeInTheDocument()
    expect(userMenu).toBeVisible()

    // Expect 2 menu items to load - links to Destinations and Logout
    const menuItems = within(userMenu).getAllByRole("menuitem")
    expect(menuItems).toHaveLength(2)
    expect(menuItems[0]).toHaveTextContent(/destinations/i)
    expect(menuItems[1]).toHaveTextContent(/logout/i)
  });
});
