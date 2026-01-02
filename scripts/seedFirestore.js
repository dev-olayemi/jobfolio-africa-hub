#!/usr/bin/env node
/*
Seed script for Firestore (dev only)

Usage:
  1. Install dependencies: npm i firebase-admin
  2. Set environment variable pointing to your service account JSON file:
     - Windows (PowerShell): $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\serviceAccountKey.json"
     - Or set SERVICE_ACCOUNT_PATH and the script will require it.
  3. Run: node scripts/seedFirestore.js

WARNING: This script uses Firebase Admin SDK and will write directly to your Firestore database.
Make sure you run it against a dev/test project.
*/

import admin from "firebase-admin";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const saPath = process.env.SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS || null;
const saBase64 = process.env.SERVICE_ACCOUNT_BASE64 || null;
const svcJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || null;

// Require at least one form of credentials: full JSON string, base64, or file path
if (!svcJson && !saBase64 && !saPath) {
  console.error("Missing credentials. Set FIREBASE_SERVICE_ACCOUNT_JSON (JSON string), SERVICE_ACCOUNT_BASE64 (base64 JSON), or SERVICE_ACCOUNT_PATH/GOOGLE_APPLICATION_CREDENTIALS (file path).\nSee docs/SEEDING.md for details.");
  process.exit(1);
}

// Initialize Firebase Admin SDK
let app;
  try {
    if (svcJson) {
      console.log("Using FIREBASE_SERVICE_ACCOUNT_JSON for initialization");
      const serviceAccount = JSON.parse(svcJson);
      app = admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      console.log("✅ Initialized Firebase Admin SDK using FIREBASE_SERVICE_ACCOUNT_JSON");
    } else if (saBase64) {
      // If SERVICE_ACCOUNT_BASE64 is provided, use it
      console.log("Using SERVICE_ACCOUNT_BASE64 for initialization");
      const decoded = Buffer.from(saBase64, "base64").toString("utf8");
      const serviceAccount = JSON.parse(decoded);
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("✅ Initialized Firebase Admin SDK using SERVICE_ACCOUNT_BASE64");
    } else if (saPath) {
      // Use service account file
      if (!fs.existsSync(saPath)) {
        throw new Error(`Service account path provided but file not found: ${saPath}`);
      }
      console.log("Using service account file:", saPath);
      const serviceAccountText = fs.readFileSync(saPath, "utf-8");
      const serviceAccount = JSON.parse(serviceAccountText);
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("✅ Initialized Firebase Admin SDK using service account file");
    } else {
      throw new Error("No service account configuration found");
    }
  } catch (err) {
  console.error("❌ Failed to initialize Firebase Admin SDK:", err.message);
  
  if (err.message.includes('invalid_grant') || err.message.includes('JWT')) {
    console.error("\n🔧 JWT Token Error - This is usually caused by:");
    console.error("1. System time not synchronized");
    console.error("2. Service account key expired or revoked");
    console.error("3. Clock skew between your machine and Google's servers");
    console.error("\n💡 Solutions:");
    console.error("• Generate a new service account key:");
    console.error("  https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk");
    console.error("• Sync your system time (run as administrator):");
    console.error("  w32tm /resync");
    console.error("• Try running this script immediately after generating a new key");
  } else {
    console.error("\n🔧 Troubleshooting steps:");
    console.error("1. Check if your service account key file exists and is valid JSON");
    console.error("2. Ensure your system time is synchronized");
    console.error("3. Generate a new service account key from Firebase Console");
    console.error("4. Make sure the service account has the correct permissions");
  }
  process.exit(1);
}

const db = admin.firestore();

