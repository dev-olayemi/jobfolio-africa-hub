#!/usr/bin/env node
/*
Comprehensive Seed script for Jobfolio Africa Hub

This script creates:
- Test users (jobseekers, agents, companies)
- User profiles with complete data
- Jobs posted by different user types
- Sample applications
- Posts for social feed
- Notifications
- Company and agent profiles
- Subscriptions and folios

Usage: node scripts/comprehensive-seed.js
*/

import admin from "firebase-admin";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin (reuse existing logic)
// Initialize Firebase Admin via one of these env vars (priority order):
// 1. FIREBASE_SERVICE_ACCOUNT_JSON - full JSON string
// 2. SERVICE_ACCOUNT_BASE64 - base64-encoded JSON
// 3. SERVICE_ACCOUNT_PATH or GOOGLE_APPLICATION_CREDENTIALS - path to JSON file
const svcJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || null;
const saBase64 = process.env.SERVICE_ACCOUNT_BASE64 || null;
const saPath = process.env.SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS || null;

if (!svcJson && !saBase64 && !saPath) {
  console.error("❌ No service account key provided. Set FIREBASE_SERVICE_ACCOUNT_JSON, SERVICE_ACCOUNT_BASE64, or SERVICE_ACCOUNT_PATH.");
  process.exit(1);
}

try {
  if (svcJson) {
    const serviceAccount = JSON.parse(svcJson);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.log("✅ Firebase Admin SDK initialized via FIREBASE_SERVICE_ACCOUNT_JSON");
  } else if (saBase64) {
    const decoded = Buffer.from(saBase64, "base64").toString("utf8");
    const serviceAccount = JSON.parse(decoded);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.log("✅ Firebase Admin SDK initialized via SERVICE_ACCOUNT_BASE64");
  } else {
    if (!fs.existsSync(saPath)) {
      throw new Error(`Service account file not found at provided path: ${saPath}`);
    }
    const serviceAccount = JSON.parse(fs.readFileSync(saPath, "utf-8"));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.log("✅ Firebase Admin SDK initialized via SERVICE_ACCOUNT_PATH");
  }
} catch (error) {
  console.error("❌ Failed to initialize Firebase:", error.message);
  process.exit(1);
}

const db = admin.firestore();
// Ignore undefined properties when writing documents (helps when some optional fields are missing)
try {
  db.settings({ ignoreUndefinedProperties: true });
  console.log('ℹ️ Firestore configured to ignore undefined properties');
} catch (e) {
  // older SDKs may not support settings - ignore failures
}

