import React, { useState } from "react";

// MUI
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";

// Date io
import DateFnsUtils from "@date-io/date-fns";

// Api
import type { AcknowledgementBody } from "../../api/types.d";

// Components
import SignOffAction, { SignOffActionPropsType } from "./SignOffAction";

type CreateAckPropsType = {
  onSubmitAck: (ack: AcknowledgementBody) => void;
  signOffActionProps?: Partial<SignOffActionPropsType>;
  isBulk: boolean;
};

const CreateAck: React.FC<CreateAckPropsType> = ({ onSubmitAck, signOffActionProps = {}, isBulk }: CreateAckPropsType) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleSubmit = (msg: string) => {
    const timestamp = new Date().toISOString()
    onSubmitAck({
      event: {
        description: msg,
       timestamp,
      },
      expiration: selectedDate && selectedDate.toISOString(),
      timestamp,
      description: msg,
    });
    setSelectedDate(null);
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  const signOffActionDefaultProps = {
    dialogTitle: "Submit acknowledment",
    dialogContentText: "Write a message describing why this incident was acknowledged",
    dialogSubmitText: "Submit",
    dialogCancelText: "Cancel",
    dialogButtonText: "Create acknowledegment",
    dialogInputLabel: "Acknowledgment message",
    isDialogInputRequired:false,
    dialogInputType: "text",
    title: "Submit acknowledment",
    question: "Are you sure you want to acknowledge this incident?",
    onSubmit: handleSubmit,
  }

  const signOffActionPluralProps = {
    dialogContentText: "Write a message describing why the incidents were acknowledged",
    question: "Are you sure you want to acknowledge these incidents?",
  }

  return (
    <SignOffAction
      {...signOffActionDefaultProps}
      {...(isBulk && signOffActionPluralProps)}
      {...signOffActionProps}
    >
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          disableToolbar
          format="MM/dd/yyyy"
          margin="normal"
          id="expiry-date"
          label="Expiry date"
          value={selectedDate}
          onChange={handleDateChange}
          KeyboardButtonProps={{
            "aria-label": "change date",
          }}
        />
      </MuiPickersUtilsProvider>
    </SignOffAction>
  );
};

export default CreateAck;
