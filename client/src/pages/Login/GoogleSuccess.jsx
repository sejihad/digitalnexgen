// src/pages/GoogleSuccess.jsx

import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "../../redux/authSlice";

const GoogleSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, {
        withCredentials: true,
      })
      .then((res) => {
        console.log("Google login successful:", res.data);
        dispatch(setUser(res.data.user));
        navigate("/");
      })
      .catch(() => {
        navigate("/auth/login");
      });
  }, []);

  return <p>Logging you in...</p>;
};

export default GoogleSuccess;
