import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Auth from "../components/Auth";
import { loginUser } from "../redux/authSlice";

const Signin = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, isAuthenticated, user } = useSelector(
    (state) => state.auth,
  );

  const handleSignIn = (event) => {
    event.preventDefault();
    dispatch(loginUser(credentials))
      .unwrap()
      .then(() => {
        toast.success("Successfully Signed In!");
      })
      .catch((err) => {
        toast.error(err || "Sign-in failed. Please try again.");
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  useEffect(() => {
    if (isAuthenticated) {
      const loggedUser = JSON.parse(localStorage.getItem("user"));

      if (loggedUser?.isAdmin) {
        navigate("/admin");
      } else {
        navigate("/service-list");
      }
    }
  }, [isAuthenticated, navigate]);

  return (
    <Auth
      mode="sign-in"
      onSubmit={handleSignIn}
      credentials={credentials}
      onChange={handleInputChange}
      isLoading={loading}
      error={error}
    />
  );
};

export default Signin;
