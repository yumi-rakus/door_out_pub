import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "~/store";
import {
  fetchParentComments,
  selectParentComments
} from "~/store/slice/Domain/comment.slice";

import CommentCard from "~/components/postDetail/CommentCard";
import ChildCommentList from "~/components/postDetail/ChildCommentList";
import {
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  makeStyles,
  Typography,
  CircularProgress
} from "@material-ui/core";
import { ExpandMore } from "@material-ui/icons";

import { useSnackbar } from "notistack";
import InfiniteScroller from "react-infinite-scroller";

import { FETCH_PARENT_COMMENTS_LIMIT } from "~/utils/globalVariables";
import { useErrorHandle } from "~/utils/useErrorHandle";

type Props = {
  postId: string;
  postedUser: {
    userId: string;
    accountId: string;
  };
  upperLimit: number;
};

const ParentCommentList: React.FC<Props> = props => {
  const classes = useStyles();
  const dispatch: AppDispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [catchUnauthorizedError] = useErrorHandle();

  // store/state
  const parentComments = useSelector(selectParentComments);

  // component/state
  const [parentCommentsOffset, setParentCommentsOffset] = useState(0);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    dispatch(
      fetchParentComments({
        postId: props.postId,
        limit: FETCH_PARENT_COMMENTS_LIMIT,
        offset: parentCommentsOffset
      })
    ).catch(e => {
      catchUnauthorizedError(e.message);
      enqueueSnackbar("コメントの取得に失敗しました。", { variant: "error" });
    });
  }, [
    catchUnauthorizedError,
    dispatch,
    enqueueSnackbar,
    parentCommentsOffset,
    props.postId
  ]);

  useEffect(() => {
    setIsFetching(false);
  }, [parentComments]);

  return (
    <>
      {parentComments ? (
        <InfiniteScroller
          loadMore={() => {
            setIsFetching(true);
            setParentCommentsOffset(
              parentCommentsOffset + FETCH_PARENT_COMMENTS_LIMIT
            );
          }}
          hasMore={
            !isFetching &&
            parentComments.length !== 0 &&
            parentComments.length < props.upperLimit
          }
        >
          {parentComments.map(comment => (
            <div key={comment.parentCommentId}>
              {/*親コメント*/}
              <CommentCard
                commentId={comment.parentCommentId}
                content={comment.content}
                createAt={comment.createAt}
                fromUser={comment.user}
                toUser={props.postedUser}
                postId={props.postId}
                parentCommentId={null}
              />

              {/*子コメントがある場合Accordionを表示*/}
              {comment.childCommentCounts !== 0 ? (
                <Accordion
                  elevation={0}
                  classes={{
                    root: classes.MuiAccordionRoot
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography className={classes.reply}>
                      返信をみる({comment.childCommentCounts}件)
                    </Typography>
                  </AccordionSummary>

                  {/*子コメント一覧*/}
                  <AccordionDetails>
                    <ChildCommentList
                      childComments={comment.childComments}
                      childCommentCounts={comment.childCommentCounts}
                      parentCommentId={comment.parentCommentId}
                      postId={props.postId}
                    />
                  </AccordionDetails>
                </Accordion>
              ) : null}
              <Divider orientation={"horizontal"} />
            </div>
          ))}
        </InfiniteScroller>
      ) : (
        <CircularProgress />
      )}
    </>
  );
};

const useStyles = makeStyles(() => ({
  MuiAccordionRoot: {
    "&.MuiAccordion-root:before": {
      backgroundColor: "white"
    }
  },
  reply: {
    color: "grey",
    fontSize: "10px",
    textAlign: "right",
    width: "100%"
  }
}));

export default ParentCommentList;