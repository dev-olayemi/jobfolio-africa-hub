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
import { Briefcase, Users, Building2, User, ArrowRight } from "lucide-react";

type AccountType = "jobseeker" | "recruiter" | "company" | "employer" | null;

const AccountTypeSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedType, setSelectedType] = useState<AccountType>(null);
  const isSignUp = location.state?.isSignUp || false;

  const accountTypes = [
    {
      id: "jobseeker",
      title: "Job Seeker",
      description: "Looking for job opportunities",
      icon: User,
      color: "from-blue-500 to-blue-600",
      details: [
        "Browse job listings",
        "Apply to positions",
        "Manage applications",
        "Refine your CV",
      ],
    },
    {
      id: "recruiter",
      title: "Recruiter",
      description: "Find and hire talent",
      icon: Briefcase,
      color: "from-purple-500 to-purple-600",
      details: [
        "Post job openings",
        "Find candidates",
        "Manage applications",
        "Build team",
      ],
    },
    {
      id: "company",
      title: "Company",
      description: "Hire for your organization",
      icon: Building2,
      color: "from-green-500 to-green-600",
      details: [
        "Company profile",
        "Post multiple jobs",
        "Manage team hiring",
        "Access analytics",
      ],
    },
    {
      id: "employer",
      title: "Individual Employer",
      description: "Hire for your business",
      icon: Briefcase,
      color: "from-orange-500 to-orange-600",
      details: [
        "Post jobs",
        "Small team hiring",
        "Direct applicant contact",
        "Flexible hiring",
      ],
    },
  ];

  const handleContinue = () => {
    if (selectedType) {
      // Always mark as sign-up when coming from the account type selector
      navigate("/auth", {
        state: {
          accountType: selectedType,
          isSignUp: true,
        },
      });
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-background">
        <div className="container max-w-6xl mx-auto px-3 md:px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Choose Your Account Type
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select the account type that best fits your needs. You can switch
              account types later.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {accountTypes.map((type) => {
              const IconComponent = type.icon;
              const isSelected = selectedType === type.id;

              return (
                <Card
                  key={type.id}
                  className={`cursor-pointer transition-all transform hover:scale-105 ${
                    isSelected
                      ? "border-primary shadow-lg ring-2 ring-primary"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedType(type.id as AccountType)}
                >
                  <CardHeader>
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${type.color} flex items-center justify-center mb-4`}
                    >
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{type.title}</CardTitle>
                    <CardDescription>{type.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {type.details.map((detail, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {detail}
                        </li>
                      ))}
                    </ul>

                    {isSelected && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs font-semibold text-primary">
                          ✓ SELECTED
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => navigate("/")} size="lg">
              Go Back
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!selectedType}
              size="lg"
              className="gap-2"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AccountTypeSelection;
