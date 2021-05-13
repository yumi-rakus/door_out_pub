import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "~/store";

type ErrorState = {
  error: {
    isError: boolean;
    code?: string;
  };
};

const initialErrorState: ErrorState = {
  error: {
    isError: false
  }
};

////////////////////////// ** Slice ** //////////////////////////

export const errorSlice = createSlice({
  name: "error",
  initialState: initialErrorState,
  reducers: {
    setError: (state: ErrorState, action) => {
      state.error = action.payload;
    }
  }
});

export const { setError } = errorSlice.actions;

export const selectError = (state: RootState) => state.error.error;