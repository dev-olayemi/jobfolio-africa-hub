import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { parseCV } from "@/lib/cvParser";

interface ParsedData {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills: string[];
  education: Array<{
    school: string;
    degree: string;
    field: string;
    dates?: string;
  }>;
  experience: Array<{
    company: string;
    position: string;
    location?: string;
    dates?: string;
    description?: string;
  }>;
}

interface CVUploaderProps {
  onDataExtracted: (data: ParsedData) => void;
}

export const CVUploader = ({ onDataExtracted }: CVUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseStatus, setParseStatus] = useState<"idle" | "success" | "error">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a PDF, DOC, DOCX, or TXT file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setFileName(file.name);
    setIsProcessing(true);
    setParseStatus("idle");

    try {
      const parsedData = await parseCV(file);
      
      onDataExtracted({
        fullName: parsedData.fullName,
        email: parsedData.email,
        phone: parsedData.phone,
        location: parsedData.location,
        summary: parsedData.summary,
        skills: parsedData.skills,
        education: parsedData.education,
        experience: parsedData.experience,
      });

      setParseStatus("success");
      toast.success("CV parsed successfully! Review and edit the extracted data below.");
    } catch (error) {
      console.error("CV parsing error:", error);
      setParseStatus("error");
      toast.error("Failed to parse CV. Please fill in the form manually.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Quick Start: Upload Your CV
        </CardTitle>
        <CardDescription>
          Upload your existing CV and we'll automatically extract your information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-all duration-200
            ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
            ${parseStatus === "success" ? "border-green-500 bg-green-50 dark:bg-green-950/20" : ""}
            ${parseStatus === "error" ? "border-red-500 bg-red-50 dark:bg-red-950/20" : ""}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleInputChange}
            className="hidden"
          />

          {isProcessing ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Processing your CV...</p>
            </div>
          ) : parseStatus === "success" ? (
            <div className="flex flex-col items-center gap-3">
              <CheckCircle className="h-10 w-10 text-green-500" />
              <div>
                <p className="font-medium text-green-700 dark:text-green-400">{fileName}</p>
                <p className="text-sm text-muted-foreground">Data extracted successfully!</p>
              </div>
              <Button variant="outline" size="sm">
                Upload Different CV
              </Button>
            </div>
          ) : parseStatus === "error" ? (
            <div className="flex flex-col items-center gap-3">
              <AlertCircle className="h-10 w-10 text-red-500" />
              <div>
                <p className="font-medium text-red-700 dark:text-red-400">Parsing failed</p>
                <p className="text-sm text-muted-foreground">Please fill in the form manually</p>
              </div>
              <Button variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="font-medium">Drop your CV here or click to browse</p>
                <p className="text-sm text-muted-foreground">PDF, DOC, DOCX, or TXT (max 10MB)</p>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-3">
          Or skip this step and fill out the form manually below
        </p>
      </CardContent>
    </Card>
  );
};

export default CVUploader;
