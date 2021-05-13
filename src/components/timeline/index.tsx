import React, { useEffect, useState } from "react";

import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "~/store";
import { selectLoginUser, fetchLoginUser } from "~/store/slice/App/auth.slice";
import {
  selectRangePosts,
  fetchRangePosts,
  selectPostIds,
  selectSpotPostIds,
  selectTimelineSortId,
  selectTimelineOffset,
  selectRoadPostIds,
  setSpotPostIds,
  setRoadPostIds,
  selectTimelineTopTabId,
  selectTimelineBottomTabId,
  SearchPostForm,
  setTimelineTopTabId,
  setTimelineBottomTabId,
  setTimelineOffset,
  selectTimelinePlaceName,
  cleanRangePosts
} from "~/store/slice/Domain/post.slice";

import PostList from "~/components/elements/post/PostList";
import SwitchTabs, { TabContent } from "~/components/elements/other/SwitchTabs";
import SortOrder from "~/components/elements/other/SortOrder";
import Header from "~/components/elements/other/Header";
import { makeStyles, CircularProgress } from "@material-ui/core";

import { useLocation, useHistory } from "react-router-dom";
import { Path } from "~/router/routes";

import { useErrorHandle } from "~/utils/useErrorHandle";
import { FETCH_POSTS_LIMIT } from "~/utils/globalVariables";

import { HEADER_HEIGHT } from "~/assets/ExportCSS";

