// import noise from "../assets/noise.svg";
import { Link } from "react-router-dom";

const ServiceCard = ({ icon: Icon, heading, content, iconColor, url }) => {
  return (
    <Link
      to={url}
      className={
        "group relative flex flex-col justify-center items-center gap-4 transition-transform duration-300 transform hover:-translate-y-1 skew-x-[-6deg] " +
        // Light-mode 'lite' look: white card with padding and subtle shadow
        "bg-white text-primaryText shadow-[0_.14px_2.29266px_rgba(0,0,0,0.03),_0_.37px_4.42626px_rgba(0,0,0,0.047),_0_3px_7px_rgba(0,0,0,0.09)] rounded-xl px-6 py-8 min-w-[200px] m-2 border border-gray-100 " +
        "dark:bg-white/10 dark:text-[#ededed] dark:border-white/20 dark:shadow-lg"
      }
      style={{
        // backgroundImage: `url(${noise})`,
        backgroundSize: "cover",
      }}
    >
      {/* <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-[200px] h-[200px] bg-gradient-radial  from-green-400/80 to-transparent blur-[70px]"></div>
      </div> */}

      <div className="text-primaryRgb transition-transform group-hover:scale-110 skew-x-[6deg]">
        <img src={Icon} className="w-12 h-12" alt="" />
        {/* <Icon className="w-12 h-12" /> */}
      </div>

      {/* 
.stat-box {
    text-align: center;
    padding: 30px;
    margin: 15px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s 
ease;
    min-width: 200px; */}

      <div className="text-center flex flex-col gap-2 skew-x-[6deg]">
        <h4 className="font-roboto text-lg">{heading}</h4>
        <p className="font-openSans text-sm">{content}</p>
      </div>
    </Link>
  );
};

export default ServiceCard;
