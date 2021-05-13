import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import qs from "qs";

import { RootState } from "~/store";
import Axios from "~/store/api";
import { PostCoordinate, RoadPost, SpotPost, Tag } from "~/interfaces";

export type RangeParam = {
  limit: number;
  offset: number;
  topRightLatitude: number;
  topRightLongitude: number;
  bottomLeftLatitude: number;
  bottomLeftLongitude: number;
};
export type SpotForm = {
  postType: string;
  content: string;
  spotName: string;
  canPostForcibly: boolean;
  tags: Array<Tag>;
  spotCoordinate: { latitude: number; longitude: number };
  base64Images: Array<string>;
};

export type RoadForm = {
  content: string;
  roadStartSpotName: string;
  roadEndSpotName: string;
  canPostForcibly: boolean;
  tags: Array<Tag>;
  base64Images: Array<string>;
};

export type SearchPostForm = {
  limit: number;
  offset: number;
  sort: number;
  postId?: Array<string>;
  tagId?: string;
  spotName?: Array<string>;
  isFolloweePost: boolean;
  postType: "1" | "2" | "";
};

export type Coordinate = {
  lat: number;
  lng: number;
};

type PostState = {
  userPosts: Array<SpotPost | RoadPost> | null;
  likePosts: Array<SpotPost | RoadPost> | null;
  userPostsOffset: number;
  likePostsOffset: number;
  postCoordinates: Array<PostCoordinate>;
  postIds: Array<{ postId: string; roadIndex: null | 0 }>;
  spotPostIds: Array<string>;
  roadPostIds: Array<string>;
  timelinePlaceName: string;
  timelineOffset: number;
  timelineTopTabId: number;
  timelineBottomTabId: number;
  timelineSortId: number;
  searchPostsByTag: Array<SpotPost | RoadPost>;
  searchPostsByPlace: Array<SpotPost | RoadPost>;
  postDetail: SpotPost | RoadPost | null;
  rangePosts: Array<SpotPost | RoadPost>;
  tagSearchOffset: number;
  placeSearchOffset: number;
  tagSearchLoadMore: boolean;
  placeSearchLoadMore: boolean;
  inputValues: {
    userInputValue: string;
    tagInputValue: Tag | null;
    placeInputValue: string;
  };
  searchValues: {
    userSearchValue: string;
    tagSearchValue: Tag | null;
    placeSearchValue: string;
  };
  searchTabId: number;
  searchSortId: number;
};

const initialPostState: PostState = {
  userPosts: null,
  likePosts: null,
  userPostsOffset: 0,
  likePostsOffset: 0,
  postCoordinates: [],
  postIds: [],
  spotPostIds: [],
  roadPostIds: [],
  timelinePlaceName: "",
  timelineOffset: 0,
  timelineTopTabId: 1,
  timelineBottomTabId: 2,
  timelineSortId: 1,
  searchPostsByTag: [],
  searchPostsByPlace: [],
  postDetail: null,
  rangePosts: [],
  tagSearchOffset: 0,
  placeSearchOffset: 0,
  tagSearchLoadMore: true,
  placeSearchLoadMore: true,
  inputValues: {
    userInputValue: "",
    tagInputValue: {
      tagId: "",
      tagName: ""
    },
    placeInputValue: ""
  },
  searchValues: {
    userSearchValue: "",
    tagSearchValue: {
      tagId: "",
      tagName: ""
    },
    placeSearchValue: ""
  },
  searchTabId: 1,
  searchSortId: 1
};

/**
 * 地図画面でクラスター・フラグを表示するための投稿の座標情報を取得するAPIを呼び出す。
 * 成功時postSliceにて、stateのpostCoordinatesにsetされる。
 * 失敗時　エラー画面遷移
 * @return postCoordinates: Array<PostCoordinate>
 */
