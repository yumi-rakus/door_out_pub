import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "~/store";
import { fetchLoginUser, selectLoginUser } from "~/store/slice/App/auth.slice";
import {
  postChildComment,
  postParentComment
} from "~/store/slice/Domain/comment.slice";

import CommentUserInfo from "~/components/elements/comment/CommentUserInfo";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  makeStyles,
  Typography,
  TextField
} from "@material-ui/core";

import { useSnackbar } from "notistack";
import { useErrorHandle } from "~/utils/useErrorHandle";

import { THEME_COLOR1 } from "~/assets/ExportCSS";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  toUser: {
    accountId: string;
    userId: string;
  };
  postId: string;
  parentCommentId: string | null;
  incrementCommentCounts?: () => void;
};

const PostComment: React.FC<Props> = props => {
  const classes = useStyles();
  const dispatch: AppDispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [catchUnauthorizedError] = useErrorHandle();

  // store/state
  const loginUser = useSelector(selectLoginUser);

  // component/state
  const [inputContent, setInputContent] = useState<{
    value: string;
    errorMessage: string | null;
  }>({
    value: "",
    errorMessage: null
  });

  const CHARACTER_LIMIT = 255;

  // 定数
  const SUCCESS_POST_COMMENT_MESSAGE = "コメントを投稿しました";
  const FAILED_POST_COMMENT_MESSAGE = "コメントの投稿に失敗しました。";

  useEffect(() => {
    if (!loginUser) {
      dispatch(fetchLoginUser()).catch(e => {
        catchUnauthorizedError(e.message);
      });
    }
  }, [catchUnauthorizedError, dispatch, loginUser]);

  // methods
  /**
   * コメントを投稿する.
   */
  const handleClickSubmitBtn = () => {
    if (!props.parentCommentId) {
      // 親コメントの投稿
      dispatch(
        postParentComment({
          postId: props.postId,
          content: inputContent.value.replace("　", " ").trim()
        })
      )
        .then(() => {
          enqueueSnackbar(SUCCESS_POST_COMMENT_MESSAGE, { variant: "success" });
          props.incrementCommentCounts && props.incrementCommentCounts();
        })
        .catch(e => {
          catchUnauthorizedError(e.message);
          enqueueSnackbar(FAILED_POST_COMMENT_MESSAGE, { variant: "error" });
        });
    } else {
      // 子コメントの投稿
      dispatch(
        postChildComment({
          parentCommentId: props.parentCommentId,
          replyUserId: props.toUser.userId,
          content: inputContent.value.replace("　", " ").trim()
        })
      )
        .then(() => {
          enqueueSnackbar(SUCCESS_POST_COMMENT_MESSAGE, { variant: "success" });
          props.incrementCommentCounts && props.incrementCommentCounts();
        })
        .catch(e => {
          catchUnauthorizedError(e.message);
          enqueueSnackbar(FAILED_POST_COMMENT_MESSAGE, { variant: "error" });
        });
    }

    closeDialog();
  };

  const handleChangeContent = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputContent({
      value: value,
      errorMessage: contentValidation(value)
    });
  };

  const contentValidation = (value: string) => {
    // 空文字チェック
    if (!value || value.replace("　", " ").trim().length === 0)
      return "コメント内容を入力してください";
    // 文字数チェック
    if (value.replace("　", " ").trim().length > CHARACTER_LIMIT) {
      return `${CHARACTER_LIMIT}字以内で入力してください`;
    }
    return "";
  };

  /**
   * stateを初期化し、ダイアログを閉じる.
   */
  const closeDialog = () => {
    props.handleClose();
    setInputContent({ value: "", errorMessage: null });
  };

  return (
    <div onClick={e => e.stopPropagation()}>
      <Dialog
        open={props.isOpen}
        onClose={props.handleClose}
        fullWidth={true}
        maxWidth={"md"}
      >
        {/*キャンセルボタン、投稿ボタン*/}
        <DialogActions>
          <Grid container justify={"center"} alignItems={"center"}>
            <Grid item xs={3}>
              <Typography className={classes.cancel} onClick={closeDialog}>
                キャンセル
              </Typography>
            </Grid>
            <Grid item xs={6} />
            <Grid item xs={3}>
              <Button
                variant="outlined"
                size="small"
                color={"primary"}
                className={classes.postButton}
                onClick={handleClickSubmitBtn}
                disabled={
                  inputContent.errorMessage === null ||
                  inputContent.errorMessage.length > 0
                }
              >
                投稿する
              </Button>
            </Grid>
          </Grid>
        </DialogActions>

        <DialogContent className={classes.dialogContent}>
          {/*コメントユーザー情報*/}
          <Grid container justify={"flex-start"} alignItems={"center"}>
            <Grid item className={classes.control}>
              {loginUser && (
                <CommentUserInfo
                  fromUser={{
                    userId: loginUser.userId,
                    accountId: loginUser.accountId,
                    name: loginUser.name,
                    userImagePath: loginUser.userImagePath
                  }}
                  toUser={{ accountId: props.toUser.accountId }}
                />
              )}
            </Grid>
          </Grid>

          {/*テキストエリア*/}
          <Grid
            container
            justify={"flex-start"}
            alignItems={"center"}
            className={classes.textAria}
          >
            <Grid item xs={12}>
              <TextField
                className={classes.control}
                multiline
                error={
                  inputContent.errorMessage !== null &&
                  inputContent.errorMessage.length > 0
                }
                rows={9}
                value={inputContent.value}
                helperText={
                  inputContent.value.replace("　", " ").trim().length +
                  "/" +
                  CHARACTER_LIMIT +
                  " " +
                  (inputContent.errorMessage !== null &&
                  inputContent.errorMessage.length > 0
                    ? inputContent.errorMessage
                    : " ")
                }
                onChange={handleChangeContent}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const useStyles = makeStyles(() => ({
  cancel: {
    fontSize: 10,
    color: THEME_COLOR1,
    textAlign: "center"
  },
  postButton: {
    fontSize: 10,
    textAlign: "center"
  },
  control: {
    width: "100%"
  },
  dialogContent: {
    padding: "0 5%"
  },
  textAria: {
    margin: "2% 0"
  }
}));

export default PostComment;