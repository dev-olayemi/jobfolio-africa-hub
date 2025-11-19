import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  Briefcase,
  Users,
  TrendingUp,
  Star,
  MapPin,
  Building2,
  Zap,
  Shield,
  Bell,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="container max-w-7xl mx-auto px-4 py-16 md:py-24 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
                <Star className="h-4 w-4 text-primary fill-primary" />
                <span className="text-sm font-medium text-primary">
                  Join 10,000+ African Professionals
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                Land Your Dream Job
                <br />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Across Africa
                </span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                JobFolio connects talented professionals with leading companies
                across 9 African countries. Build your profile once, access
                thousands of opportunities.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                {user ? (
                  <>
                    <Button
                      size="lg"
                      onClick={() => navigate("/jobs")}
                      className="text-base px-8 h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg"
                    >
                      <Briefcase className="h-5 w-5 mr-2" />
                      Browse Jobs
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate("/profile")}
                      className="text-base px-8 h-12 border-2"
                    >
                      View My Profile
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="lg"
                      onClick={() => navigate("/select-account-type")}
                      className="text-base px-8 h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg"
                    >
                      Get Started Free
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate("/jobs")}
                      className="text-base px-8 h-12 border-2"
                    >
                      Explore Jobs
                    </Button>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto pt-8 border-t border-border/50">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                    5,000+
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">
                    Active Jobs
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                    500+
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">
                    Top Companies
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                    9
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">
                    Countries
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Getting Started is Simple
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We've made it incredibly easy for you to find and apply to jobs
                that match your skills and career goals.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full" />
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-2">
                    Create Your Folio
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Sign up, upload your CV, and select 3-4 industries that
                    match your expertise. Takes less than 5 minutes.
                  </p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-accent/20 to-transparent rounded-bl-full" />
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-2">
                    3-Day Free Trial
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Get instant access to all job listings. Browse, search, and
                    apply to as many positions as you want.
                  </p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full" />
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-2">
                    Affordable Access
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    After your trial, continue with a small monthly fee. Cancel
                    anytime, no strings attached.
                  </p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-accent/20 to-transparent rounded-bl-full" />
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <span className="text-2xl font-bold text-white">4</span>
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-2">
                    Get Hired
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Apply directly to employers, track your applications, and
                    land your dream job.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 md:py-24">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why Professionals Choose JobFolio
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We're not just another job board. We're your career partner,
                built specifically for the African job market.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="pt-8 pb-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <MapPin className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-xl text-foreground mb-3">
                    Country-Specific Jobs
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Filter jobs by your country and get only relevant
                    opportunities. No more sifting through irrelevant listings.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                      Nigeria
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                      Ghana
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                      Kenya
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                      +6 more
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="pt-8 pb-6">
                  <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                    <Building2 className="h-7 w-7 text-accent" />
                  </div>
                  <h3 className="font-bold text-xl text-foreground mb-3">
                    Industry Matching
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Select your industries once, and we'll show you only jobs
                    that match your expertise and career goals.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Technology & IT</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Finance & Banking</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Healthcare & More</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="pt-8 pb-6">
                  <div className="w-14 h-14 bg-success/10 rounded-xl flex items-center justify-center mb-4">
                    <Bell className="h-7 w-7 text-success" />
                  </div>
                  <h3 className="font-bold text-xl text-foreground mb-3">
                    Smart Job Alerts
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Get notified instantly when new jobs matching your profile
                    are posted. Never miss an opportunity.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Email notifications</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Real-time updates</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Daily digest</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Success Stories
              </h2>
              <p className="text-lg text-muted-foreground">
                Real people, real results
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="relative overflow-hidden">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    "I found my current role at a fintech startup within 2 weeks
                    of joining JobFolio. The platform made it so easy to
                    connect with the right employers."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                      AD
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">
                        Adebayo O.
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Software Engineer, Lagos
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    "The industry filtering feature is brilliant. I only see
                    marketing roles that actually match my experience. Saved me
                    hours of job hunting."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white font-bold">
                      CN
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">
                        Chiamaka N.
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Marketing Manager, Nairobi
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    "JobFolio is hands down the best job platform for African
                    professionals. The 3-day trial gave me time to explore
                    before committing."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                      KM
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">
                        Kwame M.
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Data Analyst, Accra
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Premium Features */}
        <section className="py-16 md:py-24">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Premium Features for Serious Job Seekers
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get every advantage you need to stand out and land your next
                role
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground mb-2">
                        CV Refinement Service
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        Get your CV professionally optimized for specific job
                        applications. Increase your chances of getting hired
                        with a tailored resume.
                      </p>
                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                        <span>Just ₦1,000 per refinement</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground mb-2">
                        Verified Employers Only
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        Every company on our platform is verified. Apply with
                        confidence knowing you're connecting with legitimate
                        employers.
                      </p>
                      <div className="flex items-center gap-2 text-sm text-success font-medium">
                        <CheckCircle className="h-4 w-4" />
                        <span>100% Scam-Free Guarantee</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground mb-2">
                        Professional Network
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Connect with other professionals, get career advice, and
                        build relationships that can help advance your career.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground mb-2">
                        Career Growth Insights
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Get insights on trending industries, salary ranges, and
                        in-demand skills to help plan your career path.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary via-accent to-primary">
          <div className="container max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Take the Next Step in Your Career?
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who have already found their dream
              jobs through JobFolio Africa. Your next opportunity is waiting.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/select-account-type")}
                className="text-base px-8 h-12 bg-white text-primary hover:bg-white/90 shadow-xl"
              >
                Start Your 3-Day Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/jobs")}
                className="text-base px-8 h-12 bg-transparent border-2 border-white text-white hover:bg-white/10"
              >
                Browse Available Jobs
              </Button>
            </div>
            <p className="text-sm text-white/70 mt-6">
              No credit card required • Cancel anytime • Join in 5 minutes
            </p>
          </div>
        </section>

        {/* Footer Info */}
        <section className="py-12 bg-muted/30">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground mb-2">
                  Quick Access
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Find the right job in under 30 seconds with our smart
                  filtering system
                </p>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground mb-2">
                  Trusted Platform
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  All companies are verified. Your personal information is
                  always secure and private
                </p>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground mb-2">
                  Real Support
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Our team is here to help you succeed. Reach out anytime for
                  assistance
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
