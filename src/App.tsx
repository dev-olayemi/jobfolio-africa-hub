import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Profile from "./pages/Profile";
import BuildFolio from "./pages/BuildFolio";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import AccountTypeSelection from "./pages/AccountTypeSelection";
import Payment from "./pages/Payment";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Industries from "./pages/Industries";
import AdminJobs from "./pages/AdminJobs";
import PostJob from "./pages/PostJob";
import Feed from "./pages/Feed";
import PostDetail from "./pages/PostDetail";
import ManageJobs from "./pages/ManageJobs";
import JobApplications from "./pages/JobApplications";
import MyApplications from "./pages/MyApplications";
import SavedJobs from "./pages/SavedJobs";
import SettingsIndex from "./pages/settings/SettingsIndex";
import EmailSettings from "./pages/settings/EmailSettings";
import NotificationSettings from "./pages/settings/NotificationSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/select-account-type"
              element={<AccountTypeSelection />}
            />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Login />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/manage-jobs" element={<ManageJobs />} />
            <Route
              path="/job/:jobId/applications"
              element={<JobApplications />}
            />
            <Route path="/my-applications" element={<MyApplications />} />
            <Route path="/saved-jobs" element={<SavedJobs />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/build-folio" element={<BuildFolio />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/industries" element={<Industries />} />
            <Route path="/admin/jobs" element={<AdminJobs />} />
            <Route path="/settings" element={<SettingsIndex />} />
            <Route path="/settings/email" element={<EmailSettings />} />
            <Route
              path="/settings/notifications"
              element={<NotificationSettings />}
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
