
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useDispatch } from "react-redux";
// import { showLoading, hideLoading } from "../redux/loadingSlice";

// const AdminNewsLatters = () => {
//   const [newsletters, setNewsletters] = useState([]);
//   const [filterednewsletters, setFilteredNewsletters] = useState([]);
//   const [search, setSearch] = useState("");
//   const [error, setError] = useState("");
//   const dispatch = useDispatch();

//   useEffect(() => {
//     const fetchNewsletters = async () => {
//       dispatch(showLoading());
//       try {
//         const response = await axios.get(
//           `${import.meta.env.VITE_API_BASE_URL}/api/newsletters`,
//           { withCredentials: true }
//         );
//         setNewsletters(response.data);
//         setFilteredNewsletters(response.data);
//       } catch (error) {
//         setError("Failed to fetch newsletters. Please try again later.");
//       } finally {
//         dispatch(hideLoading());
//       }
//     };

//     fetchNewsletters();
//   }, [dispatch]);

//   const handleSearchChange = (e) => {
//     const query = e.target.value.toLowerCase();
//     setSearch(query);
//     setFilteredNewsletters(
//       newsletters.filter((newsletter) =>
//         newsletter.email.toLowerCase().includes(query)
//       )
//     );
//   };

//   const handleDelete = async (id) => {
//     const confirmDelete = window.confirm(
//       "Are you sure you want to delete this subscriber?"
//     );
//     if (!confirmDelete) return;

//     dispatch(showLoading());
//     try {
//       await axios.delete(
//         `${import.meta.env.VITE_API_BASE_URL}/api/newsletters/${id}`,
//         {
//           withCredentials: true,
//         }
//       );

//       const updatedNewsletters = newsletters.filter(
//         (newsletter) => newsletter._id !== id
//       );
//       setNewsletters(updatedNewsletters);
//       setFilteredNewsletters(
//         updatedNewsletters.filter((newsletter) =>
//           newsletter.email.toLowerCase().includes(search)
//         )
//       );

//       alert("Subscriber deleted successfully.");
//     } catch (error) {
//       alert("Failed to delete the subscriber. Please try again.");
//     } finally {
//       dispatch(hideLoading());
//     }
//   };

//   return (
//     <div className="p-4">
//       <h1 className="text-white text-xl font-bold mb-4">Newsletter Subscribers</h1>
//       {error && <p className="text-red-500">{error}</p>}

//       {/* Search bar */}
//       <div className="mb-4">
//         <label htmlFor="searchNewsletters" className="text-white mr-2">
//           Search Email:
//         </label>
//         <input
//           id="searchNewsletters"
//           type="text"
//           value={search}
//           onChange={handleSearchChange}
//           placeholder="Search by email..."
//           className="bg-gray-800 text-white border border-gray-700 px-4 py-2 rounded w-full"
//         />
//       </div>

//       {!filterednewsletters.length && !error && (
//         <p className="text-white">No subscribers available.</p>
//       )}
//       {filterednewsletters.length > 0 && (
//         <div className="overflow-x-auto">
//           <table className="table-auto w-full text-white border-collapse border border-gray-700">
//             <thead>
//               <tr className="bg-gray-800">
//                 <th className="border border-gray-700 px-4 py-2 text-center">#</th>
//                 <th className="border border-gray-700 px-4 py-2 text-center">Email</th>
//                 <th className="border border-gray-700 px-4 py-2 text-center">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filterednewsletters.map((newsletter, index) => (
//                 <tr key={newsletter._id} className="bg-gray-900 hover:bg-gray-700">
//                   <td className="border text-center border-gray-700 px-4 py-2">
//                     {index + 1}
//                   </td>
//                   <td className="border text-center border-gray-700 px-4 py-2">
//                     {newsletter.email}
//                   </td>
//                   <td className="border border-gray-700 px-4 py-2 flex justify-center space-x-2">
//                     <button
//                       onClick={() => handleDelete(newsletter._id)}
//                       className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
//                     >
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminNewsLatters;



import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/loadingSlice";

const AdminNewsLatters = () => {
  const [newsletters, setNewsletters] = useState([]);
  const [filterednewsletters, setFilteredNewsletters] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchNewsletters = async () => {
      dispatch(showLoading());
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/newsletters`,
          { withCredentials: true }
        );
        setNewsletters(response.data);
        setFilteredNewsletters(response.data);
      } catch (error) {
        setError("Failed to fetch newsletters. Please try again later.");
      } finally {
        dispatch(hideLoading());
      }
    };

    fetchNewsletters();
  }, [dispatch]);

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);
    setFilteredNewsletters(
      newsletters.filter((newsletter) =>
        newsletter.email.toLowerCase().includes(query)
      )
    );
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this subscriber?"
    );
    if (!confirmDelete) return;

    dispatch(showLoading());
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/newsletters/${id}`,
        {
          withCredentials: true,
        }
      );

      const updatedNewsletters = newsletters.filter(
        (newsletter) => newsletter._id !== id
      );
      setNewsletters(updatedNewsletters);
      setFilteredNewsletters(
        updatedNewsletters.filter((newsletter) =>
          newsletter.email.toLowerCase().includes(search)
        )
      );

      alert("Subscriber deleted successfully.");
    } catch (error) {
      alert("Failed to delete the subscriber. Please try again.");
    } finally {
      dispatch(hideLoading());
    }
  };

  const handleCopyAll = () => {
    const allEmails = filterednewsletters.map((n) => n.email).join(", ");
    if (!allEmails) {
      alert("No emails to copy.");
      return;
    }
    navigator.clipboard.writeText(allEmails);
    alert("All emails copied to clipboard!");
  };

  return (
    <div className="p-4">
      <h1 className="text-white text-xl font-bold mb-4">
        Newsletter Subscribers
      </h1>
      {error && <p className="text-red-500">{error}</p>}

      {/* Search + Copy button */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        {/* Search */}
        <div className="flex-1">
          <label htmlFor="searchNewsletters" className="text-white mr-2">
            Search Email:
          </label>
          <input
            id="searchNewsletters"
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by email..."
            className="bg-gray-800 text-white border border-gray-700 px-4 py-2 rounded w-full"
          />
        </div>

        {/* Copy All Button */}
        <button
          onClick={handleCopyAll}
          className="bg-blue-500 hover:bg-blue-700 mb-[-22px] text-white font-bold py-2 px-4 rounded md:ml-4"
        >
          Copy All Emails
        </button>
      </div>

      {!filterednewsletters.length && !error && (
        <p className="text-white">No subscribers available.</p>
      )}
      {filterednewsletters.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-white border-collapse border border-gray-700">
            <thead>
              <tr className="bg-gray-800">
                <th className="border border-gray-700 px-4 py-2 text-center">
                  #
                </th>
                <th className="border border-gray-700 px-4 py-2 text-center">
                  Email
                </th>
                <th className="border border-gray-700 px-4 py-2 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filterednewsletters.map((newsletter, index) => (
                <tr
                  key={newsletter._id}
                  className="bg-gray-900 hover:bg-gray-700"
                >
                  <td className="border text-center border-gray-700 px-4 py-2">
                    {index + 1}
                  </td>
                  <td className="border text-center border-gray-700 px-4 py-2">
                    {newsletter.email}
                  </td>
                  <td className="border border-gray-700 px-4 py-2 flex justify-center space-x-2">
                    <button
                      onClick={() => handleDelete(newsletter._id)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminNewsLatters;
















