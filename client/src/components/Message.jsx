import axios from "axios";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

const Message = ({ conversationId }) => {
  const location = useLocation();
  const stateServiceTitle = location.state?.serviceTitle;
  const stateServiceId = location.state?.serviceId;
  const { id: routeId } = useParams();
  const [conversation, setConversation] = useState({ messages: [] });
  const [offers, setOffers] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [newOffer, setNewOffer] = useState({
    description: "",
    price: "",
    deliveryTime: "",
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [gig, setGig] = useState(null);
  const [savedGigs, setSavedGigs] = useState([]);
  const [headerName, setHeaderName] = useState("");
  const [headerUser, setHeaderUser] = useState(null);

  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const meId = String(currentUser.id || currentUser._id || "");
  const buyerId = conversation?.buyerId ? String(conversation.buyerId) : "";
  const sellerId = conversation?.sellerId ? String(conversation.sellerId) : "";
  const adminId = conversation?.adminId ? String(conversation.adminId) : "";
  // Admin should always see the buyer's name in header
  const counterpartId = isAdmin
    ? (buyerId && buyerId !== meId ? buyerId : buyerId)
    : ((sellerId && sellerId !== meId) ? sellerId : (adminId && adminId !== meId ? adminId : sellerId || adminId || buyerId || ""));
  // derive isAdmin once from stored user to avoid effect dependency churn
  useEffect(() => {
    setIsAdmin(currentUser?.isAdmin);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const conversationRes = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/conversations/single/${conversationId || routeId}`,
          { withCredentials: true }
        );

        if (conversationRes.data) {
          const messageRes = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/messages/${conversationId || routeId}`,
            { withCredentials: true }
          );

          const offersRes = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/offers?conversationId=${conversationId || routeId}`,
            { withCredentials: true }
          );

          setOffers(offersRes.data || []);
          setConversation({
            ...conversationRes.data,
            messages: messageRes.data || [],
          });
          // Merge server-linkedServices into savedGigs (and localStorage) for cross-device persistence
          const serverLinked = Array.isArray(conversationRes.data.linkedServices) ? conversationRes.data.linkedServices : [];
          if (serverLinked.length > 0) {
            const key = `conv_gigs_${conversationId || routeId}`;
            try {
              const prev = JSON.parse(localStorage.getItem(key) || "[]");
              // normalize server items to local shape
              const normalized = serverLinked.map((s) => ({
                serviceId: String(s.serviceId),
                title: s.title,
                subCategory: s.subCategory,
                coverImage: s.coverImage,
                savedAt: s.savedAt ? new Date(s.savedAt).getTime() : Date.now(),
              }));
              const merged = [...normalized, ...prev.filter((g) => !normalized.some((n) => String(n.serviceId) === String(g.serviceId)))];
              localStorage.setItem(key, JSON.stringify(merged));
              setSavedGigs(merged);
            } catch {
              setSavedGigs(serverLinked.map((s) => ({
                serviceId: String(s.serviceId),
                title: s.title,
                subCategory: s.subCategory,
                coverImage: s.coverImage,
                savedAt: s.savedAt ? new Date(s.savedAt).getTime() : Date.now(),
              })));
            }
          }
        }
      } catch (error) {
        console.error("Error fetching conversation:", error);
      }
    };

    fetchConversation();
  }, [conversationId, routeId]);

  // Fetch counterpart username for header display
  useEffect(() => {
    const loadName = async () => {
      try {
        if (!counterpartId) return;
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/${counterpartId}`, { withCredentials: true });
        const u = res?.data || {};
        const display = u.fullName || u.name || u.username || "";
        if (display) setHeaderName(display);
        setHeaderUser(u);
      } catch {
        // ignore
      }
    };
    loadName();
  }, [counterpartId]);

  // Load previously saved gig cards for this conversation (localStorage)
  useEffect(() => {
    const key = `conv_gigs_${conversationId || routeId}`;
    try {
      const prev = JSON.parse(localStorage.getItem(key) || "[]");
      if (Array.isArray(prev)) setSavedGigs(prev);
    } catch {
      // ignore
    }
  }, [conversationId, routeId]);

  // Load gig details if we have a serviceId from state or conversation
  useEffect(() => {
    const serviceId = stateServiceId || conversation?.serviceId || conversation?.service?._id;
    if (!serviceId) return;
    let isMounted = true;
    const load = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/services/single-service/${serviceId}`);
        if (isMounted) {
          setGig(res.data);
          // Also merge this gig into saved list (dedupe by serviceId)
          const key = `conv_gigs_${conversationId || routeId}`;
          const item = {
            serviceId: res.data?._id,
            title: res.data?.title,
            subCategory: res.data?.subCategory,
            coverImage: res.data?.coverImage,
            savedAt: Date.now(),
          };
          try {
            const prev = JSON.parse(localStorage.getItem(key) || "[]");
            const merged = [item, ...prev.filter((g) => String(g.serviceId) !== String(item.serviceId))];
            localStorage.setItem(key, JSON.stringify(merged));
            setSavedGigs(merged);
          } catch {
            // ignore
          }
        }
      } catch {
        // ignore
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [stateServiceId, conversation?.serviceId, conversation?.service, conversationId, routeId]);

  useEffect(() => {
    // Auto-scroll to bottom when messages or offers change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages, offers]);

  // const handleSendMessage = async () => {
  //   if (!newMessage.trim()) return;
  //   setIsSending(true);

  //   try {
  //     const response = await axios.post(
  //       `${import.meta.env.VITE_API_BASE_URL}/api/messages`,
  //       { conversationId: conversationId || routeId, message: newMessage },
  //       { withCredentials: true }
  //     );

  //     setConversation((prev) => ({
  //       ...prev,
  //       messages: [...prev.messages, response.data],
  //     }));

  //     setNewMessage("");
  //   } catch (error) {
  //     console.error("Error sending message:", error);
  //   } finally {
  //     setIsSending(false);
  //   }
  // };
const handleSendMessage = async () => {
  if (!newMessage.trim()) return;
  setIsSending(true);

  // create a temporary local message for instant UI
  const tempMessage = {
    _id: `temp-${Date.now()}`,
    message: newMessage,
    userId: meId,
    createdAt: new Date().toISOString(),
  };

  // instantly update UI
  setConversation((prev) => ({
    ...prev,
    messages: [...prev.messages, tempMessage],
  }));

  setNewMessage("");

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/messages`,
      { conversationId: conversationId || routeId, message: newMessage },
      { withCredentials: true }
    );

    // replace temporary message with real one (after backend response)
    setConversation((prev) => {
      const msgs = prev.messages.filter((m) => !m._id.startsWith("temp-"));
      return { ...prev, messages: [...msgs, response.data] };
    });
  } catch (error) {
    console.error("Error sending message:", error);
  } finally {
    setIsSending(false);
  }
};

  const handleCreateOffer = async () => {
    if (!newOffer.description || !newOffer.price || !newOffer.deliveryTime) {
      console.error("Incomplete offer details.");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/offers`,
        {
          conversationId: conversationId || routeId,
          buyerId: conversation.buyerId,
          offerDetails: newOffer,
        },
        { withCredentials: true }
      );

      setOffers((prev) => [...prev, response.data]);
      setNewOffer({ description: "", price: "", deliveryTime: "" });
      setShowOfferForm(false);
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  const handleRespondToOffer = async (offerId, status) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/offers/${offerId}`,
        { status },
        { withCredentials: true }
      );

      setOffers((prev) =>
        prev.map((offer) =>
          offer._id === offerId ? { ...offer, ...response.data } : offer
        )
      );
    } catch (error) {
      console.error("Error responding to offer:", error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 text-gray-900 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 dark:text-gray-100 flex items-start justify-center py-8">
      <div className="w-full max-w-4xl bg-white dark:bg-white/5 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden flex flex-col" ref={containerRef}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <button onClick={() => window.history.back()} className="bg-slate-500 text-gray-300 hover:text-white px-3 py-2 rounded-full shadow-md hover:bg-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400">
              ←
            </button>
            <div>
              <h1 className="text-3xl font-bold text-[#00DCEE]">
                {headerUser?.name || headerUser?.username || headerName || "Conversation"}
              </h1>
              {/* <div className="text-sm text-gray-400">Conversation ID: {id}</div> */}
            </div>
          </div>

          <div className="flex items-center gap-3">
              {!conversationId && (
                <Link to="/messages" className="text-sm text-slate-700 dark:text-yellow-50 hover:underline">Back to Messages</Link>
              )}
             
           
            </div>
        </div>

        {/* Gig details (if available) */}
        {(stateServiceTitle || stateServiceId || conversation?.serviceTitle || conversation?.service?.title || conversation?.serviceId || conversation?.service?._id) && (
          <div className="px-6 py-3 bg-gray-100 border-b border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <div className="text-sm text-gray-600 dark:text-gray-300">Gig</div>
            <div className="text-base text-gray-900 dark:text-gray-100 font-medium">
              {stateServiceTitle || conversation?.serviceTitle || conversation?.service?.title || "Untitled"}
              {" "}
              {(stateServiceId || conversation?.serviceId || conversation?.service?._id) ? (
                <span className="text-gray-500 dark:text-gray-400">({stateServiceId || conversation?.serviceId || conversation?.service?._id})</span>
              ) : null}
            </div>
          </div>
        )}

        {/* Saved gig cards list (from localStorage) */}
        {savedGigs.length > 0 && (
          <div className="px-6 pt-4 space-y-2">
            <div className="text-sm text-gray-700 dark:text-gray-300">Saved Gigs</div>
            <div className="space-y-2">
              {savedGigs.map((g) => (
                <div key={String(g.serviceId)} className="flex gap-4 items-center bg-white border border-gray-200 rounded-lg p-3 dark:bg-gray-800 dark:border-gray-700">
                  <div className="w-20 h-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700">
                    {g.coverImage ? (
                      <img src={g.coverImage} alt={g.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-600 dark:text-gray-300 truncate">{g.subCategory}</div>
                    <div className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">{g.title}</div>
                    <div className="text-xs text-gray-500">Saved {new Date(g.savedAt).toLocaleString()}</div>
                  </div>
                  <Link
                    to={`/${g.subCategory}/${g.serviceId}`}
                    className="text-sm bg-pink-500 hover:bg-colorNeonPink text-white px-3 py-2 rounded"
                  >
                    View Gig
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gig card (if loaded and not already in saved list) */}
        {gig && !savedGigs.some((g) => String(g.serviceId) === String(gig?._id)) && (
          <div className="px-6 pt-4">
            <div className="flex gap-4 items-center bg-white border border-gray-200 rounded-lg p-3 dark:bg-gray-800 dark:border-gray-700">
              <div className="w-20 h-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700">
                {gig.coverImage ? (
                  <img src={gig.coverImage} alt={gig.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-600 dark:text-gray-300 truncate">{gig.category} · {gig.subCategory}</div>
                <div className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">{gig.title}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{Array.isArray(gig.packages) && gig.packages[0]?.salePrice ? `From $${gig.packages[0].salePrice}` : null}</div>
              </div>
              <Link
                to={`/${gig.subCategory}/${gig._id}`}
                className="text-sm bg-pink-500 hover:bg-colorNeonPink text-white px-3 py-2 rounded"
              >
                View Gig
              </Link>
            </div>
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 overflow-auto p-6 space-y-4 bg-gradient-to-t from-transparent via-black/10 to-transparent">
          {conversation.messages.length === 0 && offers.length === 0 && (
            <div className="text-center text-gray-400 py-16">No messages yet. Start the conversation.</div>
          )}

          {conversation.messages.map((msg, index) => {
            const isSender = String(msg.userId) === String(currentUser.id || currentUser._id);

            return (
              <div key={index} className={`flex items-end gap-3 ${isSender ? 'justify-end' : 'justify-start'}`}>
                {!isSender && (
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black font-semibold">
                    {String(msg.userId || '').slice(-2).toUpperCase()}
                  </div>
                )}

                <div className={`max-w-[70%] px-4 py-2 rounded-2xl shadow ${isSender ? 'bg-pink-500 text-white rounded-br-none' : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 rounded-bl-none'}`}>
                  <div className="text-sm leading-relaxed">{msg.message}</div>
                  <div className="text-xs text-gray-300 mt-1 text-right">{new Date(msg.createdAt).toLocaleString()}</div>
                </div>

                {isSender && (
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold">
                    ME
                  </div>
                )}
              </div>
            );
          })}

          {/* Offers as cards */}
          {offers.length > 0 && (
            <div className="space-y-4">
              {offers.map((offer) => (
                <div key={offer._id} className="p-4 rounded-lg shadow-md bg-white border border-gray-200 text-gray-900 dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-700 dark:border-0 dark:text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-semibold">{offer.offerDetails?.description}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Price: ${offer.offerDetails?.price} · Delivery: {offer.offerDetails?.deliveryTime} days</div>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-200">Status: <span className="font-medium">{offer.status}</span></div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    {!isAdmin && offer.status === 'pending' && (
                      <>
                        <button onClick={() => handleRespondToOffer(offer._id, 'accepted')} className="bg-green-500 text-white px-3 py-1 rounded">Accept</button>
                        <button onClick={() => handleRespondToOffer(offer._id, 'declined')} className="bg-red-500 text-white px-3 py-1 rounded">Decline</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="bg-white p-4 border-t border-gray-200 dark:bg-gray-900 dark:border-gray-800">
          <div className="max-w-4xl mx-auto flex items-start gap-3">
            <input
              type="text"
              placeholder="Type a message or press Enter..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 px-4 py-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
              disabled={isSending}
            />

            <button onClick={handleSendMessage} disabled={isSending} className="bg-pink-500 hover:bg-colorNeonPink text-white px-4 py-2 rounded-lg">
              Send
            </button>

            {isAdmin && (
              <button onClick={() => setShowOfferForm((p) => !p)} className="ml-2 flex items-center gap-2 bg-pink-500 hover:bg-colorNeonPink text-white px-3 py-2 rounded-lg">
             
                {showOfferForm ? 'Cancel' : 'Offer'}
              </button>
            )}
          </div>

          {/* Offer creator (admin) */}
          {isAdmin && showOfferForm && (
            <div className="mt-3 max-w-4xl mx-auto bg-gray-800 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input type="text" placeholder="Description" value={newOffer.description} onChange={(e)=>setNewOffer({...newOffer, description: e.target.value})} className="p-2 bg-gray-700 rounded" />
                <input type="number" placeholder="Price" value={newOffer.price} onChange={(e)=>setNewOffer({...newOffer, price: e.target.value})} className="p-2 bg-gray-700 rounded" />
                <input type="number" placeholder="Delivery (days)" value={newOffer.deliveryTime} onChange={(e)=>setNewOffer({...newOffer, deliveryTime: e.target.value})} className="p-2 bg-gray-700 rounded" />
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={handleCreateOffer} className="bg-pink-500 px-4 py-2 rounded text-white">Send Offer</button>
                <button onClick={() => setShowOfferForm(false)} className="bg-gray-300 dark:bg-gray-600 px-4 py-2 rounded text-gray-900 dark:text-white">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;

Message.propTypes = {
  conversationId: PropTypes.string,
};
