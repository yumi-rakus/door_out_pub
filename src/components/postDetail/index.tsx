import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "~/store";
import { fetchLoginUser, selectLoginUser } from "~/store/slice/App/auth.slice";
import {
  deletePost,
  fetchPostDetail,
  selectPostDetail,
  resetPostDetail
} from "~/store/slice/Domain/post.slice";
import { resetParentComments } from "~/store/slice/Domain/comment.slice";

import Header from "~/components/elements/other/Header";
import PostUserInfo from "~/components/elements/post/PostUserInfo";
import Position from "~/components/postDetail/Position";
import ImageArea from "~/components/elements/post/ImageArea";
import MiniMap from "~/components/postDetail/MiniMap";
import TagList from "~/components/elements/post/TagList";
import PostDetailReaction from "~/components/postDetail/PostDetailReaction";
import DeleteDialog from "~/components/elements/other/DeleteDialog";
import ParentCommentList from "~/components/postDetail/ParentCommentList";
import {
  Divider,
  Grid,
  IconButton,
  CircularProgress,
  makeStyles,
  Theme
} from "@material-ui/core";
import { Delete } from "@material-ui/icons";

import { useHistory, useParams } from "react-router-dom";

import { useSnackbar } from "notistack";
import { useErrorHandle } from "~/utils/useErrorHandle";

import moment from "moment";
import { HEADER_HEIGHT } from "~/assets/ExportCSS";
import { Path } from "~/router/routes";
import decode from "~/utils/decode";
import { Coordinate } from "~/interfaces";
import { GET_NO_ROAD_PATH_MSG } from "~/utils/globalVariables";

