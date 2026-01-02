/* eslint-disable @typescript-eslint/no-explicit-any */
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Profile from "./pages/Profile";
import BuildFolio from "./pages/BuildFolio";
import Auth from "./pages/Auth";
import StreamlinedAuth from "./pages/StreamlinedAuth";
import Login from "./pages/Login";
import AccountTypeSelection from "./pages/AccountTypeSelection";
import Payment from "./pages/Payment";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Industries from "./pages/Industries";
import AdminJobs from "./pages/AdminJobs";
import AdminVerifications from "./pages/AdminVerifications";
import PostJob from "./pages/PostJob";
import Feed from "./pages/Feed";
import InBuzz from "./pages/InBuzz";
import PostDetail from "./pages/PostDetail";
import Notifications from "./pages/Notifications";
import ManageJobs from "./pages/ManageJobs";
import JobApplications from "./pages/JobApplications";
import Dashboard from "./pages/Dashboard";
import MyPosts from "./pages/MyPosts";
import JobApplicationsLanding from "./pages/JobApplicationsLanding";
import Interactions from "./pages/Interactions";
import MyApplications from "./pages/MyApplications";
import SavedJobs from "./pages/SavedJobs";
import SettingsIndex from "./pages/settings/SettingsIndex";
import EmailSettings from "./pages/settings/EmailSettings";
import NotificationSettings from "./pages/settings/NotificationSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const PostDetailComponent =
  PostDetail as unknown as import("react").ComponentType<any>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route
                path="/select-account-type"
                element={<AccountTypeSelection />}
              />
              <Route path="/auth" element={<StreamlinedAuth />} />
              <Route path="/login" element={<Login />} />
              <Route path="/post/:id" element={<PostDetailComponent />} />
              <Route path="/feed" element={<InBuzz />} />
              <Route path="/inbuzz" element={<InBuzz />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/post-job" element={<PostJob />} />
              <Route path="/manage-jobs" element={<ManageJobs />} />
              <Route
                path="/job/:jobId/applications"
                element={<JobApplications />}
              />
              <Route
                path="/job-applications"
                element={<JobApplicationsLanding />}
              />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/my-posts" element={<MyPosts />} />
              <Route path="/my-applications" element={<MyApplications />} />
              <Route path="/saved-jobs" element={<SavedJobs />} />
              <Route path="/interactions" element={<Interactions />} />
              <Route path="/likes" element={<Interactions />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/build-folio" element={<BuildFolio />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/about" element={<About />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/industries" element={<Industries />} />
              <Route path="/admin/jobs" element={<AdminJobs />} />
              <Route path="/admin/verifications" element={<AdminVerifications />} />
              <Route path="/settings" element={<SettingsIndex />} />
              <Route path="/settings/email" element={<EmailSettings />} />
              <Route
                path="/settings/notifications"
                element={<NotificationSettings />}
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
