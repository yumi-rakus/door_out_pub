import { configureStore } from "@reduxjs/toolkit";

import { authSlice } from "~/store/slice/App/auth.slice";
import { errorSlice } from "~/store/slice/App/error.slice";
import { uiSlice } from "~/store/slice/App/ui.slice";
import { commentSlice } from "~/store/slice/Domain/comment.slice";
import { excludedCoordinateSlice } from "~/store/slice/Domain/excludedCoordinate.slice";
import { noticeSlice } from "~/store/slice/Domain/notice.slice";
import { postSlice } from "~/store/slice/Domain/post.slice";
import { tagSlice } from "~/store/slice/Domain/tag.slice";
import { userSlice } from "~/store/slice/Domain/user.slice";
import { mapSlice } from "~/store/slice/Domain/map.slice";

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    error: errorSlice.reducer,
    ui: uiSlice.reducer,
    comment: commentSlice.reducer,
    excludedCoordinate: excludedCoordinateSlice.reducer,
    notice: noticeSlice.reducer,
    post: postSlice.reducer,
    tag: tagSlice.reducer,
    user: userSlice.reducer,
    map: mapSlice.reducer
  }
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
