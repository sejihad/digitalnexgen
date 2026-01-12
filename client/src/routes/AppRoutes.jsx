import { Route, Routes } from "react-router-dom";
import Chat from "../components/Chat";
import FacebookCallbackHandler from "../components/FacebookCallbackHandler";
import GoogleCallbackHandler from "../components/GoogleCallbackHandler ";
import Message from "../components/Message";
import Messages from "../components/Messages";
import ScrollToTop from "../components/ScrollToTop";
import AdminLayout from "../layouts/AdminLayout";
import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";
import AboutUs from "../pages/AboutUs";
import AddBlog from "../pages/AddBlog";
import AddGallery from "../pages/AddGallery";
import AddPartner from "../pages/AddPartner";
import AddProject from "../pages/AddProject";
import AddPromotionalOffer from "../pages/AddPromotionalOffer";
import AddService from "../pages/AddService";
import AdminBlogs from "../pages/AdminBlogs";
import AdminConvesation from "../pages/AdminConvesation";
import AdminGalleries from "../pages/AdminGalleries";
import AdminNewsLatters from "../pages/AdminNewsLatters";
import AdminOrder from "../pages/AdminOrder";
import AdminOrders from "../pages/AdminOrders";
import AdminPartners from "../pages/AdminPartners";
import AdminProfile from "../pages/AdminProfile";
import AdminProjects from "../pages/AdminProjects";
import AdminPromotionalOffers from "../pages/AdminPromotionalOffers";
import AdminReviews from "../pages/AdminReviews";
import AdminServices from "../pages/AdminServices";
import AdminSettings from "../pages/AdminSettings";
import Blog from "../pages/Blog";
import Business from "../pages/Business";
import Contact from "../pages/Contact";
import Coupons from "../pages/Coupons";
import Dashboard from "../pages/Dashboard";
import DigitalMarketing from "../pages/DigitalMarketing";
import EditBlog from "../pages/EditBlog";
import EditPartner from "../pages/EditPartner";
import EditProject from "../pages/EditProject";
import EditPromotionalOffer from "../pages/EditPromotionalOffer";
import EditService from "../pages/EditService";
import ForgotPassword from "../pages/Forgot/ForgotPassword";
import GraphicsDesign from "../pages/GraphicsDesign";
import Home from "../pages/Home";
import Login from "../pages/Login/Login";
import NotFound from "../pages/NotFound";
import OfferPage from "../pages/OfferPage";
import Order from "../pages/Order";
import Orders from "../pages/Orders";
import PaymentCancelled from "../pages/PaymentCancelled";
import PaymentSuccess from "../pages/PaymentSuccess";
import PaypalCancel from "../pages/PaypalCancel";
import PaypalSuccess from "../pages/PaypalSuccess";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import Profile from "../pages/Profile";
import ProgrammingTech from "../pages/ProgrammingTech";
import Project from "../pages/Project";
import ResetPassword from "../pages/ResetPassword";
import SearchResult from "../pages/SearchResult";
import ServiceList from "../pages/ServiceList";
import Services from "../pages/Services";
import Settings from "../pages/Settings";
import SingleBlog from "../pages/SingleBlog";
import SingleProject from "../pages/SingleProject";
import SingleService from "../pages/SingleService";
import SubCategory from "../pages/SubCategory";
import TermsAndConditions from "../pages/TermsAndConditions";
import UpdatePassword from "../pages/UpdatePassword";
import UserEmails from "../pages/UserEmails";
import VideoAnimation from "../pages/VideoAnimation";
import WritingTranslation from "../pages/WritingTranslation";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = ({ theme, toggleTheme }) => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route
          path="/"
          element={
            <ProtectedRoute requiresAuth={false}>
              <MainLayout theme={theme} toggleTheme={toggleTheme} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="messages/:id" element={<Message />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="messages" element={<Messages />} />
          <Route path="services" element={<Services />} />
          <Route path="service-list" element={<ServiceList />} />
          <Route path="programming-tech" element={<ProgrammingTech />} />
          <Route
            path="programming-tech/:subCategory"
            element={<SubCategory />}
          />
          <Route path="graphics-design" element={<GraphicsDesign />} />
          <Route
            path="graphics-design/:subCategory"
            element={<SubCategory />}
          />
          <Route path="digital-marketing" element={<DigitalMarketing />} />
          <Route
            path="digital-marketing/:subCategory"
            element={<SubCategory />}
          />
          <Route path="video-animation" element={<VideoAnimation />} />
          <Route
            path="Video-animation/:subCategory"
            element={<SubCategory />}
          />
          <Route path="business" element={<Business />} />
          <Route path="business/:subCategory" element={<SubCategory />} />
          <Route path="writing-translation" element={<WritingTranslation />} />
          <Route
            path="writing-translation/:subCategory"
            element={<SubCategory />}
          />
          <Route path=":subCategory/:id" element={<SingleService />} />
          <Route path="search" element={<SearchResult />} />
          <Route path="profile/:id" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:id" element={<SingleBlog />} />
          <Route path="project" element={<Project />} />
          <Route path="project/:id" element={<SingleProject />} />
          <Route path="about" element={<AboutUs />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<TermsAndConditions />} />
          <Route path="special-offers" element={<OfferPage />} />
          <Route
            path="payment-success"
            element={
              <ProtectedRoute>
                <PaymentSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="payment-cancel"
            element={
              <ProtectedRoute>
                <PaymentCancelled />
              </ProtectedRoute>
            }
          />
          <Route
            path="paypal-success"
            element={
              <ProtectedRoute>
                <PaypalSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="paypal-cancel"
            element={
              <ProtectedRoute>
                <PaypalCancel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders/:id"
            element={
              <ProtectedRoute>
                <Order />
              </ProtectedRoute>
            }
          />
          <Route
            path="update-password"
            element={
              <ProtectedRoute>
                <UpdatePassword />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute requiresAuth isAdminRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="*" element={<NotFound />} />
          <Route index element={<Dashboard />} />
          <Route path="add-service" element={<AddService />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="services/edit/:id" element={<EditService />} />
          <Route path="/admin/conversations" element={<AdminConvesation />} />
          <Route path="add-project" element={<AddProject />} />
          <Route path="add-gallery" element={<AddGallery />} />
          <Route path="galleries" element={<AdminGalleries />} />
          <Route path="add-blog" element={<AddBlog />} />
          <Route path="blogs" element={<AdminBlogs />} />
          <Route path="blogs/edit/:id" element={<EditBlog />} />
          <Route path="emails" element={<UserEmails />} />
          <Route path="add-partners" element={<AddPartner />} />
          <Route path="partners" element={<AdminPartners />} />
          <Route path="partners/edit/:id" element={<EditPartner />} />
          <Route path="newsletters" element={<AdminNewsLatters />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="projects/edit/:id" element={<EditProject />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrder />} />
          <Route path="profile/:id" element={<AdminProfile />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="review" element={<AdminReviews />} />

          <Route
            path="promotional-offers"
            element={<AdminPromotionalOffers />}
          />
          <Route
            path="add-promotional-offer"
            element={<AddPromotionalOffer />}
          />
          <Route
            path="promotional-offers/edit/:id"
            element={<EditPromotionalOffer />}
          />
          <Route path="reviews" element={<AdminReviews />} />
        </Route>
        <Route path="/google/callback" element={<GoogleCallbackHandler />} />
        <Route
          path="/facebook/callback"
          element={<FacebookCallbackHandler />}
        />
      </Routes>
    </>
  );
};

export default AppRoutes;
