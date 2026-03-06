import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import chatReducer from "./chatSlice";
import loadingReducer from "./loadingSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    loading: loadingReducer,
    chat: chatReducer,
  },
});

export default store;
