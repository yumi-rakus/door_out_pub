import React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  makeStyles
} from "@material-ui/core";

type Props = {
  isOpened: boolean;
  deleteTarget: string;
  handleCancel: () => void;
  handleDelete: () => void;
};

const DeleteDialog: React.FC<Props> = props => {
  const classes = useStyles();

  return (
    <>
      <Dialog
        open={props.isOpened}
        onClose={props.handleCancel}
        fullWidth={true}
        maxWidth={"md"}
        className={classes.dialog}
      >
        <DialogContent className={classes.content}>
          <Typography>{props.deleteTarget}を削除しますか？</Typography>
        </DialogContent>
        <DialogActions className={classes.buttonArea}>
          <Grid container justify={"center"} alignItems={"center"}>
            <Grid item xs={6}>
              <Button onClick={props.handleCancel} className={classes.button}>
                キャンセル
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant={"contained"}
                color={"secondary"}
                disableElevation
                onClick={props.handleDelete}
                className={classes.button}
              >
                削除する
              </Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Dialog>
    </>
  );
};

const useStyles = makeStyles(() => ({
  dialog: {
    margin: 0,
    padding: 0
  },
  content: {
    margin: "5vh auto",
    textAlign: "center"
  },
  buttonArea: {
    textAlign: "center"
  },
  button: {
    padding: "3% 6%"
  }
}));

export default DeleteDialog;