// Test users data
const testUsers = [
  // Job Seekers
  {
    email: "alice.adewale@example.com",
    password: "Password123!",
    displayName: "Alice Adewale",
    accountType: "jobseeker",
    profile: {
      firstName: "Alice",
      lastName: "Adewale",
      location: "Lagos, Nigeria",
      phone: "+234-801-234-5678",
      bio: "Experienced frontend developer passionate about creating beautiful, accessible web applications.",
      skills: ["React", "TypeScript", "JavaScript", "CSS", "HTML", "Node.js", "Git"],
      experience: "5 years",
      education: "BSc Computer Science - University of Lagos",
      linkedIn: "https://linkedin.com/in/alice-adewale",
      portfolio: "https://alice-dev.com",
    }
  },
  {
    email: "ben.okoro@example.com",
    password: "Password123!",
    displayName: "Ben Okoro",
    accountType: "jobseeker",
    profile: {
      firstName: "Ben",
      lastName: "Okoro",
      location: "Abuja, Nigeria",
      phone: "+234-802-345-6789",
      bio: "Full-stack developer with expertise in modern web technologies and cloud platforms.",
      skills: ["Python", "Django", "React", "AWS", "Docker", "PostgreSQL", "Redis"],
      experience: "7 years",
      education: "MSc Software Engineering - University of Abuja",
      linkedIn: "https://linkedin.com/in/ben-okoro",
      portfolio: "https://benokoro.dev",
    }
  },
  {
    email: "chioma.okonkwo@example.com",
    password: "Password123!",
    displayName: "Chioma Okonkwo",
    accountType: "jobseeker",
    profile: {
      firstName: "Chioma",
      lastName: "Okonkwo",
      location: "Port Harcourt, Nigeria",
      phone: "+234-803-456-7890",
      bio: "UX/UI Designer focused on creating intuitive digital experiences for African markets.",
      skills: ["Figma", "Adobe XD", "Sketch", "Prototyping", "User Research", "Design Systems"],
      experience: "4 years",
      education: "BA Fine Arts - University of Port Harcourt",
      linkedIn: "https://linkedin.com/in/chioma-okonkwo",
      portfolio: "https://chioma-design.com",
    }
  },
  
  // Recruitment Agents
  {
    email: "kwame.mensah@talentbridge.com",
    password: "Password123!",
    displayName: "Kwame Mensah",
    accountType: "agent",
    profile: {
      firstName: "Kwame",
      lastName: "Mensah",
      location: "Accra, Ghana",
      phone: "+233-24-123-4567",
      bio: "Senior recruitment consultant specializing in tech talent across West Africa.",
      agencyName: "TalentBridge Africa",
      agencyLicense: "GH-REC-2021-001",
      specializations: ["Technology", "Engineering", "Product Management"],
      yearsOfExperience: 8,
      linkedIn: "https://linkedin.com/in/kwame-mensah",
      website: "https://talentbridge.africa",
    }
  },
  {
    email: "amara.hassan@eliterecruiters.com",
    password: "Password123!",
    displayName: "Amara Hassan",
    accountType: "agent",
    profile: {
      firstName: "Amara",
      lastName: "Hassan",
      location: "Nairobi, Kenya",
      phone: "+254-700-123-456",
      bio: "Executive recruiter with a focus on C-level and senior management positions.",
      agencyName: "Elite Recruiters East Africa",
      agencyLicense: "KE-REC-2020-005",
      specializations: ["Executive Search", "Finance", "Operations", "Strategy"],
      yearsOfExperience: 12,
      linkedIn: "https://linkedin.com/in/amara-hassan",
      website: "https://eliterecruiters.co.ke",
    }
  },
  
  // Companies
  {
    email: "hr@technovation.africa",
    password: "Password123!",
    displayName: "TechNovation Africa",
    accountType: "company",
    profile: {
      companyName: "TechNovation Africa",
      companySize: "51-200",
      industry: "Technology",
      location: "Lagos, Nigeria",
      phone: "+234-1-234-5678",
      companyDescription: "Leading fintech company building innovative payment solutions for Africa.",
      companyWebsite: "https://technovation.africa",
      linkedIn: "https://linkedin.com/company/technovation-africa",
      twitter: "https://twitter.com/technovationafrica",
    }
  },
  {
    email: "careers@greenagro.co.ke",
    password: "Password123!",
    displayName: "GreenAgro Solutions",
    accountType: "company",
    profile: {
      companyName: "GreenAgro Solutions",
      companySize: "11-50",
      industry: "Agriculture",
      location: "Nairobi, Kenya",
      phone: "+254-20-123-4567",
      companyDescription: "Sustainable agriculture technology company improving farming practices across East Africa.",
      companyWebsite: "https://greenagro.co.ke",
      linkedIn: "https://linkedin.com/company/greenagro-solutions",
    }
  },
  {
    email: "jobs@digitalbank.gh",
    password: "Password123!",
    displayName: "Digital Bank Ghana",
    accountType: "company",
    profile: {
      companyName: "Digital Bank Ghana",
      companySize: "201-500",
      industry: "Financial Services",
      location: "Accra, Ghana",
      phone: "+233-30-123-4567",
      companyDescription: "Digital-first bank revolutionizing financial services in West Africa.",
      companyWebsite: "https://digitalbank.gh",
      linkedIn: "https://linkedin.com/company/digital-bank-ghana",
      twitter: "https://twitter.com/digitalbankgh",
    }
  },
];

