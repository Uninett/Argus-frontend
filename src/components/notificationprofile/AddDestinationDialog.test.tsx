import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddDestinationDialog from "./AddDestinationDialog";
import {
  KnownProperties,
  Media,
  MediaSchema,
  NewDestination,
  // @ts-ignore
} from "../../api/types.d.ts";
import MockAdapter from "axios-mock-adapter";
import api from "../../api/client";
import auth from "../../auth";

// MOCK API
const apiMock = new MockAdapter(api.api);
const authTokenSpy = jest.spyOn(auth, "token");
const authIsAuthenticatedSpy = jest.spyOn(auth, "isAuthenticated");

const media: Media[] = [
  { slug: "email", name: "Email" },
  { slug: "sms", name: "SMS" },
];

const mediaSchemas: MediaSchema[] = [
  {
    json_schema: {
      $id: "http://localhost:8000/json-schema/email",
      description: "Settings for a DestinationConfig using email.",
      properties: {
        email_address: {
          title: "Email address",
          type: "string",
        },
      },
      required: [KnownProperties.EMAIL],
      title: "Email Settings",
    },
  },
  {
    json_schema: {
      $id: "http://localhost:8000/json-schema/sms",
      description: "Settings for a DestinationConfig using SMS.",
      properties: {
        phone_number: {
          description: "The phone number is validated and the country code needs to be given.",
          title: "Phone number",
          type: "string",
        },
      },
      required: [KnownProperties.PHONE_NUMBER],
      title: "SMS Settings",
    },
  },
];

// For avoiding authentication errors
beforeAll(() => {
  auth.login("token");
});
afterAll(() => {
  auth.logout();
});

