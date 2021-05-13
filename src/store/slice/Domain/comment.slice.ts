import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "~/store";
import { ChildComment, Comment } from "~/interfaces";
import Axios from "~/store/api";

type CommentState = {
  parentComments: Array<Comment> | null;
};

const initialCommentState: CommentState = {
  parentComments: null
};

/**
 * 投稿の親コメントを取得する.
 * 成功時: state.parentCommentsにset
 * 失敗時: エラーを返す(400 or 404 or 422)
 *
 * @return parentComments: Array<Comment>
 */
export const fetchParentComments = createAsyncThunk(
  "comment/fetchParentComments",
  async (arg: { postId: string; limit: number; offset: number }) => {
    try {
      const { data } = await Axios.get(`/post/${arg.postId}/parent-comment`, {
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
 * 投稿の子コメントを取得する.
 * 成功時: state.childCommentsにset
 * 失敗時: エラーを返す(400 or 404 or 422)
 *
 * @return childComments: Array<ChildComment>
 */
export const fetchChildComments = createAsyncThunk(
  "comment/fetchChildComments",
  async (arg: { parentCommentId: string; limit: number; offset: number }) => {
    try {
      const { data } = await Axios.get(
        `/post/${arg.parentCommentId}/child-comment`,
        {
          method: "GET",
          params: {
            limit: arg.limit,
            offset: arg.offset
          },
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
 * 親コメントを投稿する.
 * 失敗時: エラーを返す(400 or 404)
 */
export const postParentComment = createAsyncThunk(
  "comment/postParentComment",
  async (arg: { postId: string; content: string }) => {
    try {
      const { data } = await Axios.post(
        `/post/${arg.postId}/parent-comment`,
        { content: arg.content },
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
 * 子コメントを投稿する.
 * 失敗時: エラーを返す(400 or 404)
 */
export const postChildComment = createAsyncThunk(
  "comment/postChildComment",
  async (arg: {
    parentCommentId: string;
    replyUserId: string;
    content: string;
  }) => {
    try {
      const { data } = await Axios.post(
        `/post/${arg.parentCommentId}/child-comment`,
        { replyUserId: arg.replyUserId, content: arg.content },
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
 * 親コメントを削除する.
 * 失敗時: エラーを返す(400 or 404)
 */
export const deleteParentComment = createAsyncThunk(
  "comment/deleteParentComment",
  async (arg: { postId: string; parentCommentId: string }) => {
    try {
      const { data } = await Axios.delete(
        `/post/${arg.postId}/parent-comment/${arg.parentCommentId}`,
        {
          method: "DELETE",
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
 * 子コメントを削除する.
 * 失敗時: エラーを返す(400 or 404)
 */
export const deleteChildComment = createAsyncThunk(
  "comment/deleteChildComment",
  async (childCommentId: string) => {
    try {
      const { data } = await Axios.delete(
        `/post/child-comment/${childCommentId}`,
        {
          method: "DELETE",
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

export const commentSlice = createSlice({
  name: "comment",
  initialState: initialCommentState,
  reducers: {
    setParentComments: (state: CommentState, action) => {
      if (state.parentComments) {
        // 新しく取得した親コメント
        const list = action.payload as Array<Comment>;

        // state.parentCommentsと新しく取得した親コメントをマージ
        const data = [...state.parentComments, ...list];

        // 重複削除した配列を取得, set
        state.parentComments = data.filter(
          (element, index, self) =>
            self.findIndex(
              dataElement =>
                dataElement.parentCommentId === element.parentCommentId
            ) === index
        );
      } else {
        state.parentComments = action.payload;
      }
    },
    setChildComments: (state: CommentState, action) => {
      // IDで検索してchildCommentを追加する処理
      const parentCommentId: string = action.payload[0].parentCommentId;
      const parentComment: Array<Comment> = state.parentComments!.filter(
        parentComment => parentComment.parentCommentId === parentCommentId
      );

      if (parentComment.length === 1) {
        if (!parentComment[0].childComments) {
          parentComment[0].childComments = action.payload;
        } else {
          // // 新しく取得した子コメント
          const list = action.payload as Array<ChildComment>;

          // parentComment[0].childCommentsと新しく取得した子コメントをマージ
          const data = [...parentComment[0].childComments, ...list];

          // 重複削除した配列を取得, set
          parentComment[0].childComments = data.filter(
            (element, index, self) =>
              self.findIndex(
                dataElement =>
                  dataElement.childCommentId === element.childCommentId
              ) === index
          );
        }
      } else {
        throw new Error();
      }
    },
    resetParentComments: (state: CommentState) => {
      state.parentComments = null;
    },
    removeParentComment: (state: CommentState, action) => {
      const parentCommentId: string = action.payload;
      state.parentComments = state.parentComments!.filter(
        parentComment => parentComment.parentCommentId !== parentCommentId
      );
    },
    removeChildComment: (state: CommentState, action) => {
      const arg: { parentCommentId: string; childCommentId: string } =
        action.payload;
      const parentComment: Array<Comment> = state.parentComments!.filter(
        parentComment => parentComment.parentCommentId === arg.parentCommentId
      );

      if (parentComment.length === 1) {
        parentComment[0].childComments = parentComment[0].childComments.filter(
          childComment => childComment.childCommentId !== arg.childCommentId
        );
      }
    }
  },
  extraReducers: builder => {
    // fetchParentComments
    builder.addCase(
      fetchParentComments.fulfilled,
      (state: CommentState, action) => {
        commentSlice.caseReducers.setParentComments(
          state,
          commentSlice.actions.setParentComments(action.payload)
        );
      }
    );
    builder.addCase(
      fetchParentComments.rejected,
      (_state: CommentState, action) => {
        throw new Error(action.error.message);
      }
    );

    // fetchChildComments
    builder.addCase(
      fetchChildComments.fulfilled,
      (state: CommentState, action) => {
        commentSlice.caseReducers.setChildComments(
          state,
          commentSlice.actions.setChildComments(action.payload)
        );
      }
    );
    builder.addCase(
      fetchChildComments.rejected,
      (_state: CommentState, action) => {
        throw new Error(action.error.message);
      }
    );

    // postParentComment
    builder.addCase(
      postParentComment.rejected,
      (_state: CommentState, action) => {
        throw new Error(action.error.message);
      }
    );

    // postChildComment
    builder.addCase(
      postChildComment.rejected,
      (_state: CommentState, action) => {
        throw new Error(action.error.message);
      }
    );

    // deleteParentComment
    builder.addCase(
      deleteParentComment.rejected,
      (_state: CommentState, action) => {
        throw new Error(action.error.message);
      }
    );

    // deleteChildComment
    builder.addCase(
      deleteChildComment.rejected,
      (_state: CommentState, action) => {
        throw new Error(action.error.message);
      }
    );
  }
});

export const {
  setParentComments, setChildComments, resetParentComments, removeParentComment, removeChildComment
} = commentSlice.actions;

export const selectParentComments = (state: RootState) => state.comment.parentComments;