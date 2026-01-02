// Demo data system using localStorage for quick record keeping
// This provides realistic data for client demonstrations

export interface DemoJob {
  id: string;
  title: string;
  company: string;
  location: string;
  country: string;
  salary: string;
  category: string;
  type: string;
  description: string;
  requirements: string[];
  postedAt: string;
  isActive: boolean;
  logoUrl?: string;
  posterType: 'company' | 'agent' | 'employer';
  posterName: string;
  isVerified: boolean;
  agentFee?: string;
  applicantsCount: number;
  viewsCount: number;
}

export interface DemoPost {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  authorRole: string;
  isVerified: boolean;
  content: string;
  media: string[];
  likes: string[];
  commentsCount: number;
  createdAt: string;
  comments: DemoComment[];
}

export interface DemoComment {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  content: string;
  createdAt: string;
}

export interface DemoApplicant {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  photo: string;
  cvUrl: string;
  appliedAt: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected';
  matchScore: number;
  experience: string;
  skills: string[];
}

// Realistic Nigerian company names and job data
const DEMO_JOBS: DemoJob[] = [
  {
    id: 'job-001',
    title: 'Senior Software Engineer',
    company: 'Flutterwave',
    location: 'Lagos, Nigeria',
    country: 'Nigeria',
    salary: '₦800,000 - ₦1,200,000/month',
    category: 'Technology',
    type: 'Full-time',
    description: 'We are looking for a Senior Software Engineer to join our payments infrastructure team. You will be working on building scalable systems that process millions of transactions across Africa.',
    requirements: ['5+ years experience in backend development', 'Proficiency in Go, Python, or Node.js', 'Experience with microservices architecture', 'Strong knowledge of SQL and NoSQL databases'],
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    logoUrl: 'https://logo.clearbit.com/flutterwave.com',
    posterType: 'company',
    posterName: 'Flutterwave HR Team',
    isVerified: true,
    applicantsCount: 47,
    viewsCount: 312
  },
  {
    id: 'job-002',
    title: 'Marketing Manager',
    company: 'Jumia Nigeria',
    location: 'Lagos, Nigeria',
    country: 'Nigeria',
    salary: '₦500,000 - ₦700,000/month',
    category: 'Marketing',
    type: 'Full-time',
    description: 'Lead marketing campaigns and brand strategy for Nigeria\'s largest e-commerce platform. Drive customer acquisition and retention initiatives.',
    requirements: ['4+ years marketing experience', 'Digital marketing expertise', 'Team leadership skills', 'E-commerce experience preferred'],
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    logoUrl: 'https://logo.clearbit.com/jumia.com',
    posterType: 'company',
    posterName: 'Jumia Talent Team',
    isVerified: true,
    applicantsCount: 89,
    viewsCount: 456
  },
  {
    id: 'job-003',
    title: 'Registered Nurse',
    company: 'St. Nicholas Hospital',
    location: 'Lagos, Nigeria',
    country: 'Nigeria',
    salary: '₦250,000 - ₦350,000/month',
    category: 'Healthcare',
    type: 'Full-time',
    description: 'Join our healthcare team providing quality patient care. Position available in the general ward with opportunity for specialization.',
    requirements: ['Valid nursing license', 'Minimum 2 years experience', 'BLS certification', 'Good communication skills'],
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    posterType: 'agent',
    posterName: 'HealthCare Recruiters NG',
    isVerified: true,
    agentFee: '₦15,000',
    applicantsCount: 156,
    viewsCount: 678
  },
  {
    id: 'job-004',
    title: 'Accountant',
    company: 'PwC Nigeria',
    location: 'Abuja, Nigeria',
    country: 'Nigeria',
    salary: '₦400,000 - ₦600,000/month',
    category: 'Finance',
    type: 'Full-time',
    description: 'Seeking qualified accountant to join our audit team. You will work with diverse clients across industries.',
    requirements: ['ACA/ACCA certification', '3+ years audit experience', 'Strong analytical skills', 'Proficiency in accounting software'],
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    logoUrl: 'https://logo.clearbit.com/pwc.com',
    posterType: 'company',
    posterName: 'PwC Recruitment',
    isVerified: true,
    applicantsCount: 234,
    viewsCount: 890
  },
  {
    id: 'job-005',
    title: 'Security Guard',
    company: 'Halogen Security',
    location: 'Port Harcourt, Nigeria',
    country: 'Nigeria',
    salary: '₦70,000 - ₦90,000/month',
    category: 'Security',
    type: 'Full-time',
    description: 'Professional security personnel needed for corporate clients. Training provided for qualified candidates.',
    requirements: ['Secondary school certificate', 'Good physical fitness', 'No criminal record', 'Age 25-45'],
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    posterType: 'agent',
    posterName: 'JobConnect Nigeria',
    isVerified: true,
    agentFee: '₦5,000',
    applicantsCount: 312,
    viewsCount: 1024
  },
  {
    id: 'job-006',
    title: 'Product Designer',
    company: 'Paystack',
    location: 'Lagos, Nigeria (Remote)',
    country: 'Nigeria',
    salary: '₦600,000 - ₦900,000/month',
    category: 'Design',
    type: 'Full-time',
    description: 'Design beautiful and intuitive experiences for millions of businesses across Africa. Work with a world-class design team.',
    requirements: ['4+ years product design experience', 'Strong Figma skills', 'Portfolio required', 'Experience with design systems'],
    postedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    logoUrl: 'https://logo.clearbit.com/paystack.com',
    posterType: 'company',
    posterName: 'Paystack People Team',
    isVerified: true,
    applicantsCount: 67,
    viewsCount: 423
  },
  {
    id: 'job-007',
    title: 'Driver (Executive)',
    company: 'Private Employer',
    location: 'Ikoyi, Lagos',
    country: 'Nigeria',
    salary: '₦120,000 - ₦150,000/month',
    category: 'Transportation',
    type: 'Full-time',
    description: 'Executive driver needed for a corporate executive. Must be professional, punctual, and have excellent knowledge of Lagos roads.',
    requirements: ['Valid driver\'s license', '5+ years driving experience', 'Knowledge of Lagos routes', 'Professional appearance'],
    postedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    posterType: 'agent',
    posterName: 'Elite Staffing Agency',
    isVerified: true,
    agentFee: '₦10,000',
    applicantsCount: 89,
    viewsCount: 345
  },
  {
    id: 'job-008',
    title: 'Data Analyst',
    company: 'GTBank',
    location: 'Lagos, Nigeria',
    country: 'Nigeria',
    salary: '₦450,000 - ₦650,000/month',
    category: 'Technology',
    type: 'Full-time',
    description: 'Join our analytics team to drive data-informed decisions. Work with cutting-edge tools and diverse datasets.',
    requirements: ['Degree in Statistics, Math, or related field', 'SQL proficiency', 'Experience with Python or R', 'Power BI/Tableau skills'],
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    logoUrl: 'https://logo.clearbit.com/gtbank.com',
    posterType: 'company',
    posterName: 'GTBank HR',
    isVerified: true,
    applicantsCount: 178,
    viewsCount: 567
  },
  {
    id: 'job-009',
    title: 'Restaurant Manager',
    company: 'The Place Restaurant',
    location: 'Victoria Island, Lagos',
    country: 'Nigeria',
    salary: '₦200,000 - ₦300,000/month',
    category: 'Hospitality',
    type: 'Full-time',
    description: 'Manage daily operations of a busy restaurant. Lead a team of 20+ staff members and ensure excellent customer service.',
    requirements: ['Hospitality management background', '3+ years restaurant management', 'Leadership skills', 'Customer service excellence'],
    postedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    posterType: 'employer',
    posterName: 'The Place Management',
    isVerified: true,
    applicantsCount: 45,
    viewsCount: 234
  },
  {
    id: 'job-010',
    title: 'Sales Representative',
    company: 'Dangote Cement',
    location: 'Kano, Nigeria',
    country: 'Nigeria',
    salary: '₦150,000 - ₦250,000/month + Commission',
    category: 'Sales',
    type: 'Full-time',
    description: 'Drive sales growth in the Northern region. Build relationships with distributors and retailers.',
    requirements: ['Sales experience in FMCG or construction', 'Knowledge of Northern Nigeria market', 'Own vehicle preferred', 'Strong negotiation skills'],
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    logoUrl: 'https://logo.clearbit.com/dangote.com',
    posterType: 'company',
    posterName: 'Dangote Group HR',
    isVerified: true,
    applicantsCount: 123,
    viewsCount: 456
  },
  {
    id: 'job-011',
    title: 'Cleaner/Housekeeper',
    company: 'Private Residence',
    location: 'Lekki, Lagos',
    country: 'Nigeria',
    salary: '₦50,000 - ₦70,000/month',
    category: 'Domestic',
    type: 'Full-time',
    description: 'Live-in housekeeper needed for a family home. Responsibilities include cleaning, laundry, and light cooking.',
    requirements: ['Previous housekeeping experience', 'Honest and reliable', 'Good references', 'Live-in accommodation provided'],
    postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    posterType: 'agent',
    posterName: 'HomeStaff Recruiters',
    isVerified: false,
    agentFee: '₦8,000',
    applicantsCount: 234,
    viewsCount: 890
  },
  {
    id: 'job-012',
    title: 'Frontend Developer',
    company: 'Kuda Bank',
    location: 'Lagos, Nigeria (Hybrid)',
    country: 'Nigeria',
    salary: '₦550,000 - ₦850,000/month',
    category: 'Technology',
    type: 'Full-time',
    description: 'Build the future of banking in Africa. Work on our mobile and web applications using React and React Native.',
    requirements: ['3+ years React experience', 'TypeScript proficiency', 'Experience with mobile development', 'Fintech experience a plus'],
    postedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    logoUrl: 'https://logo.clearbit.com/kuda.com',
    posterType: 'company',
    posterName: 'Kuda Talent',
    isVerified: true,
    applicantsCount: 89,
    viewsCount: 345
  }
];

