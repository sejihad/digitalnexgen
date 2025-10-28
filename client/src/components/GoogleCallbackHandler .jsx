import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { setUser } from "../redux/authSlice";
import Spinner from "../components/Spinner";

const GoogleCallbackHandler = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const hasProcessed = useRef(false);
  const { isLoading } = useSelector((state) => state.loading);

  useEffect(() => {
    if (hasProcessed.current) return;

    hasProcessed.current = true;

    const query = new URLSearchParams(window.location.search);
    const user = query.get("user");

    try {
      if (user) {
        const decodedUser = decodeURIComponent(user);
        const userData = JSON.parse(decodedUser);

        if (userData.id && userData.username && userData.email) {
          localStorage.setItem("user", JSON.stringify(userData));
          dispatch(setUser(userData));
          toast.success("Login successful!");
          navigate("/");
        } else {
          toast.error("Error logging in. Please try again.");
          navigate("/auth/sign-in");
        }
      } else {
        toast.error("Error logging in. Please try again.");
        navigate("/auth/sign-in");
      }
    } catch (error) {
      toast.error("Error processing login. Please try again.");
      navigate("/auth/sign-in");
    }
  }, [navigate, dispatch]);

  if (isLoading) {
    return <Spinner />;
  }

  return null;
};

export default GoogleCallbackHandler;
