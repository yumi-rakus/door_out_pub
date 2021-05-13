import React, { useEffect, useState } from "react";

import { useDispatch } from "react-redux";
import { AppDispatch } from "~/store";
import {
  followUser,
  unfollowUser,
  setFollowerCountsIncrement,
  setFollowerCountsDecrement
} from "~/store/slice/Domain/user.slice";

import UserList from "~/components/elements/user/UserList";
import {
  Avatar,
  Button,
  Grid,
  makeStyles,
  Theme,
  Typography
} from "@material-ui/core";

import { useHistory } from "react-router-dom";

import { User } from "~/interfaces";
import { useErrorHandle } from "~/utils/useErrorHandle";

type Props = {
  user: User;
  isLoginUser: boolean;
};

const Profile: React.FC<Props> = props => {
  const classes = useStyles();
  const dispatch: AppDispatch = useDispatch();
  const history = useHistory();
  const [catchUnauthorizedError] = useErrorHandle();

  // component/state
  const [isFollowing, setIsFollowing] = useState(props.user.isFollowing);
  const [isOpenFollowee, setIsOpenFollowee] = useState(false);
  const [isOpenFollower, setIsOpenFollower] = useState(false);

  useEffect(() => {
    setIsFollowing(props.user.isFollowing);
  }, [props.user.isFollowing]);

  /**
   * ユーザーをフォロー/アンフォローする.
   * ログインユーザー以外のユーザーページで使用.
   */
  const handleClickButton = () => {
    if (isFollowing) {
      dispatch(unfollowUser(props.user.userId))
        .then(() => {
          dispatch(setFollowerCountsDecrement());
        })
        .catch(e => {
          catchUnauthorizedError(e.message);
          if (e.message !== "401") history.go(0);
        });
    } else {
      dispatch(followUser(props.user.userId))
        .then(() => {
          dispatch(setFollowerCountsIncrement());
        })
        .catch(e => {
          catchUnauthorizedError(e.message);
          if (e.message !== "401") history.go(0);
        });
    }
    setIsFollowing(!isFollowing);
  };

  return (
    <div>
      <Grid container justify={"center"} alignItems={"center"}>
        <Grid item xs={3}>
          <Grid container justify={"flex-end"} alignItems={"flex-start"}>
            <Grid item className={classes.gridItem}>
              <Grid
                container
                justify={"center"}
                alignItems={"center"}
                direction={"column"}
              >
                {/*ユーザーアイコン*/}
                <Grid item>
                  <Avatar
                    src={props.user.userImagePath}
                    variant={"circular"}
                    className={classes.avatar}
                  />
                </Grid>

                {/*フォロー/アンフォローボタン*/}
                <Grid item className={classes.gridItem}>
                  {props.isLoginUser ? null : (
                    <Button
                      variant={"contained"}
                      color={isFollowing ? "default" : "primary"}
                      className={classes.button}
                      disableElevation
                      onClick={handleClickButton}
                    >
                      {isFollowing ? " フォロー中 " : " フォローする "}
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={9} className={classes.nameAndId}>
          {/*ユーザー名*/}
          <Grid container justify={"flex-start"} alignItems={"center"}>
            <Grid item>
              <Typography className={classes.userName}>
                {props.user.name}
              </Typography>
            </Grid>
          </Grid>

          {/*アカウントID*/}
          <Grid container justify={"flex-start"} alignItems={"center"}>
            <Grid item>
              <Typography className={classes.accountId}>
                @{props.user.accountId}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/*bio*/}
      <Grid container justify={"flex-start"} alignItems={"center"}>
        <Grid item xs={12}>
          <Typography className={classes.bio}>{props.user.bio}</Typography>
        </Grid>
      </Grid>

      <Grid container justify={"flex-start"} alignItems={"center"}>
        {/*フォロイー*/}
        <Grid item xs={6}>
          <Grid container justify={"flex-start"} alignItems={"center"}>
            <Typography
              onClick={() => {
                setIsOpenFollowee(true);
              }}
            >
              <span className={classes.followNum}>
                {props.user.followeeCounts}
              </span>
              <span className={classes.followUnit}>&nbsp;フォロー</span>
            </Typography>
          </Grid>
        </Grid>

        {/*フォロワー*/}
        <Grid item xs={6}>
          <Grid container justify={"flex-start"} alignItems={"center"}>
            <Typography
              onClick={() => {
                setIsOpenFollower(true);
              }}
            >
              <span className={classes.followNum}>
                {props.user.followerCounts}
              </span>
              <span className={classes.followUnit}>&nbsp;フォロワー</span>
            </Typography>
          </Grid>
        </Grid>
      </Grid>

      {/*フォロイーダイアログ*/}
      <UserList
        userType={{ type: 1, userId: props.user.userId }}
        upperLimit={props.user.followeeCounts!}
        handleClose={() => {
          setIsOpenFollowee(false);
        }}
        isOpen={isOpenFollowee}
      />

      {/*フォロワーダイアログ*/}
      <UserList
        userType={{ type: 2, userId: props.user.userId }}
        upperLimit={props.user.followerCounts!}
        handleClose={() => {
          setIsOpenFollower(false);
        }}
        isOpen={isOpenFollower}
      />
    </div>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  avatar: {
    width: theme.spacing(8),
    height: theme.spacing(8)
  },
  nameAndId: {
    paddingLeft: "5%"
  },
  userName: {
    fontWeight: "bold",
    fontSize: "18px",
    textAlign: "left",
    wordBreak: "break-all"
  },
  accountId: {
    color: "grey",
    fontSize: "15px",
    textAlign: "left"
  },
  buttonSpace: {
    height: "40px"
  },
  button: {
    fontSize: "12px",
    width: "100%",
    marginTop: "5%",
    padding: "5%"
  },
  icon: {
    padding: 0,
    margin: 0
  },
  bio: {
    textAlign: "left",
    margin: "5% 0",
    fontSize: "15px"
  },
  followNum: {
    fontWeight: "bold"
  },
  followUnit: {
    color: "grey",
    fontSize: "13px"
  },
  gridItem: {
    width: "100%"
  }
}));

export default Profile;