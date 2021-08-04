import { render, screen } from "@testing-library/react";
import { DropdownMenu } from "./DropdownMenu";
import { MenuItem } from "@material-ui/core";
import userEvent from "@testing-library/user-event";
import React from "react";

describe("DropdownMenu tests", () => {
  const values = [1, 2, 3];
  const text = ["Apple", "Orange", "Banana"];

  const onChangeMock = jest.fn();

  beforeEach(() => {
    render(
      <DropdownMenu selected={1} onChange={onChangeMock}>
        {values.map((value: number, index: number) => (
          <MenuItem key={value} value={value}>
            {text[index]}
          </MenuItem>
        ))}
      </DropdownMenu>,
    );
  });

  it("renders the DropdownMenu with the correct selected item", () => {
    // Renders dropdown menu with the correct selected item
    const dropdownMenu = screen.getByRole("button", { name: /apple/i });
    expect(dropdownMenu).toBeInTheDocument();
  });

  it("shows a list of all the items when the menu is clicked", () => {
    const dropdownMenu = screen.getByRole("button");
    userEvent.click(dropdownMenu);

    const option1 = screen.getByRole("option", { name: /apple/i });
    expect(option1).toBeInTheDocument();
    expect(option1).toHaveAttribute("aria-selected", "true");

    const option2 = screen.getByRole("option", { name: /orange/i });
    expect(option2).toBeInTheDocument();
    expect(option2).not.toHaveAttribute("aria-selected", "true");

    const option3 = screen.getByRole("option", { name: /banana/i });
    expect(option3).toBeInTheDocument();
    expect(option3).not.toHaveAttribute("aria-selected", "true");
  });

  it("calls onChange() with the correct value when an item is clicked", () => {
    const dropdownMenu = screen.getByRole("button");
    userEvent.click(dropdownMenu);

    const option3 = screen.getByRole("option", { name: /banana/i });
    userEvent.click(option3);

    expect(onChangeMock).toHaveBeenCalledTimes(1);
    expect(onChangeMock).toHaveBeenCalledWith(3);
  });
});
