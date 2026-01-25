import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { hideLoading, showLoading } from "../redux/loadingSlice";

const EditPartner = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoPreview, setLogoPreview] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      website: "",
      logo: null,
    },
  });

  useEffect(() => {
    const fetchPartner = async () => {
      dispatch(showLoading());
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/partners/${id}`,
          { withCredentials: true },
        );
        const partner = response.data;
        setValue("name", partner.name);
        setValue("website", partner.website || "");
        setLogoPreview(partner.logo?.url || null);
      } catch (error) {
        toast.error("Failed to fetch partner details.");
      } finally {
        dispatch(hideLoading());
      }
    };

    fetchPartner();
  }, [id, dispatch, setValue]);

  const onSubmit = async (data) => {
    dispatch(showLoading());
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("website", data.website || "");

      // 🔥 only append file if user selected new logo
      if (data.logo && data.logo[0]) {
        formData.append("logo", data.logo[0]);
      }

      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/partners/${id}`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      toast.success("Partner updated successfully!");
      navigate("/admin/partners");
    } catch (error) {
      toast.error("Failed to update partner. Please try again.");
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
      <h1 className="text-center text-3xl font-bold mb-4 font-roboto">
        Edit Partner
      </h1>
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
          {...register("website")}
          placeholder="Website URL (optional)"
          className="w-full p-2 rounded bg-gray-700"
        />

        {/* Logo Upload */}
        <input
          {...register("logo")}
          type="file"
          accept="image/*"
          onChange={handleLogoPreview}
          className="w-full p-2 rounded bg-gray-700"
        />

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

        <button
          type="submit"
          className="w-full p-2 bg-primaryRgb rounded text-white"
        >
          Update Partner
        </button>
      </form>
    </div>
  );
};

export default EditPartner;