export const fetchPostCoordinates = createAsyncThunk(
  "post/fetchPostCoordinates",
  async (rangeParam: RangeParam) => {
    try {
      const { data } = await Axios.get("/post_coordinate/", {
        method: "GET",
        params: rangeParam,
        headers: {
          Authorization: localStorage.getItem("Authorization")
        }
      });
      return data;
    } catch (e) {
      throw new Error(e.response.status);
    }
  }
);

/**
 * 投稿一覧画面にて、範囲で指定した投稿を取得するAPIを呼び出す。
 * 成功時postSliceにて、stateのrangePostsにsetされる。
 * 失敗時　エラー画面遷移
 * @return rangePosts: Array<SpotPost | RoadPost>
 */
export const fetchRangePosts = createAsyncThunk(
  "post/fetchRangePosts",
  async (arg: { form: SearchPostForm; isSet: boolean }) => {
    try {
      const { data } = await Axios.get("/post/", {
        method: "GET",
        params: arg.form,
        paramsSerializer: params => {
          return qs.stringify(params, { arrayFormat: "repeat" });
        },
        headers: {
          Authorization: localStorage.getItem("Authorization")
        }
      });
      return { data: data, isSet: arg.isSet };
    } catch (e) {
      throw new Error(e.response.status);
    }
  }
);

/**
 * ユーザー画面にて、特定のユーザーの投稿一覧を取得するAPIを呼び出す。
 * 成功時postSliceにて、stateのuserPostsにsetされる。
 * 失敗時　エラー画面遷移
 * @return userPosts: Array<SpotPost | RoadPost>
 */
export const fetchUserPosts = createAsyncThunk(
  "post/fetchUserPosts",
  async (arg: { userId: string; offset: number; limit: number }) => {
    try {
      const { data } = await Axios.get(`/user/${arg.userId}/post`, {
        method: "GET",
        params: {
          offset: arg.offset,
          limit: arg.limit
        },
        headers: {
          Authorization: localStorage.getItem("Authorization")
        }
      });
      return data;
    } catch (e) {
      throw new Error(e.response.status);
    }
  }
);

/**
 * ユーザー画面にて、特定のユーザーのいいねした投稿を取得するAPIを呼び出す。
 * 成功時postSliceにて、stateのlikePostsにsetされる。
 * 失敗時　エラー画面遷移
 * @return likePosts: Array<SpotPost | RoadPost>
 */
export const fetchLikePosts = createAsyncThunk(
  "post/fetchLikePosts",
  async (arg: { userId: string; offset: number; limit: number }) => {
    try {
      const { data } = await Axios.get(`/user/${arg.userId}/liked-post`, {
        method: "GET",
        params: {
          offset: arg.offset,
          limit: arg.limit
        },
        headers: {
          Authorization: localStorage.getItem("Authorization")
        }
      });
      return data;
    } catch (e) {
      throw new Error(e.response.status);
    }
  }
);

/**
 * 検索画面にて、指定したタグが含まれる投稿を取得するAPIを呼び出す。
 * 成功時postSliceにて、stateのsearchPostsにsetされる。
 * 失敗時　エラー画面遷移
 * return searchPosts: Array<SpotPost | RoadPost>
 */
export const fetchPostsByTag = createAsyncThunk(
  "post/fetchPostsByTag",
  async (arg: { searchPostForm: SearchPostForm; isSet: boolean }) => {
    try {
      const { data } = await Axios.get(`/post/`, {
        method: "GET",
        params: arg.searchPostForm,
        headers: {
          Authorization: localStorage.getItem("Authorization")
        }
      });
      return { data: data, isSet: arg.isSet };
    } catch (e) {
      throw new Error(e.response.status);
    }
  }
);

/**
 * 検索画面にて、指定したスポットで投稿された投稿を取得するAPIを呼び出す。
 * 成功時postSliceにて、stateのsearchPostsにsetされる。
 * 失敗時　エラー画面遷移
 * @return searchPosts: Array<SpotPost | RoadPost>
 */
