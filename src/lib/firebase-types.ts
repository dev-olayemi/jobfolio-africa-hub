/* eslint-disable @typescript-eslint/no-explicit-any */
import { Timestamp } from "firebase/firestore";

// User Profile Types
export interface UserProfile {
  [key: string]: any;
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  accountType: "jobseeker" | "agent" | "company";
  profilePicture?: string;
  bio?: string;
  location?: string;
  phone?: string;
  website?: string;
  linkedIn?: string;
  twitter?: string;
  
  // Job seeker specific fields
  skills?: string[];
  experience?: string;
  education?: string;
  resume?: string;
  portfolio?: string;
  
  // Agent specific fields
  agencyName?: string;
  agencyLicense?: string;
  specializations?: string[];
  yearsOfExperience?: number;
  
  // Company specific fields
  companyName?: string;
  companySize?: string;
  industry?: string;
  companyDescription?: string;
  companyLogo?: string;
  companyWebsite?: string;
  
  // Common fields
  isVerified?: boolean;
  isActive?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Job Types
export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  
  // Company/Organization info
  company: string;
  companyLogo?: string;
  companyDescription?: string;
  
  // Location and compensation
  location: string;
  country: string;
  isRemote?: boolean;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  
  // Job details
  type: "full-time" | "part-time" | "contract" | "internship" | "freelance";
  category: string;
  level: "entry" | "mid" | "senior" | "executive";
  
  // Posting info
  postedById: string;
  postedByType: "jobseeker" | "agent" | "company";
  postedByName?: string;
  contactEmail: string;
  contactPhone?: string;
  
  // Status and metrics
  status: "active" | "closed" | "draft" | "expired";
  isActive: boolean;
  views: number;
  likes: number;
  applies: number;
  
  // Dates
  postedAt: Timestamp;
  expiresAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Additional fields
  benefits?: string[];
  tags?: string[];
  media?: string[];
  applicationDeadline?: Timestamp;
  startDate?: Timestamp;
}

// Application Types
export interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  
  // Application details
  coverLetter?: string;
  resume?: string;
  portfolio?: string;
  additionalDocuments?: string[];
  
  // Status tracking
  status: "pending" | "reviewed" | "shortlisted" | "interviewed" | "offered" | "hired" | "rejected";
  notes?: string;
  
  // Dates
  appliedAt: Timestamp;
  reviewedAt?: Timestamp;
  interviewDate?: Timestamp;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Post Types (Social Feed) - Enhanced with repost, mentions, hashtags, media
export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorType: "jobseeker" | "agent" | "company";
  authorAvatar?: string;
  
  // Content
  title?: string;
  body: string;
  excerpt?: string;
  
  // Media and links
  images?: string[]; // Image URLs
  videos?: string[]; // Video file links/URLs
  links?: {
    url: string;
    title?: string;
    description?: string;
    image?: string;
  }[];
  
  // Social features
  hashtags?: string[]; // Extracted from body text
  mentions?: {
    userId: string;
    username: string;
    displayName: string;
  }[]; // Users mentioned with @
  
  // Repost functionality
  isRepost?: boolean;
  originalPostId?: string;
  originalAuthorId?: string;
  originalAuthorName?: string;
  repostComment?: string; // Comment added when reposting
  
  // Engagement
  likes: number;
  comments: number;
  shares: number;
  reposts: number;
  
  // Status and visibility
  isPublished: boolean;
  visibility: "public" | "connections" | "private";
  
  // Dates
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Enhanced Comment Types with mentions and hashtags
export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  
  // Content with rich text features
  body: string;
  hashtags?: string[];
  mentions?: {
    userId: string;
    username: string;
    displayName: string;
  }[];
  
  // Media
  images?: string[];
  
  // Engagement
  likes: number;
  replies: number;
  
  // Threading
  parentCommentId?: string; // For nested replies
  
  // Dates
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Enhanced Notification Types
export interface Notification {
  id: string;
  to: string;
  from?: string;
  fromName?: string;
  fromAvatar?: string;
  type: "job_application" | "job_like" | "post_like" | "comment" | "mention" | "repost" | "follow" | "message" | "system";
  title: string;
  message: string;
  
  // Rich data for different notification types
  data?: {
    postId?: string;
    jobId?: string;
    commentId?: string;
    applicationId?: string;
    mentionText?: string;
    hashtag?: string;
    [key: string]: any;
  };
  
  // Status
  read: boolean;
  clicked: boolean;
  
  // Dates
  createdAt: Timestamp;
  readAt?: Timestamp;
}

// User Interactions (likes, follows, etc.)
export interface UserInteraction {
  id: string;
  userId: string;
  targetId: string; // Post ID, User ID, Job ID, etc.
  targetType: "post" | "comment" | "job" | "user";
  interactionType: "like" | "follow" | "save" | "share" | "repost";
  
  // Additional data
  metadata?: Record<string, any>;
  
  // Dates
  createdAt: Timestamp;
}

// User Connections/Following
export interface UserConnection {
  id: string;
  followerId: string;
  followingId: string;
  followerName: string;
  followingName: string;
  
