import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Auth from "../components/Auth";
import { loginUser, registerUser } from "../redux/authSlice";
import uploadImage from "../utils/uploadImage";

const Signup = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
    email: "",
    country: "",
    img: null,
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSignUp = async (event) => {
    event.preventDefault();

    let profilePictureUrl = null;

    if (credentials.profilePicture) {
      try {
        profilePictureUrl = await uploadImage(credentials.profilePicture);
      } catch (err) {
        toast.error("Error uploading image");
        return;
      }
    }

    const userData = {
      ...credentials,
      img: profilePictureUrl,
    };

    try {
      await dispatch(registerUser(userData)).unwrap();
      toast.success("Successfully Signed In!");
      await dispatch(
        loginUser({
          username: credentials.username,
          password: credentials.password,
        })
      ).unwrap();
      navigate("/services");
    } catch (err) {
      toast.error(err || "Sign Up failed. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleFileChange = (e) => {
    setCredentials({
      ...credentials,
      profilePicture: e.target.files[0],
    });
  };

  return (
    <Auth
      mode="sign-up"
      onSubmit={handleSignUp}
      credentials={credentials}
      onChange={handleInputChange}
      onFileChange={handleFileChange}
      isLoading={loading}
      error={error}
    />
  );
};

export default Signup;
