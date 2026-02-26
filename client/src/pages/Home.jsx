import Hero from "../components/Hero";
import ServiceCards from "../components/ServiceCards";
// import HomeVideo from "../components/HomeVideo";
import Gallery from "../components/Gallery";
import StatisticsSection from "../components/StatisticsSection";
import PopularServices from "../components/PopularServices";

const Home = () => {
  return (
    <div className="  pb-20">
      <Hero
        bloomColor1="rgba(12, 187, 40, 0.8)"
        bloomColor2="rgba(12, 187, 60, 0.8)"
        heroHeight="450px"
        bloomSize="600px"
      />
      <div
        className="

  dark:bg-transparent lg:my-16"
      >
        <ServiceCards
          // bloomColor1="rgba(12, 187, 40, 0.8)"
          // bloomColor2="rgba(12, 187, 60, 0.8)"
          heroHeight="450px"
          bloomSize="600px"
        />
      </div>
      <div className="lg:mb-16">
        <StatisticsSection></StatisticsSection>
      </div>
      {/* popular services */}
      <PopularServices />
      {/* <HomeVideo /> */}
      <div className="lg:mb-16">
        <Gallery category="hero section" />
      </div>
    </div>
  );
};

export default Home;
