import "boxicons/css/boxicons.min.css";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { loginUser, registerUser, setUser } from "../../redux/authSlice";
import uploadImage from "../../utils/uploadImage";
import { auth, providers } from "../../firebase";
import { signInWithPopup, fetchSignInMethodsForEmail, linkWithCredential, GoogleAuthProvider, FacebookAuthProvider, GithubAuthProvider, TwitterAuthProvider } from "firebase/auth";
import "./login.css";

const Login = () => {
  const [loginCredentials, setLoginCredentials] = useState({ email: "", password: "" });
  const [registerCredentials, setRegisterCredentials] = useState({ name: "", password: "", email: "", phone: "", country: "", countryCode: "+880", profilePicture: null });
  // Guided linking flow state
  const [pendingLinkProviderId, setPendingLinkProviderId] = useState(null); // e.g., "facebook.com" (the provider the user originally tried)
  const [resolveWithProviderId, setResolveWithProviderId] = useState(null); // e.g., "google.com" (the provider we must sign in with first)
  // We will not auto-link credentials; users will log in with the existing provider and can link later in settings.

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { loading, isAuthenticated } = useSelector((state) => state.auth);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const navigateAfterLogin = (userData) => {
    try {
      const params = new URLSearchParams(location.search);
      const redirect = params.get("redirect");
      if (redirect) {
        navigate(redirect, { replace: true });
        return;
      }
    } catch {}
    const loggedUser = userData || JSON.parse(localStorage.getItem("user"));
    if (loggedUser?.isAdmin) navigate("/admin");
    else navigate("/service-list");
  };

  // Map Firebase providerId to our providers map
  const providerFromId = (providerId) => {
    switch (providerId) {
      case "google.com":
        return providers.google;
      case "facebook.com":
        return providers.facebook;
      case "github.com":
        return providers.github;
      case "twitter.com":
        return providers.twitter;
      default:
        return null;
    }
  };

  const credentialFromError = (err) => {
    const pid = err?.customData?.providerId;
    switch (pid) {
      case "google.com":
        return GoogleAuthProvider.credentialFromError(err);
      case "facebook.com":
        return FacebookAuthProvider.credentialFromError(err);
      case "github.com":
        return GithubAuthProvider.credentialFromError(err);
      case "twitter.com":
        return TwitterAuthProvider.credentialFromError(err);
      default:
        return null;
    }
  };

  // Fallback: Build credential manually from error tokens if provider helpers return null
  const buildPendingCredential = (err) => {
    const pid = err?.customData?.providerId;
    const accessToken = err?.customData?.oauthAccessToken || err?.customData?.accessToken;
    const idToken = err?.customData?.oauthIdToken || err?.customData?.idToken;
    try {
      switch (pid) {
        case "google.com":
          // Google uses ID token
          if (idToken) return GoogleAuthProvider.credential(idToken);
          return null;
        case "facebook.com":
          // Facebook uses access token
          if (accessToken) return FacebookAuthProvider.credential(accessToken);
          return null;
        case "github.com":
          // GitHub uses access token
          if (accessToken) return GithubAuthProvider.credential(accessToken);
          return null;
        case "twitter.com":
          // Twitter uses access token and secret
          if (accessToken && err?.customData?.oauthAccessTokenSecret) return TwitterAuthProvider.credential(accessToken, err?.customData?.oauthAccessTokenSecret);
          return null;
        default:
          return null;
      }
    } catch {
      return null;
    }
  };

  const providerIdFromKey = (key) => {
    switch (key) {
      case "google":
        return "google.com";
      case "facebook":
        return "facebook.com";
      case "github":
        return "github.com";
      case "twitter":
        return "twitter.com";
      default:
        return null;
    }
  };

  const handleSocialLogin = async (providerKey) => {
    try {
      const provider = providers[providerKey];
      if (!provider) {
        toast.error("Provider not configured");
        return;
      }
      // Ensure we request email scope for providers that need it
      try {
        if (providerKey === "facebook" && provider.addScope) provider.addScope("email");
        if (providerKey === "github" && provider.addScope) provider.addScope("user:email");
      } catch (e) { /* no-op: scope add optional */ }

      // If we are in guided resolve step and user clicked the resolving provider, first sign in
      const thisProviderId = providerIdFromKey(providerKey);
      if (resolveWithProviderId && thisProviderId !== resolveWithProviderId) {
        const readable = resolveWithProviderId === "google.com" ? "Google" : resolveWithProviderId === "facebook.com" ? "Facebook" : resolveWithProviderId === "github.com" ? "GitHub" : resolveWithProviderId === "twitter.com" ? "Twitter" : resolveWithProviderId;
        toast.error(`Please click the ${readable} button first to continue.`);
        return;
      }
      if (resolveWithProviderId && thisProviderId === resolveWithProviderId) {
        // Clean session to avoid conflicts
        try { await auth.signOut(); } catch (e) { /* ignore */ }
        const existingResult = await signInWithPopup(auth, provider);

        // Finish backend session
        const idToken = await (existingResult.user || auth.currentUser).getIdToken();
        const { data } = await axios.post(
          `${apiBaseUrl}/api/auth/firebase`,
          { idToken },
          { withCredentials: true }
        );
        // Clear guided state
        setPendingLinkProviderId(null);
        setResolveWithProviderId(null);
        

        dispatch(setUser(data));
        toast.success("Logged in successfully");
        navigateAfterLogin(data);
        return;
      }

      // Normal social sign-in (ensure clean session)
      try { await auth.signOut(); } catch (e) { /* ignore */ }
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const { data } = await axios.post(
        `${apiBaseUrl}/api/auth/firebase`,
        { idToken },
        { withCredentials: true }
      );
      dispatch(setUser(data));
      toast.success("Logged in successfully");
      navigateAfterLogin(data);
    } catch (err) {
      // Handle account linking when email exists with a different provider
      if (err?.code === "auth/account-exists-with-different-credential") {
        try {
          const email = err?.customData?.email;
          let pendingCred = credentialFromError(err);
          if (!pendingCred) pendingCred = buildPendingCredential(err);
          if (!email) throw err;

          const methods = await fetchSignInMethodsForEmail(auth, email);
          if (!methods || methods.length === 0) throw err;

          // If password-based, we cannot auto-resolve via popup
          if (methods.includes("password")) {
            toast.error("This email is registered with password. Please sign in using email/password first, then retry the social button to link.");
            return;
          }
          // Guided two-step: ask user to click the existing provider button, then we will link the intended one
          const existingPid = methods[0];
          setPendingLinkProviderId(err?.customData?.providerId || null);
          setResolveWithProviderId(existingPid || null);
          // No auto-linking; users can link later if needed
          const readable = existingPid === "google.com" ? "Google" : existingPid === "facebook.com" ? "Facebook" : existingPid === "github.com" ? "GitHub" : existingPid === "twitter.com" ? "Twitter" : existingPid;
          const humanList = methods.map(m => m === "google.com" ? "Google" : m === "facebook.com" ? "Facebook" : m === "github.com" ? "GitHub" : m === "twitter.com" ? "Twitter" : m).join(", ");
          toast.info(`Email: ${email}. Existing methods: ${humanList}`);
          toast.error(`This email exists with ${readable}. Click the ${readable} button now. After that, we will link your ${providerKey} account automatically.`);
          return;
        } catch (linkErr) {
          console.error("Linking flow failed:", linkErr);
          const msg = linkErr?.response?.data?.message || linkErr?.message || "Login failed";
          toast.error(msg);
          return;
        }
      }

      console.error("Social login failed:", err);
      const msg = err?.response?.data?.message || err?.message || "Login failed";
      toast.error(msg);
    }
  };

  // Local toggle only (no navigation). Buttons below will add/remove 'active' on the container.

  // Redirect after auth
  useEffect(() => {
    if (isAuthenticated) {
      navigateAfterLogin();
    }
  }, [isAuthenticated]);

  // Show toast if Google redirect returned with phone_required error
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const err = params.get("error");
    if (err === "phone_required") {
      toast.error("Before login, add a phone number to your Gmail account");
      // Clean the URL
      navigate("/auth/login", { replace: true });
    }
  }, [location.search, navigate]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email: loginCredentials.email, password: loginCredentials.password }))
      .unwrap()
      .then(() => {
        toast.success("Successfully Signed In!");
        navigateAfterLogin();
      })
      .catch((err) => toast.error(err || "Sign-in failed. Please try again."));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    let profilePictureUrl = null;
    if (registerCredentials.profilePicture) {
      try {
        profilePictureUrl = await uploadImage(registerCredentials.profilePicture);
      } catch (err) {
        toast.error("Error uploading image");
        return;
      }
    }

    const cleanPhone = (registerCredentials.phone || "").replace(/[^0-9]/g, "");

    let localForE164 = cleanPhone;
    let combinedPhone = undefined;

    // Country-specific normalization (no validation)
    if ((registerCredentials.countryCode || "") === "+880") {
      // Remove a single leading trunk '0' for BD then build E.164
      localForE164 = cleanPhone.startsWith("0") ? cleanPhone.slice(1) : cleanPhone;
      combinedPhone = "+880" + localForE164;
    } else {
      // Generic: remove one trunk '0' then build E.164
      localForE164 = cleanPhone.startsWith("0") ? cleanPhone.slice(1) : cleanPhone;
      combinedPhone = ((registerCredentials.countryCode || "") + localForE164) || undefined;
    }

  

    const userData = {
      username: registerCredentials.name,
      password: registerCredentials.password,
      email: registerCredentials.email,
      country: registerCredentials.country,
      phone: combinedPhone,        // E.164 format: +8801950789774
      number: cleanPhone,          // Local digits only: 1950789774
      img: profilePictureUrl,
    };

    try {
      await dispatch(registerUser(userData)).unwrap();
      toast.success("Successfully Registered!");
      await dispatch(loginUser({ email: registerCredentials.email, password: registerCredentials.password })).unwrap();
      toast.success("Successfully Signed In!");
      navigateAfterLogin();
    } catch (err) {
      toast.error(err || "Sign Up failed. Please try again.");
    }
  };

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
    setRegisterCredentials((prev) => ({ ...prev, profilePicture: e.target.files[0] }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-slate-50 dark:bg-gray-900">
      <div className="containers bg-white shadow-lg dark:shadow-gray-700/50">
        {/* Login Form */}
        <div className="form-box login">
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
              />
              <i className="bx bx-lock-alt"></i>
            </div>
            <div className="forget-link">
              <a href="/auth/forgot-password">Forget Password?</a>
            </div>
            <button type="submit" className="login-btn btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
              <p>or login with social accounts</p>
            <div className="social-icons">
              <a href="#" onClick={(e) => { e.preventDefault(); handleSocialLogin('facebook'); }}>
                <i className="bx bxl-facebook"></i>
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); handleSocialLogin('google'); }}>
                <i className="bx bxl-google"></i>
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); handleSocialLogin('github'); }}>
                <i className="bx bxl-github"></i>
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); handleSocialLogin('twitter'); }}>
                <i className="bx bxl-twitter"></i>
              </a>
            </div>
          </form>
        </div>

        {/* Register Form */}
        <div className="form-box register">
          <form onSubmit={handleRegisterSubmit}>
            <h1>Registration</h1>
            <div className="input-boxs">
              <input
                type="text"
                placeholder="Name"
                name="name"
                value={registerCredentials.name}
                onChange={handleRegisterInputChange}
                required
              />
              <i className="bx bx-user"></i>
            </div>
            <div className="input-boxs">
              <input
                type="email"
                placeholder="Email"
                name="email"
                value={registerCredentials.email}
                onChange={handleRegisterInputChange}
                required
              />
              <i className="bx bx-envelope"></i>
            </div>
            <div className="input-boxs">
              <div className="flex gap-2 items-center">
                <select
                  name="countryCode"
                  value={registerCredentials.countryCode || "+880"}
                  onChange={handleRegisterInputChange}
                  className=" py-2 w-[50px] rounded-md border border-gray-300 bg-white text-gray-700 dark:border-gray-700"
                >
                  <option value={"+880"}>+880 (BD)</option>
                  <option value={"+91"}>+91 (IN)</option>
                  <option value={"+1"}>+1 (US)</option>
                  <option value={"+44"}>+44 (UK)</option>
                  <option value={"+971"}>+971 (AE)</option>
                </select>
                <input
                  type="text"
                  placeholder="Phone Number"
                  name="phone"
                  value={registerCredentials.phone}
                  onChange={handleRegisterInputChange}
                  inputMode="numeric"
                />
              </div>
              <i className="bx bx-phone"></i>
            </div>
            <div className="input-boxs">
              <input
                type="password"
                placeholder="Password"
                name="password"
                value={registerCredentials.password}
                onChange={handleRegisterInputChange}
                required
              />
              <i className="bx bx-lock-alt"></i>
            </div>
            <button type="submit" className="register-btn btn" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
            <p>or login with social accounts</p>
            <div className="social-icons">
              <a href="#" onClick={(e) => { e.preventDefault(); handleSocialLogin('facebook'); }}>
                <i className="bx bxl-facebook"></i>
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); handleSocialLogin('google'); }}>
                <i className="bx bxl-google"></i>
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); handleSocialLogin('github'); }}>
                <i className="bx bxl-github"></i>
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); handleSocialLogin('twitter'); }}>
                <i className="bx bxl-twitter"></i>
              </a>
            </div>
          </form>
        </div>

        {/* Toggle Box */}
        <div className="toggle-box">
          <div className="toggle-panel toggle-left">
            <h1>Hello, Welcome</h1>
            <p>Don't have an account?</p>
            <button
              className="btn register-toggle"
              onClick={(e) => {
                e.preventDefault();
                const container = document.querySelector(".containers");
                if (!container) return;
                container.classList.add("active");
              }}
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
                if (!container) return;
                container.classList.remove("active");
              }}
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
