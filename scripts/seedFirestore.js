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
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const saPath =
  process.env.SERVICE_ACCOUNT_PATH ||
  process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!saPath) {
  console.error(
    "Missing SERVICE_ACCOUNT_PATH or GOOGLE_APPLICATION_CREDENTIALS."
  );
  process.exit(1);
}

if (!fs.existsSync(saPath)) {
  console.error("Service account file not found at", saPath);
  process.exit(1);
}

const serviceAccountText = fs.readFileSync(saPath, "utf-8");
const serviceAccount = JSON.parse(serviceAccountText);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

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
