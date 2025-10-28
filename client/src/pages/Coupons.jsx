import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const fetchCoupons = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/coupon`,
        {
          withCredentials: true,
        }
      );
      setCoupons(res.data);
    } catch (error) {
      toast.error("Failed to load coupons");
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const onSubmit = async (data) => {
    try {
      if (editingCoupon) {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/api/coupon/${
            editingCoupon._id
          }`,
          data,
          { withCredentials: true }
        );
        toast.success("Coupon updated successfully");
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/coupon/add`,
          data,
          { withCredentials: true }
        );
        toast.success("Coupon added successfully");
      }
      reset();
      setEditingCoupon(null);
      fetchCoupons();
    } catch (error) {
      toast.error("Failed to submit coupon");
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setValue("code", coupon.code);
    setValue("discountValue", coupon.discountValue);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/coupon/${id}`,
        { withCredentials: true }
      );
      toast.success("Coupon deleted");
      fetchCoupons();
    } catch (error) {
      toast.error("Failed to delete coupon");
    }
  };

  return (
    <div className="p-6 text-white bg-[#333333] max-w-[900px] mx-auto rounded-md mt-4">
      <h1 className="text-center text-3xl font-bold mb-4 font-roboto">
        Manage Coupons
      </h1>

      {/* Coupon Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          {...register("code", { required: "Code is required" })}
          placeholder="Coupon Code"
          className="w-full p-2 rounded bg-gray-700"
        />
        {errors.code && <p className="text-red-500">{errors.code.message}</p>}

        <input
          {...register("discountValue", {
            required: "Discount value is required",
            min: 1,
            max: 100,
          })}
          type="number"
          placeholder="Discount Percentage (e.g. 20)"
          className="w-full p-2 rounded bg-gray-700"
        />
        {errors.discountValue && (
          <p className="text-red-500">{errors.discountValue.message}</p>
        )}

        <button type="submit" className="w-full p-2 bg-primaryRgb rounded">
          {editingCoupon ? "Update Coupon" : "Add Coupon"}
        </button>
      </form>

      {/* All Coupons */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-2">All Coupons</h2>
        <div className="space-y-4">
          {coupons.map((coupon) => (
            <div
              key={coupon._id}
              className="p-4 bg-gray-800 rounded flex justify-between items-center"
            >
              <div>
                <p className="font-bold">{coupon.code}</p>
                <p>{coupon.discountValue}% off</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(coupon)}
                  className="bg-yellow-500 px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(coupon._id)}
                  className="bg-red-600 px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Coupons;
