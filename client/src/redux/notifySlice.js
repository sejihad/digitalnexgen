import { createSlice } from "@reduxjs/toolkit";

const notifySlice = createSlice({
  name: "notify",
  initialState: {
    hasUnreadNotifications: false,
  },
  reducers: {
    setHasUnreadNotifications(state, action) {
      state.hasUnreadNotifications = !!action.payload;
    },
  },
});

export const { setHasUnreadNotifications } = notifySlice.actions;
export default notifySlice.reducer;
