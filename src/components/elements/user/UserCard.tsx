import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "~/store";
import { followUser, unfollowUser } from "~/store/slice/Domain/user.slice";
import {
  setFolloweeCountsIncrement,
  setFolloweeCountsDecrement,
  selectLoginUser,
  fetchLoginUser
} from "~/store/slice/App/auth.slice";

import {
  Avatar,
  Button,
  Grid,
  makeStyles,
  Typography
} from "@material-ui/core";

import { useHistory } from "react-router-dom";

import { useErrorHandle } from "~/utils/useErrorHandle";
import { User } from "~/interfaces";

type Props = {
  user: User;
  handleClick: () => void;
};

const UserCard: React.FC<Props> = props => {
  const classes = useStyles();
  const dispatch: AppDispatch = useDispatch();
  const history = useHistory();
  const [catchUnauthorizedError] = useErrorHandle();

  // store/state
  const loginUser = useSelector(selectLoginUser);

  // component/state
  const [isFollowing, setIsFollowing] = useState(props.user.isFollowing);

  useEffect(() => {
    if (!loginUser) {
      dispatch(fetchLoginUser()).catch(e => {
        catchUnauthorizedError(e.message);
      });
    }
  }, [catchUnauthorizedError, dispatch, loginUser]);

  /**
   * ユーザーをフォロー/アンフォローする.
   */
  const handleClickButton = () => {
    if (isFollowing) {
      dispatch(unfollowUser(props.user.userId))
        .then(() => {
          setIsFollowing(!isFollowing);
          dispatch(setFolloweeCountsDecrement());
        })
        .catch(e => {
          catchUnauthorizedError(e.message);
          if (e.message !== "401") history.go(0);
        });
    } else {
      dispatch(followUser(props.user.userId))
        .then(() => {
          setIsFollowing(!isFollowing);
          dispatch(setFolloweeCountsIncrement());
        })
        .catch(e => {
          catchUnauthorizedError(e.message);
          if (e.message !== "401") history.go(0);
        });
    }
  };

  return (
    <Grid
      container
      spacing={1}
      alignItems={"center"}
      className={classes.userCard}
      onClick={props.handleClick}
    >
      <Grid item xs={2}>
        <Grid container justify={"center"} alignItems={"center"}>
          <Avatar variant={"circular"} src={props.user.userImagePath} />
        </Grid>
      </Grid>
      <Grid item xs={6}>
        <Grid container>
          <Typography className={classes.userName}>
            {props.user.name}
          </Typography>
        </Grid>
        <Grid container>
          <Typography className={classes.accountId}>
            @{props.user.accountId}
          </Typography>
        </Grid>
      </Grid>
      <Grid item xs={4}>
        {loginUser && loginUser.userId !== props.user.userId ? (
          <Button
            variant={"contained"}
            color={isFollowing ? "default" : "primary"}
            className={classes.button}
            disableElevation
            onClick={e => {
              e.stopPropagation();
              handleClickButton();
            }}
          >
            {isFollowing ? "フォロー中" : "フォローする"}
          </Button>
        ) : null}
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(() => ({
  userCard: {
    margin: 0,
    width: "100%"
  },
  userName: {
    fontSize: "13px",
    fontWeight: "bold",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
    width: "100%"
  },
  accountId: {
    fontSize: "10px",
    color: "grey"
  },
  button: {
    fontSize: "12px",
    width: "100%",
    margin: "2%",
    padding: "2%"
  }
}));

export default UserCard;