import { useState, useEffect } from "react";
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
import { useAuth } from "@/contexts/AuthContext";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { CreditCard, Check, Loader2, Zap } from "lucide-react";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

const Payment = () => {
  const { user, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<"starter" | "pro">("starter");

  const plans = {
    starter: {
      name: "Starter",
      price: 2999,
      duration: "30 days",
      features: ["Access to all jobs", "Save up to 10 jobs", "Basic profile"],
    },
    pro: {
      name: "Professional",
      price: 4999,
      duration: "30 days",
      features: [
        "Access to all jobs",
        "Unlimited saves",
        "CV Refinement (₦1,000/refinement)",
        "Job alerts",
      ],
    },
  };

  useEffect(() => {
    // Load Paystack script
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to continue");
      navigate("/auth");
      return;
    }

    if (!window.PaystackPop) {
      toast.error("Payment system not loaded. Please refresh and try again.");
      return;
    }

    setLoading(true);

    try {
      const selectedPlan = plans[plan];
      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_KEY,
        email: user.email,
        amount: selectedPlan.price * 100, // Paystack amount in kobo
        currency: "NGN",
        ref: `jobfolio-${user.uid}-${Date.now()}`,
        onClose: () => {
          setLoading(false);
          toast.error("Payment cancelled");
        },
        onSuccess: async (response: any) => {
          try {
            const now = Timestamp.now();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 30);

            await setDoc(doc(db, "subscriptions", user.uid), {
              userId: user.uid,
              status: "active",
              plan: plan,
              paystackRef: response.reference,
              subscriptionStartDate: now,
              subscriptionEndDate: Timestamp.fromDate(endDate),
              createdAt: now,
              updatedAt: now,
            });

            await refreshUserData();
            toast.success("Subscription activated! You now have full access.");
            setLoading(false);
            navigate("/jobs");
          } catch (error) {
            console.error("Error saving subscription:", error);
            toast.error(
              "Payment successful but failed to activate. Please contact support."
            );
            setLoading(false);
          }
        },
      });
      handler.openIframe();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to initialize payment. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Choose Your Plan
          </h1>
          <p className="text-muted-foreground">
            Unlock full access to all job opportunities
          </p>
        </div>

        {/* Plans Comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Starter Plan */}
          <Card
            className={`cursor-pointer transition-all ${
              plan === "starter" ? "border-primary ring-2 ring-primary/50" : ""
            }`}
            onClick={() => setPlan("starter")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {plans.starter.name}
              </CardTitle>
              <CardDescription>{plans.starter.duration}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-primary">
                ₦{plans.starter.price.toLocaleString()}
              </div>
              <div className="space-y-2">
                {plans.starter.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Professional Plan */}
          <Card
            className={`cursor-pointer transition-all relative ${
              plan === "pro" ? "border-primary ring-2 ring-primary/50" : ""
            }`}
            onClick={() => setPlan("pro")}
          >
            <div className="absolute -top-3 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Popular
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                {plans.pro.name}
              </CardTitle>
              <CardDescription>{plans.pro.duration}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-primary">
                ₦{plans.pro.price.toLocaleString()}
              </div>
              <div className="space-y-2">
                {plans.pro.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Button */}
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-medium mb-2">
                  Selected Plan:{" "}
                  <span className="text-primary">{plans[plan].name}</span>
                </p>
                <p className="text-2xl font-bold">
                  ₦{plans[plan].price.toLocaleString()}
                </p>
              </div>
              <Button
                onClick={handlePayment}
                size="lg"
                className="w-full gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    Pay with Paystack
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Your payment is secure and encrypted. Auto-renews in 30 days.
                Cancel anytime.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Payment;
