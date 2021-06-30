import React from "react";

import SignOffAction, { SignOffActionPropsType } from "./SignOffAction";

type AddTicketUrlPropsType = {
  onAddTicketUrl: (url: string) => void;
  signOffActionProps?: Partial<SignOffActionPropsType>;
};

const AddTicketUrl: React.FC<AddTicketUrlPropsType> = ({
                                                       onAddTicketUrl,
                                                       signOffActionProps = {},
                                                     }: AddTicketUrlPropsType) => {

  const handleSubmit = (url: string) => {
    onAddTicketUrl(url);
  };

  return (
    <SignOffAction
      dialogTitle="Add ticket URL"
      dialogContentText="Write an URL of an existing ticket"
      dialogSubmitText="Submit"
      dialogCancelText="Cancel"
      dialogButtonText="Add ticket"
      dialogInputLabel="Valid ticket URL"
      isDialogInputRequired={true}
      dialogInputType="url"
      title="Add ticket url"
      question="Are you sure you want to add a ticket url?"
      onSubmit={handleSubmit}
      {...signOffActionProps}
    />
  );
};

export default AddTicketUrl;