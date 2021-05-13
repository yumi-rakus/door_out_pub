import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "~/store";
import {
  deleteChildComment,
  deleteParentComment,
  removeParentComment,
  removeChildComment
} from "~/store/slice/Domain/comment.slice";
import { decrementCommentCountsOfPostDetail } from "~/store/slice/Domain/post.slice";
import { fetchLoginUser, selectLoginUser } from "~/store/slice/App/auth.slice";

import CommentUserInfo from "~/components/elements/comment/CommentUserInfo";
import DeleteDialog from "~/components/elements/other/DeleteDialog";
import PostComment from "~/components/elements/comment/PostComment";
import {
  Button,
  Grid,
  IconButton,
  makeStyles,
  Typography
} from "@material-ui/core";
import { Delete } from "@material-ui/icons";

import moment from "moment";
import { useErrorHandle } from "~/utils/useErrorHandle";
import { useSnackbar } from "notistack";

type Props = {
  commentId: string;
  content: string;
  createAt: string;
  fromUser: {
    userId: string;
    accountId: string;
    name: string;
    userImagePath: string;
  };
  toUser: {
    userId: string;
    accountId: string;
  };
  postId: string;
  parentCommentId: string | null;
};

const CommentCard: React.FC<Props> = props => {
  const classes = useStyles();
  const dispatch: AppDispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [catchUnauthorizedError] = useErrorHandle();

  // store/state
  const loginUser = useSelector(selectLoginUser);

  // component/state
  const [isOpenedDeleteDialog, setIsOpenedDeleteDialog] = useState(false);
  const [isOpenedCommentForm, setIsOpenedCommentForm] = useState(false);

  // 定数
  const FAILED_DELETE_COMMENT_MESSAGE = "コメントの削除に失敗しました。";

  useEffect(() => {
    if (!loginUser) {
      dispatch(fetchLoginUser()).catch(e => {
        catchUnauthorizedError(e.message);
      });
    }
  }, [catchUnauthorizedError, dispatch, loginUser]);

  /**
   * コメントのDeleteDialogを開く.
   */
  const handleClickDeleteBtn = () => {
    if (loginUser && loginUser.userId === props.fromUser.userId) {
      setIsOpenedDeleteDialog(true);
    }
  };

  /**
   * コメントのDeleteDialogを閉じる.
   */
  const handleCancelDelete = () => {
    setIsOpenedDeleteDialog(false);
  };

  /**
   * コメントを削除する.
   */
  const handleDeleteComment = () => {
    setIsOpenedDeleteDialog(false);
    if (loginUser && loginUser.userId === props.fromUser.userId) {
      if (props.parentCommentId) {
        // 子コメントの場合
        dispatch(deleteChildComment(props.commentId))
          .then(() => {
            dispatch(
              removeChildComment({
                parentCommentId: props.parentCommentId,
                childCommentId: props.commentId
              })
            );
          })
          .catch(e => {
            catchUnauthorizedError(e.message);
            enqueueSnackbar(FAILED_DELETE_COMMENT_MESSAGE, {
              variant: "error"
            });
          });
      } else {
        // 親コメントの場合
        dispatch(
          deleteParentComment({
            postId: props.postId,
            parentCommentId: props.commentId
          })
        )
          .then(() => {
            dispatch(removeParentComment(props.commentId));
            dispatch(decrementCommentCountsOfPostDetail());
          })
          .catch(e => {
            catchUnauthorizedError(e.message);
            enqueueSnackbar(FAILED_DELETE_COMMENT_MESSAGE, {
              variant: "error"
            });
          });
      }
    }
  };

  /**
   * コメント投稿フォームを開く.
   */
  const handleClickCommentBtn = () => {
    setIsOpenedCommentForm(true);
  };

  /**
   * コメント投稿フォームを閉じる.
   */
  const handleCancelComment = () => {
    setIsOpenedCommentForm(false);
  };

  return (
    <>
      <Grid
        container
        justify={"flex-start"}
        alignItems={"center"}
        className={classes.commentCard}
      >
        {/*コメントユーザー情報*/}
        <Grid item xs={11}>
          <CommentUserInfo fromUser={props.fromUser} toUser={props.toUser} />
        </Grid>
        <Grid item xs={1}>
          {/*削除ボタン（ログインユーザーがコメント投稿者である場合のみ出現）*/}
          {loginUser && loginUser.userId === props.fromUser.userId ? (
            <IconButton size={"small"} onClick={handleClickDeleteBtn}>
              <Delete fontSize={"small"} />
            </IconButton>
          ) : null}
        </Grid>
      </Grid>

      {/*コメント内容*/}
      <Grid container justify={"flex-start"} alignItems={"center"}>
        <Grid item xs={12}>
          <Typography className={classes.content}>{props.content}</Typography>
        </Grid>
      </Grid>

      <Grid
        container
        justify={"flex-start"}
        alignItems={"center"}
        className={classes.gridContainer}
      >
        {/*コメント投稿時間*/}
        <Grid item className={classes.createAt}>
          {moment(props.createAt).format("YYYY/MM/DD HH:mm")}
        </Grid>

        {/*返信ボタン*/}
        <Grid item className={classes.button}>
          <Button
            onClick={handleClickCommentBtn}
            className={classes.buttonContent}
          >
            返信する
          </Button>
        </Grid>
      </Grid>

      {/*コメント削除ダイアログ*/}
      {loginUser && loginUser.userId === props.fromUser.userId ? (
        <DeleteDialog
          isOpened={isOpenedDeleteDialog}
          deleteTarget={"コメント"}
          handleCancel={handleCancelDelete}
          handleDelete={handleDeleteComment}
        />
      ) : null}

      {/*コメント投稿フォーム*/}
      <PostComment
        isOpen={isOpenedCommentForm}
        handleClose={handleCancelComment}
        toUser={{
          userId: props.fromUser.userId,
          accountId: props.fromUser.accountId
        }}
        postId={props.postId}
        parentCommentId={
          props.parentCommentId ? props.parentCommentId : props.commentId
        }
      />
    </>
  );
};

const useStyles = makeStyles(() => ({
  content: {
    textAlign: "left"
  },
  createAt: {
    color: "grey",
    fontSize: "13px",
    textAlign: "left"
  },
  button: {
    textAlign: "right",
    flex: 1
  },
  buttonContent: {
    color: "grey",
    fontWeight: "bold"
  },
  gridContainer: {
    display: "flex"
  },
  commentCard: {
    margin: "2% 0"
  }
}));

export default CommentCard;