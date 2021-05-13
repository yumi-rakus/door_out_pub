import React from "react";

import { makeStyles } from "@material-ui/core";
import PlayCircleFilledIcon from "@material-ui/icons/PlayCircleFilled";
import PauseCircleFilledIcon from "@material-ui/icons/PauseCircleFilled";

type Props = {
  isRecoding: boolean;
};

const RecordButton: React.FC<Props> = props => {
  const classes = buttonStyle();
  return (
    <>
      {props.isRecoding ? (
        <PauseCircleFilledIcon
          className={classes.recordButton}
          color={"error"}
        />
      ) : (
        <PlayCircleFilledIcon
          className={classes.recordButton}
          color={"primary"}
        />
      )}
    </>
  );
};

const buttonStyle = makeStyles(() => ({
  recordButton: {
    fontSize: 80
  },
  buttonText: {
    position: "absolute"
  }
}));

export default RecordButton;