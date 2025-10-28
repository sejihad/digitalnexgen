
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

const CategoryCard = ({ image, title, links, backgroundImage }) => {
  return (
    <div
      className="relative w-full  shadow-[0_.14px_2.29266px_rgba(0,0,0,0.03),_0_.37px_4.42626px_rgba(0,0,0,0.047),_0_3px_7px_rgba(0,0,0,0.09)] bg-white rounded-lg overflow-hidden border border-gray-100 dark:shadow-sm flex flex-col dark:bg-white/10 dark:border-white/20 dark:shadow-lg"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
      }}
    >
      <div>
        <img
          src={image}
          alt={title}
          className="w-full h-[220px] object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-roboto text-primaryText  dark:text-[#ededed]  text-xl lg:text-2xl">{title}</h3>
      </div>
      <div className="text-primaryText dark:text-[#ededed]  text-sm lg:text-base flex flex-col p-4 space-y-2">
        {links.map((link, index) => (
          <Link key={index} to={link.url} className="hover:underline font-openSans">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
};
CategoryCard.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      url: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  backgroundImage: PropTypes.string,
};

export default CategoryCard;