export const fetchPostsBySpotName = createAsyncThunk(
  "post/fetchPostsBySpotName",
  async (arg: { searchPostForm: SearchPostForm; isSet: boolean }) => {
    try {
      const { data } = await Axios.get(`/post/`, {
        method: "GET",
        params: arg.searchPostForm,
        paramsSerializer: params => {
          return qs.stringify(params, { arrayFormat: "repeat" });
        },
        headers: {
          Authorization: localStorage.getItem("Authorization")
        }
      });
      return { data: data, isSet: arg.isSet };
    } catch (e) {
      throw new Error(e.response.status);
    }
  }
);

/**
 * 投稿詳細画面にて、postIdで指定した投稿の詳細を取得するAPIを呼び出す。
 * 成功時postSliceにて、stateのpostDetailにsetされる。
 * 失敗時　エラー画面遷移
 * @return postDetail: SpotPost | RoadPost
 */
export const fetchPostDetail = createAsyncThunk(
  "post/fetchPostDetail",
  async (postId: string) => {
    try {
      const { data } = await Axios.get(`/post/${postId}`, {
        method: "GET",
        headers: {
          Authorization: localStorage.getItem("Authorization")
        }
      });
      return data;
    } catch (e) {
      throw new Error(e.response.status);
    }
  }
);

/**
 * 投稿画面にて、地点投稿を投稿するAPIを呼び出す。
 * 成功時サーバーから、保存した投稿が送られる。(それをどうするかは未定)
 * 失敗時　エラー画面遷移
 */
export const postSpot = createAsyncThunk(
  "post/postSpot",
  async (spotForm: SpotForm) => {
    try {
      const { data } = await Axios.post(`/post/`, spotForm, {
        method: "POST",
        headers: {
          Authorization: localStorage.getItem("Authorization")
        }
      });
      return data;
    } catch (e) {
      throw new Error(e.response.status);
    }
  }
);

/**
 * 投稿画面にて、経路投稿スタートした際にサーバに送るAPIを呼び出す。
 * 成功時 APIがまだ完成していないので未定。
 * 失敗時　エラー画面遷移
 */
export const startRecordRoad = createAsyncThunk(
  "post/startRecordRoad",
  async () => {
    try {
      const { data } = await Axios.post(
        `/post/`,
        { postType: "2" },
        {
          method: "POST",
          headers: {
            Authorization: localStorage.getItem("Authorization")
          }
        }
      );
      localStorage.setItem("postId", data.postId);
      return data;
    } catch (e) {
      throw new Error(e.response.status);
    }
  }
);

/**
 * 経路記録で座標を追加するAPIを呼び出す。
 * 成功時 未定
 * 失敗時 未定
 */
export const setCoordinate = createAsyncThunk(
  "post/setCoordinate",
  async (arg: {
    postId: string;
    latitude: number;
    longitude: number;
    roadIndex: number;
  }) => {
    try {
      const { data } = await Axios.post(`/post_coordinate/`, arg, {
        method: "POST",
        headers: {
          Authorization: localStorage.getItem("Authorization")
        }
      });
      return data;
    } catch (e) {
      throw new Error(e.response.status);
    }
  }
);

/**
 * 投稿画面にて、経路投稿を投稿するAPIを呼び出す。
 * 成功時 APIがまだ完成していないので未定。
 * 失敗時　エラー画面遷移
 * @return
 */
export const postRoad = createAsyncThunk(
  "post/postRoad",
  async (arg: { postId: string; roadForm: RoadForm }) => {
    try {
      const { data } = await Axios.put(`/post/${arg.postId}`, arg.roadForm, {
        method: "PUT",
        headers: {
          Authorization: localStorage.getItem("Authorization")
        }
      });
      return data;
    } catch (e) {
      throw new Error(e.response.status);
    }
  }
);

/**
 * 投稿詳細画面にて、自身の投稿を削除するAPIを呼び出す。
 * 成功時
 * 失敗時　エラー画面遷移
 */
