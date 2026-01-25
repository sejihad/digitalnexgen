// src/redux/authSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_BASE_URL;

// ======================= Thunks ======================= //

// Login User
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${apiUrl}/api/auth/login`,
        credentials,
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (error) {
      let errorMessage = "Login failed";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = "Invalid email or password";
      } else if (error.response?.status === 404) {
        errorMessage = "User not found";
      } else if (error.response?.status === 400) {
        errorMessage = "Please complete the verification";
      } else if (error.message) {
        errorMessage = error.message;
      }

      return rejectWithValue(errorMessage);
    }
  },
);

// Verify OTP
export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ userId, otp }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${apiUrl}/api/auth/verify-otp`,
        { userId, otp },
        { withCredentials: true },
      );
      return response.data;
    } catch (error) {
      let errorMessage = "OTP verification failed";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      return rejectWithValue(errorMessage);
    }
  },
);

// Register User
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${apiUrl}/api/auth/register`,
        userData,
      );
      return response.data;
    } catch (error) {
      let errorMessage = "Registration failed";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 409) {
        errorMessage = "Email already registered";
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid input data";
      } else if (error.message) {
        errorMessage = error.message;
      }

      return rejectWithValue(errorMessage);
    }
  },
);

// Logout User
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${apiUrl}/api/auth/logout`,
        {},
        { withCredentials: true },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Logout failed",
      );
    }
  },
);

// ======================= Slice ======================= //

// Safe parsing for localStorage
const storedUser = localStorage.getItem("user");

const initialState = {
  user:
    storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null,
  isAuthenticated: storedUser && storedUser !== "undefined" ? true : false,
  loading: false,
  error: null,
  otpPending: false,
  otpUserId: null,
  otpMessage: "",
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
    clearUser(state) {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("user");
      state.otpPending = false;
      state.otpUserId = null;
      state.otpMessage = "";
      state.error = null;
    },
    resetError(state) {
      state.error = null;
    },
    resetOtp(state) {
      state.otpPending = false;
      state.otpUserId = null;
      state.otpMessage = "";
    },
    setOtpData(state, action) {
      state.otpPending = true;
      state.otpUserId = action.payload.userId;
      state.otpMessage = action.payload.message || "";
    },
  },
  extraReducers: (builder) => {
    // -------- Login --------
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;

      if (action.payload.twoFactorRequired) {
        state.otpPending = true;
        state.otpUserId = action.payload.userId;
        state.otpMessage =
          action.payload.message || "Enter OTP sent to your email";
        state.error = null;
      } else {
        state.user = action.payload;
        state.isAuthenticated = true;
        localStorage.setItem("user", JSON.stringify(action.payload));
        state.otpPending = false;
        state.otpUserId = null;
        state.otpMessage = "";
        state.error = null;
      }
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "An unknown error occurred during login.";
      state.otpPending = false;
      state.otpUserId = null;
      state.otpMessage = "";
    });

    // -------- Register --------
    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload.twoFactorRequired) {
        state.otpPending = true;
        state.otpUserId = action.payload.userId;
        state.otpMessage =
          action.payload.message || "Enter OTP sent to your email";
      }
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.error =
        action.payload || "An unknown error occurred during registration.";
    });

    // -------- Logout --------
    builder.addCase(logoutUser.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.loading = false;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("user");
      state.otpPending = false;
      state.otpUserId = null;
      state.otpMessage = "";
      state.error = null;
    });
    builder.addCase(logoutUser.rejected, (state, action) => {
      state.loading = false;
      state.error =
        action.payload || "An unknown error occurred during logout.";
    });

    // -------- OTP Verification --------
    builder.addCase(verifyOtp.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(verifyOtp.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(action.payload));
      state.otpPending = false;
      state.otpUserId = null;
      state.otpMessage = "";
      state.error = null;
    });
    builder.addCase(verifyOtp.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "OTP verification failed";
      state.otpPending = true; // Keep OTP pending so user can try again
    });
  },
});

// ======================= Exports ======================= //
export const { setUser, clearUser, resetError, resetOtp, setOtpData } =
  authSlice.actions;
export default authSlice.reducer;
