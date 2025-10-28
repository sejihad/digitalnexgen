import React, { useEffect, useState } from "react";
import { Code, Paintbrush, Rocket, Globe2 } from "lucide-react";

const statsData = [
  { icon: Code, value: 900, label: "Clients Served" },
  { icon: Paintbrush, value: 205, label: "Projects Completed" },
  { icon: Rocket, value: 40, label: "Ongoing Deployments" },
  { icon: Globe2, value: 12, label: "Countries Reached" },
];

const StatisticsSection = () => {
  const [counts, setCounts] = useState(statsData.map(() => 0));

  useEffect(() => {
    const duration = 1500;
    const interval = 30;

    statsData.forEach((stat, index) => {
      let start = 0;
      const increment = stat.value / (duration / interval);

      const counter = setInterval(() => {
        start += increment;
        if (start >= stat.value) {
          start = stat.value;
          clearInterval(counter);
        }
        setCounts((prev) => {
          const updated = [...prev];
          updated[index] = Math.floor(start);
          return updated;
        });
      }, interval);
    });
  }, []);

  return (
    <section className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-11/12 max-w-[1440px] mt-8 pb-10 mx-auto">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="group relative border border-gray-100  bg-light-bg dark:bg-white/10 rounded-xl text-primaryText dark:text-[#ededed] shadow-lg backdrop-blur-lg dark:border dark:border-white/20 flex flex-col justify-center items-center gap-4 px-4 py-4 transition-transform duration-300 transform hover:-translate-y-1"
          >
            <div className="text-primaryRgb transition-transform mb-[-10px] pt-3 group-hover:scale-110">
              <Icon size={40} strokeWidth={1.5} />
            </div>
            <div className="text-4xl mb-[-10px] font-bold text-primaryText dark:text-[#ededed]">
              {counts[index]}+
            </div>
            <h3 className=" text-primaryText dark:text-[#ededed] text-lg font-roboto">
              {stat.label}
            </h3>
          </div>
        );
      })}
    </section>
  );
};

export default StatisticsSection;