// Job categories and their typical requirements
const jobCategories = {
  "Technology": {
    skills: ["Programming", "Software Development", "System Design", "Database Management"],
    levels: ["entry", "mid", "senior", "executive"],
    types: ["full-time", "part-time", "contract", "internship"]
  },
  "Design": {
    skills: ["UI/UX Design", "Graphic Design", "Prototyping", "Design Systems"],
    levels: ["entry", "mid", "senior"],
    types: ["full-time", "part-time", "contract", "freelance"]
  },
  "Marketing": {
    skills: ["Digital Marketing", "Content Creation", "SEO", "Social Media"],
    levels: ["entry", "mid", "senior"],
    types: ["full-time", "part-time", "contract"]
  },
  "Sales": {
    skills: ["Sales Strategy", "Customer Relations", "CRM", "Negotiation"],
    levels: ["entry", "mid", "senior", "executive"],
    types: ["full-time", "part-time", "contract"]
  },
  "Finance": {
    skills: ["Financial Analysis", "Accounting", "Risk Management", "Compliance"],
    levels: ["entry", "mid", "senior", "executive"],
    types: ["full-time", "contract"]
  },
  "Operations": {
    skills: ["Process Optimization", "Project Management", "Supply Chain", "Quality Control"],
    levels: ["entry", "mid", "senior", "executive"],
    types: ["full-time", "contract"]
  },
  "Human Resources": {
    skills: ["Recruitment", "Employee Relations", "Performance Management", "Training"],
    levels: ["entry", "mid", "senior"],
    types: ["full-time", "part-time", "contract"]
  },
  "Customer Service": {
    skills: ["Communication", "Problem Solving", "CRM", "Customer Support"],
    levels: ["entry", "mid", "senior"],
    types: ["full-time", "part-time", "contract"]
  }
};

