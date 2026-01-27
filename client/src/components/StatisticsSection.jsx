import axios from "axios";
import { Code, Globe2, Paintbrush, Rocket } from "lucide-react";
import { useEffect, useState } from "react";

const StatisticsSection = () => {
  const [statsData, setStatsData] = useState([]);
  const [counts, setCounts] = useState([]);

  // 🔹 Fetch statistics from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/statistic`,
        );

        const stat = res.data.statistic;

        const formattedStats = [
          { icon: Code, value: stat.clientsServed, label: "Clients Served" },
          {
            icon: Paintbrush,
            value: stat.projectsCompleted,
            label: "Projects Completed",
          },
          {
            icon: Rocket,
            value: stat.ongoingProjects,
            label: "Ongoing Projects",
          },
          {
            icon: Globe2,
            value: stat.countriesReached,
            label: "Countries Reached",
          },
        ];

        setStatsData(formattedStats);
        setCounts(formattedStats.map(() => 0));
      } catch (err) {
        console.error("Failed to load statistics", err);
      }
    };

    fetchStats();
  }, []);

  // 🔹 Counter animation
  useEffect(() => {
    if (!statsData.length) return;

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
  }, [statsData]);

  return (
    <section className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-11/12 max-w-[1440px] mt-8 pb-10 mx-auto">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="group relative border border-gray-100  bg-light-bg dark:bg-white/10 rounded-xl text-primaryText dark:text-[#ededed] shadow-lg backdrop-blur-lg dark:border dark:border-white/20 flex flex-col justify-center items-center gap-4 px-4 py-4 transition-transform duration-300 transform hover:-translate-y-1 skew-x-[-6deg]"
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
