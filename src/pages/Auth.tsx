/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, MapPin, Mail, Lock, User } from "lucide-react";

const COUNTRIES = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "Rwanda",
  "Tanzania",
  "Uganda",
  "Ethiopia",
  "Zambia",
];

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState<string | undefined>(undefined);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (!firstName || !lastName || !country) {
          toast.error("Please fill in all fields, including country");
          setLoading(false);
          return;
        }
        await signUp(email, password, firstName, lastName, country);
        toast.success("Account created successfully!");
        navigate("/build-folio");
      } else {
        await signIn(email, password);
        toast.success("Signed in successfully!");
        navigate("/");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email already in use");
      } else if (error.code === "auth/weak-password") {
        toast.error("Password should be at least 6 characters");
      } else if (error.code === "auth/invalid-email") {
        toast.error("Invalid email address");
      } else if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        toast.error("Invalid email or password");
      } else {
        toast.error(error.message || "Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto px-3 md:px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Left Side - Info */}
          <div className="hidden md:flex flex-col justify-center">
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  JobFolio Africa
                </h2>
                <p className="text-muted-foreground">
                  Your gateway to opportunities across Africa
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Country-Based Filtering
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Find jobs specific to your location
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Build Your Folio
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Upload CV and showcase your skills
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Apply Directly
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Connect with employers in seconds
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <Card className="md:shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </CardTitle>
              <CardDescription>
                {isSignUp
                  ? "Join JobFolio to access African job opportunities"
                  : "Sign in to continue to your dashboard"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm">
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm">
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Doe"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                    </div>

                    {/* Country Selection */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        Country (Important for job filtering)
                      </Label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setShowCountryPicker(!showCountryPicker)
                          }
                          className="w-full rounded-md border border-input px-3 py-2 bg-background text-left text-sm hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                        >
                          {country ? (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              {country}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              Select your country...
                            </span>
                          )}
                        </button>

                        {showCountryPicker && (
                          <div className="absolute z-50 top-full mt-1 w-full bg-card border border-input rounded-md shadow-lg p-2 max-h-60 overflow-y-auto">
                            {COUNTRIES.map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => {
                                  setCountry(c);
                                  setShowCountryPicker(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                  country === c
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-muted"
                                }`}
                              >
                                {c}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {country && (
                        <Badge variant="secondary" className="w-fit gap-1">
                          <MapPin className="h-3 w-3" />
                          {country} selected
                        </Badge>
                      )}
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 focus:ring-2 focus:ring-primary"
                      required
                      minLength={6}
                    />
                  </div>
                  {!isSignUp && (
                    <Button
                      type="button"
                      variant="link"
                      className="text-xs h-auto p-0 float-right"
                      onClick={() => {
                        toast.info("Contact support for password reset");
                      }}
                    >
                      Forgot password?
                    </Button>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 text-base font-semibold"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSignUp ? "Create Account" : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 border-t border-border pt-4">
                <p className="text-center text-sm text-muted-foreground mb-3">
                  {isSignUp
                    ? "Already have an account?"
                    : "Don't have an account?"}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setFirstName("");
                    setLastName("");
                    setCountry(undefined);
                    setShowCountryPicker(false);
                  }}
                >
                  {isSignUp ? "Sign In Instead" : "Create New Account"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
