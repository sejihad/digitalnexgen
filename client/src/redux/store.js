import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import chatReducer from "./chatSlice";
import loadingReducer from "./loadingSlice";
import notifyReducer from "./notifySlice";
const store = configureStore({
  reducer: {
    auth: authReducer,
    loading: loadingReducer,
    chat: chatReducer,
    notify: notifyReducer,
  },
});

export default store;