async function seed() {
  try {
    // Create Auth users (if they don't exist) and use their UIDs for profile documents
    const testUsers = [
      {
        email: "alice@example.com",
        password: "Password123!",
        displayName: "Alice Adewale",
      },
      {
        email: "ben@example.com",
        password: "Password123!",
        displayName: "Ben Okoro",
      },
      {
        email: "chioma@example.com",
        password: "Password123!",
        displayName: "Chioma Okonkwo",
      },
      {
        email: "kwame@example.com",
        password: "Password123!",
        displayName: "Kwame Mensah",
      },
      {
        email: "amara@example.com",
        password: "Password123!",
        displayName: "Amara Hassan",
      },
    ];

    const createdUsers = [];

    for (const u of testUsers) {
      try {
        // Check if the user exists
        const existing = await admin.auth().getUserByEmail(u.email);
        console.log(`Auth user exists: ${u.email} (uid=${existing.uid})`);
        createdUsers.push(existing);
      } catch (e) {
        // create user
        const newUser = await admin.auth().createUser({
          email: u.email,
          password: u.password,
          displayName: u.displayName,
        });
        console.log(`Created auth user: ${u.email} (uid=${newUser.uid})`);
        createdUsers.push(newUser);
      }
    }

    // Create profile documents keyed by the actual UID
    for (const u of createdUsers) {
      const uid = u.uid;
      const profileRef = db.doc(`profiles/${uid}`);
      await profileRef.set(
        {
          email: u.email,
          firstName: (u.displayName || "").split(" ")[0] || "",
          lastName: (u.displayName || "").split(" ")[1] || "",
          userId: uid,
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
        },
        { merge: true }
      );
      console.log(`Wrote profile for uid=${uid}`);
    }

    // Create a folio + subscription for the first user (Alice)
    const aliceUid = createdUsers[0].uid;
    const folioData = {
      userId: aliceUid,
      cvUrl: "https://example.com/cv/alice.pdf",
      cvFileName: "alice_cv.pdf",
      industries: ["Engineering", "Product"],
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    };

    await db.collection("folios").add(folioData);
    console.log(`Created folio for uid=${aliceUid}`);

    await db.collection("subscriptions").add({
      userId: aliceUid,
      status: "trial",
      trialStartDate: admin.firestore.Timestamp.fromDate(new Date()),
      trialEndDate: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      ),
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    });
    console.log(`Created subscription for uid=${aliceUid}`);

    // Jobs: create several sample jobs to test listing
    const sampleJobs = [
      {
        id: "job_frontend_1",
        title: "Frontend Engineer",
        company: "Acme Africa",
        location: "Lagos",
        country: "Nigeria",
        salary: "$1,200 - $2,000",
        category: "Engineering",
        description:
          "Build performant, accessible React apps for African markets.",
        requirements: ["3+ years React", "TypeScript", "Remote friendly"],
        responsibilities: [
          "Develop UI",
          "Collaborate with design",
          "Ship features",
        ],
        contactEmail: "hr@acme.africa",
        logoUrl: "/favicon.png",
        views: 342,
        likes: 28,
        applies: 12,
        postedById: createdUsers[1].uid, // Ben posts this job
        postedByType: "company",
        status: "active",
        type: "company",
        companyName: "Acme Africa",
        cacNumber: "RC123456",
        companyEmail: "hr@acme.africa",
        officeAddress: "123 Victoria Island, Lagos, Nigeria",
        hrManagerName: "Sarah Johnson",
        hrManagerPhone: "+234-801-234-5678",
        isActive: true,
      },
      {
        id: "job_product_1",
        title: "Product Manager",
        company: "Beta Labs",
        location: "Nairobi",
        country: "Kenya",
        salary: "$1,500 - $2,500",
        category: "Product",
        description: "Lead product for marketplace features.",
        requirements: ["2+ years PM", "Data-driven"],
        responsibilities: ["Define roadmap", "Work with engineering"],
        contactEmail: "jobs@betalabs.co",
        logoUrl: "/favicon.png",
        views: 521,
        likes: 45,
        applies: 18,
      },
      {
        id: "job_backend_1",
        title: "Backend Engineer",
        company: "DigitalRoots",
        location: "Accra",
        country: "Ghana",
        salary: "$1,300 - $2,200",
        category: "Engineering",
        description: "Design and maintain scalable APIs.",
        requirements: ["Node.js", "Databases", "APIs"],
        responsibilities: ["Build services", "Ensure reliability"],
        contactEmail: "talent@digitalroots.co",
        logoUrl: "/favicon.png",
        views: 287,
        likes: 22,
        applies: 8,
      },
      {
        id: "job_design_1",
        title: "Product Designer",
        company: "StudioX",
        location: "Kigali",
        country: "Rwanda",
        salary: "$900 - $1,400",
        category: "Design",
        description: "Design delightful experiences for our users.",
        requirements: ["Figma", "UX research"],
        responsibilities: ["Design screens", "Run research"],
        contactEmail: "design@studiox.rw",
        logoUrl: "/favicon.png",
        views: 198,
        likes: 31,
        applies: 14,
      },
      {
        id: "job_sales_1",
        title: "Sales Executive",
        company: "MarketReach",
        location: "Kampala",
        country: "Uganda",
        salary: "$600 - $1,000",
        category: "Sales",
        description: "Drive sales in East Africa.",
        requirements: ["2+ years sales", "CRM experience"],
        responsibilities: ["Close deals", "Build relationships"],
        contactEmail: "careers@marketreach.ug",
        logoUrl: "/favicon.png",
        views: 412,
        likes: 19,
        applies: 25,
      },
      {
        id: "job_ops_1",
        title: "Operations Manager",
        company: "AgriSupply",
        location: "Dar es Salaam",
        country: "Tanzania",
        salary: "$800 - $1,300",
        category: "Operations",
        description: "Manage supply chain operations.",
        requirements: ["Ops experience", "Logistics"],
        responsibilities: ["Coordinate supply", "Optimize processes"],
        contactEmail: "ops@agrisupply.co.tz",
        logoUrl: "/favicon.png",
        views: 165,
        likes: 11,
        applies: 6,
      },
      {
        id: "job_marketing_1",
        title: "Marketing Specialist",
        company: "SparkMedia",
        location: "Accra",
        country: "Ghana",
        salary: "$700 - $1,200",
        category: "Marketing",
        description: "Run digital campaigns across channels.",
        requirements: ["Social media", "Analytics"],
        responsibilities: ["Run campaigns", "Analyze performance"],
        contactEmail: "hello@sparkmedia.gh",
        logoUrl: "/favicon.png",
        views: 298,
        likes: 36,
        applies: 16,
      },
      {
        id: "job_support_1",
        title: "Customer Support",
        company: "HelpDesk Africa",
        location: "Lagos",
        country: "Nigeria",
        salary: "$400 - $700",
        category: "Support",
        description: "Provide excellent customer support.",
        requirements: ["Good communication", "Problem-solving"],
        responsibilities: ["Handle tickets", "Assist customers"],
        contactEmail: "support@helpdesk.africa",
        logoUrl: "/favicon.png",
        views: 234,
        likes: 15,
        applies: 9,
      },
      {
        id: "job_devops_1",
        title: "DevOps Engineer",
        company: "CloudNine",
        location: "Nairobi",
        country: "Kenya",
        salary: "$1,400 - $2,300",
        category: "Engineering",
        description: "Manage cloud infrastructure and CI/CD pipelines.",
        requirements: ["Kubernetes", "Docker", "AWS/GCP"],
        responsibilities: ["Infrastructure automation", "System reliability"],
        contactEmail: "tech@cloudnine.ke",
        logoUrl: "/favicon.png",
        views: 267,
        likes: 24,
        applies: 11,
      },
      {
        id: "job_dataeng_1",
        title: "Data Engineer",
        company: "DataFlow Analytics",
        location: "Johannesburg",
        country: "South Africa",
        salary: "$1,300 - $2,100",
        category: "Engineering",
        description: "Build data pipelines and analytics infrastructure.",
        requirements: ["Python", "SQL", "Apache Spark"],
        responsibilities: ["Design pipelines", "Optimize queries"],
        contactEmail: "careers@dataflowanalytics.co.za",
        logoUrl: "/favicon.png",
        views: 445,
        likes: 38,
        applies: 17,
      },
      {
        id: "job_fullstack_1",
        title: "Full Stack Developer",
        company: "TechVenture",
        location: "Cairo",
        country: "Egypt",
        salary: "$1,100 - $1,900",
        category: "Engineering",
        description: "Build web applications with modern tech stack.",
        requirements: ["React", "Node.js", "PostgreSQL"],
        responsibilities: ["Full app development", "Code review"],
        contactEmail: "jobs@techventure.eg",
        logoUrl: "/favicon.png",
        views: 356,
        likes: 42,
        applies: 20,
      },
      {
        id: "job_ba_1",
        title: "Business Analyst",
        company: "Insight Consulting",
        location: "Lagos",
        country: "Nigeria",
        salary: "$800 - $1,400",
        category: "Product",
        description: "Analyze business requirements and drive solutions.",
        requirements: ["Requirements gathering", "Data analysis"],
        responsibilities: ["Stakeholder meetings", "Document specs"],
        contactEmail: "consulting@insightafrica.com",
        logoUrl: "/favicon.png",
        views: 189,
        likes: 13,
        applies: 7,
      },
      {
        id: "job_hr_1",
        title: "HR Manager",
        company: "PeopleWorks",
        location: "Lagos",
        country: "Nigeria",
        salary: "$700 - $1,200",
        category: "Human Resources",
        description: "Manage recruitment, onboarding and employee relations.",
        requirements: ["HR experience", "Labour law knowledge"],
        responsibilities: ["Recruitment", "Policy enforcement"],
        contactEmail: "hr@peopleworks.ng",
        logoUrl: "/favicon.png",
        views: 143,
        likes: 9,
        applies: 4,
      },
      {
        id: "job_finance_1",
        title: "Finance Officer",
        company: "GreenAgro",
        location: "Kampala",
        country: "Uganda",
        salary: "$600 - $1,000",
        category: "Finance",
        description: "Support financial reporting and budgeting.",
        requirements: ["Accounting background", "Excel"],
        responsibilities: ["Reports", "Budget tracking"],
        contactEmail: "finance@greenagro.ug",
        logoUrl: "/favicon.png",
        views: 98,
        likes: 6,
        applies: 3,
      },
      {
        id: "job_customer_success_1",
        title: "Customer Success Manager",
        company: "SaaSify",
        location: "Nairobi",
        country: "Kenya",
        salary: "$900 - $1,500",
        category: "Customer Success",
        description: "Drive adoption and retention for enterprise clients.",
        requirements: ["Account management", "SaaS experience"],
        responsibilities: ["Onboarding", "Customer retention"],
        contactEmail: "careers@saasify.co.ke",
        logoUrl: "/favicon.png",
        views: 210,
        likes: 20,
        applies: 9,
      },
      {
        id: "job_research_1",
        title: "Research Analyst",
        company: "PolicyLab",
        location: "Addis Ababa",
        country: "Ethiopia",
        salary: "$500 - $900",
        category: "Research",
        description: "Conduct policy research and produce actionable briefs.",
        requirements: ["Research methods", "Report writing"],
        responsibilities: ["Field research", "Report drafting"],
        contactEmail: "jobs@policylab.et",
        logoUrl: "/favicon.png",
        views: 76,
        likes: 5,
        applies: 2,
      },
      {
        id: "job_qa_1",
        title: "QA Engineer",
        company: "BuildStack",
        location: "Cape Town",
        country: "South Africa",
        salary: "$1,000 - $1,600",
        category: "Engineering",
        description: "Ensure product quality through automated testing.",
        requirements: ["Selenium", "Test automation"],
        responsibilities: ["Write tests", "Report bugs"],
        contactEmail: "qa@buildstack.co.za",
        logoUrl: "/favicon.png",
        views: 132,
        likes: 14,
        applies: 6,
      },
      {
        id: "job_data_scientist_1",
        title: "Data Scientist",
        company: "InsightAI",
        location: "Lagos",
        country: "Nigeria",
        salary: "$1,500 - $2,500",
        category: "Data",
        description: "Build ML models for customer segmentation.",
        requirements: ["Python", "Machine Learning"],
        responsibilities: ["Modeling", "Experimentation"],
        contactEmail: "jobs@insightai.ng",
        logoUrl: "/favicon.png",
        views: 260,
        likes: 30,
        applies: 12,
      },
      {
        id: "job_account_manager_1",
        title: "Account Manager",
        company: "AdReach",
        location: "Nairobi",
        country: "Kenya",
        salary: "$700 - $1,200",
        category: "Sales",
        description: "Manage client relationships and ad campaigns.",
        requirements: ["Client-facing experience", "Ads platforms"],
        responsibilities: ["Client meetings", "Campaign optimization"],
        contactEmail: "hello@adreach.co.ke",
        logoUrl: "/favicon.png",
        views: 154,
        likes: 11,
        applies: 5,
      },
      {
        id: "job_legal_1",
        title: "Legal Counsel",
        company: "SafeLaw",
        location: "Accra",
        country: "Ghana",
        salary: "$1,200 - $2,000",
        category: "Legal",
        description: "Provide legal guidance on contracts and compliance.",
        requirements: ["LLB", "Corporate law"],
        responsibilities: ["Draft contracts", "Advise management"],
        contactEmail: "legal@safelaw.gh",
        logoUrl: "/favicon.png",
        views: 98,
        likes: 7,
        applies: 3,
      },
      {
        id: "job_health_1",
        title: "Public Health Officer",
        company: "Health4All",
        location: "Kigali",
        country: "Rwanda",
        salary: "$500 - $900",
        category: "Health",
        description: "Support community health programs and monitoring.",
        requirements: ["Public health background", "Program monitoring"],
        responsibilities: ["Field support", "Data collection"],
        contactEmail: "careers@health4all.rw",
        logoUrl: "/favicon.png",
        views: 64,
        likes: 4,
        applies: 1,
      },
    ];

    const now = admin.firestore.Timestamp.now();
    for (const j of sampleJobs) {
      const jobDoc = {
        ...j,
        postedAt: now,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };
      await db.doc(`jobs/${j.id}`).set(jobDoc);
      console.log(`Wrote job ${j.id}`);
    }

    console.log("Seed completed.");
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
