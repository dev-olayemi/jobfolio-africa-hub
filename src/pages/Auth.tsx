/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Loader2,
  MapPin,
  Mail,
  Lock,
  User,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";

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
  const location = useLocation();
  const accountTypeFromLocation = (location.state as any)?.accountType;
  const navigate = useNavigate();
  const [showSignIn, setShowSignIn] = useState(false);

  // If no account type is selected and not showing sign-in, redirect to account type selection
  useEffect(() => {
    if (!accountTypeFromLocation && !showSignIn) {
      navigate("/select-account-type", { replace: true });
      return;
    }
  }, [accountTypeFromLocation, navigate, showSignIn]);

  const [accountType, setAccountType] = useState<
    "jobseeker" | "recruiter" | "company" | "employer" | null
  >(accountTypeFromLocation || null);

  const isSignUpFromLocation = (location.state as any)?.isSignUp;
  const [isSignUp, setIsSignUp] = useState<boolean>(
    Boolean(isSignUpFromLocation)
  );
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState<string | undefined>(undefined);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // Recruiter fields
  const [recruiterCompany, setRecruiterCompany] = useState("");
  const [recruiterExperience, setRecruiterExperience] = useState("");
  const [recruiterSpecializations, setRecruiterSpecializations] = useState("");
  const [recruiterLicense, setRecruiterLicense] = useState("");

  // Company fields
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyIndustry, setCompanyIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [companyRegistration, setCompanyRegistration] = useState("");

  // Employer fields
  const [employerBusinessName, setEmployerBusinessName] = useState("");
  const [employerBusinessType, setEmployerBusinessType] = useState("");
  const [employerYearsInBusiness, setEmployerYearsInBusiness] = useState("");

  const { signIn, signUp } = useAuth();

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

        // Validate role-specific fields
        if (accountType === "recruiter") {
          if (!recruiterCompany || !recruiterExperience || !recruiterLicense) {
            toast.error("Please fill in all recruiter fields");
            setLoading(false);
            return;
          }
        } else if (accountType === "company") {
          if (
            !companyName ||
            !companyWebsite ||
            !companyIndustry ||
            !companyRegistration
          ) {
            toast.error("Please fill in all company fields");
            setLoading(false);
            return;
          }
        } else if (accountType === "employer") {
          if (
            !employerBusinessName ||
            !employerBusinessType ||
            !employerYearsInBusiness
          ) {
            toast.error("Please fill in all employer fields");
            setLoading(false);
            return;
          }
        }

        const roleDetails =
          accountType === "recruiter"
            ? {
                companyName: recruiterCompany,
                experience: recruiterExperience,
                specialization: recruiterSpecializations
                  .split(",")
                  .map((s) => s.trim()),
                licenseNumber: recruiterLicense,
              }
            : accountType === "company"
            ? {
                companyName,
                website: companyWebsite,
                industry: companyIndustry,
                companySize,
                registrationNumber: companyRegistration,
              }
            : accountType === "employer"
            ? {
                businessName: employerBusinessName,
                businessType: employerBusinessType,
                yearsInBusiness: employerYearsInBusiness,
              }
            : undefined;

        await signUp(
          email,
          password,
          firstName,
          lastName,
          country,
          accountType || "jobseeker",
          roleDetails
        );
        toast.success("Account created successfully!");
        navigate(accountType === "jobseeker" ? "/build-folio" : "/profile");
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
      <div className="container max-w-5xl mx-auto px-3 sm:px-4 py-6 md:py-12">
        <div className="grid md:grid-cols-2 gap-4 md:gap-8 lg:gap-12">
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

              {accountType && isSignUp && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <Badge className="mb-2 capitalize">{accountType}</Badge>
                  <p className="text-sm text-foreground font-semibold">
                    {accountType === "recruiter"
                      ? "Recruiter Registration"
                      : accountType === "company"
                      ? "Company Registration"
                      : "Employer Registration"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {accountType === "recruiter"
                      ? "Help job seekers find their perfect roles"
                      : accountType === "company"
                      ? "Post jobs and find top talent"
                      : "Build your hiring team and grow"}
                  </p>
                </div>
              )}

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
          <Card className="border md:shadow-lg w-full">
            <CardHeader className="space-y-2 pb-3">
              {/* Show tabs for sign-in vs sign-up when on main auth page */}
              {!accountTypeFromLocation && (
                <div className="flex gap-1 -mx-6 px-6 mb-4 border-b border-border">
                  <Button
                    type="button"
                    variant={showSignIn ? "default" : "ghost"}
                    size="sm"
                    className={`rounded-none border-b-2 transition-colors flex-1 ${
                      showSignIn
                        ? "border-primary font-semibold"
                        : "border-transparent"
                    }`}
                    onClick={() => {
                      setShowSignIn(true);
                      setIsSignUp(false);
                      setFirstName("");
                      setLastName("");
                      setCountry(undefined);
                      setShowCountryPicker(false);
                      setShowPassword(false);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    type="button"
                    variant={!showSignIn ? "default" : "ghost"}
                    size="sm"
                    className={`rounded-none border-b-2 transition-colors flex-1 ${
                      !showSignIn
                        ? "border-primary font-semibold"
                        : "border-transparent"
                    }`}
                    onClick={() => {
                      setShowSignIn(false);
                      setIsSignUp(true);
                      setEmail("");
                      setPassword("");
                      setShowPassword(false);
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              )}

              {accountType && isSignUp ? (
                <div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mb-2 -ml-2"
                    onClick={() => navigate("/select-account-type")}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Change account type
                  </Button>
                  <CardTitle className="text-2xl capitalize">
                    Register as {accountType}
                  </CardTitle>
                  <CardDescription>
                    {accountType === "recruiter"
                      ? "Help job seekers connect with opportunities"
                      : accountType === "company"
                      ? "Post jobs and find top talent"
                      : "Build your hiring team and grow"}
                  </CardDescription>
                </div>
              ) : showSignIn ? (
                <div>
                  <CardTitle className="text-2xl">Welcome Back</CardTitle>
                  <CardDescription>
                    Sign in to continue to your dashboard
                  </CardDescription>
                </div>
              ) : (
                <div>
                  <CardTitle className="text-2xl">
                    {isSignUp ? "Create Account" : "Welcome Back"}
                  </CardTitle>
                  <CardDescription>
                    {isSignUp
                      ? "Join JobFolio to access African job opportunities"
                      : "Sign in to continue to your dashboard"}
                  </CardDescription>
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Sign-in form - simple email/password only */}
                {showSignIn ? (
                  <>
                    <div className="space-y-2">
                      <Label
                        htmlFor="signin-email"
                        className="text-sm font-medium"
                      >
                        Email Address
                      </Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="focus:ring-2 focus:ring-primary h-10"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="signin-password"
                        className="text-sm font-medium"
                      >
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="focus:ring-2 focus:ring-primary h-10 pr-10"
                          minLength={6}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                        className="text-xs h-auto p-0"
                        onClick={() => {
                          toast.info("Contact support for password reset");
                        }}
                      >
                        Forgot password?
                      </Button>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 text-base font-semibold mt-2"
                      disabled={loading}
                    >
                      {loading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Sign In
                    </Button>

                    <div className="mt-6 pt-4 border-t border-border text-center">
                      <p className="text-sm text-muted-foreground mb-3">
                        Don't have an account?{" "}
                        <Button
                          type="button"
                          variant="link"
                          className="p-0 h-auto text-primary font-semibold"
                          onClick={() => {
                            setShowSignIn(false);
                            setIsSignUp(true);
                            setEmail("");
                            setPassword("");
                            setShowPassword(false);
                          }}
                        >
                          Create one here
                        </Button>
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Sign-up form - full form with role-specific fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label
                          htmlFor="firstName"
                          className="text-sm font-medium"
                        >
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="focus:ring-2 focus:ring-primary h-10"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="lastName"
                          className="text-sm font-medium"
                        >
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Doe"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="focus:ring-2 focus:ring-primary h-10"
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

                    {/* Recruiter-specific fields */}
                    {accountType === "recruiter" && (
                      <div className="space-y-4 pt-4 border-t border-border">
                        <h3 className="font-semibold text-sm text-foreground">
                          Recruiter Information
                        </h3>

                        <div className="space-y-2">
                          <Label htmlFor="recruiterCompany" className="text-sm">
                            Company Name *
                          </Label>
                          <Input
                            id="recruiterCompany"
                            type="text"
                            placeholder="Your recruitment company"
                            value={recruiterCompany}
                            onChange={(e) =>
                              setRecruiterCompany(e.target.value)
                            }
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="recruiterExperience"
                            className="text-sm"
                          >
                            Years of Experience *
                          </Label>
                          <Select
                            value={recruiterExperience}
                            onValueChange={setRecruiterExperience}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select experience" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0-2">0-2 years</SelectItem>
                              <SelectItem value="2-5">2-5 years</SelectItem>
                              <SelectItem value="5-10">5-10 years</SelectItem>
                              <SelectItem value="10+">10+ years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="recruiterSpecializations"
                            className="text-sm"
                          >
                            Specializations (comma-separated)
                          </Label>
                          <Textarea
                            id="recruiterSpecializations"
                            placeholder="e.g., Technology, Finance, Healthcare"
                            value={recruiterSpecializations}
                            onChange={(e) =>
                              setRecruiterSpecializations(e.target.value)
                            }
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="recruiterLicense" className="text-sm">
                            License Number *
                          </Label>
                          <Input
                            id="recruiterLicense"
                            type="text"
                            placeholder="Your recruiter license"
                            value={recruiterLicense}
                            onChange={(e) =>
                              setRecruiterLicense(e.target.value)
                            }
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* Company-specific fields */}
                    {accountType === "company" && (
                      <div className="space-y-4 pt-4 border-t border-border">
                        <h3 className="font-semibold text-sm text-foreground">
                          Company Information
                        </h3>

                        <div className="space-y-2">
                          <Label htmlFor="companyName" className="text-sm">
                            Company Name *
                          </Label>
                          <Input
                            id="companyName"
                            type="text"
                            placeholder="Your company name"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="companyWebsite" className="text-sm">
                            Website *
                          </Label>
                          <Input
                            id="companyWebsite"
                            type="url"
                            placeholder="https://company.com"
                            value={companyWebsite}
                            onChange={(e) => setCompanyWebsite(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="companyIndustry" className="text-sm">
                            Industry *
                          </Label>
                          <Input
                            id="companyIndustry"
                            type="text"
                            placeholder="e.g., Technology, Finance"
                            value={companyIndustry}
                            onChange={(e) => setCompanyIndustry(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="companySize" className="text-sm">
                            Company Size
                          </Label>
                          <Select
                            value={companySize}
                            onValueChange={setCompanySize}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select company size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1-10">
                                1-10 employees
                              </SelectItem>
                              <SelectItem value="11-50">
                                11-50 employees
                              </SelectItem>
                              <SelectItem value="51-200">
                                51-200 employees
                              </SelectItem>
                              <SelectItem value="201-500">
                                201-500 employees
                              </SelectItem>
                              <SelectItem value="500+">
                                500+ employees
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="companyRegistration"
                            className="text-sm"
                          >
                            Registration Number *
                          </Label>
                          <Input
                            id="companyRegistration"
                            type="text"
                            placeholder="Company registration number"
                            value={companyRegistration}
                            onChange={(e) =>
                              setCompanyRegistration(e.target.value)
                            }
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* Employer-specific fields */}
                    {accountType === "employer" && (
                      <div className="space-y-4 pt-4 border-t border-border">
                        <h3 className="font-semibold text-sm text-foreground">
                          Business Information
                        </h3>

                        <div className="space-y-2">
                          <Label
                            htmlFor="employerBusinessName"
                            className="text-sm"
                          >
                            Business Name *
                          </Label>
                          <Input
                            id="employerBusinessName"
                            type="text"
                            placeholder="Your business name"
                            value={employerBusinessName}
                            onChange={(e) =>
                              setEmployerBusinessName(e.target.value)
                            }
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="employerBusinessType"
                            className="text-sm"
                          >
                            Business Type *
                          </Label>
                          <Input
                            id="employerBusinessType"
                            type="text"
                            placeholder="e.g., Tech Startup, Manufacturing"
                            value={employerBusinessType}
                            onChange={(e) =>
                              setEmployerBusinessType(e.target.value)
                            }
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="employerYearsInBusiness"
                            className="text-sm"
                          >
                            Years in Business *
                          </Label>
                          <Select
                            value={employerYearsInBusiness}
                            onValueChange={setEmployerYearsInBusiness}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select years" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0-1">
                                Less than 1 year
                              </SelectItem>
                              <SelectItem value="1-3">1-3 years</SelectItem>
                              <SelectItem value="3-5">3-5 years</SelectItem>
                              <SelectItem value="5-10">5-10 years</SelectItem>
                              <SelectItem value="10+">10+ years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Email/Password fields - only for signup (sign-in has separate ones above) */}
                {!showSignIn && (
                  <>
                    <div className="space-y-2">
                      <Label
                        htmlFor="signup-email"
                        className="text-sm font-medium"
                      >
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 focus:ring-2 focus:ring-primary h-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="signup-password"
                        className="text-sm font-medium"
                      >
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 focus:ring-2 focus:ring-primary h-10"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-semibold mt-4"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {showSignIn
                    ? "Sign In"
                    : isSignUp
                    ? "Create Account"
                    : "Sign In"}
                </Button>
              </form>

              {/* Only show toggle if not coming from account type selector */}
              {!accountTypeFromLocation && (
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
              )}

              {/* Show sign in link when coming from account type selector */}
              {accountTypeFromLocation && !isSignUp && (
                <div className="mt-6 text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm"
                    onClick={() => navigate("/auth")}
                  >
                    Already have an account? Sign In
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
