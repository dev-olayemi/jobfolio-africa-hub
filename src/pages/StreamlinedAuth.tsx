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
  Building2,
  UserCheck,
  Search,
  Briefcase,
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

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Retail",
  "Manufacturing",
  "Construction",
  "Agriculture",
  "Energy",
  "Telecommunications",
  "Transportation",
  "Real Estate",
  "Hospitality",
  "Media",
  "Consulting",
  "Government",
  "Non-profit",
];

const COMPANY_SIZES = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees",
];

const StreamlinedAuth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signUp, signIn, resetPassword } = useAuth();
  
  const accountTypeFromLocation = (location.state as any)?.accountType;
  const isSignUpFromLocation = (location.state as any)?.isSignUp;
  
  const [accountType, setAccountType] = useState<"jobseeker" | "agent" | "company" | null>(
    accountTypeFromLocation || null
  );
  const [isSignUp, setIsSignUp] = useState<boolean>(Boolean(isSignUpFromLocation));
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Basic fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState<string>("Nigeria");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Job Seeker specific fields
  const [experienceLevel, setExperienceLevel] = useState<string>("entry");
  const [availabilityStatus, setAvailabilityStatus] = useState<string>("immediately");
  const [preferredIndustries, setPreferredIndustries] = useState<string[]>([]);
  const [skills, setSkills] = useState<string>("");

  // Agent specific fields
  const [agencyName, setAgencyName] = useState("");
  const [businessType, setBusinessType] = useState<string>("individual_recruiter");
  const [experience, setExperience] = useState<string>("1-2 years");
  const [specialization, setSpecialization] = useState<string>("");

  // Company specific fields
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyIndustry, setCompanyIndustry] = useState<string>("");
  const [companySize, setCompanySize] = useState<string>("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");

  // Redirect if no account type is selected
  useEffect(() => {
    if (!accountType && !showForgotPassword) {
      navigate("/select-account-type", { replace: true });
    }
  }, [accountType, navigate, showForgotPassword]);

  const getAccountTypeIcon = () => {
    switch (accountType) {
      case "jobseeker":
        return <Search className="h-5 w-5" />;
      case "agent":
        return <UserCheck className="h-5 w-5" />;
      case "company":
        return <Building2 className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getAccountTypeTitle = () => {
    switch (accountType) {
      case "jobseeker":
        return "Job Seeker";
      case "agent":
        return "Agent/Recruiter";
      case "company":
        return "Company/Employer";
      default:
        return "Account";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (showForgotPassword) {
        await resetPassword(email);
        toast.success("Password reset email sent!");
        setShowForgotPassword(false);
        return;
      }

      if (isSignUp) {
        // Validate required fields
        if (!firstName || !lastName || !email || !password) {
          toast.error("Please fill in all required fields");
          return;
        }

        if (password.length < 6) {
          toast.error("Password must be at least 6 characters");
          return;
        }

        // Prepare role-specific details
        let roleDetails: Record<string, any> = {};

        if (accountType === "jobseeker") {
          roleDetails = {
            experienceLevel,
            availabilityStatus,
            preferredIndustries: preferredIndustries.length > 0 ? preferredIndustries : [],
            skills: skills ? skills.split(",").map(s => s.trim()) : [],
          };
        } else if (accountType === "agent") {
          if (!agencyName && !firstName) {
            toast.error("Please provide agency name or your name");
            return;
          }
          roleDetails = {
            agencyName: agencyName || `${firstName} ${lastName} Recruitment`,
            businessType,
            experience,
            specialization: specialization ? specialization.split(",").map(s => s.trim()) : [],
            yearsInBusiness: experience,
          };
        } else if (accountType === "company") {
          if (!companyName) {
            toast.error("Company name is required");
            return;
          }
          roleDetails = {
            companyName,
            website: companyWebsite,
            industry: companyIndustry,
            companySize,
            description: companyDescription,
            registrationNumber,
            address: companyAddress,
            contactPerson: `${firstName} ${lastName}`,
            companyType: "sme", // default
          };
        }

        await signUp(email, password, firstName, lastName, country, accountType!, roleDetails);
        toast.success("Account created successfully! Welcome to JobFolio Africa!");
        navigate("/dashboard");
      } else {
        // Sign in
        await signIn(email, password);
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleIndustry = (industry: string) => {
    setPreferredIndustries(prev => 
      prev.includes(industry) 
        ? prev.filter(i => i !== industry)
        : [...prev, industry]
    );
  };

  if (showForgotPassword) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Reset Password
              </CardTitle>
              <CardDescription>
                Enter your email address and we'll send you a reset link
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Reset Link
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {getAccountTypeIcon()}
              <CardTitle className="text-2xl">
                {isSignUp ? "Create" : "Sign in to"} {getAccountTypeTitle()} Account
              </CardTitle>
            </div>
            <CardDescription>
              {isSignUp 
                ? `Join JobFolio Africa as a ${getAccountTypeTitle().toLowerCase()}`
                : `Welcome back! Sign in to your ${getAccountTypeTitle().toLowerCase()} account`
              }
            </CardDescription>
            {accountType && (
              <Badge variant="secondary" className="w-fit mx-auto">
                {getAccountTypeTitle()}
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isSignUp && (
                  <>
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}
                <div className={isSignUp ? "md:col-span-2" : "col-span-2"}>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className={isSignUp ? "md:col-span-2" : "col-span-2"}>
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Sign Up Additional Fields */}
              {isSignUp && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Select value={country} onValueChange={setCountry}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+234..."
                      />
                    </div>
                  </div>

                  {/* Account Type Specific Fields */}
                  {accountType === "jobseeker" && (
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="font-semibold text-lg">Job Preferences</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Experience Level</Label>
                          <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="entry">Entry Level</SelectItem>
                              <SelectItem value="mid">Mid Level</SelectItem>
                              <SelectItem value="senior">Senior Level</SelectItem>
                              <SelectItem value="executive">Executive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Availability</Label>
                          <Select value={availabilityStatus} onValueChange={setAvailabilityStatus}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="immediately">Immediately</SelectItem>
                              <SelectItem value="2_weeks">2 Weeks</SelectItem>
                              <SelectItem value="1_month">1 Month</SelectItem>
                              <SelectItem value="3_months">3 Months</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label>Skills (comma-separated)</Label>
                        <Input
                          value={skills}
                          onChange={(e) => setSkills(e.target.value)}
                          placeholder="JavaScript, React, Node.js, etc."
                        />
                      </div>
                      <div>
                        <Label>Preferred Industries (select multiple)</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                          {INDUSTRIES.slice(0, 9).map((industry) => (
                            <Button
                              key={industry}
                              type="button"
                              variant={preferredIndustries.includes(industry) ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleIndustry(industry)}
                              className="text-xs"
                            >
                              {industry}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {accountType === "agent" && (
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="font-semibold text-lg">Agency Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="agencyName">Agency/Company Name</Label>
                          <Input
                            id="agencyName"
                            value={agencyName}
                            onChange={(e) => setAgencyName(e.target.value)}
                            placeholder="Your recruitment agency name"
                          />
                        </div>
                        <div>
                          <Label>Business Type</Label>
                          <Select value={businessType} onValueChange={setBusinessType}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="recruitment_agency">Recruitment Agency</SelectItem>
                              <SelectItem value="individual_recruiter">Individual Recruiter</SelectItem>
                              <SelectItem value="hr_consultant">HR Consultant</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Years of Experience</Label>
                          <Select value={experience} onValueChange={setExperience}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1-2 years">1-2 years</SelectItem>
                              <SelectItem value="3-5 years">3-5 years</SelectItem>
                              <SelectItem value="6-10 years">6-10 years</SelectItem>
                              <SelectItem value="10+ years">10+ years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Specialization</Label>
                          <Input
                            value={specialization}
                            onChange={(e) => setSpecialization(e.target.value)}
                            placeholder="IT, Finance, Healthcare, etc."
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {accountType === "company" && (
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="font-semibold text-lg">Company Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="companyName">Company Name *</Label>
                          <Input
                            id="companyName"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="companyWebsite">Website</Label>
                          <Input
                            id="companyWebsite"
                            type="url"
                            value={companyWebsite}
                            onChange={(e) => setCompanyWebsite(e.target.value)}
                            placeholder="https://..."
                          />
                        </div>
                        <div>
                          <Label>Industry</Label>
                          <Select value={companyIndustry} onValueChange={setCompanyIndustry}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent>
                              {INDUSTRIES.map((industry) => (
                                <SelectItem key={industry} value={industry}>
                                  {industry}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Company Size</Label>
                          <Select value={companySize} onValueChange={setCompanySize}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              {COMPANY_SIZES.map((size) => (
                                <SelectItem key={size} value={size}>
                                  {size}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="registrationNumber">Registration Number</Label>
                          <Input
                            id="registrationNumber"
                            value={registrationNumber}
                            onChange={(e) => setRegistrationNumber(e.target.value)}
                            placeholder="Company registration number"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="companyAddress">Address</Label>
                          <Input
                            id="companyAddress"
                            value={companyAddress}
                            onChange={(e) => setCompanyAddress(e.target.value)}
                            placeholder="Company address"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="companyDescription">Company Description</Label>
                          <Textarea
                            id="companyDescription"
                            value={companyDescription}
                            onChange={(e) => setCompanyDescription(e.target.value)}
                            placeholder="Brief description of your company..."
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Submit Button */}
              <div className="flex flex-col gap-4">
                <Button type="submit" disabled={loading} className="w-full">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSignUp ? "Create Account" : "Sign In"}
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="p-0"
                  >
                    {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                  </Button>
                  
                  {!isSignUp && (
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => setShowForgotPassword(true)}
                      className="p-0"
                    >
                      Forgot password?
                    </Button>
                  )}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/select-account-type")}
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Change Account Type
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default StreamlinedAuth;