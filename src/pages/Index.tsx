import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Globe, Briefcase, Users, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logoImage from "@/assets/jobfolio-logo.jpg";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <Layout>
      <div className="container max-w-6xl mx-auto px-4">
        {/* Hero Section */}
        <section className="py-12 text-center">
          <div className="max-w-3xl mx-auto">
            <img
              src={logoImage}
              alt="JobFolio Africa"
              className="h-20 mx-auto mb-6"
            />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Your Gateway to African Job Opportunities
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Connect with top employers across Africa. Build your professional folio and access thousands of job opportunities tailored to your skills.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Button size="lg" onClick={() => navigate("/jobs")}>
                    Browse Jobs
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate("/profile")}>
                    View Profile
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" onClick={() => navigate("/auth")}>
                    Get Started - 3 Days Free
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate("/jobs")}>
                    Browse Jobs
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12">
          <h2 className="text-3xl font-bold text-center text-foreground mb-10">
            Why Choose JobFolio?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Pan-African Reach</h3>
                <p className="text-sm text-muted-foreground">
                  Access jobs from Nigeria, Ghana, Kenya, South Africa, and more
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Industry Focused</h3>
                <p className="text-sm text-muted-foreground">
                  Jobs tailored to your selected industries and expertise
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Easy Profile</h3>
                <p className="text-sm text-muted-foreground">
                  Build your folio once and apply to multiple positions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Career Growth</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with top employers and advance your career
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 bg-muted/30 rounded-2xl px-6">
          <h2 className="text-3xl font-bold text-center text-foreground mb-10">
            How JobFolio Works
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Build Your Folio</h3>
                <p className="text-sm text-muted-foreground">
                  Upload your CV and select 3-4 industries that match your career goals
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Get 3 Days Free Access</h3>
                <p className="text-sm text-muted-foreground">
                  Enjoy a 3-day trial to explore jobs and apply to positions
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Pay Access Fee</h3>
                <p className="text-sm text-muted-foreground">
                  After your trial, pay a small monthly fee to continue accessing opportunities
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Apply & Get Hired</h3>
                <p className="text-sm text-muted-foreground">
                  Browse filtered jobs and apply directly to positions that match your profile
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-12">
          <h2 className="text-3xl font-bold text-center text-foreground mb-10">
            What You Get
          </h2>
          <div className="max-w-2xl mx-auto space-y-4">
            {[
              "Access to thousands of verified job listings across Africa",
              "Industry-specific job filtering based on your expertise",
              "Direct application to employers",
              "3-day free trial to explore the platform",
              "Affordable monthly access fee",
              "Regular job updates matching your profile",
            ].map((benefit, index) => (
              <div key={index} className="flex gap-3 items-start">
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{benefit}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 text-center">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
              <p className="text-lg mb-6 opacity-90">
                Build your folio today and get 3 days of free access to all job listings
              </p>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => window.location.href = "/build-folio"}
              >
                Get Started Now
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Contact Section */}
        <section className="py-12 text-center border-t border-border">
          <h3 className="text-xl font-semibold text-foreground mb-4">Need Help?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Our support team is here to assist you
          </p>
          <Button variant="outline" onClick={() => window.location.href = "/contact"}>
            Contact Support
          </Button>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
