import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const AdminReviews = () => {
  const [status, setStatus] = useState("pending"); // 'pending' | 'approved'
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null); // review object when editing
  const [editStar, setEditStar] = useState(5);
  const [editDesc, setEditDesc] = useState("");

  const base = useMemo(() => import.meta.env.VITE_API_BASE_URL, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${base}/api/reviews/admin/all`, {
        withCredentials: true,
      });
      setRows(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleApprove = async (id) => {
    try {
      await axios.patch(
        `${base}/api/reviews/admin/${id}/approve`,
        {},
        { withCredentials: true },
      );
      toast.success("Approved");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Approve failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this review?")) return;
    try {
      await axios.delete(`${base}/api/reviews/${id}`, {
        withCredentials: true,
      });
      toast.success("Deleted");
      setRows((r) => r.filter((x) => x._id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  const openEdit = (r) => {
    setEditing(r);
    setEditStar(r.star);
    setEditDesc(r.desc);
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      const res = await axios.put(
        `${base}/api/reviews/${editing._id}`,
        { star: editStar, desc: editDesc },
        { withCredentials: true },
      );
      toast.success("Updated");
      setRows((list) =>
        list.map((x) => (x._id === editing._id ? res.data : x)),
      );
      setEditing(null);
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Reviews Moderation
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setStatus("pending")}
            className={`px-3 py-1 rounded-md ${
              status === "pending"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatus("approved")}
            className={`px-3 py-1 rounded-md ${
              status === "approved"
                ? "bg-green-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            Approved
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-md dark:border-gray-700">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="text-left p-2">User</th>
              <th className="text-left p-2">Service</th>
              <th className="text-left p-2">Stars</th>
              <th className="text-left p-2">Desc</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-3 text-center" colSpan={6}>
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="p-3 text-center" colSpan={6}>
                  No reviews
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r._id} className="border-t dark:border-gray-700">
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={r.userImage || ""}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {r.username}
                        </div>
                        <div className="text-gray-500 text-xs">{r.country}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-2 whitespace-nowrap">{r.serviceId}</td>
                  <td className="p-2">{r.star}/5</td>
                  <td className="p-2 max-w-[420px]">
                    <div className="line-clamp-2 text-gray-800 dark:text-gray-200">
                      {r.desc}
                    </div>
                  </td>
                  <td
                    className={`p-2 font-medium ${r.approved ? "text-green-600" : "text-yellow-500"}`}
                  >
                    {r.approved ? "approved" : "pending"}
                  </td>
                  <td className="p-2 space-x-2 whitespace-nowrap">
                    {!r.approved && (
                      <button
                        onClick={() => handleApprove(r._id)}
                        className="px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                      >
                        Approve
                      </button>
                    )}
                    {r.approved && (
                      <button
                        onClick={() => handleApprove(r._id)}
                        className="px-2 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                      >
                        Unapprove
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(r)}
                      className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(r._id)}
                      className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
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

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#2b2b2b] rounded-md p-4 w-[520px] max-w-[95vw]">
            <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
              Edit Review
            </h2>
            <div className="mb-3">
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                Stars (1-5)
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={editStar}
                onChange={(e) => setEditStar(Number(e.target.value))}
                className="w-full border rounded p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                rows={4}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full border rounded p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditing(null)}
                className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-3 py-1 rounded bg-primaryRgb text-white hover:opacity-90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
