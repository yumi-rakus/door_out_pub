import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import Axios from "~/store/api";
import { Tag } from "~/interfaces";
import { RootState } from "~/store";

type TagState = {
  tags: Array<Tag>;
};

const initialTagState: TagState = {
  tags: []
};

/**
 * タグを取得するAPIを呼び出す EP未定
 * 成功時tagSliceにて、stateのtagsにsetされる。
 * 失敗時
 * @return tags:Array<Tag>
 */

export const fetchTags = createAsyncThunk(
  "tag/fetchTags",
  async (keyword: string) => {
    try {
      const { data } = await Axios.get("/tag/", {
        method: "GET",
        params: { part_of_name: keyword, limit: 10, offset: 0 },
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

export const tagSlice = createSlice({
  name: "tag",
  initialState: initialTagState,
  reducers: {
    setTags: (state: TagState, action) => {
      state.tags = action.payload;
    },
    addTag: (state: TagState, action) => {
      state.tags = [];
      state.tags.push(action.payload);
    },
    cleanTags: (state: TagState) => {
      state.tags = [];
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchTags.fulfilled, (state: TagState, action) => {
      tagSlice.caseReducers.setTags(
        state,
        tagSlice.actions.setTags(action.payload)
      );
    });
    builder.addCase(fetchTags.rejected, (_state: TagState, action) => {
      throw new Error(action.error.message);
    });
  }
});

export const { addTag, cleanTags } = tagSlice.actions;

export const selectTags = (state: RootState) => state.tag.tags;
