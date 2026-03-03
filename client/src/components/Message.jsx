import axios from "axios";
import { Gift, Send, X } from "lucide-react";
import PropTypes from "prop-types";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { io } from "socket.io-client";

const Message = ({ conversationId }) => {
  const location = useLocation();
  const stateServiceTitle = location.state?.serviceTitle;
  const stateServiceId = location.state?.serviceId;
  const { id: routeId } = useParams();
  const convId = conversationId || routeId;

  const [conversation, setConversation] = useState({ messages: [] });
  const [offers, setOffers] = useState([]);
  const [socket, setSocket] = useState(null);

  const [newMessage, setNewMessage] = useState("");

  // ✅ Offer form now supports gig + features
  const [newOffer, setNewOffer] = useState({
    gigId: "",
    gigTitle: "",
    gigSubCategory: "",
    gigCoverImage: "",
    description: "",
    featuresText: "", // newline separated
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

  // ✅ payment modal for accepting offer
  const [payOffer, setPayOffer] = useState(null); // offer object or null
  const [isPaying, setIsPaying] = useState(false);

  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const apiBase = import.meta.env.VITE_API_BASE_URL;

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

  const getDisplayName = (msg) => {
    // If Admin -> real usernames
    if (currentUser?.isAdmin) {
      return msg.userId?.name || msg.userId?.username || "User";
    }
    // Normal user: if admin sender show "Admin"
    if (msg.userId?.isAdmin) {
      return msg.userId?.name || msg.userId?.username || "Admin";
    }
    return msg.userId?.name || "User";
  };

  useEffect(() => {
    setIsAdmin(Boolean(currentUser?.isAdmin));
  }, []);

  // ✅ Socket connection
  useEffect(() => {
    const s = io(apiBase, { withCredentials: true });

    const token = localStorage.getItem("token");
    if (token) s.emit("user:join", token);

    if (convId) s.emit("conversation:join", convId);

    setSocket(s);
    return () => s.disconnect();
  }, [apiBase, convId]);

  // ✅ Socket listeners (message + typing)
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data) => {
      if (data.conversationId === convId) {
        setConversation((prev) => ({
          ...prev,
          messages: [...prev.messages, data.message],
        }));
      }
    };

    const handleTyping = (data) => {
      if (data.conversationId === convId) {
        setIsTypingVisible(data.isTyping);
        if (data.isTyping) {
          const timer = setTimeout(() => setIsTypingVisible(false), 3000);
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
  }, [socket, convId, typingTimeout]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ✅ auto scroll
  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages, offers, isTypingVisible]);

  const fetchOffers = async () => {
    if (!convId) return;
    try {
      const offersRes = await axios.get(
        `${apiBase}/api/offers?conversationId=${convId}`,
        { withCredentials: true },
      );
      setOffers(offersRes.data || []);
    } catch {
      // ignore
    }
  };

  // ✅ Fetch conversation + messages + offers
  useEffect(() => {
    const fetchConversation = async () => {
      if (!convId) return;
      try {
        const conversationRes = await axios.get(
          `${apiBase}/api/conversations/single/${convId}`,
          { withCredentials: true },
        );

        if (conversationRes.data) {
          const messageRes = await axios.get(
            `${apiBase}/api/messages/${convId}`,
            {
              withCredentials: true,
            },
          );

          setConversation({
            ...conversationRes.data,
            messages: messageRes.data || [],
          });

          await fetchOffers();

          // Merge server-linkedServices into local savedGigs
          const serverLinked = Array.isArray(
            conversationRes.data.linkedServices,
          )
            ? conversationRes.data.linkedServices
            : [];

          if (serverLinked.length > 0) {
            const key = `conv_gigs_${convId}`;
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
                      (n) => String(n.serviceId) === String(g.serviceId),
                    ),
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
                })),
              );
            }
          }
        }
      } catch {
        // ignore
      }
    };

    fetchConversation();
  }, [apiBase, convId]);

  // ✅ Fetch counterpart username
  useEffect(() => {
    const loadName = async () => {
      try {
        if (!counterpartId) return;
        const res = await axios.get(`${apiBase}/api/users/${counterpartId}`, {
          withCredentials: true,
        });
        const u = res?.data || {};
        if (u) {
          if (currentUser?.isAdmin)
            setHeaderName(u.name || u.username || "User");
          else
            setHeaderName(u.isAdmin ? "Admin" : u.name || u.username || "User");
        }
        setHeaderUser(u);
      } catch {
        // ignore
      }
    };
    loadName();
  }, [apiBase, counterpartId]);

  // ✅ Load saved gigs from localStorage
  useEffect(() => {
    const key = `conv_gigs_${convId}`;
    try {
      const prev = JSON.parse(localStorage.getItem(key) || "[]");
      if (Array.isArray(prev)) setSavedGigs(prev);
    } catch {
      // ignore
    }
  }, [convId]);

  // ✅ Load gig details (optional)
  useEffect(() => {
    const serviceId =
      stateServiceId || conversation?.serviceId || conversation?.service?._id;
    if (!serviceId) return;

    let isMounted = true;
    const load = async () => {
      try {
        const res = await axios.get(
          `${apiBase}/api/services/single-service/${serviceId}`,
        );
        if (!isMounted) return;
        setGig(res.data);

        const key = `conv_gigs_${convId}`;
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
              (g) => String(g.serviceId) !== String(item.serviceId),
            ),
          ];
          localStorage.setItem(key, JSON.stringify(merged));
          setSavedGigs(merged);
        } catch {
          // ignore
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
    apiBase,
    convId,
    stateServiceId,
    conversation?.serviceId,
    conversation?.service,
  ]);

  const handleTypingIndicator = (typing) => {
    if (!socket || !convId) return;
    setIsTyping(typing);
    socket.emit("typing:update", {
      conversationId: convId,
      userId: meId,
      isTyping: typing,
    });
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

    const text = newMessage;
    setNewMessage("");
    handleTypingIndicator(false);

    try {
      const response = await axios.post(
        `${apiBase}/api/messages`,
        { conversationId: convId, message: text },
        { withCredentials: true },
      );

      setConversation((prev) => {
        const msgs = prev.messages.filter(
          (m) => !String(m._id).startsWith("temp-"),
        );
        return { ...prev, messages: [...msgs, response.data] };
      });

      if (socket) {
        const receiverId = isAdmin
          ? buyerId || sellerId
          : adminId || sellerId || buyerId;
        socket.emit("message:send", {
          conversationId: convId,
          receiverId,
          message: response.data,
        });
      }
    } catch {
      // ignore
    } finally {
      setIsSending(false);
    }
  };

  // ✅ Admin create offer with gig + features
  const handleCreateOffer = async () => {
    const {
      gigId,
      gigTitle,
      gigSubCategory,
      gigCoverImage,
      description,
      featuresText,
      price,
      deliveryTime,
    } = newOffer;

    if (!gigId || !gigTitle || !description || !price || !deliveryTime) return;

    const features = String(featuresText || "")
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);

    try {
      const response = await axios.post(
        `${apiBase}/api/offers`,
        {
          conversationId: convId,
          buyerId: conversation.buyerId,
          gig: {
            id: gigId,
            title: gigTitle,
            subCategory: gigSubCategory || "",
            coverImage: gigCoverImage || "",
          },
          offerDetails: {
            description,
            features,
            price: Number(price),
            deliveryTime: Number(deliveryTime),
          },
        },
        { withCredentials: true },
      );

      setOffers((prev) => [...prev, response.data]);
      setNewOffer({
        gigId: "",
        gigTitle: "",
        gigSubCategory: "",
        gigCoverImage: "",
        description: "",
        featuresText: "",
        price: "",
        deliveryTime: "",
      });
      setShowOfferForm(false);
    } catch {
      // ignore
    }
  };

  // ✅ Decline only (accept will start payment)
  const handleDeclineOffer = async (offerId) => {
    try {
      const response = await axios.put(
        `${apiBase}/api/offers/${offerId}`,
        { status: "declined" },
        { withCredentials: true },
      );

      setOffers((prev) =>
        prev.map((o) =>
          String(o._id) === String(offerId) ? { ...o, ...response.data } : o,
        ),
      );
    } catch {
      // ignore
    }
  };

  // ✅ Start payment for offer (Stripe/PayPal) -> backend returns redirect url
  const startOfferPayment = async (offer, provider) => {
    if (!offer?._id) return;
    setIsPaying(true);

    try {
      const url =
        provider === "stripe"
          ? `${apiBase}/api/offers/${offer._id}/checkout/stripe`
          : `${apiBase}/api/offers/${offer._id}/checkout/paypal`;

      const res = await axios.post(url, {}, { withCredentials: true });

      if (res?.data?.url) {
        window.location.href = res.data.url;
        return;
      }

      // fallback (if backend returns paypal {id})
      if (provider === "paypal" && res?.data?.id) {
        window.location.href = `https://www.sandbox.paypal.com/checkoutnow?token=${res.data.id}`;
        return;
      }
    } catch {
      // ignore
    } finally {
      setIsPaying(false);
      setPayOffer(null);
    }
  };

  // ✅ timeline (messages + offers serially)
  const timeline = useMemo(() => {
    return [
      ...(conversation.messages || []).map((m) => ({
        kind: "message",
        _id: String(m._id),
        createdAt: m.createdAt,
        data: m,
      })),
      ...(offers || []).map((o) => ({
        kind: "offer",
        _id: String(o._id),
        createdAt: o.createdAt || o.updatedAt,
        data: o,
      })),
    ]
      .filter((x) => x.createdAt)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [conversation.messages, offers]);

  const renderOfferCard = (offer) => {
    const features = Array.isArray(offer?.offerDetails?.features)
      ? offer.offerDetails.features
      : [];
    const hasGig = Boolean(offer?.gig?.title || offer?.gig?.id);

    return (
      <div className="max-w-[85%] mx-auto p-3 md:p-4 rounded-lg shadow-md bg-white border border-gray-200 text-gray-900 dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-700 dark:border-0 dark:text-white">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-semibold">
            <Gift size={18} />
            Custom Offer
          </div>

          <div className="text-sm">
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

        {hasGig && (
          <div className="mt-3 flex gap-3 items-start">
            {offer.gig?.coverImage ? (
              <img
                src={offer.gig.coverImage?.url || offer.gig.coverImage}
                alt={offer.gig.title || "Gig"}
                className="w-14 h-12 rounded-md object-cover border border-white/10"
              />
            ) : (
              <div className="w-14 h-12 rounded-md bg-black/10 dark:bg-white/10 flex items-center justify-center text-xs">
                Gig
              </div>
            )}

            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">
                {offer.gig?.title}
              </div>
              {offer.gig?.subCategory && (
                <div className="text-xs text-gray-600 dark:text-gray-300 truncate">
                  {offer.gig.subCategory}
                </div>
              )}
              {offer.gig?.id && offer.gig?.subCategory && (
                <Link
                  to={`/${offer.gig.subCategory}/${offer.gig.id}`}
                  className="inline-block mt-1 text-xs bg-pink-500 hover:bg-colorNeonPink text-white px-2 py-1 rounded"
                >
                  View Gig
                </Link>
              )}
            </div>
          </div>
        )}

        <div className="mt-3 text-sm whitespace-pre-line">
          {offer.offerDetails?.description}
        </div>

        {features.length > 0 && (
          <div className="mt-3">
            <div className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-300">
              Features
            </div>
            <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
              {features.map((f, idx) => (
                <li key={idx} className="break-words">
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-3 text-sm text-gray-700 dark:text-gray-200">
          Price:{" "}
          <span className="font-semibold">${offer.offerDetails?.price}</span> ·
          Delivery:{" "}
          <span className="font-semibold">
            {offer.offerDetails?.deliveryTime}
          </span>{" "}
          days
        </div>

        {/* ✅ Buyer actions */}
        {!isAdmin && offer.status === "pending" && (
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setPayOffer(offer)} // ✅ open payment modal
              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm"
            >
              Accept & Pay
            </button>
            <button
              onClick={() => handleDeclineOffer(offer._id)}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm"
            >
              Decline
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-[100vh] bg-slate-50 text-gray-900 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 dark:text-gray-100 overflow-hidden container mx-auto">
      <div
        className="h-full flex flex-col bg-white dark:bg-white/5 backdrop-blur-sm"
        ref={containerRef}
      >
        {/* Header */}
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

          {(stateServiceTitle || conversation?.service?.title) && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 truncate">
              {stateServiceTitle || conversation?.service?.title}
            </div>
          )}
        </div>

        {/* Main */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Messages Container */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gradient-to-t from-transparent via-black/5 to-transparent"
          >
            {/* Saved gigs carousel */}
            {savedGigs.length > 0 && (
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
                              src={g.coverImage?.url || g.coverImage}
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
            )}

            {conversation.messages.length === 0 && offers.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                <div className="text-center">
                  <div className="text-lg mb-2">No messages yet</div>
                  <p className="text-sm">Start the conversation</p>
                </div>
              </div>
            ) : (
              <>
                {timeline.map((item) => {
                  if (item.kind === "message") {
                    const msg = item.data;
                    const isSender =
                      String(msg.userId?._id || msg.userId) === meId;
                    const displayName = getDisplayName(msg);
                    const avatar = msg.userId?.img?.url;

                    return (
                      <div
                        key={`m-${item._id}`}
                        className={`flex gap-3 ${isSender ? "justify-end" : "justify-start"}`}
                      >
                        {!isSender && (
                          <div className="flex flex-col items-center">
                            <img
                              src={avatar || "/avatar.png"}
                              alt={displayName}
                              className="w-9 h-9 rounded-full object-cover border"
                            />
                          </div>
                        )}

                        <div className="max-w-[70%]">
                          {!isSender && (
                            <div className="text-xs text-gray-500 mb-1">
                              {displayName}
                            </div>
                          )}

                          <div
                            className={`px-4 py-2 rounded-2xl shadow-sm text-sm leading-relaxed ${
                              isSender
                                ? "bg-pink-500 text-white rounded-br-none"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none"
                            }`}
                          >
                            {msg.message}
                          </div>

                          <div
                            className={`text-[10px] mt-1 ${
                              isSender
                                ? "text-right text-pink-200"
                                : "text-gray-400"
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>

                        {isSender && (
                          <img
                            src={avatar || "/avatar.png"}
                            alt="Me"
                            className="w-9 h-9 rounded-full object-cover border"
                          />
                        )}
                      </div>
                    );
                  }

                  // Offer bubble
                  return (
                    <div key={`o-${item._id}`}>
                      {renderOfferCard(item.data)}
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 bg-white p-3 md:p-4 border-t border-gray-200 dark:bg-gray-900 dark:border-gray-800">
            <div className="max-w-6xl mx-auto">
              {/* ✅ Admin Offer Form */}
              {isAdmin && showOfferForm && (
                <div className="mb-3 bg-gray-800 p-3 md:p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 mb-3">
                    {/* Gig selector */}
                    <select
                      value={newOffer.gigId}
                      onChange={(e) => {
                        const gid = e.target.value;
                        const selected = savedGigs.find(
                          (g) => String(g.serviceId) === String(gid),
                        );
                        setNewOffer((p) => ({
                          ...p,
                          gigId: gid,
                          gigTitle: selected?.title || "",
                          gigSubCategory: selected?.subCategory || "",
                          gigCoverImage:
                            selected?.coverImage?.url ||
                            selected?.coverImage ||
                            "",
                        }));
                      }}
                      className="p-2 bg-gray-700 rounded text-sm md:text-base"
                    >
                      <option value="">Select a gig</option>
                      {savedGigs.map((g) => (
                        <option
                          key={String(g.serviceId)}
                          value={String(g.serviceId)}
                        >
                          {g.title}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      placeholder="Price"
                      value={newOffer.price}
                      onChange={(e) =>
                        setNewOffer((p) => ({ ...p, price: e.target.value }))
                      }
                      className="p-2 bg-gray-700 rounded text-sm md:text-base"
                    />

                    <input
                      type="number"
                      placeholder="Delivery (days)"
                      value={newOffer.deliveryTime}
                      onChange={(e) =>
                        setNewOffer((p) => ({
                          ...p,
                          deliveryTime: e.target.value,
                        }))
                      }
                      className="p-2 bg-gray-700 rounded text-sm md:text-base"
                    />

                    <textarea
                      placeholder="Description"
                      value={newOffer.description}
                      onChange={(e) =>
                        setNewOffer((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                      rows={5}
                      className="p-2 bg-gray-700 rounded text-sm md:text-base w-full md:col-span-2 resize-y"
                    />
                  </div>

                  <textarea
                    placeholder="Features (one per line)"
                    value={newOffer.featuresText}
                    onChange={(e) =>
                      setNewOffer((p) => ({
                        ...p,
                        featuresText: e.target.value,
                      }))
                    }
                    rows={4}
                    className="w-full p-2 bg-gray-700 rounded text-sm md:text-base mb-3"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateOffer}
                      disabled={
                        !newOffer.gigId ||
                        !newOffer.description ||
                        !newOffer.price ||
                        !newOffer.deliveryTime
                      }
                      className="flex-1 bg-pink-500 hover:bg-colorNeonPink text-white px-4 py-2 rounded text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="bg-pink-500 hover:bg-colorNeonPink text-white px-4 py-2 md:py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    title="Send message"
                  >
                    {isSending ? (
                      <span className="text-xs md:text-sm">...</span>
                    ) : (
                      <Send size={18} />
                    )}
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => setShowOfferForm((p) => !p)}
                      className={`px-4 py-2 md:py-3 rounded-lg transition-colors flex items-center justify-center ${
                        showOfferForm
                          ? "bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white"
                          : "bg-pink-500 hover:bg-colorNeonPink text-white"
                      }`}
                      title={showOfferForm ? "Close offer" : "Send offer"}
                    >
                      {showOfferForm ? <X size={18} /> : <Gift size={18} />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ✅ Payment modal for accepting offer */}
          {payOffer && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
              <div className="bg-gray-900 text-gray-100 rounded-2xl p-6 shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="text-lg font-bold">Pay to accept offer</div>
                  <button
                    onClick={() => (!isPaying ? setPayOffer(null) : null)}
                    className="text-gray-400 hover:text-white"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>

                <div className="text-sm text-gray-300">
                  <div className="font-semibold">
                    {payOffer.gig?.title || "Offer"}
                  </div>
                  <div className="mt-1">
                    Amount:{" "}
                    <span className="font-semibold">
                      ${payOffer.offerDetails?.price}
                    </span>
                  </div>
                  <div className="mt-1">
                    Delivery:{" "}
                    <span className="font-semibold">
                      {payOffer.offerDetails?.deliveryTime}
                    </span>{" "}
                    days
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <button
                    onClick={() => startOfferPayment(payOffer, "stripe")}
                    disabled={isPaying}
                    className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:brightness-95 disabled:opacity-50"
                  >
                    {isPaying ? "Processing..." : "💳 Pay with Card or Others"}
                  </button>

                  <button
                    onClick={() => startOfferPayment(payOffer, "paypal")}
                    disabled={isPaying}
                    className="w-full bg-green-500 text-white font-semibold py-3 rounded-lg hover:bg-green-600 disabled:opacity-50"
                  >
                    {isPaying ? "Processing..." : "🅿️ Pay with PayPal"}
                  </button>

                  <button
                    onClick={() => (!isPaying ? setPayOffer(null) : null)}
                    className="w-full text-gray-400 text-sm hover:text-white hover:underline"
                  >
                    Cancel
                  </button>
                </div>
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
