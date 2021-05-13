import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "~/store";

type MapState = {
  center: {
    lat: number | null;
    lng: number | null;
  };
};

const initialMapState: MapState = {
  center: {
    lat: null,
    lng: null
  }
};

export const mapSlice = createSlice({
  name: "map",
  initialState: initialMapState,
  reducers: {
    setCenter: (state: MapState, action) => {
      state.center = action.payload;
    }
  }
});

export const { setCenter } = mapSlice.actions;

export const selectCenter = (state: RootState) => state.map.center;
