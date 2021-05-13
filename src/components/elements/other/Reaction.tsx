import React, { useState } from "react";

import { useDispatch } from "react-redux";
import { AppDispatch } from "~/store";
import { addLike, removeLike } from "~/store/slice/Domain/post.slice";

import PostComment from "~/components/elements/comment/PostComment";
import { Grid, IconButton, makeStyles } from "@material-ui/core";
import {
  Favorite as FavoriteIcon,
  FavoriteBorderRounded as FavoriteBorderRoundedIcon,
  ChatBubbleOutlineRounded as ChatBubbleOutlineRoundedIcon
} from "@material-ui/icons";
import { useErrorHandle } from "~/utils/useErrorHandle";

export type ReactionProp = {
  postId: string;
  isLikedPost: boolean;
  likeCounts: number;
  commentCounts: number;
  toUser: {
    userId: string;
    accountId: string;
  };
};

const Reaction: React.FC<ReactionProp> = ({
  postId,
  isLikedPost,
  commentCounts,
  likeCounts,
  toUser
}) => {
  const classes = useStyles();
  const dispatch: AppDispatch = useDispatch();
  const [catchUnauthorizedError] = useErrorHandle();

  // component/state
  const [liked, setLiked] = useState(isLikedPost);
  const [favCounts, setFavCounts] = useState(likeCounts);
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [comCounts, setComCounts] = useState(commentCounts);

  /**
   * いいねする/取り消す
   *
   * @param e: React.MouseEvent<HTMLSpanElement, MouseEvent>
   */
  const switchLike = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    e.stopPropagation();
    if (liked) {
      dispatch(removeLike(postId))
        .then(() => {
          setLiked(false);
          setFavCounts(favCounts - 1);
        })
        .catch(e => {
          catchUnauthorizedError(e.message);
        });
    } else {
      dispatch(addLike(postId))
        .then(() => {
          setLiked(true);
          setFavCounts(favCounts + 1);
        })
        .catch(e => {
          catchUnauthorizedError(e.message);
        });
    }
  };

  /**
   * コメント投稿フォームを開く.
   *
   * @param e: React.MouseEvent<HTMLSpanElement, MouseEvent>
   */
  const openCommentDialog = (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ) => {
    e.stopPropagation();
    setIsOpenDialog(true);
  };

  /**
   * 表示コメント数を増やす.
   */
  const incrementCommentCounts = () => {
    setComCounts(comCounts + 1);
  };

  /**
   * いいね数を表示する.
   * 10000以上になった場合に表示を単位kにする.
   */
  const displayFavCounts = () => {
    if (favCounts < 10000) {
      return favCounts;
    } else {
      return Math.floor((favCounts / 10000) * 10) / 10 + "k";
    }
  };

  /**
   * コメント数を表示する.
   * 10000以上になった場合に表示を単位kにする.
   */
  const displayComCounts = () => {
    if (comCounts < 10000) {
      return comCounts;
    } else {
      return Math.floor((comCounts / 10000) * 10) / 10 + "k";
    }
  };

  return (
    <>
      <Grid container justify={"flex-start"} alignItems={"flex-start"}>
        {/*いいね*/}
        <Grid item xs={6} className={classes.reaction}>
          <IconButton onClick={switchLike} className={classes.iconButton}>
            {liked ? (
              <FavoriteIcon color={"secondary"} />
            ) : (
              <FavoriteBorderRoundedIcon />
            )}
            <span className={classes.count}>&nbsp;{displayFavCounts()}</span>
          </IconButton>
        </Grid>

        {/*コメント投稿*/}
        <Grid item xs={6} className={classes.reaction}>
          <IconButton
            onClick={openCommentDialog}
            className={classes.iconButton}
          >
            <ChatBubbleOutlineRoundedIcon />
            <span className={classes.count}>&nbsp;{displayComCounts()}</span>
          </IconButton>
        </Grid>
      </Grid>

      {/*コメント投稿フォーム*/}
      <PostComment
        isOpen={isOpenDialog}
        toUser={toUser}
        postId={postId}
        parentCommentId={null}
        incrementCommentCounts={incrementCommentCounts}
        handleClose={() => setIsOpenDialog(false)}
      />
    </>
  );
};

const useStyles = makeStyles(() => ({
  count: {
    fontSize: "15px"
  },
  iconButton: {
    paddingLeft: 0,
    paddingRight: "1%"
  },
  reaction: {
    textAlign: "left"
  }
}));

export default Reaction;