const Timeline: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const history = useHistory();
  const location = useLocation<{ needFetch: boolean }>();
  const classes = timelineStyle();

  // store/state
  const loginUser = useSelector(selectLoginUser);
  const rangePost = useSelector(selectRangePosts);
  const postIds = useSelector(selectPostIds);
  const storeSpotPostIds = useSelector(selectSpotPostIds);
  const storeRoadPostIds = useSelector(selectRoadPostIds);
  const topTabId = useSelector(selectTimelineTopTabId);
  const placeName = useSelector(selectTimelinePlaceName);
  const offset = useSelector(selectTimelineOffset);
  const bottomTabId = useSelector(selectTimelineBottomTabId);
  const sortId = useSelector(selectTimelineSortId);

  // component/state
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [catchUnauthorizedError] = useErrorHandle();

  // enum
  // (topTabのvalue)
  enum postListType {
    followUserPosts = 1,
    mapRangePosts = 2
  }

  // (bottomTabのvalue)
  enum postType {
    spotPost = 1,
    allPost = 2,
    roadPost = 3
  }

  const topTabContents: Array<TabContent> = [
    {
      label: "フォロー中のユーザー",
      value: postListType.followUserPosts,
      function: () =>
        dispatch(setTimelineTopTabId(postListType.followUserPosts))
    },
    {
      label: postIds.length > 0 ? placeName + "周辺" : "Map画面で場所を選択",
      value: postListType.mapRangePosts,
      function:
        postIds.length > 0
          ? () => dispatch(setTimelineTopTabId(postListType.mapRangePosts))
          : () => history.push({ pathname: Path.map })
    }
  ];

  const bottomTabContents: Array<TabContent> = [
    {
      label: "地点の投稿",
      value: postType.spotPost,
      function: () => dispatch(setTimelineBottomTabId(postType.spotPost))
    },
    {
      label: "すべての投稿",
      value: postType.allPost,
      function: () => dispatch(setTimelineBottomTabId(postType.allPost))
    },
    {
      label: "経路の投稿",
      value: postType.roadPost,
      function: () => dispatch(setTimelineBottomTabId(postType.roadPost))
    }
  ];

  useEffect(() => {
    //Map画面からinfoWindowの「投稿を見る」を押下して遷移してきた場合のみ、if文内の処理が実行される
    if (postIds.length > 0 && location?.state?.needFetch === true) {
      setIsLoading(true);
      const searchForm: SearchPostForm = {
        limit: FETCH_POSTS_LIMIT,
        offset: 0,
        sort: sortId,
        postId: postIds.map(id => id.postId),
        isFolloweePost: false,
        postType: ""
      };
      dispatch(fetchRangePosts({ form: searchForm, isSet: true }))
        .then(() => setIsLoading(false))
        .catch(e => {
          catchUnauthorizedError(e.message);
          setIsLoading(true);
        });
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postIds]);

  useEffect(() => {
    if (!loginUser) {
      dispatch(fetchLoginUser()).catch(e => {
        catchUnauthorizedError(e.message);
      });
    } else if (
      loginUser &&
      postIds.length === 0 &&
      rangePost.length === 0 &&
      loginUser?.followeeCounts &&
      loginUser.followeeCounts > 0
    ) {
      setIsLoading(true);
      const searchForm: SearchPostForm = {
        limit: FETCH_POSTS_LIMIT,
        offset: 0,
        sort: sortId,
        postId: [],
        isFolloweePost: true,
        postType: ""
      };
      dispatch(fetchRangePosts({ form: searchForm, isSet: true }))
        .then(() => setIsLoading(false))
        .catch(e => {
          catchUnauthorizedError(e.message);
          setIsLoading(false);
        });
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginUser]);

  const searchFormTemplate: SearchPostForm = {
    limit: FETCH_POSTS_LIMIT,
    offset: 0,
    sort: sortId,
    postId: [],
    isFolloweePost: false,
    postType: ""
  };

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
    } else {
      setIsLoading(true);
      if (
        topTabId === postListType.followUserPosts &&
        bottomTabId === postType.spotPost
      ) {
        const searchForm: SearchPostForm = {
          ...searchFormTemplate,
          isFolloweePost: true,
          postType: "1"
        };
        dispatch(fetchRangePosts({ form: searchForm, isSet: true }))
          .then(() => setIsLoading(false))
          .catch(e => catchUnauthorizedError(e.message));
      } else if (
        topTabId === postListType.followUserPosts &&
        bottomTabId === postType.allPost
      ) {
        const searchForm: SearchPostForm = {
          ...searchFormTemplate,
          isFolloweePost: true,
          postType: ""
        };
        dispatch(fetchRangePosts({ form: searchForm, isSet: true }))
          .then(() => setIsLoading(false))
          .catch(e => catchUnauthorizedError(e.message));
      } else if (
        topTabId === postListType.followUserPosts &&
        bottomTabId === postType.roadPost
      ) {
        const searchForm: SearchPostForm = {
          ...searchFormTemplate,
          isFolloweePost: true,
          postType: "2"
        };
        dispatch(fetchRangePosts({ form: searchForm, isSet: true }))
          .then(() => setIsLoading(false))
          .catch(e => catchUnauthorizedError(e.message));
      } else if (
        topTabId === postListType.mapRangePosts &&
        bottomTabId === postType.spotPost
      ) {
        //roadIndexがnullの投稿(地点投稿)のpostIdを抽出
        const spotPostIds: Array<string> = postIds
          .filter(postId => postId.roadIndex === null)
          .map(filteredPostId => filteredPostId.postId);
        const searchForm: SearchPostForm = {
          ...searchFormTemplate,
          postId: spotPostIds
        };
        storeSpotPostIds.length === 0 && dispatch(setSpotPostIds(spotPostIds));
        dispatch(fetchRangePosts({ form: searchForm, isSet: true }))
          .then(() => setIsLoading(false))
          .catch(e => {
            dispatch(cleanRangePosts());
            setIsLoading(false);
            catchUnauthorizedError(e.message);
          });
      } else if (
        topTabId === postListType.mapRangePosts &&
        bottomTabId === postType.allPost
      ) {
        const searchForm: SearchPostForm = {
          ...searchFormTemplate,
          postId: postIds.map(post => post.postId)
        };
        dispatch(fetchRangePosts({ form: searchForm, isSet: true }))
          .then(() => setIsLoading(false))
          .catch(e => catchUnauthorizedError(e.message));
      } else if (
        topTabId === postListType.mapRangePosts &&
        bottomTabId === postType.roadPost
      ) {
        //roadIndexが0の投稿(経路投稿)のpostIdを抽出
        const roadPostIds: Array<string> = postIds
          .filter(postId => postId.roadIndex === 0)
          .map(filteredPostId => filteredPostId.postId);

        const searchForm: SearchPostForm = {
          ...searchFormTemplate,
          postId: roadPostIds
        };
        storeRoadPostIds.length === 0 && dispatch(setRoadPostIds(roadPostIds));
        dispatch(fetchRangePosts({ form: searchForm, isSet: true }))
          .then(() => setIsLoading(false))
          .catch(e => {
            dispatch(cleanRangePosts());
            setIsLoading(false);
            catchUnauthorizedError(e.message);
          });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topTabId, bottomTabId, sortId]);

  const handleLoadMore = () => {
    if (
      topTabId === postListType.followUserPosts &&
      bottomTabId === postType.spotPost
    ) {
      const form: SearchPostForm = {
        ...searchFormTemplate,
        isFolloweePost: true,
        postType: "1",
        offset: offset + FETCH_POSTS_LIMIT
      };
      dispatch(setTimelineOffset(offset + FETCH_POSTS_LIMIT));
      dispatch(fetchRangePosts({ form: form, isSet: false })).catch(e =>
        catchUnauthorizedError(e.message)
      );
    } else if (
      topTabId === postListType.followUserPosts &&
      bottomTabId === postType.allPost
    ) {
      const form: SearchPostForm = {
        ...searchFormTemplate,
        isFolloweePost: true,
        offset: offset + FETCH_POSTS_LIMIT
      };
      dispatch(setTimelineOffset(offset + FETCH_POSTS_LIMIT));
      dispatch(fetchRangePosts({ form: form, isSet: false })).catch(e =>
        catchUnauthorizedError(e.message)
      );
    } else if (
      topTabId === postListType.followUserPosts &&
      bottomTabId === postType.roadPost
    ) {
      const form: SearchPostForm = {
        ...searchFormTemplate,
        isFolloweePost: true,
        postType: "2",
        offset: offset + FETCH_POSTS_LIMIT
      };
      dispatch(setTimelineOffset(offset + FETCH_POSTS_LIMIT));
      dispatch(fetchRangePosts({ form: form, isSet: false })).catch(e =>
        catchUnauthorizedError(e.message)
      );
    } else if (
      topTabId === postListType.mapRangePosts &&
      bottomTabId === postType.allPost
    ) {
      const form: SearchPostForm = {
        ...searchFormTemplate,
        isFolloweePost: false,
        offset: offset + FETCH_POSTS_LIMIT,
        postId: postIds.map(postId => postId.postId)
      };
      dispatch(setTimelineOffset(offset + FETCH_POSTS_LIMIT));
      dispatch(fetchRangePosts({ form: form, isSet: false })).catch(e =>
        catchUnauthorizedError(e.message)
      );
    } else if (
      topTabId === postListType.mapRangePosts &&
      bottomTabId === postType.spotPost
    ) {
      const form: SearchPostForm = {
        ...searchFormTemplate,
        isFolloweePost: false,
        offset: offset + FETCH_POSTS_LIMIT,
        postId: storeSpotPostIds
      };
      dispatch(setTimelineOffset(offset + FETCH_POSTS_LIMIT));
      dispatch(fetchRangePosts({ form: form, isSet: false })).catch(e =>
        catchUnauthorizedError(e.message)
      );
    } else if (
      topTabId === postListType.mapRangePosts &&
      bottomTabId === postType.roadPost
    ) {
      const form: SearchPostForm = {
        ...searchFormTemplate,
        isFolloweePost: false,
        offset: offset + FETCH_POSTS_LIMIT,
        postId: storeRoadPostIds
      };
      dispatch(setTimelineOffset(offset + FETCH_POSTS_LIMIT));
      dispatch(fetchRangePosts({ form: form, isSet: false })).catch(e =>
        catchUnauthorizedError(e.message)
      );
    }
  };

  const sortOrder = <SortOrder selectedSortId={sortId} type={2} />;

  return (
    <>
      <Header first={1} middle={1} last={sortOrder} />
      <div className={classes.timelineContainer}>
        <div className={classes.topTab}>
          <SwitchTabs tabContents={topTabContents} selectedTabVal={topTabId} />
          <SwitchTabs
            tabContents={bottomTabContents}
            selectedTabVal={bottomTabId}
          />
        </div>

        {isLoading ? (
          <CircularProgress className={classes.circularProgress} />
        ) : (
          <div className={classes.postList}>
            <PostList
              postList={rangePost}
              handleLoadMore={() => handleLoadMore()}
            />
          </div>
        )}
      </div>
    </>
  );
};

const timelineStyle = makeStyles(() => ({
  timelineContainer: {
    marginTop: HEADER_HEIGHT
  },
  topTab: {
    position: "fixed",
    width: "100%",
    zIndex: 1
  },
  postList: {
    width: "100%",
    paddingTop: "10vh"
  },
  circularProgress: {
    marginTop: "35%"
  }
}));

export default Timeline;