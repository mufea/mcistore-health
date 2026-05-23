import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Customer pages
import Home from "./pages/Home";
import Survey from "./pages/Survey";
import Recommendations from "./pages/Recommendations";
import Products from "./pages/Products";
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

      {/* Legacy /mufea21 admin routes (canonical) */}
      <Route path="/mufea21" component={AdminDashboard} />
      <Route path="/mufea21/survey" component={AdminSurvey} />
      <Route path="/mufea21/products" component={AdminProducts} />
      <Route path="/mufea21/orders" component={AdminOrders} />
      <Route path="/mufea21/settings" component={AdminSettings} />
      <Route path="/mufea21/users" component={AdminUsers} />
      <Route path="/mufea21/knowledge" component={AdminKnowledge} />
      <Route path="/mufea21/meetings" component={AdminMeetings} />
      <Route path="/mufea21/chatbot" component={AdminChatbot} />

      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
          <ChatbotWidget />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
