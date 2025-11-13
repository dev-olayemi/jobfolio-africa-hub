import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { CreditCard, Check } from "lucide-react";

const Payment = () => {
  const { user, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to continue");
      navigate("/auth");
      return;
    }

    setLoading(true);

    try {
      // In production, integrate with actual payment gateway (Stripe, Paystack, Flutterwave)
      // This is a simulation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const now = Timestamp.now();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      await setDoc(doc(db, 'subscriptions', user.uid), {
        userId: user.uid,
        status: 'active',
        subscriptionStartDate: now,
        subscriptionEndDate: Timestamp.fromDate(endDate),
        createdAt: now,
        updatedAt: now
      });

      await refreshUserData();
      toast.success("Payment successful! Your subscription is now active.");
      navigate("/profile");
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Subscribe to JobFolio Africa</h1>
          <p className="text-sm text-muted-foreground">
            Get unlimited access to all job listings and applications
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Pricing Card */}
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <CardHeader>
              <CardTitle>Monthly Access</CardTitle>
              <CardDescription>Full access to all features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="text-4xl font-bold text-foreground mb-2">$29.99</div>
                <p className="text-sm text-muted-foreground">per month</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="text-sm">View all job descriptions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="text-sm">Access contact information</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="text-sm">Apply to unlimited jobs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="text-sm">Priority support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="text-sm">Cancel anytime</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>Enter your card information below</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength={19}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      maxLength={5}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      maxLength={4}
                      type="password"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  <CreditCard className="h-4 w-4" />
                  {loading ? "Processing..." : "Pay $29.99"}
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Your payment is secure and encrypted. You can cancel your subscription anytime.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Payment;
