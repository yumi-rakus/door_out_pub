import React from "react";

import { Avatar, Grid, makeStyles, Typography } from "@material-ui/core";

import { useHistory } from "react-router-dom";
import { Path } from "~/router/routes";

import { THEME_COLOR1 } from "~/assets/ExportCSS";

type Props = {
  fromUser: {
    userId: string;
    accountId: string;
    name: string;
    userImagePath: string;
  };
  toUser: {
    // PostComment.tsxで使用される場合: userIdは渡されない
    // CommentCard.tsxで使用される場合: userIdは渡される
    userId?: string;
    accountId: string;
  };
};

const CommentUserInfo: React.FC<Props> = props => {
  const classes = useStyles();
  const history = useHistory();

  // PostComment.tsxで使用される場合: false
  // CommentCard.tsxで使用される場合: true
  const isTransition: boolean = Boolean(props.toUser.userId);

  /**
   * ユーザーページに遷移する.
   *
   * @param userId: ユーザーID
   */
  const toUserPage = (userId: string) => {
    if (isTransition) {
      history.push({ pathname: Path.userPage + userId });
    }
  };

  return (
    <div style={{ margin: 0 }}>
      <Grid
        container
        spacing={1}
        justify={"flex-start"}
        alignItems={"center"}
        style={{
          margin: 0
        }}
      >
        {/*ユーザーアイコン*/}
        <Grid item xs={2}>
          <Grid container justify={"center"} alignItems={"center"}>
            <Avatar
              variant={"circular"}
              src={props.fromUser.userImagePath}
              onClick={() => {
                toUserPage(props.fromUser.userId);
              }}
            />
          </Grid>
        </Grid>
        <Grid item xs={10}>
          <Grid
            container
            justify={"center"}
            alignItems={"flex-start"}
            direction={"column"}
          >
            {/*ユーザー名*/}
            <Grid item className={classes.userNameGrid}>
              <Typography
                className={classes.userName}
                onClick={() => {
                  toUserPage(props.fromUser.userId);
                }}
              >
                {props.fromUser.name}
              </Typography>
            </Grid>

            {/*アカウントID*/}
            <Grid item>
              <Typography
                className={classes.accountId}
                onClick={() => {
                  toUserPage(props.fromUser.userId);
                }}
              >
                &nbsp;@
                {props.fromUser.accountId}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/*返信先*/}
      <Grid container className={classes.accountId}>
        {props.toUser.userId ? (
          <span>
            返信先:{" "}
            <span
              onClick={() => {
                if (props.toUser.userId) toUserPage(props.toUser.userId);
              }}
              className={classes.clickableAccountId}
            >
              @{props.toUser.accountId}
            </span>
          </span>
        ) : (
          <span>返信先: @{props.toUser.accountId}</span>
        )}
      </Grid>
    </div>
  );
};

const useStyles = makeStyles(() => ({
  userNameGrid: {
    overflow: "hidden",
    width: "100%"
  },
  userName: {
    fontSize: "13px",
    fontWeight: "bold",
    textAlign: "left",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden"
  },
  accountId: {
    fontSize: "10px",
    color: "grey",
    textAlign: "left"
  },
  clickableAccountId: {
    color: THEME_COLOR1
  }
}));

export default CommentUserInfo;