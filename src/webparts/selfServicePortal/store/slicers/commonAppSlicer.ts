import {
  Action,
  AnyAction,
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";
import { listService } from "../../services";

export const getAllUserBadges = createAsyncThunk(
  "app/getAllUserBadges",
  async () => {
    return await listService.getAllUserBadges();
  }
);

export const getHomePageResources = createAsyncThunk(
  "app/getHomePageResources",
  async () => {
    return await listService.getHomePageResources();
  }
);

export const getHomePageArticles = createAsyncThunk(
  "app/getHomePageArticles",
  async () => {
    return await listService.getHomePageArticles();
  }
);
export const isUserInApprroverGroup = createAsyncThunk(
  "app/isUserInApprroverGroup",
  async () => {
    return await listService.isUserInApprroverGroup();
  }
);

export const loadHopperFeatures = createAsyncThunk(
  "app/loadHopperFeatures",
  async () => {
    return await listService.loadHopperFeatures();
  }
);

interface RejectedAction extends Action {
  error: Error;
}
interface PendingAction extends Action {
  loading: "pending";
}
interface FullfiledAction extends Action {
  loading: "idle";
  error: null;
}
function isRejectedAction(action: AnyAction): action is RejectedAction {
  return action.type.endsWith("rejected");
}
function isPendingAction(action: AnyAction): action is PendingAction {
  return action.type.endsWith("pending");
}
function isFulfilledAction(action: AnyAction): action is FullfiledAction {
  return action.type.endsWith("fulfilled");
}

const appSlicer = createSlice({
  name: "app",
  initialState: {
    loading: "idle",
    error: null,
    resources: [],
    articles: [],
    allBadges: [],
    isUserApprover: false,
    features: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadHopperFeatures.fulfilled, (state, action) => {
        state.features = action.payload;
      })
      .addCase(getAllUserBadges.fulfilled, (state, action) => {
        state.allBadges = action.payload;
      })
      .addCase(getHomePageArticles.fulfilled, (state, action) => {
        state.articles = action.payload;
      })
      .addCase(getHomePageResources.fulfilled, (state, action) => {
        state.resources = action.payload;
      })
      .addCase(isUserInApprroverGroup.fulfilled, (state, action) => {
        state.isUserApprover = action.payload;
      })
      .addMatcher(isPendingAction, (state, action) => {
        if (state.loading === "idle") {
          state.loading = "pending";
        }
      })
      .addMatcher(isFulfilledAction, (state, action) => {
        if (state.loading === "pending") {
          state.loading = "idle";
          state.error = action.error;
        }
      })
      .addMatcher(isRejectedAction, (state, action) => {
        if (state.loading === "pending") {
          state.error = action.error;
          state.loading = "idle";
        }
      });
  },
});

export default appSlicer.reducer;
