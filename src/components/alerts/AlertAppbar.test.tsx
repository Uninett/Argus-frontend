import React from "react";
import { render, screen } from "@testing-library/react";
import AlertAppbar from "./AlertAppbar";

const messageText = "TEST";

const colors = {
  text: "white",
  errorBackground: "rgb(211, 47, 47)",
  warningBackground: "rgb(245, 124, 0)",
  defaultBackground: "rgb(48, 63, 159)",
};

describe("Alert Appbar test suite", () => {
  test("alert message text is rendered correctly", () => {
    render(<AlertAppbar message={messageText} severity={"info"} />);

    const appbar = screen.getByRole("banner");
    expect(appbar).toBeInTheDocument();
    expect(appbar).toHaveTextContent(messageText);
  });

  test("error alert color is rendered correctly", async () => {
    const { findByRole, findByText } = render(<AlertAppbar message={messageText} severity={"error"} />);

    document.head.innerHTML = document.head.innerHTML;

    const banner = await findByRole("banner");
    expect(banner).toBeInTheDocument();

    const typography = await findByText(messageText);
    expect(typography).toBeInTheDocument();

    expect(banner).toHaveStyle(`background-color: ${colors.errorBackground}`);
    expect(typography).toHaveStyle(`color: ${colors.text}`);
  });

  test("warning alert color is rendered correctly", async () => {
    const { findByRole, findByText } = render(<AlertAppbar message={messageText} severity={"warning"} />);

    document.head.innerHTML = document.head.innerHTML;

    const banner = await findByRole("banner");
    expect(banner).toBeInTheDocument();

    const typography = await findByText(messageText);
    expect(typography).toBeInTheDocument();

    expect(banner).toHaveStyle(`background-color: ${colors.warningBackground}`);
    expect(typography).toHaveStyle(`color: ${colors.text}`);
  });

  test("info alert color is rendered correctly", async () => {
    const { findByRole, findByText } = render(<AlertAppbar message={messageText} severity={"info"} />);

    document.head.innerHTML = document.head.innerHTML;

    const banner = await findByRole("banner");
    expect(banner).toBeInTheDocument();

    const typography = await findByText(messageText);
    expect(typography).toBeInTheDocument();

    expect(banner).toHaveStyle(`background-color: ${colors.defaultBackground}`);
    expect(typography).toHaveStyle(`color: ${colors.text}`);
  });
});
