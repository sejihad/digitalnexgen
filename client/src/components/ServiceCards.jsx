// import React from "react";
// import ServiceCard from "./ServiceCard";
// import "./ServiceCards.css";
// import {
//   CodeXml,
//   Brush,
//   TrendingUp,
//   Clapperboard,
//   Handshake,
//   SquarePen,
// } from "lucide-react";

// const ServiceCards = () => {
//   return (
//     <section className="grid lg:mt-[-10px]   gap-6 sm:grid-cols-2 lg:grid-cols-3 w-11/12 max-w-[1440px] mt-8 mx-auto ">
//       <ServiceCard
//         icon={CodeXml}
//         heading="Programming & Tech"
//         content="Get expert help with coding and tech solutions."
//         iconColor="text-primaryRgb"
//         url="/programming-tech"
//       />
//       <ServiceCard
//         icon={Brush}
//         heading="Graphics Design"
//         content="Create stunning designs for your brand."
//         iconColor="text-primaryRgb"
//         url="/graphics-design"
//       />
//       <ServiceCard
//         icon={TrendingUp}
//         heading="Digital Marketing"
//         content="Promote your business with targeted strategies."
//         iconColor="text-primaryRgb"
//         url="/digital-marketing"
//       />
//       <ServiceCard
//         icon={Clapperboard}
//         heading="Video & Animation"
//         content="Create engaging videos and animations."
//         iconColor="text-primaryRgb"
//         url="/video-animation"
//       />
//       <ServiceCard
//         icon={Handshake}
//         heading="Business"
//         content="Grow your business with professional consulting."
//         iconColor="text-primaryRgb"
//         url="/business"
//       />
//       <ServiceCard
//         icon={SquarePen}
//         heading="Writing & Translation"
//         content="Get top-quality writing and translation services."
//         iconColor="text-primaryRgb"
//         url="/writing-translation"
//       />
//     </section>
//   );
// };

// export default ServiceCards;

import Clapperboard from "../assets/icons/clapperboard.svg";
import Handshake from "../assets/icons/cooperation.svg";
import TrendingUp from "../assets/icons/digital-marketing.svg";
import Brush from "../assets/icons/graphic-design.svg";
import SquarePen from "../assets/icons/pen.svg";
import CodeXml from "../assets/icons/source-code.svg";
import ServiceCard from "./ServiceCard";
import "./ServiceCards.css";

const ServiceCards = ({
  bloomColor1 = "rgba(255, 0, 150, 0.4)", // pink glow
  bloomColor2 = "rgba(0, 150, 255, 0.4)", // blue glow
  bloomSize = "550px",
}) => {
  return (
    <section className="relative w-11/12 max-w-[1440px] mx-auto mt-10 lg:mt-[-10px] overflow-hidden rounded-2xl">
      {/* Background bloom animation */}
      <div
        className="absolute top-[-150px] left-[-200px] opacity-80 blur-lg animate-moveBefore pointer-events-none"
        style={{
          height: bloomSize,
          width: bloomSize,
          background: `radial-gradient(circle, ${bloomColor1}, rgba(0,0,0,0) 70%)`,
          borderRadius: "50%",
        }}
      ></div>

      <div
        className="absolute bottom-[-250px] right-[-200px] opacity-80 blur-lg animate-moveAfter pointer-events-none"
        style={{
          height: bloomSize,
          width: bloomSize,
          background: `radial-gradient(circle, ${bloomColor2}, rgba(0,0,0,0) 70%)`,
          borderRadius: "50%",
        }}
      ></div>

      {/* Main cards grid */}
      <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-3 z-10">
        <ServiceCard
          icon={CodeXml}
          heading="Programming & Tech"
          content="Get expert help with coding and tech solutions."
          iconColor="text-primaryRgb"
          url="/programming-tech"
        />
        <ServiceCard
          icon={Brush}
          heading="Graphics Design"
          content="Create stunning designs for your brand."
          iconColor="text-primaryRgb"
          url="/graphics-design"
        />
        <ServiceCard
          icon={TrendingUp}
          heading="Digital Marketing"
          content="Promote your business with targeted strategies."
          iconColor="text-primaryRgb"
          url="/digital-marketing"
        />
        <ServiceCard
          icon={Clapperboard}
          heading="Video & Animation"
          content="Create engaging videos and animations."
          iconColor="text-primaryRgb"
          url="/video-animation"
        />
        <ServiceCard
          icon={Handshake}
          heading="Business"
          content="Grow your business with professional consulting."
          iconColor="text-primaryRgb"
          url="/business"
        />
        <ServiceCard
          icon={SquarePen}
          heading="Writing & Translation"
          content="Get top-quality writing and translation services."
          iconColor="text-primaryRgb"
          url="/writing-translation"
        />
      </div>
    </section>
  );
};

export default ServiceCards;