// Sample job data
const sampleJobs = [
  // Jobs posted by companies
  {
    title: "Senior Frontend Developer",
    company: "TechNovation Africa",
    location: "Lagos, Nigeria",
    country: "Nigeria",
    isRemote: true,
    salary: "$2,000 - $3,500",
    salaryMin: 2000,
    salaryMax: 3500,
    currency: "USD",
    type: "full-time",
    category: "Technology",
    level: "senior",
    description: "We're looking for a senior frontend developer to join our fintech team and build the next generation of payment solutions for Africa.",
    requirements: [
      "5+ years of React development experience",
      "Strong TypeScript skills",
      "Experience with modern frontend tooling",
      "Knowledge of payment systems (preferred)",
      "Experience with mobile-responsive design"
    ],
    responsibilities: [
      "Develop and maintain frontend applications",
      "Collaborate with design and backend teams",
      "Implement responsive and accessible UI components",
      "Optimize application performance",
      "Mentor junior developers"
    ],
    benefits: ["Health insurance", "Remote work", "Learning budget", "Stock options"],
    tags: ["React", "TypeScript", "Fintech", "Remote"],
    postedByType: "company",
    contactEmail: "hr@technovation.africa",
    contactPhone: "+234-1-234-5678",
  },
  {
    title: "Agricultural Technology Specialist",
    company: "GreenAgro Solutions",
    location: "Nairobi, Kenya",
    country: "Kenya",
    isRemote: false,
    salary: "KES 80,000 - 120,000",
    salaryMin: 80000,
    salaryMax: 120000,
    currency: "KES",
    type: "full-time",
    category: "Technology",
    level: "mid",
    description: "Join our mission to revolutionize agriculture in East Africa through innovative technology solutions.",
    requirements: [
      "Bachelor's degree in Agriculture or related field",
      "3+ years experience in agtech",
      "Knowledge of IoT and sensor technologies",
      "Understanding of farming practices",
      "Strong analytical skills"
    ],
    responsibilities: [
      "Develop agricultural technology solutions",
      "Work with farmers to understand needs",
      "Implement IoT monitoring systems",
      "Analyze agricultural data",
      "Provide technical support to clients"
    ],
    benefits: ["Health insurance", "Transport allowance", "Training opportunities"],
    tags: ["Agriculture", "IoT", "Technology", "Sustainability"],
    postedByType: "company",
    contactEmail: "careers@greenagro.co.ke",
    contactPhone: "+254-20-123-4567",
  },
  {
    title: "Digital Banking Product Manager",
    company: "Digital Bank Ghana",
    location: "Accra, Ghana",
    country: "Ghana",
    isRemote: false,
    salary: "$1,800 - $2,800",
    salaryMin: 1800,
    salaryMax: 2800,
    currency: "USD",
    type: "full-time",
    category: "Product",
    level: "senior",
    description: "Lead product development for our digital banking platform serving millions of customers across West Africa.",
    requirements: [
      "5+ years product management experience",
      "Experience in fintech or banking",
      "Strong analytical and strategic thinking",
      "Knowledge of digital banking trends",
      "Experience with agile methodologies"
    ],
    responsibilities: [
      "Define product strategy and roadmap",
      "Work with engineering and design teams",
      "Conduct market research and user interviews",
      "Analyze product metrics and KPIs",
      "Collaborate with stakeholders across the organization"
    ],
    benefits: ["Health insurance", "Performance bonus", "Professional development", "Flexible hours"],
    tags: ["Product Management", "Fintech", "Banking", "Strategy"],
    postedByType: "company",
    contactEmail: "jobs@digitalbank.gh",
    contactPhone: "+233-30-123-4567",
  },
  
  // Jobs posted by agents
  {
    title: "Chief Technology Officer",
    company: "Confidential Client",
    location: "Lagos, Nigeria",
    country: "Nigeria",
    isRemote: false,
    salary: "$8,000 - $12,000",
    salaryMin: 8000,
    salaryMax: 12000,
    currency: "USD",
    type: "full-time",
    category: "Technology",
    level: "executive",
    description: "Exciting opportunity for a visionary CTO to lead technology strategy at a fast-growing fintech startup.",
    requirements: [
      "10+ years of technology leadership experience",
      "Experience scaling engineering teams",
      "Strong background in fintech or financial services",
      "Proven track record of building scalable systems",
      "MBA or advanced technical degree preferred"
    ],
    responsibilities: [
      "Define and execute technology strategy",
      "Build and lead engineering organization",
      "Drive technical innovation and architecture decisions",
      "Collaborate with CEO and executive team",
      "Ensure security and compliance standards"
    ],
    benefits: ["Equity package", "Health insurance", "Relocation assistance", "Executive perks"],
    tags: ["CTO", "Leadership", "Fintech", "Executive"],
    postedByType: "agent",
    contactEmail: "kwame.mensah@talentbridge.com",
    contactPhone: "+233-24-123-4567",
  },
  {
    title: "Regional Sales Director",
    company: "Leading FMCG Company",
    location: "Nairobi, Kenya",
    country: "Kenya",
    isRemote: false,
    salary: "$4,000 - $6,000",
    salaryMin: 4000,
    salaryMax: 6000,
    currency: "USD",
    type: "full-time",
    category: "Sales",
    level: "executive",
    description: "Lead sales operations across East Africa for a major consumer goods company.",
    requirements: [
      "8+ years of sales leadership experience",
      "Experience in FMCG or consumer goods",
      "Proven track record of achieving sales targets",
      "Strong leadership and team management skills",
      "Knowledge of East African markets"
    ],
    responsibilities: [
      "Develop and execute regional sales strategy",
      "Manage sales team across multiple countries",
      "Build relationships with key clients and distributors",
      "Analyze market trends and opportunities",
      "Report to executive leadership"
    ],
    benefits: ["Car allowance", "Health insurance", "Performance bonus", "Travel allowance"],
    tags: ["Sales", "Leadership", "FMCG", "Regional"],
    postedByType: "agent",
    contactEmail: "amara.hassan@eliterecruiters.com",
    contactPhone: "+254-700-123-456",
  }
];

