import React from "react";

import { Avatar, Grid, makeStyles, Typography } from "@material-ui/core";

import { useHistory } from "react-router-dom";
import { Path } from "~/router/routes";

import { User } from "~/interfaces";
import moment from "moment";

type PostUserInfoProps = {
  postUser: User;
  createAt?: string;
  inPostingPage?: true;
};

const PostUserInfo: React.FC<PostUserInfoProps> = ({
  postUser,
  createAt,
  inPostingPage
}) => {
  const classes = useStyles();
  const history = useHistory();

  /**
   * ユーザーページに移動する.
   **/
  const moveToUserPage = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    if (!inPostingPage) {
      e.stopPropagation(); //親コンポーネントにクリックイベントが伝番して、詳細画面に遷移するのを防ぐ
      history.push({
        pathname: Path.userPage + postUser.userId
      });
    }
  };

  return (
    <>
      <br />
      <Grid container justify={"flex-start"} alignItems={"flex-start"}>
        {/*ユーザーアイコン*/}
        <Grid item xs={2} onClick={moveToUserPage}>
          <Avatar src={postUser.userImagePath} className={classes.avatar} />
        </Grid>

        <Grid item xs={10} className={classes.userInfoGrid}>
          {/*ユーザー名*/}
          <Grid container justify={"flex-start"} alignItems={"center"}>
            <Grid item className={classes.userNameGrid}>
              <Typography className={classes.userName}>
                <span onClick={moveToUserPage}>{postUser.name}</span>
              </Typography>
            </Grid>
          </Grid>

          {/*アカウントID*/}
          <Grid
            container
            justify={"flex-start"}
            alignItems={"center"}
            className={classes.gridContainer}
          >
            <Grid item>
              <Typography
                className={classes.accountId}
                onClick={moveToUserPage}
              >
                @{postUser.accountId}
              </Typography>
            </Grid>
            <Grid item className={classes.createAt}>
              {createAt && moment(createAt).format("YYYY/MM/DD HH:mm")}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

const useStyles = makeStyles(() => ({
  avatar: {
    marginLeft: "10px"
  },
  userInfoGrid: {
    paddingLeft: "2%"
  },
  accountId: {
    color: "grey",
    fontSize: "11px",
    textAlign: "left"
  },
  userNameGrid: {
    overflow: "hidden",
    width: "100%"
  },
  userName: {
    fontWeight: "bold",
    fontSize: "13px",
    textAlign: "left",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden"
  },
  gridContainer: {
    display: "flex"
  },
  createAt: {
    color: "grey",
    fontSize: "13px",
    flex: 1,
    textAlign: "right"
  }
}));

export default PostUserInfo;