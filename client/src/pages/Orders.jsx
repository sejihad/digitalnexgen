import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/orders`, {
          withCredentials: true,
        });
        setOrders(response.data);
      } catch (err) {
        setError("Failed to fetch your orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [apiBaseUrl]);

  const handleCancelRequest = async (orderId) => {
    try {
      await axios.put(
        `${apiBaseUrl}/api/orders/${orderId}/request-cancel`,
        {},
        { withCredentials: true },
      );

      toast.success("Cancel request sent.");

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, cancel_request: true } : order,
        ),
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send cancel request.",
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="container mx-auto px-4 py-8 md:px-6">
          <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <p className="text-gray-700 dark:text-gray-300">
              Loading orders...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="container mx-auto px-4 py-8 md:px-6">
          <div className="rounded-3xl border border-red-200/60 bg-white/70 p-6 shadow-xl backdrop-blur-xl dark:border-red-500/20 dark:bg-white/5">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-black dark:text-gray-100">
      <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
        {/* Header */}
        <div className="mb-6 rounded-3xl border border-black/10 bg-white/70 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                My Orders
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track your orders, view details, and request cancellation.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm text-gray-700 shadow-sm backdrop-blur-lg dark:border-white/10 dark:bg-white/10 dark:text-gray-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Total Orders: {orders.length}
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="space-y-4 md:hidden">
          {orders.length === 0 ? (
            <div className="rounded-3xl border border-black/10 bg-white/70 p-8 text-center text-gray-500 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-gray-400">
              No orders found.
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order._id}
                className="group rounded-3xl border border-black/10 bg-white/70 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(0,0,0,0.12)] dark:border-white/10 dark:bg-white/5 dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
              >
                <div className="space-y-4 overflow-x-auto">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        {order.service.name}
                      </h3>
                      <div className="mt-1 break-all text-xs text-gray-500 dark:text-gray-400">
                        Order ID: {order._id}
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium capitalize backdrop-blur-md ${
                        order.payment.status === "paid"
                          ? "border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-300"
                          : "border-amber-200 bg-amber-500/10 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-300"
                      }`}
                    >
                      {order.payment.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-black/10 bg-white/60 p-3 backdrop-blur-lg dark:border-white/10 dark:bg-white/5">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Price
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                        ${order.finalPrice}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-black/10 bg-white/60 p-3 backdrop-blur-lg dark:border-white/10 dark:bg-white/5">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Status
                      </p>
                      <p className="mt-1 text-sm font-semibold capitalize text-gray-900 dark:text-white">
                        {order.order_status}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/orders/${order._id}`}
                      className="inline-flex items-center justify-center rounded-xl border border-green-500/20 bg-green-500 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-green-500/20 transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-green-500/40"
                    >
                      View Details
                    </Link>

                    {order.order_status !== "cancelled" &&
                      order.order_status !== "completed" &&
                      !order.cancel_request && (
                        <button
                          onClick={() => handleCancelRequest(order._id)}
                          className="inline-flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-red-500/20 transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                        >
                          Request Cancel
                        </button>
                      )}
                  </div>

                  {order.cancel_request && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 backdrop-blur-lg dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                      Cancel request pending
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block">
          <div className="overflow-hidden rounded-3xl border border-black/10 bg-white/70 shadow-[0_10px_40px_rgba(0,0,0,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="border-b border-black/10 bg-white/60 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                  <tr>
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Order ID
                    </th>
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Service
                    </th>
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Price
                    </th>
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Payment
                    </th>
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Status
                    </th>
                    <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="p-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order, index) => (
                      <tr
                        key={order._id}
                        className={`transition hover:bg-black/5 dark:hover:bg-white/5 ${
                          index !== orders.length - 1
                            ? "border-b border-black/10 dark:border-white/10"
                            : ""
                        }`}
                      >
                        <td className="max-w-xs break-all p-4 text-xs text-gray-700 dark:text-gray-300">
                          {order._id}
                        </td>

                        <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">
                          {order.service.name}
                        </td>

                        <td className="p-4 text-sm font-semibold text-gray-900 dark:text-white">
                          ${order.finalPrice}
                        </td>

                        <td className="p-4">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${
                              order.payment.status === "paid"
                                ? "border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-300"
                                : "border-amber-200 bg-amber-500/10 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-300"
                            }`}
                          >
                            {order.payment.status}
                          </span>
                        </td>

                        <td className="p-4 text-sm capitalize text-gray-700 dark:text-gray-300">
                          {order.order_status}
                        </td>

                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              to={`/orders/${order._id}`}
                              className="inline-flex items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-emerald-500/20 transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                            >
                              Details
                            </Link>

                            {order.order_status !== "cancelled" &&
                              order.order_status !== "completed" &&
                              !order.cancel_request && (
                                <button
                                  onClick={() => handleCancelRequest(order._id)}
                                  className="inline-flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-red-500/20 transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                                >
                                  Cancel
                                </button>
                              )}
                          </div>

                          {order.cancel_request && (
                            <span className="mt-2 inline-block rounded-full border border-amber-200 bg-amber-500/10 px-3 py-1 text-xs text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                              Cancel requested
                            </span>
                          )}
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
    </div>
  );
};

export default Orders;
