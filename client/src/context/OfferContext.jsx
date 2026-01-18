import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const OfferContext = createContext();

export const useOffer = () => {
  const context = useContext(OfferContext);
  if (!context) {
    throw new Error("useOffer must be used within OfferProvider");
  }
  return context;
};

export const OfferProvider = ({ children }) => {
  const [offers, setOffers] = useState([]);
  const [offerEndTime, setOfferEndTime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/promotional-offers`
        );

        setOffers(response.data);

        // Set countdown to the earliest end date
        if (response.data.length > 0) {
          const earliestEndDate = response.data.reduce((earliest, offer) => {
            const offerEndDate = new Date(offer.endDate).getTime();
            return offerEndDate < earliest ? offerEndDate : earliest;
          }, new Date(response.data[0].endDate).getTime());

          setOfferEndTime(earliestEndDate);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  return (
    <OfferContext.Provider value={{ offers, offerEndTime, loading }}>
      {children}
    </OfferContext.Provider>
  );
};