/* eslint-disable eqeqeq */
const PostDetail: React.FC = () => {
  const classes = useStyles();
  const dispatch: AppDispatch = useDispatch();
  const history = useHistory();
  const params = useParams<{ postId: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const [catchUnauthorizedError] = useErrorHandle();

  // store/state
  const loginUser = useSelector(selectLoginUser);
  const postDetail = useSelector(selectPostDetail);

  // component/state
  const [isOpenedDeleteDialog, setIsOpenedDeleteDialog] = useState(false);
  const [roadPath, setRoadPath] = useState<Array<Coordinate>>([]);

  // 定数
  const FAILED_FETCH_POST_DETAIL_MESSAGE = "投稿の取得に失敗しました。";
  const FAILED_DELETE_POST_MESSAGE = "投稿の削除に失敗しました。";

  useEffect(() => {
    if (!loginUser) {
      dispatch(fetchLoginUser()).catch(e => {
        catchUnauthorizedError(e.message);
      });
    }
  }, [catchUnauthorizedError, dispatch, loginUser]);

  useEffect(() => {
    dispatch(fetchPostDetail(params.postId)).catch(e => {
      catchUnauthorizedError(e.message);
      enqueueSnackbar(FAILED_FETCH_POST_DETAIL_MESSAGE, { variant: "error" });
      history.goBack();
    });

    return () => {
      dispatch(resetPostDetail());
      dispatch(resetParentComments());
    };
  }, [
    catchUnauthorizedError,
    dispatch,
    enqueueSnackbar,
    history,
    params.postId
  ]);

  useEffect(() => {
    if (postDetail?.postType == 2) {
      decode(postDetail.encodedRoadCoordinate)
        .then(route => {
          setRoadPath(route);
        })
        .catch(e =>
          enqueueSnackbar(GET_NO_ROAD_PATH_MSG, { variant: "error" })
        );
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postDetail]);

  /**
   * 投稿のDeleteDialogを開く.
   */
  const handleClickPostDeleteBtn = () => {
    if (
      loginUser &&
      postDetail &&
      loginUser.userId === postDetail.user.userId
    ) {
      setIsOpenedDeleteDialog(true);
    }
  };

  /**
   * 投稿のDeleteDialogを閉じる.
   */
  const handleCancelPostDelete = () => {
    setIsOpenedDeleteDialog(false);
  };

  /**
   * 投稿を削除する.
   * 成功時、１つ前の画面に戻る.
   */
  const handlePostDelete = () => {
    setIsOpenedDeleteDialog(false);
    if (
      loginUser &&
      postDetail &&
      loginUser.userId === postDetail.user.userId
    ) {
      dispatch(deletePost(postDetail.postId))
        .then(() => {
          history.goBack();
        })
        .catch(e => {
          catchUnauthorizedError(e.message);
          enqueueSnackbar(FAILED_DELETE_POST_MESSAGE, { variant: "error" });
        });
    }
  };

  /**
   * Map画面に遷移する.
   */
  const toMap = () => {
    if (postDetail && postDetail.postType == 1) {
      history.push({
        pathname: Path.map,
        state: {
          lat: postDetail.spotCoordinate.latitude,
          lng: postDetail.spotCoordinate.longitude,
          spotName: postDetail.spotName,
          postType: 1
        }
      });
    } else if (postDetail && postDetail.postType == 2) {
      if (roadPath.length > 0) {
        history.push({
          pathname: Path.map,
          state: {
            // encodedPolyline: postDetail.encodedRoadCoordinate,
            path: roadPath,
            startRoadSpotName: postDetail.roadStartSpotName,
            endRoadSpotName: postDetail.roadEndSpotName,
            postType: 2
          }
        });
      }
    }
  };

  /**
   * Positionコンポーネントを生成する.
   */
  const positionJSX = () => {
    if (postDetail && postDetail.postType == 1) {
      return (
        <Position
          position={{
            postType: 1,
            data: {
              postType: 1,
              spotName: postDetail.spotName,
              lat: postDetail.spotCoordinate.latitude,
              lng: postDetail.spotCoordinate.longitude
            }
          }}
          handleClickPosition={toMap}
        />
      );
    } else if (postDetail && postDetail.postType == 2) {
      return (
        <Position
          position={{
            postType: 2,
            data: {
              postType: 2,
              startRoadSpotName: postDetail.roadStartSpotName,
              endRoadSpotName: postDetail.roadEndSpotName
            }
          }}
          handleClickPosition={toMap}
        />
      );
    }
  };

  /**
   * MiniMapコンポーネントを生成する.
   */
  const miniMapJSX = () => {
    if (postDetail && postDetail.postType == 1) {
      return (
        <MiniMap
          position={{
            postType: 1,
            data: {
              postType: 1,
              spotName: postDetail.spotName,
              lat: postDetail.spotCoordinate.latitude,
              lng: postDetail.spotCoordinate.longitude
            }
          }}
          handleClickMap={toMap}
        />
      );
    } else if (postDetail && postDetail.postType == 2) {
      return (
        <MiniMap
          position={{
            postType: 2,
            data: {
              postType: 2,
              // encodedPolyline: postDetail.encodedRoadCoordinate,
              startRoadSpotName: postDetail.roadStartSpotName,
              endRoadSpotName: postDetail.roadEndSpotName,
              path: roadPath
            }
          }}
          handleClickMap={toMap}
        />
      );
    }
  };

  return (
    <div>
      <Header first={2} middle={null} last={null} />
      {postDetail ? (
        <div className={classes.postDetail}>
          <Grid container justify={"flex-start"} alignItems={"flex-start"}>
            {/*投稿ユーザー*/}
            <Grid item xs={10}>
              <PostUserInfo postUser={postDetail.user} />
            </Grid>

            {/*投稿ユーザーとログインユーザーが同一だった場合、削除ボタンが表示される*/}
            {loginUser && loginUser.userId === postDetail.user.userId ? (
              <Grid item xs={2}>
                <br />
                <IconButton onClick={handleClickPostDeleteBtn}>
                  <Delete className={classes.postDeleteBtn} />
                </IconButton>
              </Grid>
            ) : null}
          </Grid>
          <Grid
            container
            justify={"center"}
            alignItems={"flex-start"}
            direction={"column"}
            className={classes.gridContainer}
          >
            {/*位置情報*/}
            <Grid item className={classes.position}>
              {positionJSX()}
            </Grid>

            {/*投稿内容*/}
            <Grid item className={classes.content}>
              {postDetail.content}
            </Grid>
          </Grid>

          {/*投稿写真一覧*/}
          <ImageArea postImagePaths={postDetail.postImagePaths} />

          {/*ミニマップ*/}
          <Grid container justify={"center"} alignItems={"center"}>
            <Grid item className={classes.miniMap} xs={10}>
              {miniMapJSX()}
            </Grid>
          </Grid>

          {/*タグ一覧*/}
          <TagList tags={postDetail.tags} />

          <Grid
            container
            justify={"center"}
            alignItems={"flex-start"}
            direction={"column"}
            style={{ padding: "0 5vw" }}
          >
            {/*投稿時間*/}
            <Grid item className={classes.createAt}>
              {moment(postDetail.createAt).format("YYYY/MM/DD HH:mm")}
            </Grid>
            <Grid item className={classes.gridItem}>
              <Divider orientation={"horizontal"} />
            </Grid>

            {/*Reaction*/}
            <Grid item className={classes.gridItem}>
              <PostDetailReaction
                postId={postDetail.postId}
                isLikedPost={postDetail.isLikedPost}
                likeCounts={postDetail.likeCounts}
                toUser={{
                  userId: postDetail.user.userId,
                  accountId: postDetail.user.accountId
                }}
              />
            </Grid>
            <Grid item className={classes.gridItem}>
              <Divider orientation={"horizontal"} />
            </Grid>

            {/*親コメント一覧*/}
            <Grid item className={classes.gridItem}>
              <ParentCommentList
                postId={postDetail.postId}
                postedUser={{
                  userId: postDetail.user.userId,
                  accountId: postDetail.user.accountId
                }}
                upperLimit={postDetail.commentCounts}
              />
            </Grid>
          </Grid>
        </div>
      ) : (
        <CircularProgress />
      )}

      {/*投稿削除ダイアログ*/}
      <DeleteDialog
        isOpened={isOpenedDeleteDialog}
        deleteTarget={"この投稿"}
        handleCancel={handleCancelPostDelete}
        handleDelete={handlePostDelete}
      />
    </div>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  postDetail: {
    marginTop: HEADER_HEIGHT
  },
  postDeleteBtn: {
    color: "grey"
  },
  position: {
    width: "100%"
  },
  content: {
    textAlign: "left",
    padding: theme.spacing(1)
  },
  gridContainer: {
    padding: theme.spacing(1)
  },
  gridItem: {
    width: "100%"
  },
  miniMap: {
    width: "100%",
    height: "25vh",
    margin: "1vh"
  },
  createAt: {
    color: "grey",
    margin: "2% 0"
  }
}));

export default PostDetail;
