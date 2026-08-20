import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";

// Customer pages
import Home from "./pages/Home";
import Survey from "./pages/Survey";
import Recommendations from "./pages/Recommendations";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import OrderDetail from "./pages/OrderDetail";
import MyOrders from "./pages/MyOrders";
import TrackOrder from "./pages/TrackOrder";
import Profile from "./pages/Profile";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSurvey from "./pages/admin/AdminSurvey";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminKnowledge from "./pages/admin/AdminKnowledge";
import AdminMeetings from "./pages/admin/AdminMeetings";
import AdminChatbot from "./pages/admin/AdminChatbot";

// Chatbot
import ChatbotWidget from "./components/ChatbotWidget";

function Router() {
  return (
    <Switch>
      {/* Customer Routes */}
      <Route path="/" component={Home} />
      <Route path="/survey" component={Survey} />
      <Route path="/recommendations" component={Recommendations} />
      <Route path="/products" component={Products} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/payment/:orderNumber" component={Payment} />
      <Route path="/order/:orderNumber" component={OrderDetail} />
      <Route path="/my-orders" component={MyOrders} />
      <Route path="/track-order" component={TrackOrder} />
      <Route path="/profile" component={Profile} />

      {/* Admin Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/survey" component={AdminSurvey} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/knowledge" component={AdminKnowledge} />
      <Route path="/admin/meetings" component={AdminMeetings} />
      <Route path="/admin/chatbot" component={AdminChatbot} />

      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ResumePendingCheckout() {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading || !isAuthenticated) return;
    if (sessionStorage.getItem("pending_checkout_after_login") !== "true") return;
    sessionStorage.removeItem("pending_checkout_after_login");
    if (window.location.pathname !== "/checkout") window.location.replace("/checkout");
  }, [isAuthenticated, loading]);

  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
          <ResumePendingCheckout />
          <ChatbotWidget />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
