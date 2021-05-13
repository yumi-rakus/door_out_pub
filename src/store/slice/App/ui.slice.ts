import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "~/store";

type UiState = {
  prevPathname: string | null;
};

const initialUiState: UiState = {
  prevPathname: null
};

////////////////////////// ** Slice ** //////////////////////////

export const uiSlice = createSlice({
  name: "error",
  initialState: initialUiState,
  reducers: {
    setPrevPathname: (state: UiState, action) => {
      state.prevPathname = action.payload;
    }
  }
});

export const { setPrevPathname } = uiSlice.actions;

export const selectPrevPathname = (state: RootState) => state.ui.prevPathname;