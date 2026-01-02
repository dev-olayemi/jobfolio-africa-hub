import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  collectionGroup,
} from "firebase/firestore";
import { 
  Briefcase, 
  FileText, 
  Users, 
  Building2, 
  TrendingUp, 
  Eye, 
  Heart, 
  Send, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  Search,
  Settings,
  BarChart3,
  UserCheck,
  MapPin,
  Calendar
} from "lucide-react";

// Role-specific dashboard components
const JobSeekerDashboard = ({ dashboardData, recentActivity, loading }: any) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Send className="h-4 w-4 text-blue-500" />
            Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData.applicationsCount ?? "—"}</div>
          <div className="text-xs text-muted-foreground mt-1">Jobs applied to</div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Eye className="h-4 w-4 text-green-500" />
            Profile Views
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData.profileViews ?? "—"}</div>
          <div className="text-xs text-muted-foreground mt-1">This month</div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-purple-500" />
            Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData.postsCount ?? "—"}</div>
          <div className="text-xs text-muted-foreground mt-1">Your updates</div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Heart className="h-4 w-4 text-red-500" />
            Saved Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12</div>
          <div className="text-xs text-muted-foreground mt-1">Bookmarked</div>
        </CardContent>
      </Card>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recommended Jobs</h2>
          <Button variant="ghost" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Browse All
          </Button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-muted-foreground">Loading jobs...</div>
          ) : recentActivity.length === 0 ? (
            <Card className="p-6 text-center">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-2">No jobs found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Complete your profile to get personalized job recommendations
              </p>
              <Button size="sm">Complete Profile</Button>
            </Card>
          ) : (
            recentActivity.map((job: any) => (
              <Card key={job.id} className="hover:shadow transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Building2 className="h-4 w-4" />
                        {job.company}
                        <MapPin className="h-4 w-4 ml-2" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">{job.type}</Badge>
                        <Badge variant="outline">
                          {typeof job.salary === "object" && job.salary !== null
                            ? `${job.salary.currency ? job.salary.currency + ' ' : ''}${job.salary.min ? Number(job.salary.min).toLocaleString() : ''}${job.salary.max ? ` - ${Number(job.salary.max).toLocaleString()}` : ''}`
                            : job.salary}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        {job.createdAt?.toDate ? 
                          new Date(job.createdAt.toDate()).toLocaleDateString() : 
                          'Recently posted'
                        }
                      </div>
                      <Button size="sm" className="mt-2">Apply</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
        </div>

        <div className="space-y-3">
          <Button className="w-full justify-start">
            <Search className="h-4 w-4 mr-2" />
            Find Jobs
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <FileText className="h-4 w-4 mr-2" />
            Update Resume
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Profile Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <BarChart3 className="h-4 w-4 mr-2" />
            Application Status
          </Button>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Profile Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={75} className="mb-2" />
            <div className="text-xs text-muted-foreground">75% complete</div>
            <Button size="sm" variant="outline" className="w-full mt-3">
              Complete Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </>
);

const AgentDashboard = ({ dashboardData, recentActivity, loading }: any) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Briefcase className="h-4 w-4 text-blue-500" />
            Active Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData.activeJobsCount ?? "—"}</div>
          <div className="text-xs text-muted-foreground mt-1">Currently hiring</div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-green-500" />
            Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData.totalApplicationsReceived ?? "—"}</div>
          <div className="text-xs text-muted-foreground mt-1">Total received</div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <UserCheck className="h-4 w-4 text-purple-500" />
            Placements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">8</div>
          <div className="text-xs text-muted-foreground mt-1">This month</div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            Success Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">85%</div>
          <div className="text-xs text-muted-foreground mt-1">Placement rate</div>
        </CardContent>
      </Card>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Job Posts</h2>
          <Button variant="ghost" size="sm">View All</Button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-muted-foreground">Loading...</div>
          ) : recentActivity.length === 0 ? (
            <Card className="p-6 text-center">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-2">No recent activity</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start by posting a job or creating content
              </p>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Post Job
              </Button>
            </Card>
          ) : (
            recentActivity.map((item: any) => (
              <Card key={item.id} className="hover:shadow transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="h-4 w-4" />
                        {item.createdAt?.toDate ? 
                          new Date(item.createdAt.toDate()).toLocaleDateString() : 
                          'Recently posted'
                        }
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                          {item.status || 'Active'}
                        </Badge>
                        {item.type === 'job' && (
                          <Badge variant="outline">
                            {item.applicationsCount || 0} applications
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm">View</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
        </div>

        <div className="space-y-3">
          <Button className="w-full justify-start">
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Users className="h-4 w-4 mr-2" />
            Browse Candidates
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <FileText className="h-4 w-4 mr-2" />
            Create Post
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>New applications</span>
                <Badge variant="destructive">5</Badge>
              </div>
              <div className="flex justify-between">
                <span>Interviews to schedule</span>
                <Badge variant="secondary">3</Badge>
              </div>
              <div className="flex justify-between">
                <span>Expiring jobs</span>
                <Badge variant="outline">2</Badge>
              </div>
            </div>
            <Button size="sm" className="w-full mt-3">
              Review All
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </>
);

const CompanyDashboard = ({ dashboardData, recentActivity, loading }: any) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Briefcase className="h-4 w-4 text-blue-500" />
            Open Positions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData.activeJobsCount ?? "—"}</div>
          <div className="text-xs text-muted-foreground mt-1">Currently hiring</div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-green-500" />
            Total Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData.totalApplicationsReceived ?? "—"}</div>
          <div className="text-xs text-muted-foreground mt-1">All time</div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-purple-500" />
            Hires Made
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">24</div>
          <div className="text-xs text-muted-foreground mt-1">This year</div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-orange-500" />
            Avg. Time to Hire
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">18d</div>
          <div className="text-xs text-muted-foreground mt-1">Days average</div>
        </CardContent>
      </Card>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Job Postings</h2>
          <Button variant="ghost" size="sm">Manage All</Button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-muted-foreground">Loading...</div>
          ) : recentActivity.length === 0 ? (
            <Card className="p-6 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-2">No job postings yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start building your team by posting your first job
              </p>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Post First Job
              </Button>
            </Card>
          ) : (
            recentActivity.map((item: any) => (
              <Card key={item.id} className="hover:shadow transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4" />
                        {item.location || 'Remote'}
                        <Calendar className="h-4 w-4 ml-2" />
                        {item.createdAt?.toDate ? 
                          new Date(item.createdAt.toDate()).toLocaleDateString() : 
                          'Recently posted'
                        }
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                          {item.status || 'Active'}
                        </Badge>
                        <Badge variant="outline">
                          {item.applicationsCount || 0} applications
                        </Badge>
                        <Badge variant="outline">{item.type || 'Full-time'}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm">View Applications</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Company Tools</h2>
        </div>

        <div className="space-y-3">
          <Button className="w-full justify-start">
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Users className="h-4 w-4 mr-2" />
            Candidate Pipeline
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Building2 className="h-4 w-4 mr-2" />
            Company Profile
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <BarChart3 className="h-4 w-4 mr-2" />
            Hiring Analytics
          </Button>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Hiring Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Applied</span>
                <Badge variant="secondary">45</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Screening</span>
                <Badge variant="secondary">12</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Interview</span>
                <Badge variant="secondary">8</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Offer</span>
                <Badge variant="secondary">3</Badge>
              </div>
            </div>
            <Button size="sm" variant="outline" className="w-full mt-3">
              View Pipeline
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </>
);
const Dashboard = () => {
  const { user, profile } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    postsCount: null as number | null,
    jobsCount: null as number | null,
    applicationsCount: null as number | null,
    profileViews: null as number | null,
    activeJobsCount: null as number | null,
    totalApplicationsReceived: null as number | null,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile) return;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const data = { ...dashboardData };

        // Common data for all user types
        const postsQ = query(
          collection(db, "posts"),
          where("authorId", "==", user.uid)
        );
        const postsSnap = await getDocs(postsQ);
        data.postsCount = postsSnap.size;

        // Role-specific data loading
        if (profile.accountType === "jobseeker") {
          await loadJobSeekerData(data);
        } else if (profile.accountType === "agent") {
          await loadAgentData(data);
        } else if (profile.accountType === "company") {
          await loadCompanyData(data);
        }

        setDashboardData(data);
        await loadRecentActivity();
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    const loadJobSeekerData = async (data: any) => {
      // Applications submitted by user
      const appsQ = query(
        collectionGroup(db, "applications"),
        where("applicantId", "==", user.uid)
      );
      const appsSnap = await getDocs(appsQ);
      data.applicationsCount = appsSnap.size;

      // Profile views (mock data for now)
      data.profileViews = Math.floor(Math.random() * 50) + 10;
    };

    const loadAgentData = async (data: any) => {
      // Jobs posted by agent
      const jobsQ = query(
        collection(db, "jobs"),
        where("postedById", "==", user.uid),
        where("postedByType", "==", "agent")
      );
      const jobsSnap = await getDocs(jobsQ);
      data.jobsCount = jobsSnap.size;

      // Active jobs
      const activeJobsQ = query(
        collection(db, "jobs"),
        where("postedById", "==", user.uid),
        where("status", "==", "active")
      );
      const activeJobsSnap = await getDocs(activeJobsQ);
      data.activeJobsCount = activeJobsSnap.size;

      // Total applications received
      let totalApps = 0;
      for (const jobDoc of jobsSnap.docs) {
        const applicationsQ = query(
          collection(db, "jobs", jobDoc.id, "applications")
        );
        const applicationsSnap = await getDocs(applicationsQ);
        totalApps += applicationsSnap.size;
      }
      data.totalApplicationsReceived = totalApps;
    };

    const loadCompanyData = async (data: any) => {
      // Jobs posted by company
      const jobsQ = query(
        collection(db, "jobs"),
        where("postedById", "==", user.uid),
        where("postedByType", "==", "company")
      );
      const jobsSnap = await getDocs(jobsQ);
      data.jobsCount = jobsSnap.size;

      // Active jobs
      const activeJobsQ = query(
        collection(db, "jobs"),
        where("postedById", "==", user.uid),
        where("status", "==", "active")
      );
      const activeJobsSnap = await getDocs(activeJobsQ);
      data.activeJobsCount = activeJobsSnap.size;

      // Total applications received
      let totalApps = 0;
      for (const jobDoc of jobsSnap.docs) {
        const applicationsQ = query(
          collection(db, "jobs", jobDoc.id, "applications")
        );
        const applicationsSnap = await getDocs(applicationsQ);
        totalApps += applicationsSnap.size;
      }
      data.totalApplicationsReceived = totalApps;
    };

    const loadRecentActivity = async () => {
      // Load recent posts/jobs based on user type
      if (profile.accountType === "jobseeker") {
        const recentJobsQ = query(
          collection(db, "jobs"),
          where("status", "==", "active"),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const recentJobsSnap = await getDocs(recentJobsQ);
        setRecentActivity(recentJobsSnap.docs.map((d) => ({ 
          id: d.id, 
          type: "job",
          ...d.data() 
        })));
      } else {
        const recentPostsQ = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const recentPostsSnap = await getDocs(recentPostsQ);
        setRecentActivity(recentPostsSnap.docs.map((d) => ({ 
          id: d.id, 
          type: "post",
          ...d.data() 
        })));
      }
    };

    loadDashboardData();
  }, [user, profile]);

  if (!profile) {
    return (
      <Layout>
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  const renderDashboard = () => {
    switch (profile.accountType) {
      case "jobseeker":
        return <JobSeekerDashboard dashboardData={dashboardData} recentActivity={recentActivity} loading={loading} />;
      case "agent":
        return <AgentDashboard dashboardData={dashboardData} recentActivity={recentActivity} loading={loading} />;
      case "company":
        return <CompanyDashboard dashboardData={dashboardData} recentActivity={recentActivity} loading={loading} />;
      default:
        return (
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Welcome to your dashboard</h2>
            <p className="text-muted-foreground">Please complete your profile setup to get started.</p>
          </div>
        );
    }
  };

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {errorMsg && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded">
            {errorMsg}
          </div>
        )}
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            Welcome back, {profile.firstName || profile.displayName || 'User'}!
          </h1>
          <p className="text-muted-foreground">
            {profile.accountType === "jobseeker" && "Find your next opportunity"}
            {profile.accountType === "agent" && "Manage your placements and candidates"}
            {profile.accountType === "company" && "Build your team with top talent"}
          </p>
        </div>

        {renderDashboard()}
      </div>
    </Layout>
  );
};

export default Dashboard;