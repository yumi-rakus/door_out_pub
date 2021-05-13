import React, { useEffect, useState } from "react";

import InfiniteScroller from "react-infinite-scroller";

import SpotPostCard from "~/components/elements/post/SpotPostCard";
import RoadPostCard from "~/components/elements/post/RoadPostCard";
import { SpotPost, RoadPost } from "~/interfaces";
import { makeStyles } from "@material-ui/core";

export type PostListProps = {
  postList: Array<RoadPost | SpotPost>;
  handleLoadMore: () => void;
};

const PostList: React.FC<PostListProps> = ({ postList, handleLoadMore }) => {
  const classes = useStyles();

  // component/state
  const [hasMore] = useState(true);
  const [interval, setInterval] = useState(true);

  useEffect(() => {
    return () => {
      //setTimeout()によるメモリーリークの警告を防ぐため
      setInterval(true);
    };
  }, []);

  /**
   * TypeによってPostCardを選択し、表示する.
   */
  const putPosts = () => {
    if (postList.length > 0) {
      return postList.map(post => {
        // eslint-disable-next-line eqeqeq
        return post.postType == 1 ? (
          <SpotPostCard key={post.postId} spotPost={post} />
        ) : (
          <RoadPostCard key={post.postId} roadPost={post} />
        );
      });
    } else {
      return <div className={classes.emptyMessage}>投稿はありません。</div>;
    }
  };

  return (
    <>
      <InfiniteScroller
        loadMore={() => {
          //無限スクロールによる取得の間隔を2秒に設定
          //間隔を設けないと瞬間的にloadMoreが何度も発火してしまう
          setInterval(false);
          setTimeout(() => setInterval(true), 2000);
          handleLoadMore();
        }}
        hasMore={hasMore && interval}
        initialLoad={false}
      >
        {putPosts()}
      </InfiniteScroller>
    </>
  );
};

const useStyles = makeStyles(() => ({
  emptyMessage: {
    marginTop: "60%",
    color: "grey"
  }
}));

export default PostList;