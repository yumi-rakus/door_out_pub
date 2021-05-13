import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "~/store";
import Axios from "~/store/api";

import { User } from "~/interfaces";

export type SearchUserForm = {
  limit: number;
  offset: number;
  query: string;
};

type UserState = {
  userDetail: User | null;
  followees: Array<User> | null;
  followers: Array<User> | null;
  searchUsers: Array<User>;
  searchUsersOffset: number;
  searchUsersLoadMore: boolean;
  usersLikedInPost: Array<User> | null;
};

const initialUserState: UserState = {
  userDetail: null,
  followees: null,
  followers: null,
  searchUsers: [],
  searchUsersOffset: 0,
  searchUsersLoadMore: true,
  usersLikedInPost: null
};

////////////////////////// ** Async ** //////////////////////////

/**
 * ユーザーの詳細情報を取得する.
 * 成功時: state.userDerailにsetする.
 * 失敗時: エラーを返す（400 or 404）.
 *
 * @return userDetail: User
 */
export const fetchUserDetail = createAsyncThunk(
  "user/fetchUserDetail",
  async (userId: string) => {
    try {
      const { data } = await Axios.get(`/user/${userId}`, {
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
 * フォロイーを取得する.
 * 成功時: state.followeesにsetする.
 * 失敗時: エラーを返す（400）.
 *
 * @return followee: Array<User>
 */
export const fetchFollowees = createAsyncThunk(
  "user/fetchFollowees",
  async (arg: { userId: string; limit: number; offset: number }) => {
    try {
      const { data } = await Axios.get(`/user/${arg.userId}/followee`, {
        method: "GET",
        params: {
          limit: arg.limit,
          offset: arg.offset
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
 * フォロワーを取得する.
 * 成功時: state.followersにsetする.
 * 失敗時: エラーを返す（400）.
 *
 * @return follower: Array<User>
 */
export const fetchFollowers = createAsyncThunk(
  "user/fetchFollowers",
  async (arg: { userId: string; limit: number; offset: number }) => {
    try {
      const { data } = await Axios.get(`/user/${arg.userId}/follower`, {
        method: "GET",
        params: {
          limit: arg.limit,
          offset: arg.offset
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
 * ユーザーを検索する.
 * 成功時: state.searchUsersにsetする.
 * 失敗時: エラーを返す（400）.
 *
 * @return searchUsers: Array<User>
 */
export const fetchSearchUsers = createAsyncThunk(
  "user/fetchSearchUsers",
  async (arg: { searchUserForm: SearchUserForm; isSet: boolean }) => {
    try {
      const { data } = await Axios.get(`/user/`, {
        method: "GET",
        params: arg.searchUserForm,
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
 * 投稿にいいねしているユーザーを取得する.
 * 成功時: state.usersLikedInPostにsetする.
 * 失敗時: エラーを返す（400）.
 *
 * @return usersLikedInPost: Array<User>
 */
export const fetchUsersLikedInPost = createAsyncThunk(
  "user/fetchUsersLikedInPost",
  async (arg: { postId: string; limit: number; offset: number }) => {
    try {
      const { data } = await Axios.get(`/post/${arg.postId}/like`, {
        method: "GET",
        params: {
          limit: arg.limit,
          offset: arg.offset
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
 * ユーザーをフォローする.
 * 失敗時: エラーを返す（400）.
 *
 * @return message: string
 */
export const followUser = createAsyncThunk(
  "user/followUser",
  async (followeeId: string) => {
    try {
      const { data } = await Axios.post(
        `/follow/${followeeId}`,
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
 * ユーザーをアンフォローする.
 * 失敗時: エラーを返す（400）.
 *
 * @return message: string
 */
export const unfollowUser = createAsyncThunk(
  "user/unfollowUser",
  async (followeeId: string) => {
    try {
      const { data } = await Axios.delete(`/follow/${followeeId}`, {
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

////////////////////////// ** Slice ** //////////////////////////

export const userSlice = createSlice({
  name: "user",
  initialState: initialUserState,
  reducers: {
    setUserDetail: (state: UserState, action) => {
      state.userDetail = action.payload;
    },
    resetUserDetail: (state: UserState) => {
      state.userDetail = null;
    },
    setFollowees: (state: UserState, action) => {
      state.followees = action.payload;
    },
    setFollowers: (state: UserState, action) => {
      state.followers = action.payload;
    },
    setFollowerCountsIncrement: (state: UserState) => {
      if (state.userDetail && state.userDetail.followerCounts) {
        state.userDetail.followerCounts++;
      }
    },
    setFollowerCountsDecrement: (state: UserState) => {
      if (state.userDetail && state.userDetail.followerCounts) {
        state.userDetail.followerCounts--;
      }
    },
    setSearchUsers: (state: UserState, action) => {
      state.searchUsers = action.payload;
      state.searchUsersOffset = 0;
      state.searchUsersLoadMore = true;
    },
    addSearchUsers: (state: UserState, action) => {
      const userIds: Array<string> = state.searchUsers.map(user => user.userId);
      action.payload.forEach(
        (user: User) =>
          userIds.includes(user.userId) || state.searchUsers.push(user)
      );
    },
    resetSearchUsers: (state: UserState) => {
      state.searchUsers = [];
      state.searchUsersOffset = 0;
      state.searchUsersLoadMore = true;
    },
    setSearchUsersOffset: (state: UserState, action) => {
      state.searchUsersOffset += action.payload;
    },
    setUsersLikedInPost: (state: UserState, action) => {
      state.usersLikedInPost = action.payload;
    }
  },
  extraReducers: builder => {
    // fetchUserDetail
    builder.addCase(fetchUserDetail.fulfilled, (state: UserState, action) => {
      userSlice.caseReducers.setUserDetail(
        state,
        userSlice.actions.setUserDetail(action.payload)
      );
    });
    builder.addCase(fetchUserDetail.rejected, (_state: UserState, action) => {
      throw new Error(action.error.message);
    });

    // fetchFollowee
    builder.addCase(fetchFollowees.fulfilled, (state: UserState, action) => {
      userSlice.caseReducers.setFollowees(
        state,
        userSlice.actions.setFollowees(action.payload)
      );
    });
    builder.addCase(fetchFollowees.rejected, (_state: UserState, action) => {
      throw new Error(action.error.message);
    });

    // fetchFollower
    builder.addCase(fetchFollowers.fulfilled, (state: UserState, action) => {
      userSlice.caseReducers.setFollowers(
        state,
        userSlice.actions.setFollowers(action.payload)
      );
    });
    builder.addCase(fetchFollowers.rejected, (_state: UserState, action) => {
      throw new Error(action.error.message);
    });

    // fetchSearchUsers
    builder.addCase(fetchSearchUsers.fulfilled, (state: UserState, action) => {
      if (action.payload.isSet) {
        userSlice.caseReducers.setSearchUsers(
          state,
          userSlice.actions.setSearchUsers(action.payload.data)
        );
      } else {
        userSlice.caseReducers.addSearchUsers(
          state,
          userSlice.actions.addSearchUsers(action.payload.data)
        );
      }
    });
    builder.addCase(fetchSearchUsers.rejected, (_state: UserState, action) => {
      throw new Error(action.error.message);
    });

    // fetchUsersLikedInPost
    builder.addCase(
      fetchUsersLikedInPost.fulfilled,
      (state: UserState, action) => {
        userSlice.caseReducers.setUsersLikedInPost(
          state,
          userSlice.actions.setUsersLikedInPost(action.payload)
        );
      }
    );
    builder.addCase(
      fetchUsersLikedInPost.rejected,
      (_state: UserState, action) => {
        throw new Error(action.error.message);
      }
    );

    // followUser
    builder.addCase(followUser.fulfilled, (_state: UserState, action) => {
      action.payload = "200";
    });
    builder.addCase(followUser.rejected, (_state: UserState, action) => {
      throw new Error(action.error.message);
    });

    // unfollowUser
    builder.addCase(unfollowUser.fulfilled, (_state: UserState, action) => {
      action.payload = "200";
    });
    builder.addCase(unfollowUser.rejected, (_state: UserState, action) => {
      throw new Error(action.error.message);
    });
  }
});

export const {
  setUserDetail,
  resetUserDetail,
  setFollowees,
  setFollowers,
  setFollowerCountsIncrement,
  setFollowerCountsDecrement,
  setSearchUsers,
  setUsersLikedInPost,
  setSearchUsersOffset,
  resetSearchUsers
} = userSlice.actions;

export const selectUserDetail = (state: RootState) => state.user.userDetail;
export const selectFollowees = (state: RootState) => state.user.followees;
export const selectFollowers = (state: RootState) => state.user.followers;
export const selectSearchUsers = (state: RootState) => state.user.searchUsers;
export const selectUsersLikedInPost = (state: RootState) =>
  state.user.usersLikedInPost;
export const selectUserSearchOffset = (state: RootState) =>
  state.user.searchUsersOffset;
export const selectUserSearchLoadMore = (state: RootState) =>
  state.user.searchUsersLoadMore;
