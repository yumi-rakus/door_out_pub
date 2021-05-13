import React, { useEffect, useState } from "react";

import { AppDispatch } from "~/store";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFollowees,
  fetchFollowers,
  fetchUsersLikedInPost,
  selectFollowees,
  selectFollowers,
  selectUsersLikedInPost,
  setFollowees,
  setFollowers,
  setUsersLikedInPost
} from "~/store/slice/Domain/user.slice";

import UserCard from "~/components/elements/user/UserCard";
import InfiniteScroll from "react-infinite-scroller";
import {
  Divider,
  ListItem,
  Dialog,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  CircularProgress,
  makeStyles
} from "@material-ui/core";
import { Cancel } from "@material-ui/icons";

import { useHistory } from "react-router-dom";
import { Path } from "~/router/routes";

import { FETCH_USERS_LIMIT } from "~/utils/globalVariables";
import { useErrorHandle } from "~/utils/useErrorHandle";
import { useSnackbar } from "notistack";

import { User } from "~/interfaces";

/**
 * userType.type
 * 1: followee
 * 2: follower
 * 3: liked in post
 **/
type Props = {
  userType:
    | { type: 1; userId: string }
    | { type: 2; userId: string }
    | { type: 3; postId: string };
  upperLimit: number;
  handleClose: () => void;
  isOpen: boolean;
};

