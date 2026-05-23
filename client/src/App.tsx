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

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSurvey from "./pages/admin/AdminSurvey";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminUsers from "./pages/admin/AdminUsers";

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

      {/* Admin Routes */}
      <Route path="/mufea21" component={AdminDashboard} />
      <Route path="/mufea21/survey" component={AdminSurvey} />
      <Route path="/mufea21/products" component={AdminProducts} />
      <Route path="/mufea21/orders" component={AdminOrders} />
      <Route path="/mufea21/settings" component={AdminSettings} />
      <Route path="/mufea21/users" component={AdminUsers} />

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
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
