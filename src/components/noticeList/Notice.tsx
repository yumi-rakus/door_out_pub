import React, { useState, useEffect } from "react";

import {
  makeStyles,
  Typography,
  Avatar,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider
} from "@material-ui/core";
import {
  Favorite as FavoriteIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  Face
} from "@material-ui/icons";

import { useHistory } from "react-router-dom";
import { Path } from "~/router/routes";

import { HEADER_HEIGHT } from "~/assets/ExportCSS";

import { Notification } from "~/interfaces";

type Props = {
  notices: Array<Notification>;
};

const Notice: React.FC<Props> = props => {
  const classes = noticeStyle();
  const history = useHistory();

  // component/state
  const [noticeList, setNoticeList] = useState<Array<Notification> | null>(
    null
  );

  enum enumNoticeType {
    favorite,
    reply,
    follow
  }

  useEffect(() => {
    if (props.notices) {
      setNoticeList([...props.notices]);
    }
  }, [props.notices]);

  /**
   * ユーザーページに遷移する.
   *
   * @param e: React.MouseEvent<HTMLDivElement | HTMLSpanElement>
   * @param userId: ユーザーID
   */
  const toUserPage = (
    e: React.MouseEvent<HTMLDivElement | HTMLSpanElement>,
    userId: string
  ) => {
    e.stopPropagation();
    history.push({
      pathname: Path.userPage + userId
    });
  };

  /**
   * noticeTypeによってアイコンを出し分ける.
   *
   * @param noticeType: 通知タイプ
   */
  const noticeIconJSX = (noticeType: number) => {
    if (noticeType === enumNoticeType.favorite) {
      return (
        <FavoriteIcon
          color={"error"}
          fontSize={"small"}
          className={classes.noticeIcon}
        />
      );
    } else if (noticeType === enumNoticeType.reply) {
      return (
        <ChatBubbleOutlineIcon
          color={"primary"}
          fontSize={"small"}
          className={classes.noticeIcon}
        />
      );
    } else if (noticeType === enumNoticeType.follow) {
      return (
        <Face
          color={"primary"}
          fontSize={"small"}
          className={classes.noticeIcon}
        />
      );
    }
  };

  /**
   * noticeTypeによってListItem押下時の遷移先を切り替える.
   *
   * @param notice: Notification
   */
  const handleClickListItem = (notice: Notification) => {
    if (
      notice.noticeType === enumNoticeType.favorite ||
      notice.noticeType === enumNoticeType.reply
    ) {
      history.push({
        pathname: Path.postDetail + notice.postId
      });
    } else if (notice.noticeType === enumNoticeType.follow) {
      history.push({
        pathname: Path.userPage + notice.userId
      });
    }
  };

  /**
   * noticeTypeによってListItemTextを出し分ける.
   *
   * @param notice: Notification
   */
  const listItemTextJSX = (notice: Notification) => {
    let primaryText = "";

    if (notice.noticeType === enumNoticeType.favorite) {
      primaryText = "さんがいいねしました";
    } else if (notice.noticeType === enumNoticeType.reply) {
      primaryText = "さんが返信しました";
    } else if (notice.noticeType === enumNoticeType.follow) {
      primaryText = "さんがフォローしました";
    }

    return (
      <ListItemText
        primary={
          <React.Fragment>
            <Grid container justify={"flex-start"} alignItems={"center"}>
              <span
                className={classes.primaryText}
                onClick={e => {
                  toUserPage(e, notice.userId);
                }}
              >
                {notice.name}
              </span>
              {primaryText}
            </Grid>
          </React.Fragment>
        }
        secondary={
          <Typography component={"div"} className={classes.secondaryText}>
            {typeof notice.content === "string" && notice.content}
          </Typography>
        }
      />
    );
  };

  return (
    <div>
      <List>
        {noticeList !== null &&
          (noticeList.length === 0 ? (
            <Grid container justify={"center"} alignItems={"flex-start"}>
              <Grid item className={classes.emptyMessage}>
                お知らせはありません
              </Grid>
            </Grid>
          ) : (
            noticeList.map((notice, index) => (
              <div key={notice.noticeId}>
                <ListItem
                  alignItems={"center"}
                  button
                  onClick={() => {
                    handleClickListItem(notice);
                  }}
                >
                  <Grid container justify={"center"} alignItems={"center"}>
                    <Grid item xs={1}>
                      <Grid container justify={"center"} alignItems={"center"}>
                        <Grid item>{noticeIconJSX(notice.noticeType)}</Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={2}>
                      <Grid container justify={"center"} alignItems={"center"}>
                        <Grid item>
                          <Avatar
                            src={notice.userImagePath}
                            onClick={e => {
                              toUserPage(e, notice.userId);
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={9}>
                      {listItemTextJSX(notice)}
                    </Grid>
                  </Grid>
                </ListItem>
                {noticeList.length !== index + 1 && <Divider />}
              </div>
            ))
          ))}
      </List>
    </div>
  );
};

const noticeStyle = makeStyles(() => ({
  noticeIcon: {
    paddingTop: "7px"
  },
  emptyMessage: {
    color: "grey",
    marginTop: HEADER_HEIGHT
  },
  primaryText: {
    fontWeight: 700,
    maxWidth: "100%",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden"
  },
  secondaryText: {
    color: "grey",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden"
  }
}));

export default Notice;