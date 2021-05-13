import React, { useState } from "react";

import { useDispatch } from "react-redux";
import { AppDispatch } from "~/store";
import { addLike, removeLike } from "~/store/slice/Domain/post.slice";

import PostComment from "~/components/elements/comment/PostComment";
import UserList from "~/components/elements/user/UserList";
import { Grid, IconButton, makeStyles } from "@material-ui/core";
import {
  ChatBubbleOutlineRounded,
  Favorite,
  FavoriteBorderRounded
} from "@material-ui/icons";

import { useErrorHandle } from "~/utils/useErrorHandle";

type Props = {
  postId: string;
  isLikedPost: boolean;
  likeCounts: number;
  toUser: {
    userId: string;
    accountId: string;
  };
};

const PostDetailReaction: React.FC<Props> = props => {
  const classes = useStyles();
  const dispatch: AppDispatch = useDispatch();
  const [catchUnauthorizedError] = useErrorHandle();

  // component/state
  const [isLiked, setIsLiked] = useState(props.isLikedPost);
  const [isOpenedCommentForm, setIsOpenedCommentForm] = useState(false);
  const [isOpenedUsersLikedInPost, setIsOpenedUsersLikedInPost] = useState(
    false
  );
  const [likeCounts, setLikeCounts] = useState(props.likeCounts);

  /**
   * いいねする / いいねを外す
   *
   * @param postId: 投稿ID
   */
  const handleClickFavoriteBtn = (postId: string) => {
    if (isLiked) {
      dispatch(removeLike(postId))
        .then(() => {
          setIsLiked(!isLiked);
          setLikeCounts(likeCounts - 1);
        })
        .catch(e => {
          catchUnauthorizedError(e.message);
        });
    } else {
      dispatch(addLike(postId))
        .then(() => {
          setIsLiked(!isLiked);
          setLikeCounts(likeCounts + 1);
        })
        .catch(e => {
          catchUnauthorizedError(e.message);
        });
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
  const handleCloseCommentForm = () => {
    setIsOpenedCommentForm(false);
  };

  const handleClickPostLikedCounts = () => {
    setIsOpenedUsersLikedInPost(true);
  };

  /**
   * 投稿にいいねしているユーザー一覧ダイアログを閉じる.
   */
  const handleClosePostLikedUsers = () => {
    setIsOpenedUsersLikedInPost(false);
  };

  return (
    <div>
      <Grid
        container
        justify={"flex-start"}
        alignItems={"center"}
        className={classes.reaction}
      >
        <Grid item>
          <IconButton
            onClick={() => {
              handleClickFavoriteBtn(props.postId);
            }}
          >
            {isLiked ? (
              <Favorite color={"secondary"} />
            ) : (
              <FavoriteBorderRounded />
            )}
          </IconButton>
        </Grid>
        <Grid item>
          <IconButton onClick={handleClickCommentBtn}>
            <ChatBubbleOutlineRounded />
          </IconButton>
        </Grid>

        <Grid item className={classes.gridItem}>
          <Grid container justify={"flex-end"} alignItems={"center"}>
            <Grid
              item
              className={classes.likeCounts}
              onClick={handleClickPostLikedCounts}
            >
              {likeCounts}件のいいね
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <PostComment
        isOpen={isOpenedCommentForm}
        handleClose={handleCloseCommentForm}
        toUser={props.toUser}
        postId={props.postId}
        parentCommentId={null}
      />
      <UserList
        userType={{ type: 3, postId: props.postId }}
        upperLimit={likeCounts}
        handleClose={handleClosePostLikedUsers}
        isOpen={isOpenedUsersLikedInPost}
      />
    </div>
  );
};

const useStyles = makeStyles(() => ({
  reaction: {
    display: "flex"
  },
  gridItem: {
    flex: 1
  },
  likeCounts: {
    color: "grey",
    textAlign: "right"
  }
}));

export default PostDetailReaction;