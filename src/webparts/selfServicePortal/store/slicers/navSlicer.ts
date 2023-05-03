import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { listService } from "../../services";

export const getLeftNavigationItems = createAsyncThunk(
  "nav/getLeftNavigationItems",
  async () => {
    const response = await listService.getLeftNavItems();
    return response;
  }
);

export const getToolTags = createAsyncThunk("nav/getToolTags", async () => {
  const response = await listService.getToolTags();
  return response;
});

const navigationSlicer = createSlice({
  name: "nav",
  initialState: { entities: [], keyWords: [] },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getToolTags.fulfilled, (state, action) => {
        state.keyWords = action.payload;
      })
      .addCase(getLeftNavigationItems.fulfilled, (state, action) => {
        state.entities = action.payload;
      });
  },
});

//export const getLeftNavLinks = state =>

export default navigationSlicer.reducer;
