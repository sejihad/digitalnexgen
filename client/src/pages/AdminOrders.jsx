import axios from "axios";
import { Eye, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

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
      setOrders(Array.isArray(response.data) ? response.data : []);
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
      setOrders((prev) => prev.filter((order) => order._id !== orderId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete order");
    }
  };

  const getPaymentBadge = (status) => {
    return status === "paid"
      ? "border-green-500/20 bg-green-500/10 text-green-300"
      : "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";
  };

  const getStatusBadge = (status) => {
    if (status === "completed") {
      return "border-green-500/20 bg-green-500/10 text-green-300";
    }
    if (status === "pending") {
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";
    }
    if (status === "in progress") {
      return "border-blue-500/20 bg-blue-500/10 text-blue-300";
    }
    if (status === "cancelled") {
      return "border-red-500/20 bg-red-500/10 text-red-300";
    }
    return "border-white/10 bg-white/5 text-gray-300";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white px-4 py-5 text-gray-900 dark:bg-black dark:text-gray-100">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-black/10 bg-white/70 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Loading orders...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white px-4 py-5 text-gray-900 dark:bg-black dark:text-gray-100">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:border-red-500/20 dark:bg-red-500/10">
            <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-5 text-gray-900 dark:bg-black dark:text-gray-100">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-black/10 bg-white/70 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:p-5">
          <div className="mb-5 flex flex-col gap-3 border-b border-black/10 pb-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgb(12,187,20)]/10 text-[rgb(12,187,20)]">
                <ShoppingBag className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-lg font-bold text-[rgb(12,187,20)] sm:text-xl">
                  All Orders
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                  Manage all customer orders from one place.
                </p>
              </div>
            </div>

            <div className="rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-xs font-medium text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
              Total Orders: {orders.length}
            </div>
          </div>

          {/* Mobile / Tablet Card View */}
          <div className="grid grid-cols-1 gap-4 xl:hidden">
            {orders.length === 0 ? (
              <div className="rounded-2xl border border-black/10 bg-white/60 p-5 text-center text-sm text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400">
                No orders found.
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order._id}
                  className="rounded-2xl border border-black/10 bg-white/60 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {order?.service?.name || "Service"}
                      </p>
                      <p className="mt-1 break-all text-xs text-gray-500 dark:text-gray-400">
                        Order ID: {order?._id}
                      </p>
                    </div>

                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${getStatusBadge(
                        order?.order_status,
                      )}`}
                    >
                      {order?.order_status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-black/10 bg-white/70 p-3 dark:border-white/10 dark:bg-black/20">
                      <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        User ID
                      </p>
                      <p className="mt-1 break-all text-sm text-gray-800 dark:text-gray-200">
                        {order?.user?.id}
                      </p>
                    </div>

                    <div className="rounded-xl border border-black/10 bg-white/70 p-3 dark:border-white/10 dark:bg-black/20">
                      <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Price
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
                        ${order?.finalPrice}
                      </p>
                    </div>

                    <div className="rounded-xl border border-black/10 bg-white/70 p-3 dark:border-white/10 dark:bg-black/20">
                      <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Payment
                      </p>
                      <div className="mt-1">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${getPaymentBadge(
                            order?.payment?.status,
                          )}`}
                        >
                          {order?.payment?.status}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-black/10 bg-white/70 p-3 dark:border-white/10 dark:bg-black/20">
                      <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Cancel Request
                      </p>
                      <p
                        className={`mt-1 text-sm font-medium ${
                          order?.cancel_request
                            ? "text-yellow-600 dark:text-yellow-300"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {order?.cancel_request ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <Link
                      to={`/admin/orders/${order._id}`}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                      <Eye className="h-4 w-4" />
                      Details
                    </Link>

                    <button
                      onClick={() => handleDeleteOrder(order._id)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden xl:block overflow-x-auto">
            <table className="w-full min-w-[1100px] overflow-hidden rounded-2xl border border-black/10 dark:border-white/10">
              <thead className="bg-black/[0.03] dark:bg-white/[0.04]">
                <tr>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    Order ID
                  </th>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    User ID
                  </th>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    Service
                  </th>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    Price
                  </th>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    Payment
                  </th>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    Status
                  </th>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    Cancel Request
                  </th>
                  <th className="p-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="p-6 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-t border-black/10 transition hover:bg-black/[0.02] dark:border-white/10 dark:hover:bg-white/[0.03]"
                    >
                      <td className="p-3 text-xs text-gray-800 dark:text-gray-200 break-all max-w-[180px]">
                        {order._id}
                      </td>

                      <td className="p-3 text-xs text-gray-800 dark:text-gray-200 break-all max-w-[180px]">
                        {order?.user?.id}
                      </td>

                      <td className="p-3 text-sm font-medium text-gray-900 dark:text-white">
                        {order?.service?.name}
                      </td>

                      <td className="p-3 text-sm font-semibold text-gray-900 dark:text-white">
                        ${order?.finalPrice}
                      </td>

                      <td className="p-3">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${getPaymentBadge(
                            order?.payment?.status,
                          )}`}
                        >
                          {order?.payment?.status}
                        </span>
                      </td>

                      <td className="p-3">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize ${getStatusBadge(
                            order?.order_status,
                          )}`}
                        >
                          {order?.order_status}
                        </span>
                      </td>

                      <td className="p-3 text-sm">
                        <span
                          className={
                            order?.cancel_request
                              ? "text-yellow-600 dark:text-yellow-300"
                              : "text-gray-500 dark:text-gray-400"
                          }
                        >
                          {order?.cancel_request ? "Yes" : "No"}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            to={`/admin/orders/${order._id}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Details
                          </Link>

                          <button
                            onClick={() => handleDeleteOrder(order._id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