export const deletePost = createAsyncThunk(
  "post/deletePost",
  async (postId: string) => {
    try {
      const { data } = await Axios.delete(`/post/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: localStorage.getItem("Authorization")
        }
      });
      return data;
    } catch (e) {
      throw new Error(e.response.status);
    }
  }
);

/**
 * 投稿に対していいねを送るAPIを呼び出す。
 * 成功時
 * 失敗時　エラー画面遷移
 */
export const addLike = createAsyncThunk(
  "post/addLike",
  async (postId: string) => {
    try {
      const { data } = await Axios.post(
        `/post/${postId}/like`,
        {},
        {
          method: "POST",
          headers: {
            Authorization: localStorage.getItem("Authorization")
          }
        }
      );
      return data;
    } catch (e) {
      throw new Error(e.response.status);
    }
  }
);

/**
 * 投稿に対する自身のいいねを取消すAPIを呼び出す。
 * 成功時
 * 失敗時　エラー画面遷移
 */
export const removeLike = createAsyncThunk(
  "post/removeLike",
  async (postId: string) => {
    try {
      const { data } = await Axios.delete(`/post/${postId}/like`, {
        method: "DELETE",
        headers: {
          Authorization: localStorage.getItem("Authorization")
        }
      });
      return data;
    } catch (e) {
      throw new Error(e.response.status);
    }
  }
);

export const postSlice = createSlice({
  name: "post",
  initialState: initialPostState,
  reducers: {
    setPostCoordinate: (state: PostState, action) => {
      state.postCoordinates = action.payload;
    },
    setPostIds: (state: PostState, action) => {
      state.postIds = action.payload;
      state.spotPostIds = [];
      state.roadPostIds = [];
    },
    setSpotPostIds: (state: PostState, action) => {
      state.spotPostIds = action.payload;
    },
    setRoadPostIds: (state: PostState, action) => {
      state.roadPostIds = action.payload;
    },
    setTimelinePlaceName: (state: PostState, action) => {
      state.timelinePlaceName = action.payload;
    },
    setTimelineOffset: (state: PostState, action) => {
      state.timelineOffset = action.payload;
    },
    setTimelineTopTabId: (state: PostState, action) => {
      state.timelineTopTabId = action.payload;
    },
    setTimelineBottomTabId: (state: PostState, action) => {
      state.timelineBottomTabId = action.payload;
    },
    setTimelineSortId: (state: PostState, action) => {
      state.timelineSortId = action.payload;
    },
    setRangePosts: (state: PostState, action) => {
      state.timelineOffset = 0;
      state.rangePosts = action.payload;
    },
    addRangePosts: (state: PostState, action) => {
      const rangePostIds: Array<string> = state.rangePosts.map(
        rangePost => rangePost.postId
      );
      //state.rangePosts配列に同一のpostIdがない(false)場合pushする。(重複除外)
      action.payload.forEach(
        (post: SpotPost | RoadPost) =>
          rangePostIds.includes(post.postId) || state.rangePosts.push(post)
      );
    },
    cleanRangePosts: (state: PostState) => {
      state.timelineOffset = 0;
      state.rangePosts = [];
    },
    setUserPosts: (state: PostState, action) => {
      if (state.userPosts) {
        // 新しく取得した投稿
        const list = action.payload as Array<SpotPost | RoadPost>;

        // state.userPostsと新しく取得した投稿をマージ
        const data = [...state.userPosts, ...list];

        // 重複削除した配列を取得, set
        state.userPosts = data.filter(
          (element, index, self) =>
            self.findIndex(
              dataElement => dataElement.postId === element.postId
            ) === index
        );
      } else {
        state.userPosts = action.payload;
      }
    },
    setLikePosts: (state: PostState, action) => {
      if (state.likePosts) {
        // 新しく取得した投稿
        const list = action.payload as Array<SpotPost | RoadPost>;

        // state.userPostsと新しく取得した投稿をマージ
        const data = [...state.likePosts, ...list];

        // 重複削除した配列を取得, set
        state.likePosts = data.filter(
          (element, index, self) =>
            self.findIndex(
              dataElement => dataElement.postId === element.postId
            ) === index
        );
      } else {
        state.likePosts = action.payload;
      }
    },
    resetUserPosts: (state: PostState) => {
      state.userPosts = null;
      state.userPostsOffset = 0;
    },
    resetLikePosts: (state: PostState) => {
      state.likePosts = null;
      state.likePostsOffset = 0;
    },
    setUserPostsOffsetIncrement: (state: PostState) => {
      state.userPostsOffset += 10;
    },
    setLikePostsOffsetIncrement: (state: PostState) => {
      state.likePostsOffset += 10;
    },
    setSearchPostByTag: (state: PostState, action) => {
      state.searchPostsByTag = action.payload;
      state.tagSearchOffset = 0;
      state.tagSearchLoadMore = true;
    },
    addSearchPostByTag: (state: PostState, action) => {
      const postIds: Array<string> = state.searchPostsByTag.map(
        post => post.postId
      );
      action.payload.forEach(
        (post: SpotPost | RoadPost) =>
          postIds.includes(post.postId) || state.searchPostsByTag.push(post)
      );
    },
    resetSearchPostByTag: (state: PostState) => {
      state.searchPostsByTag = [];
      state.inputValues.tagInputValue = null;
      state.tagSearchOffset = 0;
    },
    setSearchPostByPlace: (state: PostState, action) => {
      state.searchPostsByPlace = action.payload;
      state.placeSearchOffset = 0;
      state.placeSearchLoadMore = true;
    },
    addSearchPostByPlace: (state: PostState, action) => {
      const postIds: Array<string> = state.searchPostsByPlace.map(
        post => post.postId
      );
      action.payload.forEach(
        (post: SpotPost | RoadPost) =>
          postIds.includes(post.postId) || state.searchPostsByPlace.push(post)
      );
    },
    resetSearchPostByPlace: (state: PostState) => {
      state.searchPostsByPlace = [];

      state.placeSearchOffset = 0;
    },
    setPostDetail: (state: PostState, action) => {
      state.postDetail = action.payload;
    },
    resetPostDetail: (state: PostState) => {
      state.postDetail = null;
    },
    decrementCommentCountsOfPostDetail: (state: PostState) => {
      if (state.postDetail) {
        state.postDetail.commentCounts -= 1;
      }
    },
    setTagSearchOffset: (state: PostState, action) => {
      state.tagSearchOffset += action.payload;
    },
    setPlaceSearchOffset: (state: PostState, action) => {
      state.placeSearchOffset += action.payload;
    },
    setInputValues: (state: PostState, action) => {
      if (action.payload.searchType === 1) {
        state.inputValues.userInputValue = action.payload.inputValue;
      } else if (action.payload.searchType === 2) {
        state.inputValues.tagInputValue = action.payload.inputValue;
      } else if (action.payload.searchType === 3) {
        state.inputValues.placeInputValue = action.payload.inputValue;
      }
    },
    setSearchValues: (state: PostState, action) => {
      if (action.payload.searchType === 1) {
        state.searchValues.userSearchValue = action.payload.searchValue;
      } else if (action.payload.searchType === 2) {
        state.searchValues.tagSearchValue = action.payload.searchValue;
      } else if (action.payload.searchType === 3) {
        state.searchValues.placeSearchValue = action.payload.searchValue;
      }
    },
    setSearchTabId: (state: PostState, action) => {
      state.searchTabId = action.payload;
    },
    setSearchSortId: (state: PostState, action) => {
      state.searchSortId = action.payload;
    }
  },
  extraReducers: builder => {
    // fetchPostCoordinates
    builder.addCase(
      fetchPostCoordinates.fulfilled,
      (state: PostState, action) => {
        postSlice.caseReducers.setPostCoordinate(
          state,
          postSlice.actions.setPostCoordinate(action.payload)
        );
      }
    );
    builder.addCase(
      fetchPostCoordinates.rejected,
      (_state: PostState, action) => {
        throw new Error(action.error.message);
      }
    );

    // fetchRangePosts
    builder.addCase(fetchRangePosts.fulfilled, (state: PostState, action) => {
      if (action.payload.isSet) {
        postSlice.caseReducers.setRangePosts(
          state,
          postSlice.actions.setRangePosts(action.payload.data)
        );
      } else {
        postSlice.caseReducers.addRangePosts(
          state,
          postSlice.actions.addRangePosts(action.payload.data)
        );
      }
    });
    builder.addCase(fetchRangePosts.rejected, (_state: PostState, action) => {
      throw new Error(action.error.message);
    });

    // fetchUserPosts
    builder.addCase(fetchUserPosts.fulfilled, (state: PostState, action) => {
      postSlice.caseReducers.setUserPosts(
        state,
        postSlice.actions.setUserPosts(action.payload)
      );
    });
    builder.addCase(fetchUserPosts.rejected, (_state: PostState, action) => {
      throw new Error(action.error.message);
    });

    // fetchLikePosts
    builder.addCase(fetchLikePosts.fulfilled, (state: PostState, action) => {
      postSlice.caseReducers.setLikePosts(
        state,
        postSlice.actions.setLikePosts(action.payload)
      );
    });
    builder.addCase(fetchLikePosts.rejected, (_state: PostState, action) => {
      throw new Error(action.error.message);
    });

    // fetchPostsBySpotName
    builder.addCase(
      fetchPostsBySpotName.fulfilled,
      (state: PostState, action) => {
        if (action.payload.isSet) {
          postSlice.caseReducers.setSearchPostByPlace(
            state,
            postSlice.actions.setSearchPostByPlace(action.payload.data)
          );
        } else {
          postSlice.caseReducers.addSearchPostByPlace(
            state,
            postSlice.actions.addSearchPostByPlace(action.payload.data)
          );
        }
      }
    );
    builder.addCase(
      fetchPostsBySpotName.rejected,
      (_state: PostState, action) => {
        throw new Error(action.error.message);
      }
    );

    // fetchPostsByTag
    builder.addCase(fetchPostsByTag.fulfilled, (state: PostState, action) => {
      if (action.payload.isSet) {
        postSlice.caseReducers.setSearchPostByTag(
          state,
          postSlice.actions.setSearchPostByTag(action.payload.data)
        );
      } else {
        postSlice.caseReducers.addSearchPostByTag(
          state,
          postSlice.actions.addSearchPostByTag(action.payload.data)
        );
      }
    });
    builder.addCase(fetchPostsByTag.rejected, (_state: PostState, action) => {
      throw new Error(action.error.message);
    });

    // fetchPostDetail
    builder.addCase(fetchPostDetail.fulfilled, (state: PostState, action) => {
      postSlice.caseReducers.setPostDetail(
        state,
        postSlice.actions.setPostDetail(action.payload)
      );
    });
    builder.addCase(fetchPostDetail.rejected, (_state: PostState, action) => {
      throw new Error(action.error.message);
    });

    // postSpot
    builder.addCase(postSpot.fulfilled, (_state: PostState, action) => {
      action.payload = "201";
    });
    builder.addCase(postSpot.rejected, (_state: PostState, action) => {
      throw new Error(action.error.message);
    });

    // startRecordRoad
    builder.addCase(startRecordRoad.fulfilled, (_state: PostState, action) => {
      action.payload = "201";
    });
    builder.addCase(startRecordRoad.rejected, (_state: PostState, action) => {
      throw new Error(action.error.message);
    });

    // setCoordinate
    builder.addCase(setCoordinate.fulfilled, (_state: PostState, action) => {
      action.payload = "200";
    });
    builder.addCase(setCoordinate.rejected, (_state: PostState, action) => {
      throw new Error(action.error.message);
    });

    // postRoad
    builder.addCase(postRoad.fulfilled, (_state: PostState, action) => {
      action.payload = "200";
    });
    builder.addCase(postRoad.rejected, (_state: PostState, action) => {
      throw new Error(action.error.message);
    });

    // deletePost
    builder.addCase(deletePost.fulfilled, (_state: PostState, action) => {
      action.payload = "204";
    });
    builder.addCase(deletePost.rejected, (_state: PostState, action) => {
      throw new Error(action.error.message);
    });

    // addLike
    builder.addCase(addLike.fulfilled, (_state: PostState, action) => {
      action.payload = "201";
    });
    builder.addCase(addLike.rejected, (_state: PostState, action) => {
      throw new Error(action.error.message);
    });

    // removeLike
    builder.addCase(removeLike.fulfilled, (_state: PostState, action) => {
      action.payload = "204";
    });
    builder.addCase(removeLike.rejected, (_state: PostState, action) => {
      throw new Error(action.error.message);
    });
  }
});

export const {
  setPostIds,
  setSpotPostIds,
  setRoadPostIds,
  setTimelinePlaceName,
  setTimelineTopTabId,
  setTimelineBottomTabId,
  setTimelineSortId,
  setTimelineOffset,
  resetSearchPostByPlace,
  resetSearchPostByTag,
  cleanRangePosts,
  setInputValues,
  setSearchValues,
  setSearchTabId,
  setSearchSortId,
  setTagSearchOffset,
  setPlaceSearchOffset,
  resetUserPosts,
  resetLikePosts,
  setUserPostsOffsetIncrement,
  setLikePostsOffsetIncrement,
  resetPostDetail,
  decrementCommentCountsOfPostDetail
} = postSlice.actions;

export const selectRangePosts = (state: RootState) => state.post.rangePosts;
export const selectPostCoordinates = (state: RootState) => {
  return state.post.postCoordinates;
};
export const selectPostIds = (state: RootState) => state.post.postIds;
export const selectSpotPostIds = (state: RootState) => state.post.spotPostIds;
export const selectRoadPostIds = (state: RootState) => state.post.roadPostIds;
export const selectTimelinePlaceName = (state: RootState) =>
  state.post.timelinePlaceName;
export const selectTimelineOffset = (state: RootState) =>
  state.post.timelineOffset;
export const selectTimelineTopTabId = (state: RootState) =>
  state.post.timelineTopTabId;
export const selectTimelineBottomTabId = (state: RootState) =>
  state.post.timelineBottomTabId;
export const selectTimelineSortId = (state: RootState) =>
  state.post.timelineSortId;
export const selectSearchPostsByTag = (state: RootState) =>
  state.post.searchPostsByTag;
export const selectSearchPostsByPlace = (state: RootState) =>
  state.post.searchPostsByPlace;
export const selectInputValues = (state: RootState) => state.post.inputValues;
export const selectSearchValues = (state: RootState) => state.post.searchValues;
export const selectSearchTabId = (state: RootState) => state.post.searchTabId;
export const selectSearchSortId = (state: RootState) => state.post.searchSortId;
export const selectTagSearchOffset = (state: RootState) =>
  state.post.tagSearchOffset;
export const selectPlaceSearchOffset = (state: RootState) =>
  state.post.placeSearchOffset;
export const selectTagSearchLoadMore = (state: RootState) =>
  state.post.tagSearchLoadMore;
export const selectPlaceSearchLoadMore = (state: RootState) =>
  state.post.placeSearchLoadMore;
export const selectUserPosts = (state: RootState) => state.post.userPosts;
export const selectLikePosts = (state: RootState) => state.post.likePosts;
export const selectUserPostsOffset = (state: RootState) =>
  state.post.userPostsOffset;
export const selectLikePostsOffset = (state: RootState) =>
  state.post.likePostsOffset;
export const selectPostDetail = (state: RootState) => state.post.postDetail;
