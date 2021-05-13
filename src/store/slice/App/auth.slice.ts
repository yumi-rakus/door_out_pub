import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Axios from "~/store/api";
import { RootState } from "~/store";

import { User } from "~/interfaces";

export type LoginForm = {
  accountIdOrEmail: string;
  password: string;
};

export type CreateUserForm = {
  accountId: string;
  email: string;
  name: string;
  password: string;
};

export type UpdateProfileForm = {
  accountId: string;
  email: string;
  name: string;
  userImage?: string;
  bio: string;
};

type AuthState = {
  loginUser: User | null;
  profile: {
    accountId: string | null;
    name: string | null;
    bio: string | null;
    email: string | null;
    userImage: string | null;
  };
  existsAccountId: boolean;
  existsEmail: boolean;
};

const initialAuthState: AuthState = {
  loginUser: null,
  profile: {
    accountId: null,
    name: null,
    bio: null,
    email: null,
    userImage: null
  },
  existsAccountId: false,
  existsEmail: false
};

////////////////////////// ** Async ** //////////////////////////

/**
 * ログインする.
 * 成功時: authSliceにて、localStorageにAuthorizationをsetする.
 * 失敗時: エラーを返す（400 or 422）.
 *
 * @return token
 */
export const login = createAsyncThunk(
  "auth/login",
  async (loginInfo: LoginForm) => {
    try {
      const { data } = await Axios.post("/auth/login", loginInfo, {
        method: "POST"
      });
      return data;
    } catch (e) {
      throw new Error(e.response.status);
    }
  }
);

/**
 * ログインユーザーの情報を取得する.
 * 成功時: state.loginUserにsetする.
 * 失敗時: エラーを返す（）
 *
 * @return loginUser: User
 */
export const fetchLoginUser = createAsyncThunk("auth/user", async () => {
  try {
    const { data } = await Axios.get("/auth/user", {
      method: "GET",
      headers: {
        Authorization: localStorage.getItem("Authorization")
      }
    });
    return data;
  } catch (e) {
    throw new Error(e.response.status);
  }
});

/**
 * 新規ユーザーを作成する.
 * 失敗時: エラーを返す（400 or 409 or 422）.
 *
 * @return message: string
 */
export const createUser = createAsyncThunk(
  "user/createUser",
  async (createUserForm: CreateUserForm) => {
    try {
      const { data } = await Axios.post(`/auth/register`, createUserForm, {
        method: "POST"
      });
      return data;
    } catch (e) {
      throw new Error(e.response.status);
    }
  }
);

/**
 * 入力されたaccountIdが登録済みかどうかをチェックする.
 * 成功時: 200
 * 失敗時: エラーを返す（400 or 409 or 422）.
 *
 * @return message: string
 */
export const checkExistingAccountId = createAsyncThunk(
  "user/checkExistingAccountId",
  async (inputAccountId: string) => {
    try {
      const { data } = await Axios.post(
        `/auth/check-account_id`,
        { accountId: inputAccountId },
        {
          method: "POST"
        }
      );
      return data;
    } catch (e) {
      throw new Error(e.response.status);
    }
  }
);

/**
 * 入力されたemailが登録済みかどうかをチェックする.
 * 成功時: 200
 * 失敗時: エラーを返す（400 or 409 or 422）.
 *
 * @return message: string
 */
export const checkExistingEmail = createAsyncThunk(
  "user/checkExistingEmail",
  async (inputEmail: string) => {
    try {
      const { data } = await Axios.post(
        `/auth/check-email`,
        { email: inputEmail },
        {
          method: "POST"
        }
      );
      return data;
    } catch (e) {
      throw new Error(e.response.status);
    }
  }
);

