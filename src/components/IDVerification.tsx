import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, Upload, FileCheck, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { doc, setDoc, Timestamp, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

type DocumentType = "id_card" | "business_license" | "cac_certificate" | "passport" | "other";
type VerificationStatus = "not_submitted" | "pending" | "approved" | "rejected";

interface IDVerificationProps {
  accountType: "recruiter" | "company" | "employer";
  currentStatus?: VerificationStatus;
  onStatusChange?: (status: VerificationStatus) => void;
}

const documentTypeLabels: Record<DocumentType, string> = {
  id_card: "National ID Card",
  business_license: "Business License",
  cac_certificate: "CAC Certificate",
  passport: "International Passport",
  other: "Other Document",
};

const getRequiredDocuments = (accountType: string): DocumentType[] => {
  switch (accountType) {
    case "recruiter":
      return ["id_card", "passport", "business_license"];
    case "company":
      return ["cac_certificate", "business_license"];
    case "employer":
      return ["id_card", "passport", "business_license"];
    default:
      return ["id_card"];
  }
};

export const IDVerification = ({ accountType, currentStatus = "not_submitted", onStatusChange }: IDVerificationProps) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<VerificationStatus>(currentStatus);
  const [documentType, setDocumentType] = useState<DocumentType | "">("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const requiredDocuments = getRequiredDocuments(accountType);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a JPG, PNG, WEBP, or PDF file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    if (!user || !documentType || !selectedFile) {
      toast.error("Please select a document type and upload a file");
      return;
    }

    setIsUploading(true);

    try {
      // Upload document to Firebase Storage
      const fileExtension = selectedFile.name.split(".").pop();
      const fileName = `verifications/${user.uid}/${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, selectedFile);
      const downloadUrl = await getDownloadURL(storageRef);

      // Create verification request in Firestore
      const verificationRef = doc(collection(db, "verificationRequests"));
      await setDoc(verificationRef, {
        id: verificationRef.id,
        userId: user.uid,
        accountType,
        status: "pending",
        documentType,
        documentUrl: downloadUrl,
        documentName: selectedFile.name,
        additionalInfo: additionalInfo || null,
        submittedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      setStatus("pending");
      onStatusChange?.("pending");
      toast.success("Verification request submitted! We'll review it within 24-48 hours.");
      
      // Reset form
      setSelectedFile(null);
      setDocumentType("");
      setAdditionalInfo("");
    } catch (error) {
      console.error("Verification submission error:", error);
      toast.error("Failed to submit verification. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const renderStatusBadge = () => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-600">
            <Clock className="h-3 w-3" />
            Pending Review
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="gap-1 border-green-500 text-green-600">
            <CheckCircle className="h-3 w-3" />
            Verified
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
        return (
          <Badge variant="outline" className="gap-1">
            <Shield className="h-3 w-3" />
            Not Verified
          </Badge>
        );
    }
  };

  if (status === "approved") {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-700 dark:text-green-400">Account Verified</h3>
              <p className="text-sm text-green-600 dark:text-green-500">
                Your identity has been verified. You have full access to all features.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "pending") {
    return (
      <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600 animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-yellow-700 dark:text-yellow-400">Verification Pending</h3>
              <p className="text-sm text-yellow-600 dark:text-yellow-500">
                Your documents are being reviewed. This usually takes 24-48 hours.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Identity Verification</CardTitle>
          </div>
          {renderStatusBadge()}
        </div>
        <CardDescription>
          Verify your identity to unlock all features and build trust with {accountType === "recruiter" ? "candidates" : "applicants"}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Document Type *</Label>
          <Select value={documentType} onValueChange={(v) => setDocumentType(v as DocumentType)}>
            <SelectTrigger>
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {requiredDocuments.map((docType) => (
                <SelectItem key={docType} value={docType}>
                  {documentTypeLabels[docType]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Upload Document *</Label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
              transition-colors hover:border-primary/50
              ${selectedFile ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-muted-foreground/25"}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            {selectedFile ? (
              <div className="flex items-center justify-center gap-2">
                <FileCheck className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-400">{selectedFile.name}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Click to upload (JPG, PNG, PDF - max 5MB)
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Additional Information (Optional)</Label>
          <Textarea
            placeholder="Any additional details about your document..."
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            rows={2}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!documentType || !selectedFile || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Submit for Verification
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Your documents are securely stored and only used for verification purposes.
        </p>
      </CardContent>
    </Card>
  );
};

export default IDVerification;
