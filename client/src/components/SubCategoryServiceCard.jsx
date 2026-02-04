import { Star } from "lucide-react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
// import noise from "../assets/noise.svg";

const SubCategoryServiceCard = ({ service }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const getDiscountPercentage = (regularPrice, salePrice) => {
    return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
  };

  return (
    <Link
      to={`/${service.subCategory}/${service._id}`}
      className="group relative block transition-transform duration-300 transform hover:-translate-y-1 bg-white rounded-lg   shadow-[0_.14px_2.29266px_rgba(0,0,0,0.03),_0_.37px_4.42626px_rgba(0,0,0,0.047),_0_3px_7px_rgba(0,0,0,0.09)] px-4 py-4 min-w-[200px] m-2 border border-gray-100 dark:bg-white/10 dark:border-white/20 dark:shadow-lg"
      style={{
        // backgroundImage: `url(${noise})`,
        backgroundSize: "cover",
      }}
    >
      <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        {/* <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-[200px] h-[200px] bg-gradient-radial from-green-500/80 to-transparent blur-[50px]"></div> */}
      </div>

      <div className="relative">
        <img
          src={service.coverImage?.url}
          alt={service.shortTitle}
          className="w-full h-48  rounded-md group-hover:opacity-90 transition-opacity duration-300"
        />
      </div>

      <div className="py-4">
        <h3 className="text-lg font-bold font-roboto  dark:text-gray-200 line-clamp-1">
          {service.shortTitle}
        </h3>

        <p className="text-base text-primaryText dark:text-gray-200 mt-2 line-clamp-2">
          {service.shortDesc}
        </p>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1 text-yellow-400">
            <Star className="w-5 h-5" />
            <span className="text-base font-medium">
              {service.averageStars}
            </span>
            <span className="text-sm text-gray-400">
              ({service.starNumber})
            </span>
          </div>

          <p className="text-base font-semibold text-red-600">
            Starting from{" "}
            {service.packages[0]?.salePrice > 0 ? (
              <>
                <span className="text-sm text-red-500 line-through">
                  ${service.packages[0]?.regularPrice || "N/A"}
                </span>{" "}
                <span className="text-red-600 font-semibold">
                  ${service.packages[0]?.salePrice || "N/A"}
                </span>
              </>
            ) : (
              <span className="text-red-500 font-medium">
                ${service.packages[0]?.regularPrice || "N/A"}
              </span>
            )}
          </p>
        </div>
      </div>

      {service.packages[0]?.salePrice > 0 && (
        <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold py-1 px-2 rounded-md">
          {getDiscountPercentage(
            service.packages[0]?.regularPrice,
            service.packages[0]?.salePrice,
          )}
          % OFF
        </div>
      )}
    </Link>
  );
};

export default SubCategoryServiceCard;
