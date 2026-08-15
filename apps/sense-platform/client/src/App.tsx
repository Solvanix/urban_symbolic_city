import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import PublicDirectory from "@/pages/PublicDirectory";
import LocalMarket from "@/pages/LocalMarket";
import Store from "@/pages/Store";
import InternalCheckout from "@/pages/InternalCheckout";
import ProductDetail from "@/pages/ProductDetail";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Preferences from "./pages/Preferences";
import TripPlanner from "./pages/TripPlanner";
import InfoPage from "./pages/InfoPage";
import Reports from "./pages/Reports";
import OperationsReports from "./pages/OperationsReports";
import ProviderAdmin from "./pages/ProviderAdmin";
import AdminProviders from "./pages/AdminProviders";
import AdminOrders from "./pages/AdminOrders";
import Notifications from "./pages/Notifications";
import RoleDashboard from "./pages/RoleDashboard";
import ProviderDetail from "./pages/ProviderDetail";
import ReportAssistant from "./pages/ReportAssistant";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/profile/preferences" component={Preferences} />
      <Route path="/preferences" component={Preferences} />
      <Route path="/plan" component={TripPlanner} />
      <Route path="/ai-planner" component={TripPlanner} />
      <Route path="/reports" component={Reports} />
      <Route path="/ops/reports" component={OperationsReports} />
      <Route path="/provider-admin" component={ProviderAdmin} />
      <Route path="/admin/providers" component={AdminProviders} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/dashboard" component={RoleDashboard} />
      <Route path="/ai-assistant" component={ReportAssistant} />
      <Route path="/orders/:id" component={OrderDetail} />
      <Route path="/orders" component={Orders} />
      <Route path="/about" component={InfoPage} />
      <Route path="/help" component={InfoPage} />
      <Route path="/contact" component={InfoPage} />
      <Route path="/privacy" component={InfoPage} />
      <Route path="/terms" component={InfoPage} />
      <Route path="/tourism" component={PublicDirectory} />
      <Route path="/services" component={PublicDirectory} />
      <Route path="/providers" component={PublicDirectory} />
      <Route path="/providers/:kind/:id" component={ProviderDetail} />
      <Route path="/municipal-services" component={PublicDirectory} />
      <Route path="/market" component={LocalMarket} />
      <Route path="/store" component={Store} />
      <Route path="/store/:handle" component={ProductDetail} />
      <Route path="/checkout/:cartId" component={InternalCheckout} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
