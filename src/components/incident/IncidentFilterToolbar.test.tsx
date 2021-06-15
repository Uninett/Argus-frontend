import { render, screen } from "@testing-library/react";
import { IncidentFilterToolbar, ButtonGroupSwitch } from './IncidentFilterToolbar';
import React from "react";
import { Token, User } from "../../api";

// const testUser: User = {
//   username: 'testUser',
//   first_name: 'FTest',
//   last_name: 'LTest',
//   email: 'test@test.test'
// };
//
// const testToken: Token = "testToken";
//
// const authServiceMock = {
//
// }

describe('Incident Toolbar test suite', () => {

  let incidentToolbar: HTMLElement;

  beforeEach(() => {
    incidentToolbar = render(<IncidentFilterToolbar />).container;
  });

  afterEach(() => {
    document.body.removeChild(incidentToolbar);
    incidentToolbar.remove();
    jest.clearAllMocks();
  })

  test('incidents toolbar is rendered', () => {
    const openStateSwitch = screen.getByTestId('incidents-toolbar');
    expect(openStateSwitch).toBeInTheDocument();
  });
});

describe('Open State Switch test suite', () => {

  let incidentToolbar: HTMLElement;

  beforeEach(() => {
    incidentToolbar = render(<IncidentFilterToolbar />).container;
  });

  afterEach(() => {
    document.body.removeChild(incidentToolbar);
    incidentToolbar.remove();
    jest.clearAllMocks();
  })

  test('open state switch is rendered', () => {
    const openStateSwitch = screen.getByTestId('open-state-switch');
    expect(openStateSwitch).toBeInTheDocument();
  });

  test('open state switch is visible', () => {
    const openStateSwitch = screen.getByTestId('open-state-switch');
    expect(openStateSwitch).toBeVisible();
  });
});

test('setup test', () => {

});

