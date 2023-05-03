import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import navReducer from "./slicers/navSlicer";
import toolsReducer from "./slicers/toolsSlicer";
import commonAppReducer from "./slicers/commonAppSlicer";

const store = configureStore({
  reducer: { nav: navReducer, tool: toolsReducer, app: commonAppReducer },
  middleware: () => getDefaultMiddleware(),
});

export default store;
