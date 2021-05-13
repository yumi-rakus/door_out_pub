import React, { useState, useEffect } from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Grid,
  makeStyles
} from "@material-ui/core";

import { useHistory } from "react-router-dom";

type Props = {
  isOpen: boolean;
  setIsOpen: Function;
  coordinateList: Array<Coordinate>;
  postId: string;
  fromAddress: string;
  toAddress: string;
  resetTime: Function;
};

type Coordinate = {
  lat: number;
  lng: number;
};

const PostConfirmDialog: React.FC<Props> = props => {
  const classes = useStyles();
  const history = useHistory();

  const [canPost, setCanPost] = useState<boolean | null>(null);

  useEffect(() => {
    if (
      props.postId &&
      props.coordinateList.length > 0 &&
      props.fromAddress &&
      props.toAddress
    ) {
      setCanPost(true);
    } else {
      setCanPost(false);
    }
  }, [
    props.coordinateList.length,
    props.fromAddress,
    props.postId,
    props.toAddress
  ]);

  const handleClose = () => {
    props.resetTime();
    props.setIsOpen(false);
  };

  const handleClick = () => {
    props.setIsOpen(false);
    history.push({
      pathname: "/road/post",
      state: {
        coordinateList: props.coordinateList,
        postId: props.postId,
        fromAddress: props.fromAddress,
        toAddress: props.toAddress
      }
    });
  };

  return (
    <>
      <Dialog open={props.isOpen} fullWidth={true} maxWidth={"md"}>
        <DialogContent className={classes.content}>
          <DialogContentText>投稿しますか？</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Grid
            container
            justify={"center"}
            alignItems={"center"}
            className={classes.buttonArea}
          >
            <Grid item xs={6}>
              <Button onClick={handleClose} className={classes.button}>
                やめる
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                color={"primary"}
                variant={"contained"}
                disableElevation
                disabled={!canPost}
                onClick={handleClick}
                className={classes.button}
              >
                投稿する
              </Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Dialog>
    </>
  );
};

const useStyles = makeStyles(() => ({
  content: {
    margin: "3vh auto",
    textAlign: "center"
  },
  buttonArea: {
    textAlign: "center"
  },
  button: {
    padding: "3% 6%"
  }
}));

export default PostConfirmDialog;
