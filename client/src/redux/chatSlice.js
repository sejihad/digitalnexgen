import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: { hasUnread: false },
  reducers: {
    setHasUnread(state, action) {
      state.hasUnread = !!action.payload;
    },
  },
});

export const { setHasUnread } = chatSlice.actions;
export default chatSlice.reducer;