async function createComprehensiveSeed() {
  try {
    console.log("🌱 Starting comprehensive database seeding...\n");

    // Step 1: Create Auth users and profiles
    console.log("👥 Creating users and profiles...");
    const createdUsers = [];

    for (const userData of testUsers) {
      try {
        // Check if user exists
        let user;
        try {
          user = await admin.auth().getUserByEmail(userData.email);
          console.log(`✓ User exists: ${userData.email}`);
        } catch (e) {
          // Create new user
          user = await admin.auth().createUser({
            email: userData.email,
            password: userData.password,
            displayName: userData.displayName,
          });
          console.log(`✓ Created user: ${userData.email}`);
        }

        createdUsers.push({ ...user, accountType: userData.accountType, profileData: userData.profile });

        // Create/update profile
        const profileRef = db.doc(`profiles/${user.uid}`);
        const profileData = {
          userId: user.uid,
          email: user.email,
          displayName: userData.displayName,
          accountType: userData.accountType,
          ...userData.profile,
          isVerified: userData.accountType !== "jobseeker", // Agents and companies start verified
          isActive: true,
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
        };

        await profileRef.set(profileData, { merge: true });
        console.log(`✓ Profile created for ${userData.displayName}`);

      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
      }
    }

    // Step 2: Create company and agent profiles
    console.log("\n🏢 Creating company and agent profiles...");
    
    const companies = createdUsers.filter(u => u.accountType === "company");
    const agents = createdUsers.filter(u => u.accountType === "agent");

    for (const company of companies) {
      const companyData = {
        id: company.uid,
        name: company.profileData.companyName,
        description: company.profileData.companyDescription,
        website: company.profileData.companyWebsite,
        industry: company.profileData.industry,
        size: company.profileData.companySize,
        location: company.profileData.location,
        email: company.email,
        phone: company.profileData.phone,
        linkedIn: company.profileData.linkedIn,
        twitter: company.profileData.twitter,
        isVerified: true,
        jobsPosted: 0,
        employeesHired: 0,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      };

      await db.collection("companies").doc(company.uid).set(companyData);
      console.log(`✓ Company profile created: ${company.profileData.companyName}`);
    }

    for (const agent of agents) {
      const agentData = {
        id: agent.uid,
        userId: agent.uid,
        agencyName: agent.profileData.agencyName,
        license: agent.profileData.agencyLicense,
        specializations: agent.profileData.specializations,
        yearsOfExperience: agent.profileData.yearsOfExperience,
        successfulPlacements: Math.floor(Math.random() * 50) + 10,
        email: agent.email,
        phone: agent.profileData.phone,
        isVerified: true,
        jobsPosted: 0,
        candidatesPlaced: 0,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      };

      await db.collection("agents").doc(agent.uid).set(agentData);
      console.log(`✓ Agent profile created: ${agent.profileData.agencyName}`);
    }

    // Step 3: Create subscriptions and folios
    console.log("\n📄 Creating subscriptions and folios...");
    
    const jobseekers = createdUsers.filter(u => u.accountType === "jobseeker");
    
    for (const jobseeker of jobseekers) {
      // Create subscription
      const subscriptionData = {
        userId: jobseeker.uid,
        plan: "free",
        status: "active",
        features: ["basic_profile", "job_applications", "basic_search"],
        limits: {
          applications_per_month: 10,
          profile_views: 100,
          saved_jobs: 20
        },
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      };

      await db.collection("subscriptions").add(subscriptionData);

      // Create folio
      const folioData = {
        userId: jobseeker.uid,
        industries: [jobseeker.profileData.skills?.[0] || "Technology"],
        skills: jobseeker.profileData.skills || [],
        experience: [jobseeker.profileData.experience || ""],
        education: [jobseeker.profileData.education || ""],
        isPublic: true,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      };

      await db.collection("folios").add(folioData);
      console.log(`✓ Subscription and folio created for ${jobseeker.displayName}`);
    }

    // Step 4: Create jobs
    console.log("\n💼 Creating job postings...");
    
    for (let i = 0; i < sampleJobs.length; i++) {
      const jobData = sampleJobs[i];
      let postedBy;

      if (jobData.postedByType === "company") {
        postedBy = companies.find(c => c.profileData.companyName === jobData.company);
      } else if (jobData.postedByType === "agent") {
        postedBy = agents[i % agents.length]; // Distribute among agents
      }

      if (!postedBy) {
        console.warn(`⚠️ No poster found for job: ${jobData.title}`);
        continue;
      }

      const jobDoc = {
        id: `job_${i + 1}`,
        ...jobData,
        postedById: postedBy.uid,
        postedByName: postedBy.displayName,
        status: "active",
        isActive: true,
        views: Math.floor(Math.random() * 500) + 50,
        likes: Math.floor(Math.random() * 50) + 5,
        applies: Math.floor(Math.random() * 30) + 2,
        postedAt: admin.firestore.Timestamp.now(),
        expiresAt: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        ),
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      };

      await db.doc(`jobs/job_${i + 1}`).set(jobDoc);
      console.log(`✓ Created job: ${jobData.title}`);
    }

    // Step 5: Create sample applications
    console.log("\n📝 Creating job applications...");
    
    for (let i = 0; i < Math.min(jobseekers.length * 2, 10); i++) {
      const jobseeker = jobseekers[i % jobseekers.length];
      const jobIndex = Math.floor(Math.random() * sampleJobs.length);
      
      const applicationData = {
        jobId: `job_${jobIndex + 1}`,
        applicantId: jobseeker.uid,
        applicantName: jobseeker.displayName,
        applicantEmail: jobseeker.email,
        coverLetter: `I am very interested in this position and believe my skills in ${jobseeker.profileData.skills?.[0] || 'technology'} make me a great fit.`,
        status: ["pending", "reviewed", "shortlisted"][Math.floor(Math.random() * 3)],
        appliedAt: admin.firestore.Timestamp.now(),
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      };

      await db.collection(`jobs/job_${jobIndex + 1}/applications`).add(applicationData);
      console.log(`✓ Application created: ${jobseeker.displayName} -> job_${jobIndex + 1}`);
    }

    // Step 6: Create sample posts
    console.log("\n📱 Creating social feed posts...");
    
    const samplePosts = [
      {
        authorType: "company",
        title: "We're Hiring!",
        body: "Excited to announce that we're expanding our team! We're looking for talented developers to join our mission of revolutionizing fintech in Africa. Check out our open positions!",
        tags: ["hiring", "fintech", "africa", "jobs"]
      },
      {
        authorType: "agent",
        title: "Market Insights: Tech Talent in Africa",
        body: "The demand for tech talent across Africa continues to grow. Here are some key trends I'm seeing in the market...",
        tags: ["insights", "tech", "talent", "africa"]
      },
      {
        authorType: "jobseeker",
        title: "Just completed a new project!",
        body: "Excited to share my latest React project - a job board application with real-time features. Always learning and growing!",
        tags: ["react", "project", "development", "learning"]
      }
    ];

    for (let i = 0; i < samplePosts.length; i++) {
      const postData = samplePosts[i];
      const authors = createdUsers.filter(u => u.accountType === postData.authorType);
      const author = authors[i % authors.length];

      const post = {
        authorId: author.uid,
        authorName: author.displayName,
        authorType: postData.authorType,
        title: postData.title,
        body: postData.body,
        tags: postData.tags,
        likes: Math.floor(Math.random() * 20) + 1,
        comments: Math.floor(Math.random() * 10),
        shares: Math.floor(Math.random() * 5),
        isPublished: true,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      };

      await db.collection("posts").add(post);
      console.log(`✓ Post created by ${author.displayName}`);
    }

    console.log("\n🎉 Comprehensive seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`  • ${createdUsers.length} users created`);
    console.log(`  • ${companies.length} company profiles`);
    console.log(`  • ${agents.length} agent profiles`);
    console.log(`  • ${sampleJobs.length} job postings`);
    console.log(`  • ${jobseekers.length} subscriptions and folios`);
    console.log(`  • Sample applications and posts created`);

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

createComprehensiveSeed();