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
};

const CreateAck: React.FC<CreateAckPropsType> = ({ onSubmitAck, signOffActionProps = {} }: CreateAckPropsType) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleSubmit = (msg: string) => {
    onSubmitAck({
      event: {
        description: msg,
        timestamp: new Date().toISOString(),
      },
      expiration: selectedDate && selectedDate.toISOString(),
    });
    setSelectedDate(null);
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  return (
    <SignOffAction
      dialogTitle="Submit acknowledment"
      dialogContentText="Write a message describing why this incident was acknowledged "
      dialogSubmitText="Submit"
      dialogCancelText="Cancel"
      dialogButtonText="Create acknowledegment"
      title="Submit acknowledment"
      question="Are you sure you want to acknowledge this incident?"
      onSubmit={handleSubmit}
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
