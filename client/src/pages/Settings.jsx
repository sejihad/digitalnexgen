import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { setUser } from "../redux/authSlice.js";

const Settings = () => {
  const dispatch = useDispatch();
  const { user: authUser } = useSelector((state) => state.auth);

  const [user, setUserState] = useState({
    username: authUser?.username || "",
    email: authUser?.email || "",
    country: authUser?.country || "",
    phone: authUser?.phone || "",
    isTwoFactorEnabled: authUser?.isTwoFactorEnabled || false,
  });

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    country: "",
    phone: "",
    img: "",
  });

  const [formError, setFormError] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const userId = authUser?._id || authUser?.id;

  const validateField = (name, value) => {
    const trimmedValue = typeof value === "string" ? value.trim() : value;

    switch (name) {
      case "username":
        if (!trimmedValue) return "Username is required";
        if (trimmedValue.length < 3) {
          return "Username must be at least 3 characters";
        }
        return "";

      case "email":
        if (!trimmedValue) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
          return "Please enter a valid email address";
        }
        return "";

      case "country":
        if (!trimmedValue) return "Country is required";
        if (trimmedValue.length < 2) {
          return "Country name must be at least 2 characters";
        }
        return "";

      case "phone":
        if (!trimmedValue) return "Phone number is required";
        if (!/^\+?[0-9\s\-()]+$/.test(trimmedValue)) {
          return "Please enter a valid phone number";
        }
        return "";

      default:
        return "";
    }
  };

  const buildValidationErrors = (data) => ({
    username: validateField("username", data.username),
    email: validateField("email", data.email),
    country: validateField("country", data.country),
    phone: validateField("phone", data.phone),
    img: "",
  });

  const hasAnyError = (errorObject) =>
    Object.values(errorObject).some((error) => error);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user")) || {};

    const mergedUser = {
      username: storedUser.username ?? authUser?.username ?? "",
      email: storedUser.email ?? authUser?.email ?? "",
      country: storedUser.country ?? authUser?.country ?? "",
      phone: storedUser.phone ?? authUser?.phone ?? "",
      isTwoFactorEnabled:
        storedUser.isTwoFactorEnabled ?? authUser?.isTwoFactorEnabled ?? false,
    };

    setUserState(mergedUser);

    const initialErrors = buildValidationErrors(mergedUser);
    setErrors(initialErrors);

    if (hasAnyError(initialErrors)) {
      setFormError("Please complete all required fields correctly.");
      toast.error("Please complete your profile information");
    }
  }, [authUser]);

  const validateForm = () => {
    const newErrors = buildValidationErrors(user);
    setErrors(newErrors);

    const hasErrors = hasAnyError(newErrors);

    if (hasErrors) {
      setFormError("Please complete all required fields correctly.");
    } else {
      setFormError("");
    }

    return !hasErrors;
  };

  const handleToggleTwoFactor = async () => {
    if (twoFactorLoading || !userId) return;

    setTwoFactorLoading(true);
    try {
      const response = await axios.put(
        `${apiBaseUrl}/api/auth/twofactor/toggle`,
        {},
        { withCredentials: true },
      );

      const updatedTwoFactorStatus = response.data.user?.isTwoFactorEnabled;

      if (typeof updatedTwoFactorStatus === "boolean") {
        setUserState((prev) => ({
          ...prev,
          isTwoFactorEnabled: updatedTwoFactorStatus,
        }));

        const updatedUser = {
          ...authUser,
          isTwoFactorEnabled: updatedTwoFactorStatus,
        };

        dispatch(setUser(updatedUser));
        localStorage.setItem("user", JSON.stringify(updatedUser));

        toast.success(response.data.message || "2FA updated successfully");
      } else {
        toast.error("Failed to fetch updated 2FA status");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update 2FA";
      toast.error(errorMessage);
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setUserState((prev) => ({
      ...prev,
      [name]: value,
    }));

    const fieldError = validateField(name, value);

    setErrors((prev) => {
      const updatedErrors = {
        ...prev,
        [name]: fieldError,
      };

      if (hasAnyError(updatedErrors)) {
        setFormError("Please complete all required fields correctly.");
      } else {
        setFormError("");
      }

      return updatedErrors;
    });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    setErrors((prev) => {
      const updatedErrors = {
        ...prev,
        [name]: validateField(name, value),
      };

      if (hasAnyError(updatedErrors)) {
        setFormError("Please complete all required fields correctly.");
      } else {
        setFormError("");
      }

      return updatedErrors;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setNewImage(file);

    setErrors((prev) => ({
      ...prev,
      img: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      toast.error("User not found. Please login again.");
      return;
    }

    if (!validateForm()) {
      toast.error("Please complete all required fields");

      const firstErrorField = ["username", "email", "country", "phone"].find(
        (field) => validateField(field, user[field]),
      );

      if (firstErrorField) {
        const el = document.getElementById(firstErrorField);
        el?.focus();
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();

      formData.append("username", user.username.trim());
      formData.append("email", user.email.trim());
      formData.append("country", user.country.trim());
      formData.append("phone", user.phone.trim());

      if (newImage) {
        formData.append("img", newImage);
      }

      const response = await axios.put(
        `${apiBaseUrl}/api/users/${userId}`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const updatedUser = {
        ...authUser,
        ...response.data,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
      };

      dispatch(setUser(updatedUser));
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setFormError("");
      toast.success("Profile updated successfully!");
      setNewImage(null);
    } catch (error) {
      const backendErrors = error.response?.data?.errors;

      if (backendErrors && typeof backendErrors === "object") {
        setErrors((prev) => ({
          ...prev,
          ...backendErrors,
        }));
        setFormError("Please fix the highlighted fields.");
      }

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update profile";

      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const inputClass = (fieldName) =>
    `w-full rounded-xl border bg-white/80 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:ring-2 dark:bg-white/5 dark:text-gray-100 ${
      errors[fieldName]
        ? "border-red-500 focus:ring-red-500/40 dark:border-red-500"
        : "border-black/10 focus:ring-[rgb(12,187,20)]/50 dark:border-white/10"
    }`;

  return (
    <div className="min-h-screen bg-white px-4 py-5 text-gray-900 dark:bg-black dark:text-gray-100">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-black/10 bg-white/70 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-black/10 pb-3 dark:border-white/10">
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">Settings</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                Update profile and security settings
              </p>
            </div>

            <div className="hidden rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs text-gray-600 backdrop-blur-md dark:border-white/10 dark:bg-white/10 dark:text-gray-300 sm:block">
              Account
            </div>
          </div>

          {authUser?.provider === "local" && (
            <div className="mb-4 rounded-2xl border border-black/10 bg-white/60 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Two Factor Authentication
                  </h3>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    Add an extra layer of protection
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleToggleTwoFactor}
                  disabled={twoFactorLoading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[rgb(12,187,20)]/60 ${
                    user.isTwoFactorEnabled
                      ? "bg-[rgb(12,187,20)]"
                      : "bg-gray-300 dark:bg-gray-600"
                  } ${twoFactorLoading ? "cursor-not-allowed opacity-80" : ""}`}
                >
                  <span className="sr-only">
                    {user.isTwoFactorEnabled ? "Disable" : "Enable"} 2FA
                  </span>
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-300 ${
                      user.isTwoFactorEnabled
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
                <p className="font-semibold">
                  Please complete your profile properly.
                </p>
                <p className="mt-1 text-xs sm:text-sm">
                  Required fields cannot be empty. Check the highlighted fields
                  below.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-black/10 bg-white/60 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <label
                  htmlFor="username"
                  className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-300"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={user.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("username")}
                />
                {errors.username && (
                  <p className="mt-1 text-xs font-medium text-red-500">
                    {errors.username}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-black/10 bg-white/60 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-300"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-xs font-medium text-red-500">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-black/10 bg-white/60 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <label
                  htmlFor="country"
                  className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-300"
                >
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={user.country}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("country")}
                />
                {errors.country && (
                  <p className="mt-1 text-xs font-medium text-red-500">
                    {errors.country}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-black/10 bg-white/60 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <label
                  htmlFor="phone"
                  className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-300"
                >
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={user.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("phone")}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs font-medium text-red-500">
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white/60 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <label
                htmlFor="img"
                className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-300"
              >
                Profile Image
              </label>

              <input
                type="file"
                id="img"
                name="img"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm text-gray-900 outline-none transition file:mr-3 file:rounded-lg file:border-0 file:bg-[rgb(12,187,20)]/10 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[rgb(12,187,20)] hover:file:bg-[rgb(12,187,20)]/20 dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
              />

              <div className="mt-3 flex flex-wrap items-center gap-3">
                {authUser?.img && !newImage && (
                  <div className="relative">
                    <img
                      src={authUser.img?.url || authUser.img}
                      alt="Current Profile"
                      className="h-16 w-16 rounded-full border border-black/10 object-cover dark:border-white/10"
                    />
                    <span className="absolute -bottom-1 -right-1 rounded-full bg-gray-800 px-1.5 py-0.5 text-[10px] text-white dark:bg-white dark:text-black">
                      Current
                    </span>
                  </div>
                )}

                {newImage && (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(newImage)}
                      alt="New Profile"
                      className="h-16 w-16 rounded-full border border-[rgb(12,187,20)] object-cover"
                    />
                    <span className="absolute -bottom-1 -right-1 rounded-full bg-[rgb(12,187,20)] px-1.5 py-0.5 text-[10px] text-white">
                      New
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                type="submit"
                disabled={isUploading}
                className="w-full rounded-xl bg-[rgb(12,187,20)] px-4 py-2.5 text-sm font-medium text-white transition duration-300 hover:bg-[rgb(10,167,18)] focus:outline-none focus:ring-2 focus:ring-[rgb(12,187,20)]/60 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUploading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="mr-2 h-4 w-4 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Updating Profile...
                  </span>
                ) : (
                  "Update Profile"
                )}
              </button>

              {authUser?.provider === "local" && (
                <Link
                  to="/update-password"
                  className="block w-full rounded-xl bg-gray-100 px-4 py-2.5 text-center text-sm font-medium text-gray-900 transition duration-300 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400/60 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                >
                  Change Password
                </Link>
              )}

              <Link
                to="/profile/delete"
                className="block w-full rounded-xl bg-red-100 px-4 py-2.5 text-center text-sm font-medium text-red-700 transition duration-300 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-400/60 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
              >
                Request Account Deletion
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
