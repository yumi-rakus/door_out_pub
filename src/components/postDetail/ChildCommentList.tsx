import React, { useEffect, useState } from "react";

import { useDispatch } from "react-redux";
import { AppDispatch } from "~/store";
import { fetchChildComments } from "~/store/slice/Domain/comment.slice";

import CommentCard from "~/components/postDetail/CommentCard";
import { Button, Grid, makeStyles, Typography } from "@material-ui/core";

import { FETCH_CHILD_COMMENTS_LIMIT } from "~/utils/globalVariables";
import { useErrorHandle } from "~/utils/useErrorHandle";

import { useSnackbar } from "notistack";
import { THEME_COLOR1 } from "~/assets/ExportCSS";

import { ChildComment } from "~/interfaces";

type Props = {
  childComments: Array<ChildComment>;
  childCommentCounts: number;
  parentCommentId: string;
  postId: string;
};

const ChildCommentList: React.FC<Props> = props => {
  const classes = useStyles();
  const dispatch: AppDispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [catchUnauthorizedError] = useErrorHandle();

  // component/state
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    dispatch(
      fetchChildComments({
        parentCommentId: props.parentCommentId,
        limit: FETCH_CHILD_COMMENTS_LIMIT,
        offset: offset
      })
    ).catch(e => {
      catchUnauthorizedError(e.message);
      enqueueSnackbar("コメントの取得に失敗しました。", { variant: "error" });
    });
  }, [
    catchUnauthorizedError,
    dispatch,
    enqueueSnackbar,
    offset,
    props.parentCommentId
  ]);

  return (
    <>
      {props.childComments && (
        <Grid
          container
          justify={"center"}
          alignItems={"flex-end"}
          direction={"column"}
          className={classes.control}
        >
          <Grid item className={classes.control}>
            {props.childComments.map(comment => (
              <div key={comment.childCommentId}>
                <CommentCard
                  commentId={comment.childCommentId}
                  content={comment.content}
                  createAt={comment.createAt}
                  fromUser={comment.user}
                  toUser={comment.replyUser}
                  postId={props.postId}
                  parentCommentId={props.parentCommentId}
                />
              </div>
            ))}
          </Grid>
          <Grid item>
            {props.childCommentCounts > props.childComments.length ? (
              <Button
                onClick={() => {
                  setOffset(offset + FETCH_CHILD_COMMENTS_LIMIT);
                }}
              >
                <Typography className={classes.button}>
                  返信をもっとみる
                </Typography>
              </Button>
            ) : null}
          </Grid>
        </Grid>
      )}
    </>
  );
};

const useStyles = makeStyles(() => ({
  button: {
    color: THEME_COLOR1,
    fontSize: "13px"
  },
  control: {
    width: "100%"
  }
}));

export default ChildCommentList;