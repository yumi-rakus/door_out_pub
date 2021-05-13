import React, { useState, useEffect } from "react";

import { AppDispatch } from "~/store";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchSearchUsers,
  selectSearchUsers,
  selectUserSearchOffset,
  setSearchUsersOffset,
  SearchUserForm
} from "~/store/slice/Domain/user.slice";
import {
  fetchPostsBySpotName,
  fetchPostsByTag,
  selectSearchPostsByTag,
  selectSearchPostsByPlace,
  selectTagSearchOffset,
  selectPlaceSearchOffset,
  selectSearchValues,
  selectSearchTabId,
  selectSearchSortId,
  setSearchTabId,
  setTagSearchOffset,
  setPlaceSearchOffset,
  SearchPostForm
} from "~/store/slice/Domain/post.slice";

import Header from "~/components/elements/other/Header";
import SearchPostInputForm from "~/components/search/SearchPostInputForm";
import SwitchTabs, { TabContent } from "~/components/elements/other/SwitchTabs";
import SortOrder from "~/components/elements/other/SortOrder";
import SearchedUserList from "~/components/search/SearchedUserList";
import PostList from "~/components/elements/post/PostList";
import { CircularProgress, makeStyles } from "@material-ui/core";

import { useLocation } from "react-router-dom";

import { useErrorHandle } from "~/utils/useErrorHandle";
import { FETCH_POSTS_LIMIT, FETCH_USERS_LIMIT } from "~/utils/globalVariables";

import { User, SpotPost, RoadPost, Tag } from "~/interfaces";
import { HEADER_HEIGHT } from "~/assets/ExportCSS";

const Search: React.FC = () => {
  const classes = useStyles();
  const dispatch: AppDispatch = useDispatch();
  const location = useLocation<Tag | undefined>();
  const [catchUnauthorizedError] = useErrorHandle();

  // タブに使用するenum
  enum tab {
    SEARCH_USER = 1,
    SEARCH_TAG = 2,
    SEARCH_SPOT = 3
  }

  const tabContents: Array<TabContent> = [
    {
      label: "ユーザー",
      value: tab.SEARCH_USER,
      function: () => dispatch(setSearchTabId(tab.SEARCH_USER))
    },
    {
      label: "タグ",
      value: tab.SEARCH_TAG,
      function: () => dispatch(setSearchTabId(tab.SEARCH_TAG))
    },
    {
      label: "場所",
      value: tab.SEARCH_SPOT,
      function: () => dispatch(setSearchTabId(tab.SEARCH_SPOT))
    }
  ];

  // store/state
  const searchedUsers: Array<User> = useSelector(selectSearchUsers);
  const searchedPostsByTag: Array<SpotPost | RoadPost> = useSelector(
    selectSearchPostsByTag
  );
  const searchedPostsByPlace: Array<SpotPost | RoadPost> = useSelector(
    selectSearchPostsByPlace
  );
  const searchType = useSelector(selectSearchTabId);
  const sortId = useSelector(selectSearchSortId);
  const searchValues = useSelector(selectSearchValues);
  const userSearchOffset = useSelector(selectUserSearchOffset);
  const tagSearchOffset = useSelector(selectTagSearchOffset);
  const placeSearchOffset = useSelector(selectPlaceSearchOffset);

  // component/state
  const [selectedTag, setSelectedTag] = useState<Tag | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (location.state && isMounted) {
      dispatch(setSearchTabId(2));
      setSelectedTag(location.state);
    }
    return () => {
      isMounted = false;
    }; // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * 検索ワードによってユーザー一覧を（さらに）取得する.
   */
  const handleLoadMoreUserList = () => {
    if (
      searchValues.userSearchValue &&
      searchValues.userSearchValue.match(/\S/g)
    ) {
      const form: SearchUserForm = {
        query: searchValues.userSearchValue,
        limit: FETCH_USERS_LIMIT,
        offset: userSearchOffset + FETCH_USERS_LIMIT
      };
      dispatch(
        fetchSearchUsers({ searchUserForm: form, isSet: false })
      ).catch(e => catchUnauthorizedError(e.message));
      //ユーザー検索時のoffset値の更新
      dispatch(setSearchUsersOffset(FETCH_USERS_LIMIT));
    }
  };

  /**
   * 検索ワードによって投稿一覧を（さらに）取得する.
   */
  const handleLoadMorePostList = () => {
    if (
      searchType === 2 &&
      searchValues.tagSearchValue &&
      searchValues.tagSearchValue.tagId &&
      searchValues.tagSearchValue.tagId.match(/\S/g)
    ) {
      const form: SearchPostForm = {
        tagId: searchValues.tagSearchValue.tagId,
        limit: FETCH_POSTS_LIMIT,
        offset: tagSearchOffset + FETCH_POSTS_LIMIT,
        sort: sortId,
        isFolloweePost: false,
        postType: ""
      };
      dispatch(
        fetchPostsByTag({ searchPostForm: form, isSet: false })
      ).catch(e => catchUnauthorizedError(e.message));
      //タグ検索時のoffset値を更新
      dispatch(setTagSearchOffset(FETCH_POSTS_LIMIT));
    } else if (
      searchType === 3 &&
      searchValues.placeSearchValue &&
      searchValues.placeSearchValue.match(/\S/g)
    ) {
      const form: SearchPostForm = {
        spotName: searchValues.placeSearchValue.split(" "), //入力値をスペース区切りで配列化,
        limit: FETCH_POSTS_LIMIT,
        offset: placeSearchOffset + FETCH_POSTS_LIMIT,
        sort: sortId,
        isFolloweePost: false,
        postType: ""
      };
      dispatch(
        fetchPostsBySpotName({ searchPostForm: form, isSet: false })
      ).catch(e => catchUnauthorizedError(e.message));
      //場所名検索時のoffset値を更新
      dispatch(setPlaceSearchOffset(FETCH_POSTS_LIMIT));
    }
  };

  // ---------------------- Header JSX Element ----------------------
  // 並び替え
  const sortOrder = <SortOrder selectedSortId={sortId} type={1} />;

  // 検索フォーム
  const inputForm = (
    <SearchPostInputForm
      searchType={searchType}
      sortId={sortId}
      selectedTag={selectedTag}
      setIsLoading={setIsLoading}
    />
  );

  return (
    <>
      <Header first={1} middle={inputForm} last={sortOrder} />
      <div className={classes.search}>
        <div className={classes.tab}>
          <SwitchTabs tabContents={tabContents} selectedTabVal={searchType} />
        </div>

        <div className={classes.result}>
          {isLoading && <CircularProgress />}
          {!isLoading && searchType === 1 && (
            <SearchedUserList
              userList={searchedUsers}
              handleLoadMore={() => handleLoadMoreUserList()}
            />
          )}
          {!isLoading && (searchType === 2 || searchType === 3) && (
            <PostList
              postList={
                searchType === 2 ? searchedPostsByTag : searchedPostsByPlace
              }
              handleLoadMore={() => handleLoadMorePostList()}
            />
          )}
        </div>
      </div>
    </>
  );
};

const useStyles = makeStyles(() => ({
  search: {
    marginTop: HEADER_HEIGHT
  },
  tab: {
    position: "fixed",
    width: "100%",
    zIndex: 1
  },
  result: {
    paddingTop: "6vh"
  }
}));

export default Search;
