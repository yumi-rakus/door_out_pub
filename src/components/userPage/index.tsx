import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "~/store";
import {
  fetchUserDetail,
  resetUserDetail,
  selectUserDetail
} from "~/store/slice/Domain/user.slice";
import { fetchLoginUser, selectLoginUser } from "~/store/slice/App/auth.slice";
import {
  fetchLikePosts,
  fetchUserPosts,
  selectLikePosts,
  selectUserPosts,
  resetUserPosts,
  resetLikePosts,
  setUserPostsOffsetIncrement,
  setLikePostsOffsetIncrement,
  selectUserPostsOffset,
  selectLikePostsOffset
} from "~/store/slice/Domain/post.slice";

import Header from "~/components/elements/other/Header";
import Profile from "~/components/userPage/Profile";
import Setting from "~/components/userPage/Setting";
import PostList from "~/components/elements/post/PostList";
import SwitchTabs, { TabContent } from "~/components/elements/other/SwitchTabs";
import {
  Grid,
  makeStyles,
  Typography,
  CircularProgress
} from "@material-ui/core";

import { useHistory, useParams } from "react-router-dom";
import { Path } from "~/router/routes";

import { useErrorHandle } from "~/utils/useErrorHandle";
import { FETCH_POSTS_LIMIT } from "~/utils/globalVariables";

import { useSnackbar } from "notistack";
import { HEADER_HEIGHT } from "~/assets/ExportCSS";

const UserPage: React.FC = () => {
  const classes = useStyles();
  const dispatch: AppDispatch = useDispatch();
  const history = useHistory();
  const param = useParams<{ userId: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const [catchUnauthorizedError] = useErrorHandle();

  // タブに使用するenum
  enum tab {
    POST_LIST,
    LIKED_LIST
  }

  // store/state
  const loginUser = useSelector(selectLoginUser);
  const userDetail = useSelector(selectUserDetail);
  const userPosts = useSelector(selectUserPosts);
  const likePosts = useSelector(selectLikePosts);
  const userPostsOffset = useSelector(selectUserPostsOffset);
  const likePostsOffset = useSelector(selectLikePostsOffset);

  // component/state
  const [tabValue, setTabValue] = useState(tab.POST_LIST);

  // 定数
  const tabContents: Array<TabContent> = [
    {
      label: "投稿",
      value: tab.POST_LIST,
      function: () => {
        setTabValue(tab.POST_LIST);
      }
    },
    {
      label: "いいね",
      value: tab.LIKED_LIST,
      function: () => {
        setTabValue(tab.LIKED_LIST);
      }
    }
  ];
  const FETCH_POST_ERROR_MESSAGE =
    "投稿の取得に失敗しました。ページをリロードしてください。";
  let prevLocationPathname: string = "";

  useEffect(() => {
    if (!loginUser) {
      dispatch(fetchLoginUser()).catch(e => {
        catchUnauthorizedError(e.message);
      });
    }
  }, [catchUnauthorizedError, dispatch, loginUser]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    prevLocationPathname = history.location.pathname;

    dispatch(resetUserDetail());
    dispatch(resetLikePosts());
    dispatch(resetUserPosts());
    return history.listen(nextLocation => {
      if (nextLocation.pathname !== prevLocationPathname) {
        prevLocationPathname = nextLocation.pathname;
        setTabValue(0);

        dispatch(resetUserDetail());
        dispatch(resetLikePosts());
        dispatch(resetUserPosts());
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  useEffect(() => {
    dispatch(fetchUserDetail(param.userId)).catch(() => {
      console.log("no exist user");
      history.push({ pathname: Path.timeline });
    });
  }, [dispatch, history, param.userId]);

  useEffect(() => {
    dispatch(
      fetchUserPosts({
        userId: param.userId,
        offset: userPostsOffset,
        limit: FETCH_POSTS_LIMIT
      })
    ).catch(() => {
      enqueueSnackbar(FETCH_POST_ERROR_MESSAGE, { variant: "error" });
    });
  }, [dispatch, userPostsOffset, param.userId, enqueueSnackbar]);

  useEffect(() => {
    dispatch(
      fetchLikePosts({
        userId: param.userId,
        offset: likePostsOffset,
        limit: FETCH_POSTS_LIMIT
      })
    ).catch(() => {
      enqueueSnackbar(FETCH_POST_ERROR_MESSAGE, { variant: "error" });
    });
  }, [dispatch, enqueueSnackbar, likePostsOffset, param.userId]);

  return (
    <div>
      <Header
        first={2}
        middle={null}
        last={
          loginUser && loginUser.userId !== param.userId ? null : <Setting />
        }
      />
      {userDetail && loginUser ? (
        <>
          <Grid
            container
            justify={"center"}
            alignItems={"center"}
            className={classes.userPage}
          >
            <Grid item className={classes.profile}>
              <Profile
                user={
                  loginUser.userId === param.userId ? loginUser : userDetail
                }
                isLoginUser={loginUser.userId === param.userId}
              />
            </Grid>
          </Grid>

          {/*Tab*/}
          <div className={classes.switchTabs}>
            <SwitchTabs tabContents={tabContents} selectedTabVal={tabValue} />
          </div>

          {userPosts && likePosts ? (
            tabValue === 0 ? (
              userPosts.length > 0 ? (
                <PostList
                  postList={userPosts}
                  handleLoadMore={() => {
                    dispatch(setUserPostsOffsetIncrement());
                  }}
                />
              ) : (
                <Typography className={classes.emptyMessage}>
                  投稿がありません
                </Typography>
              )
            ) : likePosts.length > 0 ? (
              <PostList
                postList={likePosts}
                handleLoadMore={() => {
                  dispatch(setLikePostsOffsetIncrement());
                }}
              />
            ) : (
              <Typography className={classes.emptyMessage}>
                いいねした投稿がありません
              </Typography>
            )
          ) : (
            <div className={classes.circularProgress}>
              <CircularProgress />
            </div>
          )}
        </>
      ) : (
        <div className={classes.userPage}>
          <div className={classes.circularProgress}>
            <CircularProgress />
          </div>
        </div>
      )}
    </div>
  );
};

const useStyles = makeStyles(() => ({
  profile: {
    margin: "2vh 0",
    width: "90%"
  },
  userPage: {
    marginTop: HEADER_HEIGHT
  },
  emptyMessage: {
    color: "grey",
    margin: "2vh 0"
  },
  circularProgress: {
    marginTop: HEADER_HEIGHT,
    paddingTop: HEADER_HEIGHT
  },
  switchTabs: {
    position: "sticky",
    top: HEADER_HEIGHT,
    zIndex: 1
  }
}));

export default UserPage;