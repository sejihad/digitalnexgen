import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import axios from "axios";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/loadingSlice";
import uploadImage from "../utils/uploadImage"; // your image upload utility

const AddPartner = () => {
  const dispatch = useDispatch();
  const [logoPreview, setLogoPreview] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      logo: null,
      websiteUrl: "",
    },
  });

  const onSubmit = async (data) => {
    if (!data.logo[0]) {
      return toast.error("Please select a logo image.");
    }

    dispatch(showLoading());
    try {
      const logoUrl = await uploadImage(data.logo[0]);

      const partnerData = {
        name: data.name,
        logoUrl,
        websiteUrl: data.websiteUrl || "",
      };

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/partners`,
        partnerData,
        { withCredentials: true }
      );

      toast.success("Partner added successfully!");
      reset();
      setLogoPreview(null);
    } catch (error) {
      toast.error("Failed to add partner. Please try again.");
    } finally {
      dispatch(hideLoading());
    }
  };

  const handleLogoPreview = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="p-6 text-white bg-[#333333] max-w-[600px] mx-auto rounded-md mt-4">
      <h1 className="text-center text-3xl font-bold mb-4 font-roboto">Add New Partner</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <input
          {...register("name", { required: "Partner name is required" })}
          placeholder="Partner Name"
          className="w-full p-2 rounded bg-gray-700"
        />
        {errors.name && <p className="text-red-500">{errors.name.message}</p>}

        {/* Website URL */}
        <input
          {...register("websiteUrl")}
          placeholder="Website URL (optional)"
          className="w-full p-2 rounded bg-gray-700"
        />

        {/* Logo Upload */}
        <input
          {...register("logo", { required: "Logo image is required" })}
          type="file"
          accept="image/*"
          onChange={handleLogoPreview}
          className="w-full p-2 rounded bg-gray-700"
        />
        {errors.logo && <p className="text-red-500">{errors.logo.message}</p>}

        {/* Logo Preview */}
        {logoPreview && (
          <div className="mt-2 flex justify-center">
            <img
              src={logoPreview}
              alt="Logo Preview"
              className="w-32 h-32 object-contain rounded-md border border-gray-600"
            />
          </div>
        )}

        <button type="submit" className="w-full p-2 bg-primaryRgb rounded text-white">
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddPartner;
