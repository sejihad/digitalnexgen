import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/api/orders/admin`, {
        withCredentials: true,
      });
      setOrders(response.data);
    } catch (err) {
      setError("Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      await axios.delete(`${apiBaseUrl}/api/orders/${orderId}/delete`, {
        withCredentials: true,
      });
      toast.success("Order deleted successfully");
      setOrders(orders.filter((order) => order._id !== orderId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete order");
    }
  };

  if (loading) return <p className="text-gray-300 p-6">Loading orders...</p>;
  if (error) return <p className="text-red-500 p-6">{error}</p>;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto bg-gray-900 min-h-screen">
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-white">
        All Orders (Admin)
      </h2>

      {/* Mobile View with Horizontal Scroll */}
      <div className="md:hidden overflow-x-auto pb-2">
        <div className="inline-block min-w-full">
          {orders.length === 0 ? (
            <div className="text-center p-5 text-gray-400">
              No orders found.
            </div>
          ) : (
            <div className="grid gap-4" style={{ minWidth: "800px" }}>
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700 grid grid-cols-5 gap-2"
                >
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400">Order ID</p>
                    <p className="text-sm text-white break-all">{order._id}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400">User ID</p>
                    <p className="text-sm text-white break-all">
                      {order.user.id}
                    </p>
                  </div>
                  <div className="col-span-1 flex justify-end items-start">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        order.payment.status === "paid"
                          ? "bg-green-900 text-green-300"
                          : "bg-yellow-900 text-yellow-300"
                      }`}
                    >
                      {order.payment.status}
                    </span>
                  </div>

                  <div className="col-span-3">
                    <p className="font-medium text-white">
                      {order.service.name}
                    </p>
                    <p className="text-white">${order.service.price}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400">Status</p>
                    <p className="text-sm text-white capitalize">
                      {order.order_status}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-xs text-gray-400">Cancel Request</p>
                    <p
                      className={`text-xs ${
                        order.cancel_request
                          ? "text-yellow-400"
                          : "text-gray-400"
                      }`}
                    >
                      {order.cancel_request ? "Yes" : "No"}
                    </p>
                  </div>
                  <div className="col-span-3 flex justify-end space-x-2">
                    <Link
                      to={`/admin/orders/${order._id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => handleDeleteOrder(order._id)}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border border-gray-700 rounded-lg overflow-hidden">
          <thead className="bg-gray-800 text-left">
            <tr>
              <th className="p-3 text-sm text-gray-300">Order ID</th>
              <th className="p-3 text-sm text-gray-300">User ID</th>
              <th className="p-3 text-sm text-gray-300">Service</th>
              <th className="p-3 text-sm text-gray-300">Price</th>
              <th className="p-3 text-sm text-gray-300">Payment</th>
              <th className="p-3 text-sm text-gray-300">Status</th>
              <th className="p-3 text-sm text-gray-300">Cancel Req.</th>
              <th className="p-3 text-sm text-gray-300 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center p-5 text-gray-400">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-t border-gray-700 hover:bg-gray-800"
                >
                  <td className="p-3 text-xs text-white break-all max-w-xs">
                    {order._id}
                  </td>
                  <td className="p-3 text-xs text-white break-all max-w-xs">
                    {order.user.id}
                  </td>
                  <td className="p-3 text-sm text-white">
                    {order.service.name}
                  </td>
                  <td className="p-3 text-white">${order.service.price}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        order.payment.status === "paid"
                          ? "bg-green-900 text-green-300"
                          : "bg-yellow-900 text-yellow-300"
                      }`}
                    >
                      {order.payment.status}
                    </span>
                  </td>
                  <td className="p-3 text-white capitalize">
                    {order.order_status}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`text-xs ${
                        order.cancel_request
                          ? "text-yellow-400"
                          : "text-gray-400"
                      }`}
                    >
                      {order.cancel_request ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="p-3 text-center space-x-2">
                    <Link
                      to={`/admin/orders/${order._id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-md inline-block"
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => handleDeleteOrder(order._id)}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-md"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