const UserList: React.FC<Props> = props => {
  const classes = useStyles();
  const dispatch: AppDispatch = useDispatch();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [catchUnauthorizedError] = useErrorHandle();

  // store/state
  const followees = useSelector(selectFollowees);
  const followers = useSelector(selectFollowers);
  const usersLikedInPost = useSelector(selectUsersLikedInPost);

  // component/state
  const [users, setUsers] = useState<Array<User>>([]);
  const [offset, setOffset] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [scrollHeight, setScrollHeight] = useState(0);
  const [userLength, setUserLength] = useState(0);

  // 定数
  const FAILED_FETCH_USERS_MESSAGE = "ユーザーの取得に失敗しました。";
  /**
   * offsetが更新される度に走る処理
   */
  useEffect(() => {
    if (props.isOpen) {
      if (userLength < props.upperLimit) {
        setIsFetching(true);
        if (props.userType.type === 1) {
          // followee
          dispatch(
            fetchFollowees({
              userId: props.userType.userId,
              limit: FETCH_USERS_LIMIT,
              offset: offset
            })
          ).catch(e => {
            catchUnauthorizedError(e.message);
            enqueueSnackbar(FAILED_FETCH_USERS_MESSAGE, { variant: "error" });
          });
        } else if (props.userType.type === 2) {
          // follower
          dispatch(
            fetchFollowers({
              userId: props.userType.userId,
              limit: FETCH_USERS_LIMIT,
              offset: offset
            })
          ).catch(e => {
            catchUnauthorizedError(e.message);
            enqueueSnackbar(FAILED_FETCH_USERS_MESSAGE, { variant: "error" });
          });
        } else if (props.userType.type === 3) {
          // likedInPost
          dispatch(
            fetchUsersLikedInPost({
              postId: props.userType.postId,
              limit: FETCH_USERS_LIMIT,
              offset: offset
            })
          ).catch(e => {
            catchUnauthorizedError(e.message);
            enqueueSnackbar(FAILED_FETCH_USERS_MESSAGE, { variant: "error" });
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, offset, props.isOpen]);

  /**
   * store/stateの値が更新される度に走る処理
   */
  useEffect(() => {
    if (props.isOpen && userLength < props.upperLimit) {
      let data: Array<User> = [];

      if (props.userType.type === 1) {
        // followee
        if (followees) {
          // usersと新しく取得したfolloweesをマージ
          data = [...users, ...followees];
        }
      } else if (props.userType.type === 2) {
        // follower
        if (followers) {
          // usersと新しく取得したfollowersをマージ
          data = [...users, ...followers];
        }
      } else if (props.userType.type === 3) {
        // likedInPost
        if (usersLikedInPost) {
          // usersと新しく取得したusersLikedInPostをマージ
          data = [...users, ...usersLikedInPost];
        }
      }

      // 重複削除した配列を取得, set
      const dataFiltered = data.filter(
        (element, index, self) =>
          self.findIndex(
            dataElement => dataElement.userId === element.userId
          ) === index
      );
      setUsers(dataFiltered);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followees, followers, usersLikedInPost, props.isOpen]);

  /**
   * usersが更新された時に走る処理
   */
  useEffect(() => {
    if (props.isOpen) {
      setUserLength(users.length);
    }
  }, [users, props.isOpen]);

  /**
   * Dialogが閉じられた時に走る処理
   */
  useEffect(() => {
    if (!props.isOpen) {
      setUsers([]);
      setOffset(0);
      setIsFetching(false);
      setScrollHeight(0);
      setUserLength(0);
      dispatch(setFollowees(null));
      dispatch(setFollowees(null));
      dispatch(setFollowers(null));
      dispatch(setUsersLikedInPost(null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.isOpen]);

  // ---------------------- methods ----------------------
  /**
   * スクロールし、最下部に到達したら
   * ・scrollHeightの更新
   * ・isFetchingの更新
   * を行い、新たに取得したユーザーを表示される.
   *
   * @param e: event
   */
  const handleOnScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    if (
      Math.floor(e.currentTarget.clientHeight + e.currentTarget.scrollTop) ===
        e.currentTarget.scrollHeight &&
      scrollHeight !== e.currentTarget.scrollHeight
    ) {
      setOffset(offset + FETCH_USERS_LIMIT);
      setScrollHeight(e.currentTarget.scrollHeight);
      setIsFetching(false);
    }
  };

  /**
   * ユーザーページに遷移する.
   *
   * @param userId: ユーザーID
   */
  const toUserPage = (userId: string) => {
    props.handleClose();
    history.push({ pathname: Path.userPage + userId });
  };

  // ---------------------- JSX Element ----------------------
  // ユーザー一覧のJSXを作成
  const userCardList = users.map((user, index) => {
    const listItem = (
      <ListItem button className={classes.listItem}>
        <UserCard user={user} handleClick={() => toUserPage(user.userId)} />
      </ListItem>
    );

    //  最後のListItem以外には<Divider/>を表示する
    if (index !== users.length - 1) {
      return (
        <div key={index}>
          {listItem}
          <Divider />
        </div>
      );
    } else {
      return <div key={index}>{listItem}</div>;
    }
  });

  // userが居ない場合のメッセージを作成
  const messageInEmptyUser = () => {
    let target = "";
    if (props.isOpen) {
      if (props.userType.type === 1 && props.upperLimit === 0) {
        target = "フォロー中のユーザー";
      } else if (props.userType.type === 2 && props.upperLimit === 0) {
        target = "フォロワー";
      } else if (props.userType.type === 3 && props.upperLimit === 0) {
        target = "この投稿をいいねしたユーザー";
      } else {
        return;
      }
      return <div className={classes.emptyMessage}>{target}はいません。</div>;
    }
    return;
  };

  // 初期loading表示
  const loading = () => {
    if (props.isOpen && props.upperLimit !== 0) {
      if (
        (props.userType.type === 1 && followees === null) ||
        (props.userType.type === 2 && followers === null) ||
        (props.userType.type === 3 && usersLikedInPost === null)
      ) {
        return <CircularProgress className={classes.circularProgress} />;
      }
    }
    return;
  };

  //ロード中に表示する項目
  const loader = (
    <div className="loader" key={0}>
      <CircularProgress />
    </div>
  );

  return (
    <div>
      <Dialog
        open={props.isOpen}
        onClose={props.handleClose}
        fullWidth={true}
        maxWidth={"md"}
      >
        {/*ダイアログ閉じるボタン*/}
        <DialogActions>
          <Grid
            container
            justify={"flex-end"}
            alignItems={"center"}
            alignContent={"flex-end"}
          >
            <Grid item xs={2}>
              <IconButton onClick={props.handleClose}>
                <Cancel fontSize={"small"} color={"disabled"} />
              </IconButton>
            </Grid>
          </Grid>
        </DialogActions>

        <DialogContent onScroll={handleOnScroll}>
          {/*Loading*/}
          <Grid container justify={"center"} alignItems={"center"}>
            <Grid item>{loading()}</Grid>
          </Grid>

          {/*ユーザー一覧*/}
          <Grid container justify={"center"} alignItems={"center"}>
            <Grid item className={classes.control}>
              <InfiniteScroll
                loader={loader}
                loadMore={() => {}}
                hasMore={!isFetching && userLength < props.upperLimit}
                useWindow={false}
              >
                {userCardList}
              </InfiniteScroll>
              {messageInEmptyUser()}
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const useStyles = makeStyles(() => ({
  control: {
    width: "100%"
  },
  listItem: {
    padding: 3,
    width: "100%"
  },
  emptyMessage: {
    color: "grey",
    marginBottom: "15%"
  },
  circularProgress: {
    margin: "5vh 0",
    textAlign: "center"
  }
}));

export default UserList;