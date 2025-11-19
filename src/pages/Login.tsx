/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const accountType = (location.state as any)?.accountType;
  const { signIn, resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email || !password) {
        toast.error("Please enter email and password");
        setLoading(false);
        return;
      }

      await signIn(email, password);
      toast.success("Logged in successfully!");
      navigate("/profile");
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = error.message || "Login failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setResettingPassword(true);
    try {
      await resetPassword(resetEmail);
      toast.success("Password reset email sent! Check your inbox.");
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to send password reset email");
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-5xl mx-auto px-3 sm:px-4 py-6 md:py-12 min-h-screen flex items-center">
        <div className="grid md:grid-cols-2 gap-4 md:gap-8 lg:gap-12 w-full">
          {/* Left Side - Info */}
          <div className="hidden md:flex flex-col justify-center">
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Welcome Back
                </h2>
                <p className="text-muted-foreground text-lg">
                  Sign in to your JobFolio account
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Quick Access
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Sign in with your email and password
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Secure Login
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Your account is protected with industry-standard security
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                    <AlertCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Forgot Password?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Reset your password instantly via email
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <Card className="border w-full h-fit">
            <CardHeader className="space-y-2 pb-3">
              {accountType && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mb-2 -ml-2 w-fit"
                  onClick={() => navigate(`/auth`, { state: { accountType } })}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to signup
                </Button>
              )}
              <CardTitle className="text-2xl md:text-3xl">Sign In</CardTitle>
              <CardDescription className="text-base">
                {accountType
                  ? `Sign in as ${accountType}`
                  : "Sign in to your account"}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 focus:ring-2 focus:ring-primary h-11"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="login-password"
                    className="text-sm font-medium"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 focus:ring-2 focus:ring-primary h-11"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    className="text-xs h-auto p-0 mt-1"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot password?
                  </Button>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-semibold mt-6"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-background text-muted-foreground">
                      New to JobFolio?
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => navigate("/select-account-type")}
                >
                  Create an Account
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <AlertDialog
        open={showForgotPassword}
        onOpenChange={setShowForgotPassword}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Reset Password</AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            Enter your email address and we'll send you a link to reset your
            password.
          </AlertDialogDescription>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="you@example.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="focus:ring-2 focus:ring-primary h-10"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePasswordReset}
              disabled={resettingPassword || !resetEmail}
              className="flex-1"
            >
              {resettingPassword && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Send Reset Link
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Login;