describe("AddDestinationDialog tests", () => {
  const onSaveMock = jest.fn();
  const onCancelMock = jest.fn();

  beforeEach(() => {
    authTokenSpy.mockImplementation(() => "token");
    authIsAuthenticatedSpy.mockImplementation(() => true);
    apiMock
      .onPost("/api/v1/token-auth/")
      .reply(200, { token: "token" })
      .onGet("/api/v2/auth/user/")
      // eslint-disable-next-line @typescript-eslint/camelcase
      .reply(200, { username: "test", first_name: "test", last_name: "test", email: "test" })
      .onGet("/api/v2/notificationprofiles/media/email/json_schema/")
      .reply(200, mediaSchemas[0] as MediaSchema)
      .onGet("/api/v2/notificationprofiles/media/sms/json_schema/")
      .reply(200, mediaSchemas[1] as MediaSchema)
      .onPost("/api/v2/notificationprofiles/destinations/")
      .reply(400);
  });

  afterEach(() => {
    apiMock.reset();
    authTokenSpy.mockReset();
    authIsAuthenticatedSpy.mockReset();
    jest.clearAllMocks();
  });

  it("renders the default component correctly when open is true", async () => {
    render(<AddDestinationDialog open={true} onSave={onSaveMock} onCancel={onCancelMock} configuredMedia={media} />);

    const dialog = screen.getByRole("dialog");

    const mediaSelector = screen.getByRole("radiogroup");
    const emailOption = screen.getByRole("radio", { name: /email/i });
    const smsOption = screen.getByRole("radio", { name: /sms/i });

    const titleField = await screen.findByRole("textbox", { name: /title/i });
    const emailAddressField = await screen.findByRole("textbox", { name: /email address/i });

    const createButton = screen.getByRole("button", { name: /create/i });
    const discardButton = screen.getByRole("button", { name: /discard/i });
    const closeButton = screen.getByRole("button", { name: /close/i }); // button to close dialog

    expect(dialog).toBeInTheDocument();
    expect(mediaSelector).toBeInTheDocument();
    expect(emailOption).toBeInTheDocument();
    expect(smsOption).toBeInTheDocument();
    expect(emailOption).toBeChecked();
    expect(smsOption).not.toBeChecked();
    expect(titleField).toBeInTheDocument();
    expect(emailAddressField).toBeInTheDocument();
    expect(createButton).toBeInTheDocument();
    expect(discardButton).toBeInTheDocument();
    expect(createButton).toBeDisabled();
    expect(discardButton).toBeDisabled();
    expect(closeButton).toBeInTheDocument();
  });

  it("does not render the component when open is false", async () => {
    render(<AddDestinationDialog open={false} onSave={onSaveMock} onCancel={onCancelMock} configuredMedia={media} />);

    const dialog = screen.queryByRole("dialog");

    const mediaSelector = screen.queryByRole("radiogroup");
    const emailOption = screen.queryByRole("radio", { name: /email/i });
    const smsOption = screen.queryByRole("radio", { name: /sms/i });

    const titleField = screen.queryByRole("textbox", { name: /title/i });
    const propertyField = screen.queryByRole("textbox", { name: /email address/i });
    const createButton = screen.queryByRole("button", { name: /create/i });
    const discardButton = screen.queryByRole("button", { name: /discard/i });
    const closeButton = screen.queryByRole("button", { name: /close/i }); // button to close dialog

    expect(dialog).toBeNull();
    expect(mediaSelector).toBeNull();
    expect(emailOption).toBeNull();
    expect(smsOption).toBeNull();
    expect(titleField).toBeNull();
    expect(propertyField).toBeNull();
    expect(createButton).toBeNull();
    expect(discardButton).toBeNull();
    expect(closeButton).toBeNull();
  });

  it("renders the sms input fields when sms radio is selected", async () => {
    render(<AddDestinationDialog open={true} onSave={onSaveMock} onCancel={onCancelMock} configuredMedia={media} />);

    const emailOption = screen.getByRole("radio", { name: /email/i });
    const smsOption = screen.getByRole("radio", { name: /sms/i });
    expect(emailOption).toBeChecked();
    expect(smsOption).not.toBeChecked();

    await userEvent.click(smsOption);

    const titleField = await screen.findByRole("textbox", { name: /title/i });
    const phoneNumberField = await screen.findByRole("textbox", { name: /phone number/i });
    const emailAddressField = screen.queryByRole("textbox", { name: /email address/i });

    expect(titleField).toBeInTheDocument();
    expect(phoneNumberField).toBeInTheDocument();
    expect(emailAddressField).toBeNull();
  });

  it("calls onSave() with the right email values, and clears input fields  when save button is clicked", async () => {
    const emailTitle = "test_email";
    const emailAddress = "testemail@email.test";

    const newDestination: NewDestination = {
      label: emailTitle,
      media: media[0].slug,
      settings: {
        [KnownProperties.EMAIL]: emailAddress,
      },
    };

    onSaveMock.mockResolvedValueOnce(newDestination);
    render(<AddDestinationDialog open={true} onSave={onSaveMock} onCancel={onCancelMock} configuredMedia={media} />);

    let titleField = await screen.findByRole("textbox", { name: /title/i });
    let emailAddressField = await screen.findByRole("textbox", { name: /email address/i });
    const createButton = screen.getByRole("button", { name: /create/i });

    await userEvent.type(titleField, emailTitle);
    expect(titleField).toHaveValue(emailTitle);
    await userEvent.type(emailAddressField, emailAddress);
    expect(emailAddressField).toHaveValue(emailAddress);
    await userEvent.click(createButton);

    expect(onSaveMock).toHaveBeenCalledTimes(1);
    expect(onSaveMock).toHaveBeenCalledWith(newDestination);

    // Wait for fields to be updated
    titleField = await screen.findByRole("textbox", { name: /title/i });
    emailAddressField = await screen.findByRole("textbox", { name: /email address/i });
    expect(titleField).toHaveValue("");
    expect(emailAddressField).toHaveValue("");
  });

  it("calls onSave() with the right sms values, and clears input fields when save button is clicked", async () => {
    const smsTitle = "test_sms";
    const phoneNumber = "+4747474747";

    const newDestination: NewDestination = {
      label: smsTitle,
      media: media[1].slug,
      settings: {
        [KnownProperties.PHONE_NUMBER]: phoneNumber,
      },
    };

    onSaveMock.mockResolvedValueOnce(newDestination);
    render(<AddDestinationDialog open={true} onSave={onSaveMock} onCancel={onCancelMock} configuredMedia={media} />);

    const mediaSelector = screen.getByRole("radiogroup");
    const smsOption = screen.getByRole("radio", { name: /sms/i });
    expect(mediaSelector).toBeInTheDocument();
    expect(smsOption).toBeInTheDocument();

    await userEvent.click(smsOption);
    expect(smsOption).toBeChecked();

    let titleField = await screen.findByRole("textbox", { name: /title/i });
    let phoneNumberField = await screen.findByRole("textbox", { name: /phone number/i });
    const createButton = screen.getByRole("button", { name: /create/i });

    await userEvent.type(titleField, smsTitle);
    expect(titleField).toHaveValue(smsTitle);
    await userEvent.type(phoneNumberField, phoneNumber);
    expect(phoneNumberField).toHaveValue(phoneNumber);

    await userEvent.click(createButton);

    expect(onSaveMock).toHaveBeenCalledTimes(1);
    expect(onSaveMock).toHaveBeenCalledWith(newDestination);

    // Wait for fields to be updated
    titleField = await screen.findByRole("textbox", { name: /title/i });
    phoneNumberField = await screen.findByRole("textbox", { name: /phone number/i });
    expect(titleField).toHaveValue("");
    expect(phoneNumberField).toHaveValue("");
  });

  it("calls onCancel() when close button is clicked", () => {
    render(<AddDestinationDialog open={true} onSave={onSaveMock} onCancel={onCancelMock} configuredMedia={media} />);

    const closeButton = screen.getByRole("button", { name: /close/i });

    userEvent.click(closeButton);

    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });

  it("resets email fields when the sms radio is selected", async () => {
    const input = "testreset";
    render(<AddDestinationDialog open={true} onSave={onSaveMock} onCancel={onCancelMock} configuredMedia={media} />);

    const emailOption = screen.getByRole("radio", { name: /email/i });
    const smsOption = screen.getByRole("radio", { name: /sms/i });
    expect(emailOption).toBeChecked();
    expect(smsOption).not.toBeChecked();

    let titleField = await screen.findByRole("textbox", { name: /title/i });
    let emailAddressField = await screen.findByRole("textbox", { name: /email address/i });
    expect(titleField).toHaveValue("");
    expect(emailAddressField).toHaveValue("");

    await userEvent.type(titleField, input);
    expect(titleField).toHaveValue(input);
    await userEvent.type(emailAddressField, input);
    expect(emailAddressField).toHaveValue(input);

    await userEvent.click(smsOption);
    await userEvent.click(emailOption);

    // Wait for fields to be updated
    titleField = await screen.findByRole("textbox", { name: /title/i });
    emailAddressField = await screen.findByRole("textbox", { name: /email address/i });
    expect(titleField).toHaveValue("");
    expect(emailAddressField).toHaveValue("");
  });

  it("resets input fields when discard button is clicked", async () => {
    const input = "testdiscard";
    render(<AddDestinationDialog open={true} onSave={onSaveMock} onCancel={onCancelMock} configuredMedia={media} />);

    let discardButton = screen.getByRole("button", { name: /discard/i });

    let titleField = await screen.findByRole("textbox", { name: /title/i });
    let emailAddressField = await screen.findByRole("textbox", { name: /email address/i });
    expect(titleField).toHaveValue("");
    expect(emailAddressField).toHaveValue("");

    await userEvent.type(titleField, input);
    expect(titleField).toHaveValue(input);
    await userEvent.type(emailAddressField, input);
    expect(emailAddressField).toHaveValue(input);

    // Wait for discard button to get enabled
    discardButton = screen.getByRole("button", { name: /discard/i });
    await waitFor(() => {
      expect(discardButton).toBeEnabled();
    });
    await userEvent.click(discardButton);

    // Wait for confirmation dialog to appear
    const confirmationDialog = await screen.findByRole("dialog", { name: /discard/i, hidden: true });
    expect(confirmationDialog).toBeInTheDocument();
    expect(confirmationDialog).toHaveTextContent(/are you sure you want to discard changes/i);

    await userEvent.click(within(confirmationDialog).getByRole("button", { name: /yes/i }));

    // Wait for fields to get updated
    titleField = screen.getByRole("textbox", { name: /title/i });
    emailAddressField = await screen.findByRole("textbox", { name: /email address/i });
    expect(titleField).toHaveValue("");
    expect(emailAddressField).toHaveValue("");
  });
});
