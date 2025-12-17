/* eslint-disable @typescript-eslint/no-explicit-any */
import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  country?: string;
  badges?: string[];
  isAdmin?: boolean;
  phoneNumber?: string;
  profilePictureUrl?: string;
  coverImageUrl?: string;
  bio?: string;
  location?: string;
  website?: string;
  linkedIn?: string;
  twitter?: string;
  workStatus?: "open" | "not-open" | "employed";
  title?: string;

  // Account Type Information
  accountType: "jobseeker" | "recruiter" | "company" | "employer";
  accountStatus: "pending" | "approved" | "rejected" | "active";

  // Recruiter Specific
  recruiterDetails?: {
    companyName: string;
    experience: string;
    specialization: string[];
    licenseNumber?: string;
    licenseDocument?: string;
    notes?: string;
  };

  // Company Specific
  companyDetails?: {
    companyName: string;
    website?: string;
    industry: string;
    companySize: string;
    description: string;
    logo?: string;
    registrationNumber: string;
    taxId?: string;
    address: string;
    contactPerson: string;
    verified: boolean;
  };

  // Employer Specific (individual employer)
  employerDetails?: {
    businessName: string;
    businessType: string;
    website?: string;
    description?: string;
    yearsInBusiness: string;
  };

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  summary?: string;
}

export interface Folio {
  id: string;
  userId: string;
  cvUrl: string;
  cvFileName: string;
  industries: string[];
  skills?: string[];
  education?: Education[];
  experience?: Experience[];
  personalInfo?: PersonalInfo;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Subscription {
  id: string;
  userId: string;
  status: "trial" | "active" | "expired" | "cancelled";
  trialStartDate?: Timestamp;
  trialEndDate?: Timestamp;
  subscriptionStartDate?: Timestamp;
  subscriptionEndDate?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Job {
  companyLogo: any;
  id: string;
  title: string;
  company: string;
  location: string;
  country: string;
  salary: string;
  category: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  contactEmail?: string;
  contactPhone?: string;
  applicationUrl?: string;
  postedAt: Timestamp;
  expiresAt?: Timestamp;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Employer Info
  postedById: string;
  postedByType: "recruiter" | "company" | "employer";

  // Job Specifics
  jobType: "full-time" | "part-time" | "contract" | "freelance" | "internship";
  workMode: "remote" | "onsite" | "hybrid";
  qualifications: string[];
  benefits?: string[];
  minExperience?: string;
  maxExperience?: string;
  educationLevel?: string;

  // Metrics
  views?: number;
  likes?: number;
  applies?: number;
  logoUrl?: string;
}

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  status: "pending" | "reviewed" | "accepted" | "rejected";
  appliedAt: Timestamp;
  reviewedAt?: Timestamp;
  notes?: string;
}

export interface Advertisement {
  id: string;
  title: string;
  videoUrl: string;
  duration: number;
  advertiserName: string;
  targetUrl?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  accountType: "recruiter" | "company" | "employer";
  status: "pending" | "approved" | "rejected";
  documentType: "id_card" | "business_license" | "cac_certificate" | "passport" | "other";
  documentUrl: string;
  documentName: string;
  additionalInfo?: string;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  rejectionReason?: string;
  submittedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
