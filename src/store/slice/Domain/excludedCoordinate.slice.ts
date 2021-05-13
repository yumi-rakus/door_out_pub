import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ExcludedCoordinate } from "~/interfaces";
import Axios from "~/store/api";
import { RootState } from "~/store";

type ExcludedCoordinateState = {
  excludedCoordinates: Array<ExcludedCoordinate> | null;
};

const initialExcludedCoordinateState: ExcludedCoordinateState = {
  excludedCoordinates: null
};

////////////////////////// ** Async ** //////////////////////////

/**
 * 投稿除外地点を取得する.
 * 成功時: state.excludedCoordinatesにsetする.
 * 失敗時: エラーを返す（404）.
 *
 * @return excludedCoordinates: Array<ExcludedCoordinate>
 */
export const fetchExcludedCoordinates = createAsyncThunk(
  "excludedCoordinate/fetchExcludedCoordinates",
  async () => {
    try {
      const { data } = await Axios.get("/auth/user/excluded-coordinate", {
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
 * 投稿除外地点を登録する.
 * 失敗時: エラーを返す（400 or 422）.
 *
 * @return 作成した投稿除外地点: ExcludedCoordinate
 */
export const addExcludedCoordinate = createAsyncThunk(
  "excludedCoordinate/addExcludedCoordinate",
  async (excludedCoordinate: ExcludedCoordinate) => {
    try {
      const { data } = await Axios.post(
        "/auth/user/excluded-coordinate",
        excludedCoordinate,
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
 * 投稿除外地点を削除する.
 * 失敗時: エラーを返す（400）.
 *
 * @return message: string
 */
export const removeExcludedCoordinate = createAsyncThunk(
  "excludedCoordinate/removeExcludedCoordinate",
  async (excludedCoordinateId: string) => {
    try {
      const { data } = await Axios.delete(
        `/auth/user/excluded-coordinate/${excludedCoordinateId}`,
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

////////////////////////// ** Slice ** //////////////////////////

export const excludedCoordinateSlice = createSlice({
  name: "excludedCoordinate",
  initialState: initialExcludedCoordinateState,
  reducers: {
    setExcludedCoordinates: (state: ExcludedCoordinateState, action) => {
      state.excludedCoordinates = action.payload;
    }
  },
  extraReducers: builder => {
    // fetchExcludedCoordinates
    builder.addCase(
      fetchExcludedCoordinates.fulfilled,
      (state: ExcludedCoordinateState, action) => {
        excludedCoordinateSlice.caseReducers.setExcludedCoordinates(
          state,
          excludedCoordinateSlice.actions.setExcludedCoordinates(action.payload)
        );
      }
    );
    builder.addCase(
      fetchExcludedCoordinates.rejected,
      (_state: ExcludedCoordinateState, action) => {
        throw new Error(action.error.message);
      }
    );

    // addExcludedCoordinate
    builder.addCase(
      addExcludedCoordinate.fulfilled,
      (_state: ExcludedCoordinateState, action) => {
        action.payload = "200";
      }
    );
    builder.addCase(
      addExcludedCoordinate.rejected,
      (_state: ExcludedCoordinateState, action) => {
        throw new Error(action.error.message);
      }
    );

    // removeExcludedCoordinate
    builder.addCase(
      removeExcludedCoordinate.fulfilled,
      (_state: ExcludedCoordinateState, action) => {
        action.payload = "200";
      }
    );
    builder.addCase(
      removeExcludedCoordinate.rejected,
      (_state: ExcludedCoordinateState, action) => {
        throw new Error(action.error.message);
      }
    );
  }
});

export const { setExcludedCoordinates } = excludedCoordinateSlice.actions;

export const selectExcludedCoordinates = (state: RootState) => state.excludedCoordinate.excludedCoordinates;
