import axios from "axios";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { io } from "socket.io-client";

const Message = ({ conversationId }) => {
  const location = useLocation();
  const stateServiceTitle = location.state?.serviceTitle;
  const stateServiceId = location.state?.serviceId;
  const { id: routeId } = useParams();
  const [conversation, setConversation] = useState({ messages: [] });
  const [offers, setOffers] = useState([]);
  const [socket, setSocket] = useState(null);
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
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [isTypingVisible, setIsTypingVisible] = useState(false);

  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const meId = String(currentUser.id || currentUser._id || "");
  const buyerId = conversation?.buyerId ? String(conversation.buyerId) : "";
  const sellerId = conversation?.sellerId ? String(conversation.sellerId) : "";
  const adminId = conversation?.adminId ? String(conversation.adminId) : "";

  // Admin should always see the buyer's name in header
  const counterpartId = isAdmin
    ? buyerId && buyerId !== meId
      ? buyerId
      : buyerId
    : sellerId && sellerId !== meId
      ? sellerId
      : adminId && adminId !== meId
        ? adminId
        : sellerId || adminId || buyerId || "";

  // derive isAdmin once from stored user to avoid effect dependency churn
  useEffect(() => {
    setIsAdmin(currentUser?.isAdmin);
  }, []);

  // Socket connection
  useEffect(() => {
    const s = io(import.meta.env.VITE_API_BASE_URL, {
      withCredentials: true,
    });

    const token = localStorage.getItem("token");
    if (token) s.emit("user:join", token);

    // join conversation room
    if (conversationId || routeId) {
      s.emit("conversation:join", conversationId || routeId);
    }

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [conversationId, routeId]);

  // Socket listeners for messages and typing
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data) => {
      if (data.conversationId === (conversationId || routeId)) {
        setConversation((prev) => ({
          ...prev,
          messages: [...prev.messages, data.message],
        }));
      }
    };

    const handleTyping = (data) => {
      if (data.conversationId === (conversationId || routeId)) {
        setIsTypingVisible(data.isTyping);
        if (data.isTyping) {
          const timer = setTimeout(() => {
            setIsTypingVisible(false);
          }, 3000);
          setTypingTimeout(timer);
        }
      }
    };

    socket.on("message:receive", handleMessage);
    socket.on("typing:update", handleTyping);

    return () => {
      socket.off("message:receive", handleMessage);
      socket.off("typing:update", handleTyping);
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [socket, conversationId, routeId]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages, offers, isTypingVisible]);

  // Fetch conversation data
  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const conversationRes = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/conversations/single/${
            conversationId || routeId
          }`,
          { withCredentials: true }
        );

        if (conversationRes.data) {
          const messageRes = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/messages/${
              conversationId || routeId
            }`,
            { withCredentials: true }
          );

          const offersRes = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/offers?conversationId=${
              conversationId || routeId
            }`,
            { withCredentials: true }
          );

          setOffers(offersRes.data || []);
          setConversation({
            ...conversationRes.data,
            messages: messageRes.data || [],
          });

          // Merge server-linkedServices
          const serverLinked = Array.isArray(
            conversationRes.data.linkedServices
          )
            ? conversationRes.data.linkedServices
            : [];
          if (serverLinked.length > 0) {
            const key = `conv_gigs_${conversationId || routeId}`;
            try {
              const prev = JSON.parse(localStorage.getItem(key) || "[]");
              const normalized = serverLinked.map((s) => ({
                serviceId: String(s.serviceId),
                title: s.title,
                subCategory: s.subCategory,
                coverImage: s.coverImage,
                savedAt: s.savedAt ? new Date(s.savedAt).getTime() : Date.now(),
              }));
              const merged = [
                ...normalized,
                ...prev.filter(
                  (g) =>
                    !normalized.some(
                      (n) => String(n.serviceId) === String(g.serviceId)
                    )
                ),
              ];
              localStorage.setItem(key, JSON.stringify(merged));
              setSavedGigs(merged);
            } catch {
              setSavedGigs(
                serverLinked.map((s) => ({
                  serviceId: String(s.serviceId),
                  title: s.title,
                  subCategory: s.subCategory,
                  coverImage: s.coverImage,
                  savedAt: s.savedAt
                    ? new Date(s.savedAt).getTime()
                    : Date.now(),
                }))
              );
            }
          }
        }
      } catch (error) {}
    };

    fetchConversation();
  }, [conversationId, routeId]);

  // Fetch counterpart username
  useEffect(() => {
    const loadName = async () => {
      try {
        if (!counterpartId) return;
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/users/${counterpartId}`,
          { withCredentials: true }
        );
        const u = res?.data || {};

        if (u) {
          if (isAdmin) {
            setHeaderName(u.username);
          } else {
            setHeaderName("Admin");
          }
        }

        setHeaderUser(u);
      } catch {
        // ignore
      }
    };
    loadName();
  }, [counterpartId]);

  // Load saved gigs from localStorage
  useEffect(() => {
    const key = `conv_gigs_${conversationId || routeId}`;
    try {
      const prev = JSON.parse(localStorage.getItem(key) || "[]");
      if (Array.isArray(prev)) setSavedGigs(prev);
    } catch {
      // ignore
    }
  }, [conversationId, routeId]);

  // Load gig details
  useEffect(() => {
    const serviceId =
      stateServiceId || conversation?.serviceId || conversation?.service?._id;
    if (!serviceId) return;
    let isMounted = true;
    const load = async () => {
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/api/services/single-service/${serviceId}`
        );
        if (isMounted) {
          setGig(res.data);
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
            const merged = [
              item,
              ...prev.filter(
                (g) => String(g.serviceId) !== String(item.serviceId)
              ),
            ];
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
  }, [
    stateServiceId,
    conversation?.serviceId,
    conversation?.service,
    conversationId,
    routeId,
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleTypingIndicator = (typing) => {
    if (socket && (conversationId || routeId)) {
      setIsTyping(typing);
      socket.emit("typing:update", {
        conversationId: conversationId || routeId,
        userId: meId,
        isTyping: typing,
      });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setIsSending(true);

    const tempMessage = {
      _id: `temp-${Date.now()}`,
      message: newMessage,
      userId: meId,
      createdAt: new Date().toISOString(),
    };

    setConversation((prev) => ({
      ...prev,
      messages: [...prev.messages, tempMessage],
    }));

    setNewMessage("");
    handleTypingIndicator(false);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/messages`,
        { conversationId: conversationId || routeId, message: newMessage },
        { withCredentials: true }
      );

      setConversation((prev) => {
        const msgs = prev.messages.filter((m) => !m._id.startsWith("temp-"));
        return { ...prev, messages: [...msgs, response.data] };
      });

      if (socket) {
        const receiverId = isAdmin
          ? buyerId || sellerId
          : adminId || sellerId || buyerId;

        socket.emit("message:send", {
          conversationId: conversationId || routeId,
          receiverId,
          message: response.data,
        });
      }
    } catch (err) {
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateOffer = async () => {
    if (!newOffer.description || !newOffer.price || !newOffer.deliveryTime) {
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
    } catch (error) {}
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
    } catch (error) {}
  };

  // Responsive design for messages
  const getMessageWidthClass = () => {
    if (window.innerWidth < 640) return "max-w-[85%]";
    if (window.innerWidth < 768) return "max-w-[80%]";
    return "max-w-[70%]";
  };

  return (
    <div className="h-[calc(100vh-80px)] bg-slate-50 text-gray-900 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 dark:text-gray-100 overflow-hidden">
      <div
        className="h-full flex flex-col bg-white dark:bg-white/5 backdrop-blur-sm"
        ref={containerRef}
      >
        {/* Header - Fixed */}
        <div className="flex-shrink-0 px-4 md:px-6 py-3 md:py-4 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.history.back()}
                className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-slate-500 text-gray-300 hover:text-white rounded-full shadow-md hover:bg-slate-600 transition-all duration-200"
              >
                ←
              </button>
              <div className="min-w-0">
                <h1 className="text-lg md:text-2xl font-bold text-[#00DCEE] truncate">
                  {headerName || "Conversation"}
                </h1>
                {isTypingVisible && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                    Typing...
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!conversationId && (
                <Link
                  to="/messages"
                  className="text-sm text-slate-700 dark:text-yellow-50 hover:underline"
                >
                  Back
                </Link>
              )}
            </div>
          </div>

          {/* Gig info in header for mobile */}
          {/* {(stateServiceTitle || conversation?.service?.title) && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 truncate">
              {stateServiceTitle || conversation?.service?.title}
            </div>
          )} */}
        </div>

        {/* Main Content Area with Scroll */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Saved gigs carousel */}
          {/* {savedGigs.length > 0 && (
            <div className="flex-shrink-0 px-4 md:px-6 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Saved Gigs
              </div>
              <div className="flex overflow-x-auto gap-3 pb-2 -mx-2 px-2 scrollbar-hide">
                {savedGigs.map((g) => (
                  <div
                    key={String(g.serviceId)}
                    className="flex-shrink-0 w-48 md:w-56 bg-white border border-gray-200 rounded-lg p-3 dark:bg-gray-800 dark:border-gray-700"
                  >
                    <div className="flex gap-3">
                      <div className="w-16 h-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700">
                        {g.coverImage ? (
                          <img
                            src={g.coverImage}
                            alt={g.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {g.subCategory}
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {g.title}
                        </div>
                        <Link
                          to={`/${g.subCategory}/${g.serviceId}`}
                          className="inline-block mt-1 text-xs bg-pink-500 hover:bg-colorNeonPink text-white px-2 py-1 rounded"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )} */}

          {/* Messages Container */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gradient-to-t from-transparent via-black/5 to-transparent"
          >
            {conversation.messages.length === 0 && offers.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                <div className="text-center">
                  <div className="text-lg mb-2">No messages yet</div>
                  <p className="text-sm">Start the conversation</p>
                </div>
              </div>
            ) : (
              <>
                {conversation.messages.map((msg, index) => {
                  const isSender =
                    String(msg.userId?._id || msg.userId) === meId;
                  let displayName = "";
                  if (isAdmin) {
                    // Admin dekhe sob username
                    displayName =
                      msg.userId?.username || msg.userId?.name || "User";
                  } else {
                    // Normal user dekhe admin messages as "Admin"
                    displayName = msg.userId?.isAdmin
                      ? "Admin"
                      : msg.userId?.username || "User";
                  }
                  return (
                    <div
                      key={index}
                      className={`flex items-end gap-2 md:gap-3 ${
                        isSender ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isSender && (
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center text-black dark:text-white font-semibold text-xs md:text-sm flex-shrink-0">
                          {displayName}
                        </div>
                      )}

                      <div
                        className={`${getMessageWidthClass()} px-3 md:px-4 py-2 rounded-2xl shadow ${
                          isSender
                            ? "bg-pink-500 text-white rounded-br-none"
                            : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 rounded-bl-none"
                        }`}
                      >
                        <div className="text-sm md:text-base leading-relaxed break-words">
                          {msg.message}
                        </div>
                        <div
                          className={`text-xs mt-1 ${
                            isSender
                              ? "text-pink-100 text-right"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>

                      {isSender && (
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold text-xs md:text-sm flex-shrink-0">
                          ME
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Offers */}
                {offers.length > 0 && (
                  <div className="space-y-3 md:space-y-4">
                    {offers.map((offer) => (
                      <div
                        key={offer._id}
                        className="p-3 md:p-4 rounded-lg shadow-md bg-white border border-gray-200 text-gray-900 dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-700 dark:border-0 dark:text-white"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div className="flex-1">
                            <div className="text-base md:text-lg font-semibold">
                              {offer.offerDetails?.description}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              Price: ${offer.offerDetails?.price} · Delivery:{" "}
                              {offer.offerDetails?.deliveryTime} days
                            </div>
                          </div>
                          <div className="text-sm text-gray-700 dark:text-gray-200">
                            Status:{" "}
                            <span
                              className={`font-medium ${
                                offer.status === "accepted"
                                  ? "text-green-500"
                                  : offer.status === "declined"
                                    ? "text-red-500"
                                    : "text-yellow-500"
                              }`}
                            >
                              {offer.status}
                            </span>
                          </div>
                        </div>

                        {!isAdmin && offer.status === "pending" && (
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() =>
                                handleRespondToOffer(offer._id, "accepted")
                              }
                              className="flex-1 md:flex-none bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() =>
                                handleRespondToOffer(offer._id, "declined")
                              }
                              className="flex-1 md:flex-none bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area - Fixed */}
          <div className="flex-shrink-0 bg-white p-3 md:p-4 border-t border-gray-200 dark:bg-gray-900 dark:border-gray-800">
            <div className="max-w-6xl mx-auto">
              {isAdmin && showOfferForm && (
                <div className="mb-3 bg-gray-800 p-3 md:p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="Description"
                      value={newOffer.description}
                      onChange={(e) =>
                        setNewOffer({
                          ...newOffer,
                          description: e.target.value,
                        })
                      }
                      className="p-2 bg-gray-700 rounded text-sm md:text-base"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={newOffer.price}
                      onChange={(e) =>
                        setNewOffer({ ...newOffer, price: e.target.value })
                      }
                      className="p-2 bg-gray-700 rounded text-sm md:text-base"
                    />
                    <input
                      type="number"
                      placeholder="Delivery (days)"
                      value={newOffer.deliveryTime}
                      onChange={(e) =>
                        setNewOffer({
                          ...newOffer,
                          deliveryTime: e.target.value,
                        })
                      }
                      className="p-2 bg-gray-700 rounded text-sm md:text-base"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateOffer}
                      className="flex-1 bg-pink-500 hover:bg-colorNeonPink text-white px-4 py-2 rounded text-sm md:text-base"
                    >
                      Send Offer
                    </button>
                    <button
                      onClick={() => setShowOfferForm(false)}
                      className="flex-1 bg-gray-300 dark:bg-gray-600 px-4 py-2 rounded text-gray-900 dark:text-white text-sm md:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2 md:gap-3">
                <div className="flex-1 flex flex-col">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTypingIndicator(e.target.value.length > 0);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="w-full px-4 py-2 md:py-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 text-sm md:text-base"
                    disabled={isSending}
                  />
                  {isTyping && (
                    <div className="text-xs text-gray-500 mt-1">Typing...</div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSendMessage}
                    disabled={isSending || !newMessage.trim()}
                    className="bg-pink-500 hover:bg-colorNeonPink text-white px-4 py-2 md:py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
                  >
                    {isSending ? "Sending..." : "Send"}
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => setShowOfferForm((p) => !p)}
                      className={`px-3 py-2 md:py-3 rounded-lg text-sm md:text-base ${
                        showOfferForm
                          ? "bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white"
                          : "bg-pink-500 hover:bg-colorNeonPink text-white"
                      }`}
                    >
                      {showOfferForm ? "✕" : "Offer"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;

Message.propTypes = {
  conversationId: PropTypes.string,
};
