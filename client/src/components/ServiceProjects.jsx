// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";

// const ServiceProjects = () => {
//   const { category, subcategory } = useParams();
//   const [projects, setProjects] = useState([]);

//   useEffect(() => {
//     const fetchProjects = async () => {
//       try {
//         // fetch projects by category & subcategory
//         const response = await axios.get(
//           `${import.meta.env.VITE_API_BASE_URL}/api/projects`
//         );
//         // filter on frontend (if backend doesn't support filter yet)
//         const filtered = response.data.filter(
//           (p) =>
//             p.category.toLowerCase() === category &&
//             p.subcategory.toLowerCase().replace(/\s+/g, "-") === subcategory
//         );
//         setProjects(filtered);
//       } catch (error) {
//         console.error("Error fetching projects:", error);
//       }
//     };
//     fetchProjects();
//   }, [category, subcategory]);

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4 capitalize">
//         {category.replace("-", " ")} → {subcategory.replace("-", " ")} Projects
//       </h1>

//       {projects.length === 0 ? (
//         <p>No related projects found.</p>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {projects.map((project) => (
//             <div
//               key={project._id}
//               className="p-4 border rounded-lg shadow bg-white dark:bg-gray-800"
//             >
//               <h2 className="text-lg font-semibold">{project.title}</h2>
//               <p className="text-sm">{project.description}</p>
//               {project.images?.[0] && (
//                 <img
//                   src={project.images[0]}
//                   alt={project.title}
//                   className="w-full h-40 object-cover rounded mt-2"
//                 />
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ServiceProjects;
