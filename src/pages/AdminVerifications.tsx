import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, CheckCircle, XCircle, Clock, Search, Eye, ExternalLink, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { collection, query, where, orderBy, getDocs, doc, updateDoc, Timestamp, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { VerificationRequest, UserProfile } from "@/lib/firebase-types";

interface VerificationWithUser extends VerificationRequest {
  userProfile?: UserProfile;
}

const AdminVerifications = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [verifications, setVerifications] = useState<VerificationWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<VerificationWithUser | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    if (!user || !profile?.isAdmin) {
      navigate("/");
      return;
    }
    fetchVerifications();
  }, [user, profile, navigate]);

  const fetchVerifications = async () => {
    setIsLoading(true);
    try {
      const verificationsRef = collection(db, "verificationRequests");
      const q = query(verificationsRef, orderBy("submittedAt", "desc"));
      const snapshot = await getDocs(q);
      
      const verificationsData: VerificationWithUser[] = [];
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data() as VerificationRequest;
        
        // Fetch user profile
        let userProfile: UserProfile | undefined;
        try {
          const userDoc = await getDoc(doc(db, "profiles", data.userId));
          if (userDoc.exists()) {
            userProfile = userDoc.data() as UserProfile;
          }
        } catch (e) {
          console.error("Error fetching user profile:", e);
        }
        
        verificationsData.push({
          ...data,
          id: docSnap.id,
          userProfile,
        });
      }
      
      setVerifications(verificationsData);
    } catch (error) {
      console.error("Error fetching verifications:", error);
      toast.error("Failed to load verifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedVerification || !actionType || !user) return;

    if (actionType === "reject" && !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setIsProcessing(true);
    try {
      const verificationRef = doc(db, "verificationRequests", selectedVerification.id);
      const updateData: Record<string, unknown> = {
        status: actionType === "approve" ? "approved" : "rejected",
        reviewedBy: user.uid,
        reviewedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      if (actionType === "reject") {
        updateData.rejectionReason = rejectionReason;
      }

      await updateDoc(verificationRef, updateData);

      // Update user profile status
      if (selectedVerification.userId) {
        const profileRef = doc(db, "profiles", selectedVerification.userId);
        await updateDoc(profileRef, {
          accountStatus: actionType === "approve" ? "approved" : "rejected",
          updatedAt: Timestamp.now(),
        });
      }

      toast.success(
        actionType === "approve"
          ? "Verification approved successfully"
          : "Verification rejected"
      );

      // Refresh list
      fetchVerifications();
      setSelectedVerification(null);
      setActionType(null);
      setRejectionReason("");
    } catch (error) {
      console.error("Error processing verification:", error);
      toast.error("Failed to process verification");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredVerifications = verifications.filter((v) => {
    const matchesSearch =
      !searchQuery ||
      v.userProfile?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.userProfile?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.userProfile?.lastName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && v.status === "pending") ||
      (activeTab === "approved" && v.status === "approved") ||
      (activeTab === "rejected" && v.status === "rejected");

    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-600">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="gap-1 border-green-500 text-green-600">
            <CheckCircle className="h-3 w-3" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="gap-1 border-red-500 text-red-600">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      id_card: "National ID Card",
      business_license: "Business License",
      cac_certificate: "CAC Certificate",
      passport: "Passport",
      other: "Other Document",
    };
    return labels[type] || type;
  };

  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return "N/A";
    return timestamp.toDate().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!profile?.isAdmin) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              ID Verification Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Review and approve verification requests
            </p>
          </div>
          <Button variant="outline" onClick={fetchVerifications}>
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-yellow-600">
                {verifications.filter((v) => v.status === "pending").length}
              </div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">
                {verifications.filter((v) => v.status === "approved").length}
              </div>
              <p className="text-sm text-muted-foreground">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-red-600">
                {verifications.filter((v) => v.status === "rejected").length}
              </div>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{verifications.length}</div>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Tabs */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Verifications List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredVerifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No verifications found</h3>
              <p className="text-sm text-muted-foreground">
                {activeTab === "pending"
                  ? "No pending verifications to review"
                  : "No verifications match your search"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredVerifications.map((verification) => (
              <Card key={verification.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">
                          {verification.userProfile?.firstName?.[0] || "?"}
                          {verification.userProfile?.lastName?.[0] || ""}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {verification.userProfile?.firstName}{" "}
                          {verification.userProfile?.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {verification.userProfile?.email}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {verification.accountType}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {getDocumentTypeLabel(verification.documentType)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right text-sm text-muted-foreground hidden md:block">
                        <p>Submitted</p>
                        <p>{formatDate(verification.submittedAt)}</p>
                      </div>
                      {getStatusBadge(verification.status)}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(verification.documentUrl, "_blank")}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {verification.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-500 text-green-600 hover:bg-green-50"
                              onClick={() => {
                                setSelectedVerification(verification);
                                setActionType("approve");
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500 text-red-600 hover:bg-red-50"
                              onClick={() => {
                                setSelectedVerification(verification);
                                setActionType("reject");
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Action Dialog */}
        <Dialog
          open={!!selectedVerification && !!actionType}
          onOpenChange={() => {
            setSelectedVerification(null);
            setActionType(null);
            setRejectionReason("");
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === "approve" ? "Approve Verification" : "Reject Verification"}
              </DialogTitle>
              <DialogDescription>
                {actionType === "approve"
                  ? "Are you sure you want to approve this verification request?"
                  : "Please provide a reason for rejecting this verification."}
              </DialogDescription>
            </DialogHeader>

            {selectedVerification && (
              <div className="space-y-4">
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="font-medium">
                    {selectedVerification.userProfile?.firstName}{" "}
                    {selectedVerification.userProfile?.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedVerification.userProfile?.email}
                  </p>
                  <p className="text-sm mt-2">
                    Document: {getDocumentTypeLabel(selectedVerification.documentType)}
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto mt-2"
                    onClick={() => window.open(selectedVerification.documentUrl, "_blank")}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Document
                  </Button>
                </div>

                {actionType === "reject" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rejection Reason *</label>
                    <Textarea
                      placeholder="Explain why the verification was rejected..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedVerification(null);
                  setActionType(null);
                  setRejectionReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAction}
                disabled={isProcessing || (actionType === "reject" && !rejectionReason.trim())}
                variant={actionType === "approve" ? "default" : "destructive"}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : actionType === "approve" ? (
                  "Approve"
                ) : (
                  "Reject"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default AdminVerifications;
