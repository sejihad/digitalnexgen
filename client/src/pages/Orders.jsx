import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

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
  }, []);

  const handleCancelRequest = async (orderId) => {
    try {
      const res = await axios.put(
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

  if (loading) return <p className="text-gray-300 p-6">Loading orders...</p>;
  if (error) return <p className="text-red-500 p-6">{error}</p>;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-primaryRgb">
        My Orders
      </h2>

      {/* Mobile View - Cards with Horizontal Scroll */}
      <div className="md:hidden space-y-4">
        {orders.length === 0 ? (
          <div className="text-center p-5 text-gray-500 dark:text-gray-400">
            No orders found.
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-4 border border-black/5 dark:border-white/10 overflow-x-auto backdrop-blur"
            >
              <div className="min-w-[300px]">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium">{order.service.name}</h3>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 break-all">
                      Order ID: {order._id}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs whitespace-nowrap border ${
                      order.payment.status === "paid"
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
                    }`}
                  >
                    {order.payment.status}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div>
                    <p>${order.finalPrice}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                      Status: {order.order_status}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      to={`/orders/${order._id}`}
                      className="bg-[rgb(12,187,20)] hover:brightness-95 text-white text-xs px-3 py-1 rounded whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[rgb(12,187,20)]/60"
                    >
                      View Details
                    </Link>

                    {order.order_status !== "cancelled" &&
                      order.order_status !== "completed" &&
                      !order.cancel_request && (
                        <button
                          onClick={() => handleCancelRequest(order._id)}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-red-600/40"
                        >
                          Request Cancel
                        </button>
                      )}
                  </div>
                </div>

                {order.cancel_request && (
                  <p className="text-yellow-600 dark:text-yellow-400 text-xs mt-2">
                    Cancel request pending
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop View - Table with Horizontal Scroll */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-full inline-block align-middle">
          <table className="w-full border border-black/10 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 dark:bg-gray-800 text-left">
              <tr>
                <th className="p-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Order ID
                </th>
                <th className="p-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Service
                </th>
                <th className="p-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Price
                </th>
                <th className="p-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Payment
                </th>
                <th className="p-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Status
                </th>
                <th className="p-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-transparent text-gray-900 dark:text-gray-100">
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center p-5 text-gray-500 dark:text-gray-400"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-t border-black/10 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="p-3 text-xs break-all max-w-xs">
                      {order._id}
                    </td>
                    <td className="p-3 text-sm whitespace-nowrap">
                      {order.service.name}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      ${order.finalPrice}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs border ${
                          order.payment.status === "paid"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
                        }`}
                      >
                        {order.payment.status}
                      </span>
                    </td>
                    <td className="p-3 capitalize whitespace-nowrap">
                      {order.order_status}
                    </td>
                    <td className="p-3 text-center space-x-2 whitespace-nowrap">
                      <Link
                        to={`/orders/${order._id}`}
                        className="bg-[rgb(12,187,20)] hover:brightness-95 text-white text-xs px-3 py-1 rounded-md inline-block focus:outline-none focus:ring-2 focus:ring-[rgb(12,187,20)]/60"
                      >
                        Details
                      </Link>

                      {order.order_status !== "cancelled" &&
                        order.order_status !== "completed" &&
                        !order.cancel_request && (
                          <button
                            onClick={() => handleCancelRequest(order._id)}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600/40"
                          >
                            Cancel
                          </button>
                        )}

                      {order.cancel_request && (
                        <span className="text-yellow-600 dark:text-yellow-400 text-xs block mt-1">
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
  );
};

export default Orders;