// Realistic social posts
const DEMO_POSTS: DemoPost[] = [
  {
    id: 'post-001',
    authorId: 'user-001',
    authorName: 'Chioma Okonkwo',
    authorPhoto: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&crop=face',
    authorRole: 'HR Manager at Access Bank',
    isVerified: true,
    content: `🎉 Exciting news! We're hiring 50+ graduate trainees at Access Bank for our 2024 cohort!

If you're a fresh graduate with a passion for banking and finance, this is your chance to start an amazing career.

Requirements:
✅ BSc/HND (Minimum 2:1)
✅ NYSC completed or exempt
✅ Age 26 and below
✅ Strong communication skills

Drop your CV in the comments or DM me directly. Let's connect! 🚀

#Hiring #BankingJobs #GraduateTrainee #NigeriaJobs #AccessBank`,
    media: [],
    likes: ['user-002', 'user-003', 'user-004', 'user-005', 'user-006', 'user-007'],
    commentsCount: 23,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    comments: [
      { id: 'c1', authorId: 'user-002', authorName: 'Tunde Bakare', authorPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', content: 'This is amazing! Just sent my CV to your DM. Thank you for this opportunity! 🙏', createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
      { id: 'c2', authorId: 'user-003', authorName: 'Amina Yusuf', authorPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face', content: 'Is this open to candidates outside Lagos?', createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
      { id: 'c3', authorId: 'user-001', authorName: 'Chioma Okonkwo', authorPhoto: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&crop=face', content: '@Amina Yes! We have positions in Lagos, Abuja, Port Harcourt, and Kano.', createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: 'post-002',
    authorId: 'user-008',
    authorName: 'Emeka Nwosu',
    authorPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    authorRole: 'Tech Recruiter | Verified Agent',
    isVerified: true,
    content: `📢 URGENT HIRING - Multiple IT Positions in Lagos!

I'm currently recruiting for:
🔹 Java Developers (5 positions) - ₦600k-900k
🔹 DevOps Engineers (3 positions) - ₦700k-1M
🔹 QA Engineers (4 positions) - ₦400k-600k
🔹 Project Managers (2 positions) - ₦500k-800k

All positions are with a leading fintech company. Remote-friendly with occasional office visits.

Interested? Send your CV to careers@techrecruitng.com or comment below!

Processing fee: ₦10,000 (refundable upon placement)

#TechJobs #LagosJobs #ITJobs #SoftwareEngineering`,
    media: [],
    likes: ['user-001', 'user-009', 'user-010', 'user-011'],
    commentsCount: 15,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    comments: [
      { id: 'c4', authorId: 'user-009', authorName: 'Blessing Eze', authorPhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', content: 'Interested in the QA position. 4 years experience. Will send my CV now.', createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
      { id: 'c5', authorId: 'user-010', authorName: 'Kola Adeyemi', authorPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', content: 'Is the processing fee negotiable for multiple referrals?', createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: 'post-003',
    authorId: 'user-012',
    authorName: 'Folake Adebayo',
    authorPhoto: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face',
    authorRole: 'Career Coach & Mentor',
    isVerified: true,
    content: `5 things I wish someone told me when I started job hunting in Nigeria:

1️⃣ Your CV should be 2 pages MAX. Nobody has time to read your life story.

2️⃣ Customize your CV for EVERY job application. Generic CVs get ignored.

3️⃣ LinkedIn is not optional anymore. Over 60% of corporate jobs in Nigeria are filled through referrals and LinkedIn.

4️⃣ Follow up! Send a polite follow-up email 1 week after applying. It shows you're serious.

5️⃣ Skills matter more than certificates. Learn something practical - coding, digital marketing, data analysis.

What would you add to this list? 👇

#CareerAdvice #JobSearchNigeria #CareerGrowth`,
    media: [],
    likes: ['user-001', 'user-002', 'user-003', 'user-008', 'user-009', 'user-013', 'user-014', 'user-015'],
    commentsCount: 34,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    comments: [
      { id: 'c6', authorId: 'user-013', authorName: 'David Obi', authorPhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face', content: 'I would add: Dress professionally for interviews even if it\'s virtual. First impressions matter!', createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString() },
      { id: 'c7', authorId: 'user-014', authorName: 'Grace Umeh', authorPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face', content: 'Number 3 is so true! Got my current job through a LinkedIn connection. Network, network, network!', createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: 'post-004',
    authorId: 'user-016',
    authorName: 'MTN Nigeria',
    authorPhoto: 'https://logo.clearbit.com/mtn.com',
    authorRole: 'Official Company Page',
    isVerified: true,
    content: `📣 Join #TeamYellow! 

MTN Nigeria is expanding and we're looking for passionate individuals to join our team across various departments:

🔹 Customer Experience Associates
🔹 Network Engineers  
🔹 Digital Marketing Specialists
🔹 Finance Analysts
🔹 HR Business Partners

We offer:
✨ Competitive salary
✨ Health insurance
✨ Learning & development
✨ Career growth opportunities

Apply now at careers.mtnonline.com

Together, we are good together! 💛

#MTNJobs #CareerOpportunities #JoinMTN`,
    media: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop'],
    likes: ['user-001', 'user-002', 'user-003', 'user-004', 'user-005', 'user-006', 'user-007', 'user-008', 'user-009', 'user-010'],
    commentsCount: 67,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    comments: [
      { id: 'c8', authorId: 'user-017', authorName: 'Samuel Onyeka', authorPhoto: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop&crop=face', content: 'Applied! I\'ve always wanted to work with MTN. Hope I get shortlisted 🤞', createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: 'post-005',
    authorId: 'user-018',
    authorName: 'Ahmed Ibrahim',
    authorPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    authorRole: 'Software Developer at Andela',
    isVerified: false,
    content: `Just got my first tech job! 🎉🎉🎉

After 8 months of learning to code, 200+ applications, and countless rejections, I finally landed a role as a Junior Frontend Developer!

To everyone still job hunting - DON'T GIVE UP! Your time will come.

Special thanks to the ALX community for the free training and JobFolio for connecting me with this opportunity.

If you're learning to code and need guidance, my DMs are open. I know how lonely the journey can feel.

#TechTwitterNG #NewJob #CodingJourney #NeverGiveUp`,
    media: [],
    likes: ['user-001', 'user-002', 'user-003', 'user-012', 'user-019', 'user-020'],
    commentsCount: 45,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    comments: [
      { id: 'c9', authorId: 'user-019', authorName: 'Fatima Hassan', authorPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face', content: 'Congratulations Ahmed! This is so inspiring. I\'m currently learning Python and this gives me hope!', createdAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'c10', authorId: 'user-020', authorName: 'Chidi Nwachukwu', authorPhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face', content: 'This is amazing bro! 200 applications is no joke. You deserve this! 🙌', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: 'post-006',
    authorId: 'user-021',
    authorName: 'Ngozi Wellness',
    authorPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face',
    authorRole: 'Founder, CareerMind Africa',
    isVerified: true,
    content: `🧠 Mental Health Reminder for Job Seekers:

Rejection is redirection, not a reflection of your worth.

The job market is tough. I know. But please remember:
• Take breaks when needed
• Celebrate small wins
• Talk to someone if you're struggling
• Exercise and eat well
• Limit how many applications you send daily

Your mental health matters more than any job.

If you need someone to talk to, our free career counseling hotline is available: 0800-CAREER-NG

You've got this! 💪

#MentalHealth #JobSearch #CareerSupport #YouMatter`,
    media: [],
    likes: ['user-001', 'user-002', 'user-018', 'user-022', 'user-023', 'user-024', 'user-025'],
    commentsCount: 28,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    comments: [
      { id: 'c11', authorId: 'user-022', authorName: 'Ruth Adewale', authorPhoto: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face', content: 'Thank you for this. I really needed to hear it today. ❤️', createdAt: new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  }
];

// Demo applicants for jobs
const DEMO_APPLICANTS: DemoApplicant[] = [
  { id: 'app-001', jobId: 'job-003', name: 'Blessing Eze', email: 'blessing.eze@email.com', phone: '+234 803 456 7890', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', cvUrl: '#', appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending', matchScore: 92, experience: '3 years', skills: ['Patient Care', 'Emergency Response', 'Medication Administration'] },
  { id: 'app-002', jobId: 'job-003', name: 'Victoria Nnamdi', email: 'victoria.n@email.com', phone: '+234 805 678 1234', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face', cvUrl: '#', appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'reviewed', matchScore: 87, experience: '5 years', skills: ['ICU Care', 'Patient Assessment', 'Team Leadership'] },
  { id: 'app-003', jobId: 'job-003', name: 'Funke Oladele', email: 'funke.o@email.com', phone: '+234 809 234 5678', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face', cvUrl: '#', appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), status: 'shortlisted', matchScore: 95, experience: '4 years', skills: ['General Ward', 'Documentation', 'Patient Education'] },
  { id: 'app-004', jobId: 'job-005', name: 'Musa Abdullahi', email: 'musa.a@email.com', phone: '+234 802 345 6789', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', cvUrl: '#', appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending', matchScore: 78, experience: '6 years', skills: ['Access Control', 'CCTV Monitoring', 'Report Writing'] },
  { id: 'app-005', jobId: 'job-005', name: 'Sunday Okoro', email: 'sunday.o@email.com', phone: '+234 813 456 7890', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', cvUrl: '#', appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'reviewed', matchScore: 82, experience: '4 years', skills: ['Patrol', 'Emergency Response', 'First Aid'] }
];

// Initialize demo data in localStorage
export const initializeDemoData = () => {
  if (!localStorage.getItem('demo_jobs')) {
    localStorage.setItem('demo_jobs', JSON.stringify(DEMO_JOBS));
  }
  if (!localStorage.getItem('demo_posts')) {
    localStorage.setItem('demo_posts', JSON.stringify(DEMO_POSTS));
  }
  if (!localStorage.getItem('demo_applicants')) {
    localStorage.setItem('demo_applicants', JSON.stringify(DEMO_APPLICANTS));
  }
};

// Get demo jobs
export const getDemoJobs = (): DemoJob[] => {
  initializeDemoData();
  const data = localStorage.getItem('demo_jobs');
  return data ? JSON.parse(data) : DEMO_JOBS;
};

// Get demo posts
export const getDemoPosts = (): DemoPost[] => {
  initializeDemoData();
  const data = localStorage.getItem('demo_posts');
  return data ? JSON.parse(data) : DEMO_POSTS;
};

// Get demo applicants for a job
export const getDemoApplicants = (jobId?: string): DemoApplicant[] => {
  initializeDemoData();
  const data = localStorage.getItem('demo_applicants');
  const applicants = data ? JSON.parse(data) : DEMO_APPLICANTS;
  return jobId ? applicants.filter((a: DemoApplicant) => a.jobId === jobId) : applicants;
};

// Add a like to a post
export const togglePostLike = (postId: string, userId: string): DemoPost | null => {
  const posts = getDemoPosts();
  const postIndex = posts.findIndex(p => p.id === postId);
  if (postIndex === -1) return null;
  
  const post = posts[postIndex];
  const likeIndex = post.likes.indexOf(userId);
  
  if (likeIndex > -1) {
    post.likes.splice(likeIndex, 1);
  } else {
    post.likes.push(userId);
  }
  
  posts[postIndex] = post;
  localStorage.setItem('demo_posts', JSON.stringify(posts));
  return post;
};

// Add a comment to a post
export const addPostComment = (postId: string, comment: Omit<DemoComment, 'id' | 'createdAt'>): DemoPost | null => {
  const posts = getDemoPosts();
  const postIndex = posts.findIndex(p => p.id === postId);
  if (postIndex === -1) return null;
  
  const post = posts[postIndex];
  const newComment: DemoComment = {
    ...comment,
    id: `comment-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  
  post.comments.push(newComment);
  post.commentsCount = post.comments.length;
  
  posts[postIndex] = post;
  localStorage.setItem('demo_posts', JSON.stringify(posts));
  return post;
};

// Add a new post
export const addDemoPost = (post: Omit<DemoPost, 'id' | 'createdAt' | 'likes' | 'commentsCount' | 'comments'>): DemoPost => {
  const posts = getDemoPosts();
  const newPost: DemoPost = {
    ...post,
    id: `post-${Date.now()}`,
    createdAt: new Date().toISOString(),
    likes: [],
    commentsCount: 0,
    comments: []
  };
  
  posts.unshift(newPost);
  localStorage.setItem('demo_posts', JSON.stringify(posts));
  return newPost;
};

// Apply to a job
export const applyToJob = (jobId: string, applicant: Omit<DemoApplicant, 'id' | 'jobId' | 'appliedAt' | 'status' | 'matchScore'>): DemoApplicant => {
  const applicants = getDemoApplicants();
  const newApplicant: DemoApplicant = {
    ...applicant,
    id: `app-${Date.now()}`,
    jobId,
    appliedAt: new Date().toISOString(),
    status: 'pending',
    matchScore: Math.floor(Math.random() * 30) + 70 // Random score 70-100
  };
  
  applicants.push(newApplicant);
  localStorage.setItem('demo_applicants', JSON.stringify(applicants));
  
  // Update job applicants count
  const jobs = getDemoJobs();
  const jobIndex = jobs.findIndex(j => j.id === jobId);
  if (jobIndex > -1) {
    jobs[jobIndex].applicantsCount++;
    localStorage.setItem('demo_jobs', JSON.stringify(jobs));
  }
  
  return newApplicant;
};

// Update applicant status
export const updateApplicantStatus = (applicantId: string, status: DemoApplicant['status']): void => {
  const applicants = getDemoApplicants();
  const index = applicants.findIndex(a => a.id === applicantId);
  if (index > -1) {
    applicants[index].status = status;
    localStorage.setItem('demo_applicants', JSON.stringify(applicants));
  }
};

// Format time ago helper
export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