  // Connection details
  connectionType: "follow" | "connect" | "block";
  status: "pending" | "accepted" | "blocked";
  
  // Dates
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Hashtag tracking
export interface Hashtag {
  id: string;
  tag: string; // without the #
  count: number;
  trending: boolean;
  
  // Usage stats
  usageByDate: Record<string, number>;
  topUsers: string[]; // User IDs who use this hashtag most
  
  // Dates
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// User Settings
export interface UserSettings {
  userId: string;
  
  // Privacy settings
  profileVisibility: "public" | "connections" | "private";
  showEmail: boolean;
  showPhone: boolean;
  allowMessages: "everyone" | "connections" | "none";
  
  // Notification preferences
  notifications: {
    email: boolean;
    push: boolean;
    mentions: boolean;
    likes: boolean;
    comments: boolean;
    follows: boolean;
    jobAlerts: boolean;
    applications: boolean;
  };
  
  // Feed preferences
  feedPreferences: {
    showReposts: boolean;
    showLikedPosts: boolean;
    contentTypes: string[]; // ["jobs", "posts", "articles"]
  };
  
  // Job preferences
  jobPreferences: {
    categories: string[];
    locations: string[];
    salaryRange: {
      min: number;
      max: number;
      currency: string;
    };
    jobTypes: string[];
    remoteOnly: boolean;
  };
  
  // Dates
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Folio Types (Portfolio/CV)
export interface Folio {
  id: string;
  userId: string;
  cvUrl?: string;
  cvFileName?: string;
  portfolioUrl?: string;
  industries: string[];
  skills: string[];
  experience: string[];
  education: string[];
  certifications?: string[];
  projects?: string[];
  isPublic: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Profile sub-documents
export interface Experience {
  id?: string;
  title: string;
  company?: string;
  location?: string;
  startDate?: Timestamp | string;
  endDate?: Timestamp | string;
  currentlyWorking?: boolean;
  description?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Project {
  id?: string;
  title: string;
  description?: string;
  link?: string;
  media?: string[]; // URLs
  tags?: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Education {
  id?: string;
  school: string;
  degree?: string;
  fieldOfStudy?: string;
  startYear?: string | number;
  endYear?: string | number;
  description?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Subscription Types
export interface Subscription {
  id: string;
  userId: string;
  plan: "free" | "basic" | "premium" | "enterprise";
  status: "active" | "inactive" | "trial" | "expired" | "cancelled";
  
  // Trial info
  trialStartDate?: Timestamp;
  trialEndDate?: Timestamp;
  
  // Subscription info
  startDate?: Timestamp;
  endDate?: Timestamp;
  renewalDate?: Timestamp;
  
  // Payment info
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  
  // Features
  features: string[];
  limits: Record<string, number>;
  
  // Dates
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Account Approval Types
export interface AccountApproval {
  id: string;
  userId: string;
  accountType: "agent" | "company";
  
  // Submitted documents
  documents: {
    businessLicense?: string;
    taxCertificate?: string;
    identityDocument?: string;
    proofOfAddress?: string;
    companyRegistration?: string;
    [key: string]: string | undefined;
  };
  
  // Approval status
  status: "pending" | "approved" | "rejected" | "requires_documents";
  reviewedBy?: string;
  reviewNotes?: string;
  
  // Dates
  submittedAt: Timestamp;
  reviewedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Company Types (for company profiles)
export interface Company {
  id: string;
  name: string;
  description: string;
  logo?: string;
  website?: string;
  industry: string;
  size: string;
  location: string;
  
  // Contact info
  email: string;
  phone?: string;
  address?: string;
  
  // Social media
  linkedIn?: string;
  twitter?: string;
  facebook?: string;
  
  // Verification
  isVerified: boolean;
  verificationDocuments?: string[];
  
  // Stats
  jobsPosted: number;
  employeesHired: number;
  
  // Dates
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Agent Types (for recruitment agents)
export interface Agent {
  id: string;
  userId: string;
  agencyName: string;
  license?: string;
  specializations: string[];
  
  // Experience
  yearsOfExperience: number;
  successfulPlacements: number;
  
  // Contact info
  email: string;
  phone?: string;
  
  // Verification
  isVerified: boolean;
  verificationDocuments?: string[];
  
  // Stats
  jobsPosted: number;
  candidatesPlaced: number;
  
  // Dates
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Search/Filter Types
export interface JobSearchFilters {
  query?: string;
  location?: string;
  category?: string;
  type?: string;
  level?: string;
  salaryMin?: number;
  salaryMax?: number;
  isRemote?: boolean;
  postedWithin?: number; // days
}

// Analytics Types
export interface JobAnalytics {
  jobId: string;
  views: number;
  likes: number;
  applications: number;
  viewsByDate: Record<string, number>;
  applicationsByDate: Record<string, number>;
  topSources: Record<string, number>;
  demographics: {
    locations: Record<string, number>;
    experience: Record<string, number>;
    skills: Record<string, number>;
  };
}

export interface UserAnalytics {
  userId: string;
  profileViews: number;
  jobApplications: number;
  jobsPosted: number;
  engagementRate: number;
  topSkills: string[];
  activityByDate: Record<string, number>;
}