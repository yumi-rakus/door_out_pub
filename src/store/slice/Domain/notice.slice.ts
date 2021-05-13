import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "~/store";
import Axios from "~/store/api";
import { Notification } from "~/interfaces";

type noticeState = {
  notifications: Array<Notification> | null;
};

const initialNoticeState: noticeState = {
  notifications: null
};

/**
 * 通知内容を取得するAPIを呼び出す
 * 成功時: state.notificationsにset
 * 失敗時: エラーを返す (403)
 * @return notifications: Array<Notification>
 */
export const fetchNotifications = createAsyncThunk(
  "notice/fetchNotifications",
  async (arg: { limit: number; offset: number }) => {
    try {
      const { data } = await Axios.get(`/notice/`, {
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

export const noticeSlice = createSlice({
  name: "notice",
  initialState: initialNoticeState,
  reducers: {
    setNotice(state: noticeState, action) {
      state.notifications = action.payload;
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      noticeSlice.caseReducers.setNotice(
        state,
        noticeSlice.actions.setNotice(action.payload)
      );
    });
    builder.addCase(fetchNotifications.rejected, (_state, action) => {
      throw new Error(action.error.message);
    });
  }
});

export const { setNotice } = noticeSlice.actions;

export const selectNotice = (state: RootState) => state.notice.notifications;
