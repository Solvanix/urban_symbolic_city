import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import PublicDirectory from "@/pages/PublicDirectory";
import LocalMarket from "@/pages/LocalMarket";
import Store from "@/pages/Store";
import ProductDetail from "@/pages/ProductDetail";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Preferences from "./pages/Preferences";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/profile/preferences" component={Preferences} />
      <Route path="/preferences" component={Preferences} />
      <Route path="/tourism" component={PublicDirectory} />
      <Route path="/services" component={PublicDirectory} />
      <Route path="/providers" component={PublicDirectory} />
      <Route path="/municipal-services" component={PublicDirectory} />
      <Route path="/market" component={LocalMarket} />
      <Route path="/store" component={Store} />
      <Route path="/store/:handle" component={ProductDetail} />
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
