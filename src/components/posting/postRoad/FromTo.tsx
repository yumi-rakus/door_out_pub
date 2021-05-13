import React, { ChangeEvent, useEffect } from "react";
import { Grid, TextField, makeStyles } from "@material-ui/core";

type Props = {
  fromAddress: string;
  toAddress: string;
  setFromAddress: Function;
  setToAddress: Function;
  isValidateFromLocation: boolean | null;
  isValidateToLocation: boolean | null;
  setIsValidateFromLocation: Function;
  setIsValidateToLocation: Function;
};

const FromTo: React.FC<Props> = props => {
  const classes = useStyles();

  useEffect(() => {
    if (props.fromAddress !== "") {
      props.setIsValidateFromLocation(true);
    } else {
      props.setIsValidateFromLocation(false);
    }

    if (props.toAddress !== "") {
      props.setIsValidateToLocation(true);
    } else {
      props.setIsValidateToLocation(false);
    }
    // eslint-disable-next-line
  }, []);

  const handleChangeFrom = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    props.setFromAddress(value);

    if (value.length === 0) {
      props.setIsValidateFromLocation(false);
    } else {
      props.setIsValidateFromLocation(true);
    }
  };

  const handleChangeTo = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    props.setToAddress(value);

    if (value.length === 0) {
      props.setIsValidateToLocation(false);
    } else {
      props.setIsValidateToLocation(true);
    }
  };

  return (
    <div>
      <Grid
        container
        direction={"column"}
        alignItems={"stretch"}
        justify={"flex-start"}
      >
        <Grid item className={classes.textField}>
          <TextField
            label={"From"}
            variant={"outlined"}
            size={"small"}
            defaultValue={props.fromAddress}
            fullWidth
            onChange={handleChangeFrom}
            helperText={
              props.isValidateFromLocation === null ||
              props.isValidateFromLocation
                ? " "
                : "スタート地点を入力してください"
            }
            error={
              props.isValidateFromLocation !== null &&
              !props.isValidateFromLocation
            }
          />
        </Grid>
        <Grid item className={classes.textField}>
          <TextField
            label={"To"}
            variant={"outlined"}
            size={"small"}
            defaultValue={props.toAddress}
            fullWidth
            onChange={handleChangeTo}
            helperText={
              props.isValidateToLocation === null || props.isValidateToLocation
                ? " "
                : "ゴール地点を入力してください"
            }
            error={
              props.isValidateToLocation !== null && !props.isValidateToLocation
            }
          />
        </Grid>
      </Grid>
    </div>
  );
};

const useStyles = makeStyles(() => ({
  textField: {
    margin: "2px"
  }
}));

export default FromTo;