/**
 * プロフィールを更新する.
 * 失敗時: エラーを返す（422）.
 *
 * @return 更新後のユーザー情報: User
 */
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (updateProfileForm: UpdateProfileForm) => {
    try {
      const { data } = await Axios.put(
        `/auth/user/profile`,
        updateProfileForm,
        {
          method: "PUT",
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
 * パスワードを変更する.
 * 失敗時: エラーを返す（422）.
 *
 * @return message: string
 */
export const updatePassword = createAsyncThunk(
  "auth/updatePassword",
  async (arg: { oldPassword: string; newPassword: string }) => {
    try {
      const { data } = await Axios.put(`/auth/user/password`, arg, {
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

////////////////////////// ** Slice ** //////////////////////////

export const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
  reducers: {
    setLoginUser: (state: AuthState, action) => {
      state.loginUser = action.payload;
    },
    setProfile: (state: AuthState, action) => {
      state.profile.accountId = action.payload.accountId;
      state.profile.name = action.payload.name;
      state.profile.bio = action.payload.bio;
      state.profile.email = action.payload.email;
      state.profile.userImage = action.payload.userImagePath;
    },
    logout: (state: AuthState) => {
      state.loginUser = null;
      localStorage.removeItem("Authorization");
      localStorage.removeItem("newNoticesCount");
      localStorage.removeItem("previousNotices");
      localStorage.removeItem("latestNotices");
    },
    setProfileAccountId: (state: AuthState, action) => {
      state.profile.accountId = action.payload;
    },
    setProfileName: (state: AuthState, action) => {
      state.profile.name = action.payload;
    },
    setProfileBio: (state: AuthState, action) => {
      state.profile.bio = action.payload;
    },
    setProfileEmail: (state: AuthState, action) => {
      state.profile.email = action.payload;
    },
    setProfileUserImage: (state: AuthState, action) => {
      state.profile.userImage = action.payload;
    },
    setFolloweeCountsIncrement: (state: AuthState) => {
      if (state.loginUser && state.loginUser.followeeCounts) {
        state.loginUser.followeeCounts++;
      }
    },
    setFolloweeCountsDecrement: (state: AuthState) => {
      if (state.loginUser && state.loginUser.followeeCounts) {
        state.loginUser.followeeCounts--;
      }
    }
  },
  extraReducers: builder => {
    // login
    builder.addCase(login.fulfilled, (state: AuthState, action) => {
      if (action.payload?.token) {
        localStorage.setItem("Authorization", `Bearer ${action.payload.token}`);
      }
    });
    builder.addCase(login.rejected, (state: AuthState, action) => {
      throw new Error(action.error.message);
    });

    // fetchLoginUser
    builder.addCase(fetchLoginUser.fulfilled, (state: AuthState, action) => {
      authSlice.caseReducers.setLoginUser(
        state,
        authSlice.actions.setLoginUser(action.payload)
      );
      authSlice.caseReducers.setProfile(
        state,
        authSlice.actions.setProfile(action.payload)
      );
    });
    builder.addCase(fetchLoginUser.rejected, (_state: AuthState, action) => {
      throw new Error(action.error.message);
    });

    // updateProfile
    builder.addCase(updateProfile.fulfilled, (state: AuthState, action) => {
      authSlice.caseReducers.setLoginUser(
        state,
        authSlice.actions.setLoginUser(action.payload)
      );
      authSlice.caseReducers.setProfile(
        state,
        authSlice.actions.setProfile(action.payload)
      );
    });
    builder.addCase(updateProfile.rejected, (_state: AuthState, action) => {
      throw new Error(action.error.message);
    });

    // updatePassword
    builder.addCase(updatePassword.fulfilled, (_state: AuthState, action) => {
      action.payload = "200";
    });
    builder.addCase(updatePassword.rejected, (_state: AuthState, action) => {
      throw new Error(action.error.message);
    });

    // createUser
    builder.addCase(createUser.fulfilled, (_state: AuthState, action) => {
      action.payload = "200";
    });
    builder.addCase(createUser.rejected, (_state: AuthState, action) => {
      throw new Error(action.error.message);
    });

    // checkExistingAccountId
    builder.addCase(
      checkExistingAccountId.fulfilled,
      (state: AuthState, _action) => {
        state.existsAccountId = false;
      }
    );
    builder.addCase(
      checkExistingAccountId.rejected,
      (state: AuthState, _action) => {
        state.existsAccountId = true;
      }
    );

    // checkExistingEmail
    builder.addCase(
      checkExistingEmail.fulfilled,
      (state: AuthState, _action) => {
        state.existsEmail = false;
      }
    );
    builder.addCase(
      checkExistingEmail.rejected,
      (state: AuthState, _action) => {
        state.existsEmail = true;
      }
    );
  }
});

export const {
  setLoginUser,
  logout,
  setProfile,
  setProfileAccountId,
  setProfileName,
  setProfileBio,
  setProfileEmail,
  setProfileUserImage,
  setFolloweeCountsIncrement,
  setFolloweeCountsDecrement
} = authSlice.actions;

export const selectLoginUser = (state: RootState) => state.auth.loginUser;
export const selectProfile = (state: RootState) => state.auth.profile;
export const selectExistsAccountId = (state: RootState) =>
  state.auth.existsAccountId;
export const selectExistsEmail = (state: RootState) => state.auth.existsEmail;
