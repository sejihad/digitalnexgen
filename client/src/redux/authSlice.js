import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { hideLoading, showLoading } from "./loadingSlice";

const apiUrl = import.meta.env.VITE_API_BASE_URL;

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      dispatch(showLoading());
      const response = await axios.post(
        `${apiUrl}/api/auth/login`,
        credentials,
        { withCredentials: true }
      );
      localStorage.setItem("user", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    } finally {
      dispatch(hideLoading());
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue, dispatch }) => {
    try {
      dispatch(showLoading());
      const response = await axios.post(
        `${apiUrl}/api/auth/register`,
        userData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    } finally {
      dispatch(hideLoading());
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      dispatch(showLoading());
      const response = await axios.post(
        `${apiUrl}/api/auth/logout`,
        {},
        { withCredentials: true }
      );

      localStorage.removeItem("user");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    } finally {
      dispatch(hideLoading());
    }
  }
);

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  isAuthenticated: !!localStorage.getItem("user"),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    resetError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(action.payload));
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "An unknown error occurred during login.";
    });

    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.error =
        action.payload || "An unknown error occurred during registration.";
    });

    builder.addCase(logoutUser.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.loading = false;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("user");
    });
    builder.addCase(logoutUser.rejected, (state, action) => {
      state.loading = false;
      state.error =
        action.payload || "An unknown error occurred during logout.";
    });
  },
});

export const { setUser, resetError } = authSlice.actions;
export default authSlice.reducer;
