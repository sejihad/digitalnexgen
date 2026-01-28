import "boxicons/css/boxicons.min.css";
import { useEffect, useRef, useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Turnstile from "react-turnstile";
import countryCodes from "../../data/countryCodes.json";
import {
  loginUser,
  registerUser,
  resetError,
  resetOtp,
  verifyOtp,
} from "../../redux/authSlice";
import uploadImage from "../../utils/uploadImage";
import "./login.css";
const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Get auth state from Redux
  const { error, loading, otpPending, otpUserId, otpMessage, isAuthenticated } =
    useSelector((state) => state.auth);

  // Local states
  const [otp, setOtp] = useState("");
  const [cfTokenLogin, setCfTokenLogin] = useState("");

  const [loginCredentials, setLoginCredentials] = useState({
    email: "",
    password: "",
  });

  const [registerCredentials, setRegisterCredentials] = useState({
    name: "",
    password: "",
    email: "",
    phone: "",
    country: "",
    countryCode: "+880",
    profilePicture: null,
  });

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigateAfterLogin();
    }
  }, [isAuthenticated, navigate]);
  const prevErrorRef = useRef(null);
  // Show error toast if any
  useEffect(() => {
    // Only show toast if error exists and is different from previous
    if (error && error !== prevErrorRef.current) {
      console.log("Showing error toast:", error); // Debug log
      toast.error(error, {
        toastId: error, // Prevent duplicate toasts
        position: "top-right",
        autoClose: 5000,
      });

      // Update the ref
      prevErrorRef.current = error;

      // Clear error after showing
      setTimeout(() => {
        dispatch(resetError());
      }, 3000);
    }
  }, [error, dispatch]);

  // Navigate after successful login
  const navigateAfterLogin = (userData) => {
    try {
      const params = new URLSearchParams(location.search);
      const redirect = params.get("redirect");
      if (redirect) {
        navigate(redirect, { replace: true });
        return;
      }
    } catch (err) {
      console.error("Error parsing redirect URL:", err);
    }

    const loggedUser = userData || JSON.parse(localStorage.getItem("user"));
    if (loggedUser?.isAdmin) {
      navigate("/admin", { replace: true });
    } else {
      navigate("/service-list", { replace: true });
    }
  };

  // Handle OTP submission
  const handleOtpSubmit = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    if (!otpUserId) {
      toast.error("Session expired. Please login again.");
      dispatch(resetOtp());
      return;
    }

    try {
      await dispatch(
        verifyOtp({
          userId: otpUserId,
          otp,
        }),
      ).unwrap();

      toast.success("Login successful!");
      // Navigation will happen automatically via useEffect
    } catch (err) {
      // Error is already shown via useEffect
      setOtp(""); // Clear OTP on error
    }
  };

  // Handle login form submission
  const handleLoginSubmit = (e) => {
    e.preventDefault();

    if (!cfTokenLogin) {
      toast.error("Please complete the verification first");
      return;
    }

    if (!loginCredentials.email || !loginCredentials.password) {
      toast.error("Please enter email and password");
      return;
    }

    dispatch(
      loginUser({
        email: loginCredentials.email,
        password: loginCredentials.password,
        cfToken: cfTokenLogin,
      }),
    )
      .unwrap()
      .then((res) => {
        if (res.twoFactorRequired) {
          toast.info(res.message || "OTP sent to your email");
          // No need to dispatch anything - reducer handles it
        } else {
          toast.success("Login successful!");
          navigateAfterLogin(res);
        }
      })
      .catch((err) => {
        // Error is handled by reducer and shown via useEffect
        console.error("Login error:", err);
      });
  };

  // Handle register form submission
  // Handle register form submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!registerCredentials.name) {
      toast.error("Name is required");
      return;
    }

    if (!registerCredentials.email) {
      toast.error("Email is required");
      return;
    }

    if (!registerCredentials.password) {
      toast.error("Password is required");
      return;
    }

    if (registerCredentials.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    let profilePictureUrl = null;
    if (registerCredentials.profilePicture) {
      try {
        profilePictureUrl = await uploadImage(
          registerCredentials.profilePicture,
        );
      } catch (err) {
        toast.error("Error uploading profile picture");
        return;
      }
    }

    // Format phone number
    const cleanPhone = (registerCredentials.phone || "").replace(/[^0-9]/g, "");
    let combinedPhone = undefined;

    if (cleanPhone) {
      const localForE164 = cleanPhone.startsWith("0")
        ? cleanPhone.slice(1)
        : cleanPhone;
      combinedPhone =
        (registerCredentials.countryCode || "+880") + localForE164;
    }

    const userData = {
      name: registerCredentials.name,
      password: registerCredentials.password,
      email: registerCredentials.email,
      country: registerCredentials.country,
      phone: combinedPhone,
      number: cleanPhone,
      img: profilePictureUrl,
    };

    try {
      const result = await dispatch(registerUser(userData)).unwrap();

      if (result.twoFactorRequired) {
        toast.info(
          "Registration successful! Please verify OTP sent to your email.",
        );
        // Auto-fill login for OTP verification
        setLoginCredentials({
          email: registerCredentials.email,
          password: registerCredentials.password,
        });
      }
    } catch (err) {
      // সরাসরি error show করুন
      toast.error(err || "Registration failed");
    }
  };

  // Handle social login

  // Handle input changes
  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const digits = value.replace(/[^0-9]/g, "");
      setRegisterCredentials((prev) => ({ ...prev, phone: digits }));
    } else {
      setRegisterCredentials((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setRegisterCredentials((prev) => ({
        ...prev,
        profilePicture: e.target.files[0],
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-slate-50 dark:bg-black">
      <div className="containers bg-white shadow-lg dark:shadow-gray-700/50">
        {/* Login Form */}
        <div className="form-box login">
          {otpPending ? (
            <div className="otp-container">
              <h2>Enter OTP</h2>
              <p className="otp-message">{otpMessage}</p>

              <div className="input-box">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    if (value.length <= 6) setOtp(value);
                  }}
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                <i className="bx bx-key"></i>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  className="btn flex-1"
                  onClick={handleOtpSubmit}
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <button
                  type="button"
                  className="btn flex-1 bg-gray-500 hover:bg-gray-600"
                  onClick={() => dispatch(resetOtp())}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>

              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                OTP expires in 5 minutes. Check your email spam folder if not
                received.
              </p>
            </div>
          ) : (
            <form onSubmit={handleLoginSubmit}>
              <h1>Login</h1>

              <div className="input-box">
                <input
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={loginCredentials.email}
                  onChange={handleLoginInputChange}
                  required
                  disabled={loading}
                />
                <i className="bx bx-envelope"></i>
              </div>

              <div className="input-box">
                <input
                  type="password"
                  placeholder="Password"
                  name="password"
                  autoComplete="current-password"
                  value={loginCredentials.password}
                  onChange={handleLoginInputChange}
                  required
                  disabled={loading}
                />
                <i className="bx bx-lock-alt"></i>
              </div>

              <div className="turnstile-container" style={{ margin: "10px 0" }}>
                <Turnstile
                  sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                  onVerify={(token) => setCfTokenLogin(token)}
                  onExpire={() => setCfTokenLogin("")}
                  onError={() => {
                    toast.error("Verification failed. Please try again.");
                    setCfTokenLogin("");
                  }}
                />
              </div>

              <div className="forget-link">
                <a href="/auth/forgot-password">Forgot Password?</a>
              </div>

              <button
                type="submit"
                className="login-btn btn"
                disabled={loading || !cfTokenLogin}
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <p className="divider">or login with social accounts</p>

              <div className="social-icons">
                <a href={`${apiBaseUrl}/api/auth/google`} aria-label="Google">
                  <FaGoogle className="icon" />
                </a>
              </div>
            </form>
          )}
        </div>

        {/* Register Form */}
        <div className="form-box register">
          <form onSubmit={handleRegisterSubmit}>
            <h1>Registration</h1>

            <div className="input-boxs">
              <input
                type="text"
                placeholder="Full Name *"
                name="name"
                value={registerCredentials.name}
                onChange={handleRegisterInputChange}
                required
                disabled={loading}
              />
              <i className="bx bx-user"></i>
            </div>

            <div className="input-boxs">
              <input
                type="email"
                placeholder="Email *"
                name="email"
                value={registerCredentials.email}
                onChange={handleRegisterInputChange}
                required
                disabled={loading}
              />
              <i className="bx bx-envelope"></i>
            </div>

            <div className="input-boxs">
              <div className="flex gap-2 items-center">
                <select
                  name="countryCode"
                  value={registerCredentials.countryCode || "+880"}
                  onChange={handleRegisterInputChange}
                  className="py-2 w-[80px] rounded-md border border-gray-300 bg-white text-gray-700 dark:border-gray-700"
                >
                  {Object.entries(countryCodes).map(
                    ([country, code]) =>
                      code && (
                        <option key={country} value={`+${code}`}>
                          +{code} ({country})
                        </option>
                      ),
                  )}
                </select>

                <input
                  type="text"
                  placeholder="Phone Number "
                  name="phone"
                  value={registerCredentials.phone}
                  onChange={handleRegisterInputChange}
                  inputMode="numeric"
                  disabled={loading}
                />
              </div>
              <i className="bx bx-phone"></i>
            </div>

            <div className="input-boxs">
              <input
                type="password"
                placeholder="Password (min 6 characters) *"
                name="password"
                value={registerCredentials.password}
                onChange={handleRegisterInputChange}
                required
                minLength={6}
                disabled={loading}
              />
              <i className="bx bx-lock-alt"></i>
            </div>

            <button
              type="submit"
              className="register-btn btn"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>

            <p className="divider">or register with social accounts</p>

            <div className="social-icons">
              <a href={`${apiBaseUrl}/api/auth/google`} aria-label="Google">
                <FaGoogle className="icon" />
              </a>
            </div>
          </form>
        </div>

        {/* Toggle Box */}
        <div className="toggle-box before:bg-[#339e3cff] dark:before:bg-[#211f1f]">
          <div className="toggle-panel toggle-left">
            <h1>Hello, Welcome</h1>
            <p>Don't have an account?</p>
            <button
              className="btn register-toggle"
              onClick={(e) => {
                e.preventDefault();
                const container = document.querySelector(".containers");
                if (container) container.classList.add("active");
              }}
              disabled={loading || otpPending}
            >
              Register
            </button>
          </div>

          <div className="toggle-panel toggle-right">
            <h1>Welcome Back!</h1>
            <p>Already have an account?</p>
            <button
              className="btn login-toggle"
              onClick={(e) => {
                e.preventDefault();
                const container = document.querySelector(".containers");
                if (container) container.classList.remove("active");
              }}
              disabled={loading || otpPending}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
