import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import loadingReducer from "./loadingSlice";


const store = configureStore({
  reducer: {
    auth: authReducer,
    loading: loadingReducer,
  },
});

export default store;
